function homePage(events = [], subject) {
	var page = CardService.newCardBuilder()
		.addCardAction(
			CardService.newCardAction().setText('Scan email for events').setOnClickAction(CardService.newAction().setFunctionName("onFindAndShowEvents"))
		);

	page.setHeader(CardService.newCardHeader().setTitle(`Found ${events.length} events`))
	if (events.length > 0) {
		events.forEach(event => {
			page.addSection(eventsSection(event, subject))
		})
	}

	return page.build()
}

function onGmailMessageOpen(e) {
	authorizeGmailApp(e.gmail.accessToken);
	return findAndShowEvents(e.gmail.messageId);
}

function onFindAndShowEvents(e) {
	authorizeGmailApp(e.messageMetadata.accessToken)
	return findAndShowEvents(e.messageMetadata.messageId);
}

function findAndShowEvents(messageId) {
	var mailMessage = GmailApp.getMessageById(messageId);
	var events = getEventsFromText(mailMessage.getPlainBody());
	return homePage(events, mailMessage.getSubject())
}

function authorizeGmailApp(accessToken) {
	GmailApp.setCurrentMessageAccessToken(accessToken);
}

function eventsSection(event, subject) {
	console.log(`eventsSection: create Event section for "${subject}" with event data: ${JSON.stringify(event)}`)
	var action = CardService.newAction().setFunctionName('addToCalendarCallback').setParameters({fromYear: event.from.year, fromMonth: event.from.month, fromDay: event.from.day, subject: subject});
	var cardSection = CardService.newCardSection()
		.setHeader(new Date(Date.UTC(event.from.year, event.from.month - 1, event.from.day)).toLocaleDateString('nl-NL', {year: 'numeric', month: 'long', day: 'numeric' }))
		.addWidget(CardService.newTextParagraph().setText(`Original date: ${event.originalDate}`))
		.addWidget(
			CardService.newButtonSet()
			.addButton(CardService.newTextButton().setText('add to calendar').setOnClickAction(action))
		)

	return cardSection;
}

function getEventsFromText(str) {
	return findDates(str).filter(trustedDates).map(toEvent)
}

function trustedDates(date) {
	return date.start && date.start.knownValues && date.start.knownValues.month && date.start.knownValues.day;
}

function findDates(str) {
	return chrono.nl.parse(str);
}

function toEvent(date) {
	console.log(`toEvent: convert chrono ParsingResult to normalized event: ${JSON.stringify(date)}`)
	return {
		'originalDate': date.text,
		'from': {
			'year': date.start.knownValues.year ? date.start.knownValues.year.toString() : date.start.impliedValues.year.toString(),
			'month': date.start.knownValues.month ? date.start.knownValues.month.toString() : date.start.impliedValues.month.toString(),
			'day': date.start.knownValues.day ? date.start.knownValues.day.toString() : date.start.impliedValues.day.toString()
		}
	}
}

function addToCalendarCallback(actionInput) {
	console.log(`addToCalendarCallback: parameters: ${JSON.stringify(actionInput)}`)
	CalendarApp.getDefaultCalendar().createAllDayEvent(actionInput.parameters.subject, new Date(actionInput.parameters.fromYear, actionInput.parameters.fromMonth - 1, actionInput.parameters.fromDay));
	notificationCallback();
}

function notificationCallback() {
	return CardService.newActionResponseBuilder()
		.setNotification(CardService.newNotification()
		.setText("Event created"))
		.build();
}

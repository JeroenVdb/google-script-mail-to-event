function homePage(events = [], subject) {
	var page = CardService.newCardBuilder()
		.addCardAction(
			CardService.newCardAction().setText('Scan email for events').setOnClickAction(CardService.newAction().setFunctionName("findAndShowEvents"))
		);

	if (events.length > 0) {
		page.setHeader(CardService.newCardHeader().setTitle(`Found ${events.length} events`))
		events.forEach(event => {
			page.addSection(eventsSection(event, subject))
		})
	}

	return page.build()
}

function findAndShowEvents(e) {
	authorizeGmailApp(e.messageMetadata.accessToken)

	var mailMessage = GmailApp.getMessageById(e.messageMetadata.messageId);

	var events = getEventsFromText(mailMessage.getPlainBody());

	return homePage(events, mailMessage.getSubject())
}

function authorizeGmailApp(accessToken) {
	GmailApp.setCurrentMessageAccessToken(accessToken);
}

function eventsSection(event, subject) {
	var action = CardService.newAction().setFunctionName('addToCalendarCallback').setParameters({date: event.date.toString(), subject: subject});
	var cardSection = CardService.newCardSection()
		.setHeader(event.date)
		.addWidget(CardService.newTextParagraph().setText(`Original date: ${event.originalDate}`))
		.addWidget(
			CardService.newButtonSet()
				.addButton(CardService.newTextButton().setText('add to calendar').setOnClickAction(action))
		)

	return cardSection;
}

function getEventsFromText(str) {
	var foundDates = findDates(str)
	return foundDates.map(toEvent)
}

function findDates(str) {
	var regex = /([0-9]{1,2})([\D])(januari|februari|maart|april|mei|juni|juli|augustus|september|oktober|november|december|January|February|March|April|May|June|July|August|[0-9]{1,2})([\D])([0-9]{2,4})/gi;
	return str.match(regex);
}

function toEvent(date) {
	return {
		'originalDate': date,
		'date': new Date(date)
	}
}

function addToCalendarCallback(date, subject) {
	CalendarApp.getDefaultCalendar().createAllDayEvent("subject", new Date(date));
	notificationCallback();
}

function notificationCallback() {
	return CardService.newActionResponseBuilder()
		.setNotification(CardService.newNotification()
			.setText("Event created"))
		.build();
}

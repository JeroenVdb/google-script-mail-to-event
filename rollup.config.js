import typescript from '@rollup/plugin-typescript';
import resolve from 'rollup-plugin-node-resolve';
import commonJS from 'rollup-plugin-commonjs'

export default {
	input: 'chrono/index.ts',
	output: {
		file: 'chrono.js',
		format: 'iife',
		name: 'chrono'
	},
	treeshake: false,
	plugins: [
		typescript({target: 'ES2015', module: 'ES2015'}),
		resolve(),
		commonJS({
			include: 'node_modules/**'
		})
	]
};

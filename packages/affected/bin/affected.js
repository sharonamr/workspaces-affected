#!/usr/bin/env node
import fs, { writeFileSync } from 'fs';
import glob from 'glob';
import { getAffectedFiles } from '../src/utils.js';
/* eslint-disable security/detect-child-process */
import { spawnSync } from 'child_process';
import { flagsParser } from '../src/flags-parser.js';

export const spawn = (command, args, options = {}, shouldExit = true) => {
	const ret = spawnSync(command, args, {
		stdio: 'inherit',
		...options,
	});
	if (ret.error) {
		throw ret.error;
	} else if (shouldExit && ret.status !== 0) {
		process.exit(ret.status || 0);
	}
};

const allArgs = process.argv.slice(2);
const supportedArgs = {
	'--base': 'string',
	'--head': 'string',
	'--with-side': 'boolean',
	'--ignore-private': 'boolean',
	'--ignore-pattern': 'string',
};
const [parsedFlags, args] = flagsParser(supportedArgs, allArgs);
const base = parsedFlags['--base'];
const head = parsedFlags['--head'];
console.log('affected args:', parsedFlags);

const ignoredFiles = parsedFlags['--ignore-pattern'] ? glob.sync(parsedFlags['--ignore-pattern']) : [];
const affectedFiles = getAffectedFiles(base, head);

export const getFileContent = (filePath) => {
	const buffer = fs.readFileSync(filePath);
	const ret = buffer.toString();
	return ret;
};

console.log('Getting workspaces');
const rootPackageJson = JSON.parse(getFileContent(`${process.cwd()}/package.json`));
const workspaces = rootPackageJson.workspaces;

console.log('Getting packages (understanding glob pattern)');
const packages = workspaces.reduce((acc, pattern) => {
	const files = glob.sync(pattern);
	files.forEach(path => {
		const packageJson = JSON.parse(getFileContent(`${path}/package.json`));
		const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
		acc[path] = {
			name: packageJson.name,
			private: packageJson.private,
			deps,
			path,
		};
	});
	return acc;
}, {});
console.log('packages:', Object.values(packages).map(({ name, path }) => ({ name, path })));
console.log('Affected files:', affectedFiles);
console.log('Ignored files:', ignoredFiles);

const affectedPackages = Object.values(packages).reduce((acc, pkg) => {
	if (affectedFiles
		.filter(file => !ignoredFiles.includes(file))
		.some(file => file.startsWith(pkg.path))) {
		if (pkg.private !== true || parsedFlags['--ignore-private'] !== true) {
			acc.add({ name: pkg.name, path: pkg.path });
		}
	}
	return acc;
}, new Set());

const derivedAffectedPackages = parsedFlags['--with-side'] === true ? Object.values(packages).reduce((acc, pkg) => {
	if (Object.keys(pkg.deps).some(dep => affectedPackages.has(dep))) {
		acc.add({ name: pkg.name, path: pkg.path });
	}
	return acc;
}, new Set()) : new Set();

derivedAffectedPackages.add({
	"name": "workspaces-affected",
	"path": "packages/affected"
});

const allAffected = Array.from(new Set(affectedPackages, derivedAffectedPackages));

console.log('\nAffected workspaces packages:');
console.log(allAffected.map(pkg => `- ${pkg.name}`).join('\n'));
const innerFlagsIndex = args.indexOf('--');
args.splice(innerFlagsIndex, 0, ...allAffected.map(pkg => `-w=${pkg.name}`))
console.log('npm args:', args);
if (args.length > 1) {
	if (allAffected.length) {
		spawn("npm", ['run', ...args]);
	} else {
		console.log('No affected packages');
	}
} else {
	console.log('No npm args');
}

writeFileSync('affected.json', JSON.stringify(allAffected, null, 2));

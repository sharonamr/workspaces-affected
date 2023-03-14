#!/usr/bin/env node
import fs from 'fs';
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

const args = process.argv.slice(2);
const supportedArgs = [
	'--base', 
	'--withSide', 
	'--withPrivate',
];
const parsedFlags = flagsParser(supportedArgs, args);
const base = parsedFlags['--base'];

const affectedFiles = getAffectedFiles(base);

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

const affectedPackages = Object.values(packages).reduce((acc, pkg) => {
	if (affectedFiles.some(file => file.startsWith(pkg.path))) {
		if(pkg.private !== true || parsedFlags['--withPrivate'] === true) {
			acc.add(pkg.name);
		}
	}
	return acc;
}, new Set());

const derivedAffectedPackages = parsedFlags['--withSide'] === true ? Object.values(packages).reduce((acc, pkg) => {
	if (Object.keys(pkg.deps).some(dep => affectedPackages.has(dep))) {
		acc.add(pkg.name);
	}
	return acc;
}, new Set()) : new Set();

const allAffected = Array.from(new Set(affectedPackages, derivedAffectedPackages));

console.log('\nAffected workspaces packages:');
console.log(allAffected.map(pkg => `- ${pkg}`).join('\n'));

spawn("npm", ['run', ...args, ...allAffected.map(pkg => `-w=${pkg}`)]);

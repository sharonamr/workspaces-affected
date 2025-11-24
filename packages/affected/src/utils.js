import { spawnSync } from 'child_process';

export const getAffectedFiles = base => {
	const ret = spawnSync('git', `diff --name-only ${base}...HEAD`.split(' '), {
    cwd: process.cwd(),
		stdio: 'pipe',
    encoding: 'utf-8',
	});
	return ret.stdout.split('\n').filter(file => !!file);
};
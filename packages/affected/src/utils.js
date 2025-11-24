import { spawnSync } from 'child_process';

export const getAffectedFiles = base => {
	const ret = spawnSync('git', `diff-tree --no-commit-id --name-only -r ${base} HEAD`.split(' '), {
    cwd: process.cwd(),
		stdio: 'pipe',
    encoding: 'utf-8',
	});
	return ret.stdout.split('\n').filter(file => !!file);
};
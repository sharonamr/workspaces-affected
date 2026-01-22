import { spawnSync } from 'child_process';

export const getAffectedFiles = (base, head = 'HEAD') => {
	console.log('running git command:', `diff --name-only ${base}...${head}`);
	const ret = spawnSync('git', `diff --name-only ${base}...${head}`.split(' '), {
    cwd: process.cwd(),
		stdio: 'pipe',
    encoding: 'utf-8',
	});
	return ret.stdout.split('\n').filter(file => !!file);
};
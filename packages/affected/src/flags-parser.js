export const flagsParser = (supportedFlags, args) => {
	const usedArgs = [];
	const parsed = Object.entries(supportedFlags).reduce((flagsAcc, [flag, flagType]) => {
		const value = args.reduce((acc, arg, index) => {
			if (arg === flag) {
				let argValue = args[index + 1];
				if (flagType === 'boolean') {
					usedArgs.push(arg);
					if (argValue === 'true') {
						argValue = true;
					} else if (argValue === 'false') {
						argValue = false;
					} else {
						argValue = true;
					}
				} else {
					usedArgs.push(arg, args[index + 1]);
				}
				acc = argValue;
			} else if (arg.startsWith(`${flag}=`)) {
				usedArgs.push(arg);
				acc = arg.split('=')[1];
			}
			return acc;
		}, '');
		if (value !== '') {
			flagsAcc[flag] = value;
		}
		return flagsAcc;
	}, {});
	return [parsed, args.filter(arg => !usedArgs.includes(arg))];
};
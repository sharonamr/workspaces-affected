export const flagsParser = (supportedFlags, args) => {
	return supportedFlags.reduce((flagsAcc, flag) => {
		const value = args.reduce((acc, arg, index) => {
			if (arg === flag) {
				const argValue = args[index + 1];
				acc = argValue ? (argValue.startsWith('--') ? true : argValue) : true;
			} else if (arg.startsWith(`${flag}=`)) {
				acc = arg.split('=')[1];
			}
			return acc;
		}, '');
		if (value !== '') {
			flagsAcc[flag] = value;
		}
		return flagsAcc;
	}, {});
};
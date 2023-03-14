export const flagsParser = (supportedFlags, args) => {
	const usedArgs = [];
	const parsed = supportedFlags.reduce((flagsAcc, flag) => {
		const value = args.reduce((acc, arg, index) => {
			if (arg === flag) {
				usedArgs.push(arg);
				const argValue = args[index + 1];
				!argValue?.startsWith('--') && usedArgs.push(argValue);
				acc = argValue ? (argValue.startsWith('--') ? true : argValue) : true;
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
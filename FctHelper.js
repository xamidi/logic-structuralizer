class FctHelper {
	static round(x, n, separator = '.') {
		if (n === 0) {
			let result = x.toFixed(0);
			let i = result.search(/[^0-9-]/);
			if (i === -1)
				return result;
			else return result.substring(0, i);
		}
		const toStringWithoutTrailingZeroes = (f) => {
			const removeTrailingZeros = (s) => {
				let i = s.search(/[^0-9-]/);
				if (i === -1)
					return s;
				i = s.search(/0+$/);
				return i === -1 ? s : s.substring(0, i);
			};
			let result = f.toFixed(n + 2);
			return removeTrailingZeros(result);
		};
		let result = toStringWithoutTrailingZeroes(x);
		let i = result.search(/[^0-9-]/);
		if (i === -1)
			return result + separator + '0'.repeat(n);
		if (result.length <= n + i + 1) {
			if (result[i] !== separator)
				result = result.substring(0, i) + separator + result.substring(i + 1);
			let missingTrailingZeroes = n + 1 - (result.length - i);
			return result + '0'.repeat(missingTrailingZeroes);
		}
		let d = 0;
		if (Math.floor(x * Math.pow(10, n + 1) - 10 * Math.floor(x * Math.pow(10, n))) > 4)
			d = 1;
		x = (Math.floor(x * Math.pow(10, n)) + d) / Math.pow(10, n);
		result = toStringWithoutTrailingZeroes(x);
		i = result.search(/[^0-9-]/);
		if (i === -1)
			return result + separator + '0'.repeat(n);
		if (result[i] !== separator)
			result = result.substring(0, i) + separator + result.substring(i + 1);
		if (result.length <= n + i + 1) {
			let missingTrailingZeroes = n + 1 - (result.length - i);
			return result + '0'.repeat(missingTrailingZeroes);
		}
		// the operation did not eliminate all superfluous digits (because IEEE 754 floating-point arithmetic sucks) => just cut
		return result.substring(0, n + i + 1);
	}
}

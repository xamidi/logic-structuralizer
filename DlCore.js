const DlOperator = {
	And: 0, Or: 1, Nand: 2, Nor: 3, Imply: 4, Implied: 5, Nimply: 6, Nimplied: 7,
	Equiv: 8, Xor: 9, Com: 10, App: 11, Not: 12, Nece: 13, Poss: 14, Obli: 15,
	Perm: 16, Top: 17, Bot: 18
};

class DlCore {
	static dlOperators = new Map([ ["\\and", DlOperator.And], ["\\or", DlOperator.Or], ["\\nand", DlOperator.Nand], ["\\nor", DlOperator.Nor], ["\\imply", DlOperator.Imply], ["\\implied", DlOperator.Implied], ["\\nimply", DlOperator.Nimply], ["\\nimplied", DlOperator.Nimplied], ["\\equiv", DlOperator.Equiv], ["\\xor", DlOperator.Xor], ["\\com", DlOperator.Com], ["\\app", DlOperator.App], ["\\not", DlOperator.Not], ["\\nece", DlOperator.Nece], ["\\poss", DlOperator.Poss], ["\\obli", DlOperator.Obli], ["\\perm", DlOperator.Perm], ["\\top", DlOperator.Top], ["\\bot", DlOperator.Bot] ]);
	static dlOperatorsUnicode = new Map([ ["\\and", "∧"], ["\\or", "∨"], ["\\nand", "↑"], ["\\nor", "↓"], ["\\imply", "→"], ["\\implied", "←"], ["\\nimply", "↛"], ["\\nimplied", "↚"], ["\\equiv", "↔"], ["\\xor", "↮"], ["\\com", "↷"], ["\\app", "↝"], ["\\not", "¬"], ["\\nece", "□"], ["\\poss", "◇"], ["\\obli", "○"], ["\\perm", "⌔"], ["\\top", "⊤"], ["\\bot", "⊥"] ]);
	// NOTE: In Bocheński notation \nimply and \nimplied are L and M, but in Łukasiewicz notation those are already taken by \nece and \poss, respectively.
	static operators_luk = new Map([ ['K', DlOperator.And], ['A', DlOperator.Or], ['D', DlOperator.Nand], ['X', DlOperator.Nor], ['C', DlOperator.Imply], ['B', DlOperator.Implied], ['F', DlOperator.Nimply], ['G', DlOperator.Nimplied], ['E', DlOperator.Equiv], ['J', DlOperator.Xor], ['S', DlOperator.Com], ['U', DlOperator.App], ['N', DlOperator.Not], ['L', DlOperator.Nece], ['M', DlOperator.Poss], ['Z', DlOperator.Obli], ['P', DlOperator.Perm], ['V', DlOperator.Top], ['O', DlOperator.Bot] ]);
	static operators_boc = new Map([ ['K', DlOperator.And], ['A', DlOperator.Or], ['D', DlOperator.Nand], ['X', DlOperator.Nor], ['C', DlOperator.Imply], ['B', DlOperator.Implied], ['L', DlOperator.Nimply], ['M', DlOperator.Nimplied], ['E', DlOperator.Equiv], ['J', DlOperator.Xor], ['S', DlOperator.Com], ['U', DlOperator.App], ['N', DlOperator.Not], ['H', DlOperator.Nece], ['I', DlOperator.Poss], ['Z', DlOperator.Obli], ['P', DlOperator.Perm], ['V', DlOperator.Top], ['O', DlOperator.Bot] ]);
	static operatorNames_luk = new Map([ ["\\and", "K"], ["\\or", "A"], ["\\nand", "D"], ["\\nor", "X"], ["\\imply", "C"], ["\\implied", "B"], ["\\nimply", "F"], ["\\nimplied", "G"], ["\\equiv", "E"], ["\\xor", "J"], ["\\com", "S"], ["\\app", "U"], ["\\not", "N"], ["\\nece", "L"], ["\\poss", "M"], ["\\obli", "Z"], ["\\perm", "P"], ["\\top", "V"], ["\\bot", "O"] ]);
	static operatorNames_boc = new Map([ ["\\and", "K"], ["\\or", "A"], ["\\nand", "D"], ["\\nor", "X"], ["\\imply", "C"], ["\\implied", "B"], ["\\nimply", "L"], ["\\nimplied", "M"], ["\\equiv", "E"], ["\\xor", "J"], ["\\com", "S"], ["\\app", "U"], ["\\not", "N"], ["\\nece", "H"], ["\\poss", "I"], ["\\obli", "Z"], ["\\perm", "P"], ["\\top", "V"], ["\\bot", "O"] ]);
	static dlOperatorArity(op) {
		switch (op) {
			case DlOperator.Top:
			case DlOperator.Bot:
				return 0;
			case DlOperator.Not:
			case DlOperator.Nece:
			case DlOperator.Poss:
			case DlOperator.Obli:
			case DlOperator.Perm:
				return 1;
			case DlOperator.And:
			case DlOperator.Or:
			case DlOperator.Nand:
			case DlOperator.Nor:
			case DlOperator.Imply:
			case DlOperator.Implied:
			case DlOperator.Nimply:
			case DlOperator.Nimplied:
			case DlOperator.Equiv:
			case DlOperator.Xor:
			case DlOperator.Com:
			case DlOperator.App:
				return 2;
			default:
				throw new Error(`DlCore::dlOperatorArity(): Unknown DlOperator ${op}.`);
		}
	}
	static dlOperatorToString(op) {
		switch (op) {
			case DlOperator.And:
				return "\\and";
			case DlOperator.Or:
				return "\\or";
			case DlOperator.Nand:
				return "\\nand";
			case DlOperator.Nor:
				return "\\nor";
			case DlOperator.Imply:
				return "\\imply";
			case DlOperator.Implied:
				return "\\implied";
			case DlOperator.Nimply:
				return "\\nimply";
			case DlOperator.Nimplied:
				return "\\nimplied";
			case DlOperator.Equiv:
				return "\\equiv";
			case DlOperator.Xor:
				return "\\xor";
			case DlOperator.Com:
				return "\\com";
			case DlOperator.App:
				return "\\app";
			case DlOperator.Not:
				return "\\not";
			case DlOperator.Nece:
				return "\\nece";
			case DlOperator.Poss:
				return "\\poss";
			case DlOperator.Obli:
				return "\\obli";
			case DlOperator.Perm:
				return "\\perm";
			case DlOperator.Top:
				return "\\top";
			case DlOperator.Bot:
				return "\\bot";
			default:
				throw new Error(`DlCore::dlOperatorToString(): Unknown DlOperator ${op}.`);
		}
	}

	static traverseLeftToRightInOrder(formula, fVisit, fDown, fUp) {
		const children = formula.getChildren();
		switch (children.length) {
		case 0:
			fVisit(formula);
			break;
		case 1:
			fVisit(formula);
			fDown(formula, children[0]);
			DlCore.traverseLeftToRightInOrder(children[0], fVisit, fDown, fUp);
			fUp(children[0], formula);
			break;
		case 2:
			fDown(formula, children[0]);
			DlCore.traverseLeftToRightInOrder(children[0], fVisit, fDown, fUp);
			fUp(children[0], formula);
			fVisit(formula);
			fDown(formula, children[1]);
			DlCore.traverseLeftToRightInOrder(children[1], fVisit, fDown, fUp);
			fUp(children[1], formula);
			break;
		default:
			throw new Error(`DlCore::traverseLeftToRightInOrder(): There are too many children (${children.length}).`);
		}
	}

	static formulaRepresentation_unicode(formula) {
		let ss = '';
		DlCore.traverseLeftToRightInOrder(formula, (node) => {
			const op = DlCore.dlOperatorsUnicode.get(node.getValue());
			ss += op === undefined ? node.getValue() : op;
		}, (node, child) => {
			if (child.getChildren().length >= 2)
				ss += '(';
		}, (child, node) => {
			if (child.getChildren().length >= 2)
				ss += ')';
		} );
		return ss;
	}

	static fromPolishNotation(output, input, prioritizeBochenski, debug) {
		const operators = prioritizeBochenski ? DlCore.operators_boc : DlCore.operators_luk;
		const stack = [];
		for (let i = input.length - 1; i >= 0; i--) {
			const c = input[i];
			if (c === '>') { // unsupported variable ending
				const start = input.lastIndexOf('<', i);
				if (start === -1) {
					if (debug)
						console.error(`Parse error: Missing '<'.`);
					return false;
				} else if (start + 1 === i) {
					if (debug)
						console.error(`Parse error: Empty variable name in "<>".`);
					return false;
				} else if (debug && start + 2 === i && 'a' <= input[start + 1] && input[start + 1] <= 'z')
					console.error(`Warning: Variable '${input[start + 1]}' from "<${input[start + 1]}>" might be merged. To circumvent this, avoid names 'a', 'b', ..., 'z' for variables that occur as 27th or later.`);
				stack.push(new DlFormula(input.substring(start + 1, i))); // substr(start + 1, i - start - 1) = substring(start + 1, start + 1 + i - start - 1)
				i = start;
			} else {
				const op = operators.get(c);
				if (op === undefined)
					stack.push(new DlFormula(c));
				else { // NOTE: It is assumed that all operators are addressed by 'operators', everything else will be treated as a variable.
					const arity = DlCore.dlOperatorArity(op);
					if (stack.length < arity) {
						if (debug)
							console.error(`Parse error: Missing variable for '${c}' (alias ${DlCore.dlOperatorToString(op)}) at index ${i}.`);
						return false;
					}
					switch (arity) {
						case 0:
							stack.push(new DlFormula(DlCore.dlOperatorToString(op)));
							break;
						case 1:
							stack[stack.length - 1] = new DlFormula(DlCore.dlOperatorToString(op), [stack[stack.length - 1]]);
							break;
						case 2: {
							const term = new DlFormula(DlCore.dlOperatorToString(op), [stack[stack.length - 1], stack[stack.length - 2]]);
							stack.pop();
							stack[stack.length - 1] = term;
							break;
						}
						default:
							throw new Error(`DlCore::fromPolishNotation(): Impossible arity (${arity}) for ${DlCore.dlOperatorToString(op)}.`);
					}
				}
			}
		}
		if (stack.length !== 1) {
			if (debug)
				console.error(`Parse error: Missing or extra variables resulted in non-singleton stack ${stack}.`);
			return false;
		}
		output.value = stack[0];
		return true;
	}

	static fromPolishNotation_noRename(output, input, prioritizeBochenski, debug) {
		const operators = prioritizeBochenski ? DlCore.operators_boc : DlCore.operators_luk;
		const stack = [];
		let varLast = -1;
		for (let i = input.length - 1; i >= 0; i--) {
			const c = input[i];
			if (c === '.') { // separator of variables
				if (varLast === -1) {
					if (debug)
						console.error(`Parse error: Separator '.' does not precede a variable at index ${i}.`);
					return false;
				}
				stack.push(new DlFormula(input.substring(i + 1, varLast + 1))); // register completed variable ; substr(i + 1, varLast - i) = substring(i + 1, i + 1 + varLast - i)
				varLast = -1;
			} else {
				const op = operators.get(c);
				if (op === undefined) {
					if (varLast === -1)
						varLast = i;
				} else { // It is assumed that all operators are addressed by 'operators', everything else will be treated as a variable.
					if (varLast !== -1) {
						stack.push(new DlFormula(input.substring(i + 1, varLast + 1))); // first register completed variable ; substr(i + 1, varLast - i) = substring(i + 1, i + 1 + varLast - i)
						varLast = -1;
					}
					const arity = DlCore.dlOperatorArity(op);
					if (stack.length < arity) {
						if (debug)
							console.error(`Parse error: Missing variable for '${c}' (alias ${DlCore.dlOperatorToString(op)}) at index ${i}.`);
						return false;
					}
					switch (arity) {
						case 0:
							stack.push(new DlFormula(DlCore.dlOperatorToString(op)));
							break;
						case 1:
							stack[stack.length - 1] = new DlFormula(DlCore.dlOperatorToString(op), [stack[stack.length - 1]]);
							break;
						case 2: {
							const term = new DlFormula(DlCore.dlOperatorToString(op), [stack[stack.length - 1], stack[stack.length - 2]]);
							stack.pop();
							stack[stack.length - 1] = term;
							break;
						}
						default:
							throw new Error(`DlCore::fromPolishNotation(): Impossible arity (${arity}) for ${DlCore.dlOperatorToString(op)}.`);
					}
				}
			}
		}
		if (varLast !== -1) // still need to register variable
			stack.push(new DlFormula(input));
		if (stack.length !== 1) {
			if (debug)
				console.error(`Parse error: Missing or extra variables resulted in non-singleton stack ${stack}.`);
			return false;
		}
		output.value = stack[0];
		return true;
	}

	static toPolishNotation(formula, prioritizeBochenski = false, customOperatorTranslation = new Map(), customVariableTranslation = new Map(), sequenceOfVarNames = ["p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o"]) {
		const operatorNames = prioritizeBochenski ? DlCore.operatorNames_boc : DlCore.operatorNames_luk;
		const operatorTranslations = customOperatorTranslation;
		const variableTranslations = customVariableTranslation;
		let nextVariableIndex = 0;
		const recurse = (node) => {
			const valToString = (s) => {
				// 1. Operator names
				const op_t = operatorTranslations.get(s);
				if (op_t !== undefined)
					return op_t;
				const op_n = operatorNames.get(s);
				if (op_n !== undefined) {
					operatorTranslations.set(s, op_n);
					return op_n;
				}
				if (DlCore.dlOperators.has(s)) {
					const op_s = `<${s}>`;
					operatorTranslations.set(s, op_s); // unsupported operator
					return op_s;
				}

				// 2. Variable names
				const var_t = variableTranslations.get(s);
				if (var_t !== undefined)
					return var_t;
				if (nextVariableIndex >= sequenceOfVarNames.length) {
					const var_s = `<${s}>`;
					variableTranslations.set(s, var_s); // unsupported variable
					return var_s;
				}
				const var_n = sequenceOfVarNames[nextVariableIndex++];
				variableTranslations.set(s, var_n);
				return var_n;
			};
			let str = valToString(node.getValue());
			for (let i = 0; i < node.getChildren().length; i++) {
				str += recurse(node.getChildren()[i]);
			}
			return str;
		};
		return recurse(formula);
	}

	static toPolishNotation_noRename(f, prioritizeBochenski) {
		const operatorNames = prioritizeBochenski ? DlCore.operatorNames_boc : DlCore.operatorNames_luk;
		const recurse = (node, startsWithVar, endsWithVar) => {
			const valToString = (s) => {
				// 1. Operator names
				const op = operatorNames.get(s);
				if (op !== undefined) {
					startsWithVar.value = false;
					return op;
				}

				// 2. Variable names
				startsWithVar.value = true;
				return s;
			};
			let str = valToString(node.getValue());
			let prevEndsWithVar = startsWithVar.value;
			for (let i = 0; i < node.getChildren().length; i++) {
				let childStartsWithVar = { value: null };
				let childEndsWithVar = { value: null };
				let tmp = recurse(node.getChildren()[i], childStartsWithVar, childEndsWithVar);
				str += prevEndsWithVar && childStartsWithVar.value ? "." + tmp : tmp;
				prevEndsWithVar = childEndsWithVar.value;
			}
			endsWithVar.value = prevEndsWithVar;
			return str;
		};
		let x = { value: null };
		let y = { value: null };
		return recurse(f, x, y);
	}

	// Extract the sequence of variables of the given DL-formula
	static primitiveSequenceOfFormula(formula) {
		const result = [];
		const recurse = (formula) => {
			if (formula.getChildren().length === 0) {
				const value = formula.getValue();
				if (value !== "\\bot" && value !== "\\top")
					result.push(value);
			} else
				for (const subformula of formula.getChildren())
					recurse(subformula);
		};
		recurse(formula);
		return result;
	}
	static primitivesOfFormula_ordered(formula) {
		const result = [];
		const resultSequence = DlCore.primitiveSequenceOfFormula(formula);
		const resultSet = new Set();
		for (const name of resultSequence) {
			let oldSize = resultSet.size;
			if (resultSet.add(name).size === oldSize + 1)
				result.push(name);
		}
		return result;
	}

	static toPolishNotation_numVars(f, prioritizeBochenski) {
		const operatorNames = prioritizeBochenski ? DlCore.operatorNames_boc : DlCore.operatorNames_luk;
		const variables = DlCore.primitivesOfFormula_ordered(f);
		const variableTranslation = new Map();
		let counter = 0;
		for (const variable of variables) {
			variableTranslation.set(variable, counter.toString());
			counter++;
		}
		const recurse = (node, startsWithVar, endsWithVar) => {
			const valToString = (s) => {
				// 1. Operator names
				const op = operatorNames.get(s);
				if (op !== undefined) {
					startsWithVar.value = false;
					return op;
				}

				// 2. Variable names
				startsWithVar.value = true;
				return variableTranslation.get(s);
			};
			let str = valToString(node.getValue());
			let prevEndsWithVar = startsWithVar.value;
			for (let i = 0; i < node.getChildren().length; i++) {
				let childStartsWithVar = { value: null };
				let childEndsWithVar = { value: null };
				let tmp = recurse(node.getChildren()[i], childStartsWithVar, childEndsWithVar);
				str += prevEndsWithVar && childStartsWithVar.value ? "." + tmp : tmp;
				prevEndsWithVar = childEndsWithVar.value;
			}
			endsWithVar.value = prevEndsWithVar;
			return str;
		};
		let x = { value: null };
		let y = { value: null };
		return recurse(f, x, y);
	}
}

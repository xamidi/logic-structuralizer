class GalacticSvgGenerator {
	// specific properties of the used monospace font
	static emHeight = 256;
	static emWidth = 116;
	static emAscent = 205;
	static emPaddingTB = 3; // each top and bottom, for full-sized glyphs
	static emPaddingLR = 13; // each left and right, for full-sized glyphs
	static emSpaceBetweenGridSquares = 6;
	static alteranGridHeight = 8;
	static alteranGridWidth = 3;
	static emPosRightOfFirstSquare = this.emPaddingLR + (this.emWidth - 2 * this.emPaddingLR - (this.alteranGridWidth - 1) * this.emSpaceBetweenGridSquares) / this.alteranGridWidth; // i.e. 39, used for implication symbol
	static emPosRightOfThirdSquare = this.emWidth - this.emPaddingLR; // i.e. 103, used for detachment symbol

	static roundAndTrim(num, optOut_s = null) {
		let s = FctHelper.round(num, 6);
		while (s.endsWith('0')) {
			s = s.slice(0, -1);
			if (s.endsWith('.')) {
				s = s.slice(0, -1);
				break;
			}
		}
		if (optOut_s)
			optOut_s.value = s;
		return parseFloat(s);
	}

	static obtainDataFromFontSize(fontEm, minTextY, strokeWidth_str, strokeWidth, shiftX, shiftY, deltaX, deltaY, polyLineMinX_formulas, polyLineMinX_proofs, polyLineMinY, polyLineMinYEnd) {
		minTextY.value = this.roundAndTrim((this.emAscent / this.emHeight) * fontEm);
		strokeWidth.value = this.roundAndTrim(fontEm / 36, strokeWidth_str);
		shiftX.value = this.roundAndTrim((fontEm * this.emWidth) / this.emHeight);
		shiftY.value = this.roundAndTrim(fontEm * (2 * (this.emHeight - 2 * this.emPaddingTB - (this.alteranGridHeight - 1) * this.emSpaceBetweenGridSquares) / this.alteranGridHeight + 2 * this.emSpaceBetweenGridSquares) / this.emHeight);
		deltaX.value = this.roundAndTrim((this.emPaddingLR * fontEm) / this.emHeight + strokeWidth.value / 2);
		deltaY.value = this.roundAndTrim(fontEm * ((this.emHeight - 2 * this.emPaddingTB - (this.alteranGridHeight - 1) * this.emSpaceBetweenGridSquares) / this.alteranGridHeight) / this.emHeight);

		if (polyLineMinX_formulas)
			polyLineMinX_formulas.value = this.roundAndTrim((this.emPosRightOfFirstSquare * fontEm) / this.emHeight);
		if (polyLineMinX_proofs)
			polyLineMinX_proofs.value = this.roundAndTrim((this.emPosRightOfThirdSquare * fontEm) / this.emHeight);

		polyLineMinY.value = this.roundAndTrim(minTextY.value - ((this.emAscent - this.emPaddingTB) * fontEm) / this.emHeight + strokeWidth.value / 2);
		polyLineMinYEnd.value = this.roundAndTrim((polyLineMinY.value - strokeWidth.value / 2) + deltaY.value);
	}

	static parseWord(sequence, depths, indents, polylines, w, plain = false, normalPolishNotation = false, isFormula = true, debug = false) {
		let startTime;
		if (debug)
			console.log(`CALL:  GalacticSvgGenerator::parseWord([...], "${w}", ${plain ? "true" : "false"}, ${normalPolishNotation ? "true" : "false"}, ${isFormula ? "true" : "false"}, ${debug ? "true" : "false"})`);
		let tree = { value: null };
		let target;
		if (isFormula) {
			if (!(normalPolishNotation ? DlCore.fromPolishNotation(tree, w, false, debug) : DlCore.fromPolishNotation_noRename(tree, w, false, debug)))
				return false;
			target = DlCore.toPolishNotation_numVars(tree.value); // ensure variables are increasing numbers
			if (plain && [...target].some(ch => !"0123456789.CN".includes(ch))) { // the font currently supports only pure C-N formulas and pure D-proofs (which are similar to D-formulas)
				if (debug) // NOTE: Structured requests result in a more precise report later on.
					console.error(`Parse error: Only operators 'C' and 'N' are supported. Requested formula: "${w}"`);
				return false;
			}
		} else {
			// The target proof representation system supports arbitrary amounts of axioms, therefore axioms "a",…,"z" must be renamed to "10",…,"35", and each pair of touching axioms is to be separated by a dot.
			target = w;
			target = target.split("[").join("<[");
			target = target.split("]").join("]>");
			if (!DlCore.fromPolishNotation(tree, target, false, debug)) // groups "<[...]>" as single variable names ; condensed detachment ('D') is internally treated as nand, but this works since both are binary
				return false;
			const renameAxioms = (node) => {
				if (node.getChildren().length === 0) {
					const s = node.getValue();
					if (s.length === 0)
						throw new Error(`renameAxioms(): |s| = 0`);
					if (s[0] !== '[') {
						if (s.length !== 1)
							throw new Error(`renameAxioms(): |<axiom>| != 1 (s = "${s}")`);
						switch (s[0]) {
							default: {
								const v = 10 + s.charCodeAt(0) - 'a'.charCodeAt(0);
								if (v < 10 || v > 35)
									throw new Error(`renameAxioms(): s = "${s}", => v = ${v}`);
								node.setValue(v.toString());
								break;
							}
							case '1':
							case '2':
							case '3':
							case '4':
							case '5':
							case '6':
							case '7':
							case '8':
							case '9':
								break;
						}
					}
				} else if (plain && node.getValue() !== "\\nand") { // the font currently supports only pure C-N formulas and pure D-proofs (which are similar to D-formulas)
					if (debug) // NOTE: Structured requests result in a more precise report later on.
						console.error(`Parse error: Only operator 'D' is supported. Requested proof: "${w}"`);
					return false;
				} else
					for (let i = 0; i < node.getChildren().length; i++)
						renameAxioms(node.getChildren()[i]);
				return true;
			};
			if (!renameAxioms(tree.value))
				return false;
			target = DlCore.toPolishNotation_noRename(tree.value); // use dots between touching primitives that are not operators
			target = target.split("].").join("]"); // ']' is sufficiently separating
			target = target.split(".[").join("["); // '[' is sufficiently separating
		}
		if (debug)
			startTime = performance.now();
		if (plain) {
			sequence.push(target);
			depths.push(0);
			indents.push(0);
		} else {
			const traverseWord = (sequence, depths, input) => {
				const operators = DlCore.operators_luk;
				const binOpIndexStack = [];
				const binOpCountStack = [];
				let depth = 0;
				let varFirst = -1;
				let refFirst = -1;
				const dotIfNecessary = (varFirst) => {
					return varFirst !== -1 && input[varFirst - 1] === '.' && depth === depths[depths.length - 1] ? "." : "";
				};
				const tryRestoreDepth = () => {
					if (binOpIndexStack.length === 0)
						throw new Error(`tryRestoreDepth(): |binOpIndexStack| = 0`);
					else if (binOpCountStack[binOpCountStack.length - 1]) {
						binOpIndexStack.pop();
						binOpCountStack.pop();
						if (binOpIndexStack.length > 0) {
							depth = depths[binOpIndexStack[binOpIndexStack.length - 1]] + 1; // restore depth for children of current binary operator
							if (binOpCountStack[binOpCountStack.length - 1])
								tryRestoreDepth(); // also completes the next higher binary operator
							else
								binOpCountStack[binOpCountStack.length - 1]++; // hereby the next higher binary operator gained its first input
						} else
							depth = 0;
					} else
						binOpCountStack[binOpCountStack.length - 1]++;
				};
				const registerCompletedVariableIfAny = (i) => {
					if (varFirst !== -1) {
						sequence.push(dotIfNecessary(varFirst) + input.substring(varFirst, i));
						depths.push(depth);
						varFirst = -1;
						tryRestoreDepth();
					}
				};
				for (let i = 0; i < input.length; i++) {
					const c = input[i];
					if (c === '.') { // separator of variables
						if (varFirst === -1) {
							if (debug)
								console.error(`Parse error: Separator '.' does not succeed a variable at index ${i}.`);
							return false;
						}
						sequence.push(dotIfNecessary(varFirst) + input.substring(varFirst, i)); // register completed variable
						depths.push(depth);
						varFirst = -1;
						tryRestoreDepth();
					} else if (!isFormula && (c === '[' || c === ']')) {
						registerCompletedVariableIfAny(i);
						if (c === '[') {
							if (refFirst !== -1) {
								if (debug)
									console.error(`Parse error: Separator '[' occurs within a reference at index ${i}.`);
								return false;
							}
							refFirst = i;
						} else {
							if (refFirst === -1) {
								if (debug)
									console.error(`Parse error: Separator ']' occurs outside a reference at index ${i}.`);
								return false;
							}
							sequence.push(input.substring(refFirst, i + 1)); // register completed reference
							depths.push(depth);
							refFirst = -1;
							tryRestoreDepth();
						}
					} else {
						const op = operators.get(c);
						if (op === undefined) {
							if (refFirst === -1 && varFirst === -1)
								varFirst = i;
						} else { // NOTE: It is assumed that all operators are addressed by 'operators', everything else will be treated as a variable.
							registerCompletedVariableIfAny(i);
							if (isFormula ? (op !== DlOperator.Imply && op !== DlOperator.Not) : op !== DlOperator.Nand) { // the font currently supports only pure C-N formulas and pure D-proofs (which are similar to D-formulas)
								if (debug)
									console.error(`Parse error: Unsupported operator '${c}' (alias ${DlCore.dlOperatorToString(op)}) at index ${i}.`);
								return false;
							}
							sequence.push(c);
							depths.push(depth);
							const arity = DlCore.dlOperatorArity(op);
							switch (arity) {
								case 0:
									tryRestoreDepth();
									break;
								case 1:
									break;
								case 2:
									binOpIndexStack.push(sequence.length - 1);
									binOpCountStack.push(0);
									depth++;
									break;
								default:
									throw new Error(`Impossible arity (${arity}) for ${DlCore.dlOperatorToString(op)}.`);
							}
						}
					}
				}
				if (varFirst !== -1) { // still need to register variable
					sequence.push(dotIfNecessary(varFirst) + input.substring(varFirst)); // register completed variable
					depths.push(depth);
					tryRestoreDepth();
				}
				if (depth !== 0 || binOpIndexStack.length !== 0) {
					if (debug)
						console.error(`Parse error: Invalid sequence. (depth = ${depth}, |binOpIndexStack| = ${binOpIndexStack.length})`);
					return false;
				}
				return true;
			};
			let _sequence = [];
			let _depths = [];
			if (!traverseWord(_sequence, _depths, target))
				return false;
			if (debug)
				console.log(`_sequence = ${_sequence} (size ${_sequence.length}), _depths = ${_depths} (size ${_depths.length})`);
			let indent = 0;
			for (let i = 0; i < _sequence.length; i++) {
				sequence.push(_sequence[i]);
				depths.push(_depths[i]);
				indents.push(indent);
				let j;
				for (j = i + 1; j < _sequence.length && depths[depths.length - 1] === _depths[j]; j++)
					sequence[sequence.length - 1] += _sequence[j];
				indent += sequence[sequence.length - 1].length;
				i = j - 1;
			}
		}
		if (debug)
			console.log(`sequence = ${sequence} (size ${sequence.length}), depths = ${depths} (size ${depths.length}), indents = ${indents} (size ${indents.length})`);
		if (!plain)
			for (let i = 0; i + 1 < depths.length; i++) {
				if (depths[i] < depths[i + 1]) {
					let j = i + 2;
					while (j < depths.length && depths[i] < depths[j])
						j++;
					polylines.set(i, j - 1);
				}
			}
		if (debug) {
			console.log(`polylines = ${JSON.stringify(polylines, (key, value) => (value instanceof Map ? [...value] : value))} (size ${polylines.size})`);
			console.log(`${performance.now() - startTime} ms taken to generate a ${plain ? "plain" : "structured"} variant of "${target}".`);
		}
		return true;
	}

	static preparseSvg(fontEm, width_str, height_str, strokeWidth_str, svgId) {
		let shadow_s = { value: null }, shadow_m = { value: null }, shadow_l = { value: null };
		this.roundAndTrim(fontEm / 6, shadow_s);
		this.roundAndTrim(10 * fontEm / 6, shadow_m);
		this.roundAndTrim(15 * fontEm / 6, shadow_l);
		shadow_s = shadow_s.value;
		shadow_m = shadow_m.value;
		shadow_l = shadow_l.value;
		return "<svg"
				+ (svgId !== undefined ? ` id="${svgId}"` : "")
				+ ` width="`
				+ width_str
				+ `px" height="`
				+ height_str
				+ `px" viewBox="0 0 `
				+ width_str
				+ " "
				+ height_str
				+ "\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\">\n<rect width=\"100%\" height=\"100%\" fill=\"#2d2321\"/>\n<defs>\n<style>\n@font-face {\n  font-family: 'FormulaGalactic';\n  src:url(\"data:font/woff;base64,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\") format('woff');\n}\n"
				+ (svgId !== undefined ? `#${svgId} ` : "")
				+ "text {\n  font: normal "
				+ fontEm.toString()
				+ "px FormulaGalactic;\n  fill:#fff;\n  text-shadow: 0px 0px "
				+ shadow_s
				+ "px #f00, 0px 0px "
				+ shadow_s
				+ "px #f00, 0px 0px "
				+ shadow_s
				+ "px #500, 0px 0px "
				+ shadow_s
				+ "px #cab784, 0px 0px "
				+ shadow_l
				+ "px #cab784, 0px 0px "
				+ shadow_m
				+ "px #895129;\n}\n"
				+ (svgId !== undefined ? `#${svgId} ` : "")
				+ "polyline {\n  fill:none;\n  stroke:#fff;\n  stroke-width:"
				+ strokeWidth_str
				+ ";\n}\n</style>\n</defs>\n";
	}

	static wordAsSvg(isFormula, translateX, translateY, sequence, depths, indents, polylines, minTextY, shiftX, shiftY, deltaX, polyLineMinX, polyLineMinY, polyLineMinYEnd) {
		let svgGroup = `<g transform="translate(${translateX},${translateY})">\n`;
		polylines.forEach((last, first, map) => { // (value, key, map)
			const pos = sequence[first].indexOf(isFormula ? 'C' : 'D');
			if (pos === -1)
				throw new Error(`Binary operator '${isFormula ? "C" : "D"}' is missing from sequence[${first}] = ${sequence[first]}.`);
			let firstX = { value: null }, firstY = { value: null }, lastX = { value: null }, lastY = { value: null };
			this.roundAndTrim(polyLineMinX + (indents[first] + pos) * shiftX, firstX);
			this.roundAndTrim(polyLineMinY + depths[first] * shiftY, firstY);
			this.roundAndTrim((indents[last] + sequence[last].length) * shiftX - deltaX, lastX);
			this.roundAndTrim(polyLineMinYEnd + depths[first] * shiftY, lastY);
			firstX = firstX.value;
			firstY = firstY.value;
			lastX = lastX.value;
			lastY = lastY.value;
			svgGroup += `<polyline points="${firstX},${firstY} ${lastX},${firstY} ${lastX},${lastY}" />\n`;
		});
		for (let i = 0; i < sequence.length; i++) {
			let x = { value: null }, y = { value: null };
			this.roundAndTrim(indents[i] * shiftX, x);
			this.roundAndTrim(minTextY + depths[i] * shiftY, y);
			x = x.value;
			y = y.value;
			if (i)
				svgGroup += `<tspan x="${x}" y="${y}">${sequence[i]}</tspan>\n`;
			else
				svgGroup += `<text x="${x}" y="${y}">${sequence[i]}\n`;
		}
		svgGroup += `</text>\n</g>\n`;
		return svgGroup;
	}

	static fromWord(isFormula, fontEm, w, svgId = undefined, plain = false, normalPolishNotation = false, paddingL = 0, paddingT = 0, paddingR = 0, paddingB = 0, debug = false) {
		let startTime;

		// data based on font size
		let strokeWidth_str = { value: null };
		let minTextY = { value: null }, strokeWidth = { value: null }, shiftX = { value: null }, shiftY = { value: null }, deltaX = { value: null }, deltaY = { value: null }, polyLineMinX = { value: null }, polyLineMinY = { value: null }, polyLineMinYEnd = { value: null };
		this.obtainDataFromFontSize(fontEm, minTextY, strokeWidth_str, strokeWidth, shiftX, shiftY, deltaX, deltaY, isFormula ? polyLineMinX : null, isFormula ? null : polyLineMinX, polyLineMinY, polyLineMinYEnd);
		minTextY = minTextY.value;
		strokeWidth_str = strokeWidth_str.value;
		strokeWidth = strokeWidth.value;
		shiftX = shiftX.value;
		shiftY = shiftY.value;
		deltaX = deltaX.value;
		deltaY = deltaY.value;
		polyLineMinX = polyLineMinX.value;
		polyLineMinY = polyLineMinY.value;
		polyLineMinYEnd = polyLineMinYEnd.value;

		// parse input
		let sequence = [];
		let depths = [];
		let indents = [];
		let polylines = new Map();
		if (!this.parseWord(sequence, depths, indents, polylines, w, plain, normalPolishNotation, isFormula, debug)) {
			if (!debug) // details were already reported otherwise
				console.error("Parse error.");
			return;
		}

		// SVG based on contents
		if (debug)
			startTime = performance.now();
		let maxX = this.roundAndTrim((indents[indents.length - 1] + sequence[sequence.length - 1].length) * shiftX + paddingL + paddingR);
		let maxY = this.roundAndTrim(fontEm + Math.max(...depths) * shiftY + paddingT + paddingB);
		let svg = this.preparseSvg(fontEm, maxX, maxY, strokeWidth_str, svgId);
		svg += this.wordAsSvg(isFormula, paddingL.toString(), paddingT.toString(), sequence, depths, indents, polylines, minTextY, shiftX, shiftY, deltaX, polyLineMinX, polyLineMinY, polyLineMinYEnd);
		svg += "</svg>\n";
		if (debug)
			console.log(performance.now() - startTime + " ms taken to assemble SVG.");
		return svg;
	}

	static fromFormula(fontEm, f, svgId = undefined, plain = false, normalPolishNotation = false, paddingL = 0, paddingT = 0, paddingR = 0, paddingB = 0, debug = false) {
		return this.fromWord(true, fontEm, f, svgId, plain, normalPolishNotation, paddingL, paddingT, paddingR, paddingB, debug);
	}

	static fromProof(fontEm, p, svgId = undefined, plain = false, paddingL = 0, paddingT = 0, paddingR = 0, paddingB = 0, debug = false) {
		return this.fromWord(false, fontEm, p, svgId, plain, false, paddingL, paddingT, paddingR, paddingB, debug);
	}

	static readProofSummary(axioms, rules, s) {
		const organizeProofSummary = () => {
			const lines = s.split('\n');
			for (let line of lines) {
				if (line.endsWith('\r'))
					line = line.slice(0, -1);
				if (line.length > 0 && line[0] !== '%') {
					const start = line.search(/\S/);
					if (start === -1)
						return false;
					if (line[start] !== '[') { // axiom
						const sep = line.slice(start + 1).search(/[ :=]/);
						if (sep === -1)
							return false;
						const sepIndex = start + 1 + sep;
						const pos = line.slice(sepIndex + 1).search(/[^ :=]/);
						if (pos === -1)
							return false;
						const posIndex = sepIndex + 1 + pos;
						axioms.push([line.substring(start, sepIndex), line.substring(posIndex)]);
					} else { // rule
						const sep1 = line.indexOf(']', start + 1);
						if (sep1 === -1)
							return false;
						const pos1 = line.slice(sep1 + 1).search(/[^ :=]/);
						if (pos1 === -1)
							return false;
						const pos1Index = sep1 + 1 + pos1;
						const sep2 = line.slice(pos1Index + 1).search(/[ :=]/);
						if (sep2 === -1)
							rules.push([line.substring(start, sep1 + 1), "", line.substring(pos1Index)]);
						else {
							const sep2Index = pos1Index + 1 + sep2;
							const pos2 = line.slice(sep2Index + 1).search(/[^ :=]/);
							if (pos2 === -1)
								return false;
							const pos2Index = sep2Index + 1 + pos2;
							rules.push([line.substring(start, sep1 + 1), line.substring(pos1Index, sep2Index), line.substring(pos2Index)]);
						}
					}
				}
			}
			return true;
		};
		if (!organizeProofSummary()) {
			console.error("Parse error.");
			return;
		}

		/*console.log(`axioms:`);
		for (var i = 0; i < axioms.length; i++)
			for (var j = 0; j < axioms[i].length; j++)
				console.log(`[i=${i},j=${j}] "${axioms[i][j]}"`);
		console.log(`rules:`);
		for (var i = 0; i < rules.length; i++)
			for (var j = 0; j < rules[i].length; j++)
				console.log(`[i=${i},j=${j}] "${rules[i][j]}"`); //*/
	}

	static fromProofSummary(fontEm, s, svgId = undefined, plain = false, centered = false, normalPolishNotation = false, paddingL = 0, paddingT = 0, paddingR = 0, paddingB = 0, debug = false) {
		let startTime;

		// data based on font size
		let strokeWidth_str = { value: null };
		let minTextY = { value: null }, strokeWidth = { value: null }, shiftX = { value: null }, shiftY = { value: null }, deltaX = { value: null }, deltaY = { value: null }, polyLineMinX_formulas = { value: null }, polyLineMinX_proofs = { value: null }, polyLineMinY = { value: null }, polyLineMinYEnd = { value: null };
		this.obtainDataFromFontSize(fontEm, minTextY, strokeWidth_str, strokeWidth, shiftX, shiftY, deltaX, deltaY, polyLineMinX_formulas, polyLineMinX_proofs, polyLineMinY, polyLineMinYEnd);
		minTextY = minTextY.value;
		strokeWidth_str = strokeWidth_str.value;
		strokeWidth = strokeWidth.value;
		shiftX = shiftX.value;
		shiftY = shiftY.value;
		deltaX = deltaX.value;
		deltaY = deltaY.value;
		polyLineMinX_formulas = polyLineMinX_formulas.value;
		polyLineMinX_proofs = polyLineMinX_proofs.value;
		polyLineMinY = polyLineMinY.value;
		polyLineMinYEnd = polyLineMinYEnd.value;

		// organize input
		const axioms = [];
		const rules = [];
		this.readProofSummary(axioms, rules, s);

		// parse input
		class StructuredData {
			constructor() {
				this.sequence = [];
				this.depths = [];
				this.indents = [];
				this.polylines = new Map();
				this.width = 0.0;
				this.height = 0.0;
			}
		}
		let structuredAxioms = [];
		let structuredRules = [];
		const parse = (data, w, isFormula) => {
			if (!this.parseWord(data.sequence, data.depths, data.indents, data.polylines, w, plain, normalPolishNotation, isFormula, debug)) {
				console.error(`Failed to parse "${w}".`);
				return false;
			}
			return true;
		};
		const measure = (data) => {
			data.width = this.roundAndTrim((data.indents[data.indents.length - 1] + data.sequence[data.sequence.length - 1].length) * shiftX);
			data.height = this.roundAndTrim(fontEm + Math.max(...data.depths) * shiftY);
		};
		for (const a of axioms) {
			let axiomData = new StructuredData();
			if (!parse(axiomData, a[0], true))
				return;
			measure(axiomData);
			structuredAxioms.push([axiomData, a[1]]);
		}
		for (const a of rules) {
			let conclusionData = new StructuredData();
			let proofData = new StructuredData();
			if (a[1] !== "") {
				if (!parse(conclusionData, a[1], true))
					return;
				measure(conclusionData);
			}
			if (!parse(proofData, a[2], false))
				return;
			measure(proofData);
			structuredRules.push([a[0], conclusionData, proofData]);
		}

		// measure contents
		let maxY = paddingT + paddingB;
		let maxFirstCol_glyphs = 4;
		let maxSecondCol = 0;
		let maxThirdCol = 0;
		let maxPairWidth = 0;
		let maxPairWidthRequiresSep = true;
		for (const t of structuredAxioms) {
			const w = t[0].width;
			const h = t[0].height;
			if (maxSecondCol < w)
				maxSecondCol = w;
			if (maxPairWidth < w + (t[1][0] <= '9' ? 1 : 2) * shiftX)
				maxPairWidth = w + (t[1][0] <= '9' ? 1 : 2) * shiftX;
			maxY += h;
		}
		for (const t of structuredRules) {
			const w0 = t[0].length;
			const w1 = t[1].width;
			const h1 = t[1].height;
			const w2 = t[2].width;
			const h2 = t[2].height;
			if (maxFirstCol_glyphs < w0)
				maxFirstCol_glyphs = w0;
			if (maxSecondCol < w1)
				maxSecondCol = w1;
			if (maxThirdCol < w2)
				maxThirdCol = w2;
			if (maxPairWidth < w1 + w2) {
				maxPairWidth = w1 + w2;
				maxPairWidthRequiresSep = w1;
			}
			maxY += Math.max(h1, h2);
		}
		maxY += fontEm * (structuredAxioms.length + structuredRules.length - 1) * 0.25;
		const maxFirstCol = this.roundAndTrim((maxFirstCol_glyphs + 1) * shiftX);
		let x_eqGlyphs = { value: null }, x_col3 = { value: null };
		this.roundAndTrim(maxFirstCol + maxSecondCol + shiftX, x_eqGlyphs);
		this.roundAndTrim(maxFirstCol + maxSecondCol + 3 * shiftX, x_col3);
		x_eqGlyphs = x_eqGlyphs.value;
		x_col3 = x_col3.value;

		// SVG based on contents
		if (debug)
			startTime = performance.now();
		let maxX_str = { value: null }, maxY_str = { value: null };
		this.roundAndTrim(maxFirstCol + (centered ? maxSecondCol + maxThirdCol : maxPairWidth) + (centered || maxPairWidthRequiresSep ? 3 * shiftX : 0) + paddingL + paddingR, maxX_str);
		this.roundAndTrim(maxY, maxY_str);
		maxX_str = maxX_str.value;
		maxY_str = maxY_str.value;
		let svg = this.preparseSvg(fontEm, maxX_str, maxY_str, strokeWidth_str, svgId) + `<g transform="translate(${paddingL},${paddingT})">\n`;
		let currentY = 0;
		for (let i = 0; i < structuredAxioms.length; i++) {
			const t = structuredAxioms[i];
			const axiomData = t[0];
			const axiomName = t[1];
			let translatedAxiomName;
			if (axiomName.length !== 1)
				throw new Error(`|<axiomName>| != 1 (axiomName = "${axiomName}")`);
			switch (axiomName[0]) {
				default: {
					let v = 10 + (axiomName.charCodeAt(0) - 'a'.charCodeAt(0));
					if (v < 10 || v > 35)
						throw new Error(`axiomName = "${axiomName}", => v = ${v}`);
					translatedAxiomName = v.toString();
					break;
				}
				case '1':
				case '2':
				case '3':
				case '4':
				case '5':
				case '6':
				case '7':
				case '8':
				case '9':
					translatedAxiomName = axiomName;
					break;
			}
			let currentY_str = { value: null }, currentTextY_str = { value: null }, formulaX = { value: null }, textX = { value: null };
			this.roundAndTrim(currentY, currentY_str);
			this.roundAndTrim(minTextY + currentY, currentTextY_str);
			this.roundAndTrim(maxFirstCol + (centered ? maxSecondCol - axiomData.width : 0), formulaX);
			this.roundAndTrim(maxFirstCol + axiomData.width + shiftX, textX);
			currentY_str = currentY_str.value;
			currentTextY_str = currentTextY_str.value;
			formulaX = formulaX.value;
			textX = textX.value;
			svg += this.wordAsSvg(true, formulaX, currentY_str, axiomData.sequence, axiomData.depths, axiomData.indents, axiomData.polylines, minTextY, shiftX, shiftY, deltaX, polyLineMinX_formulas, polyLineMinY, polyLineMinYEnd);
			svg += `<text x="${centered ? x_eqGlyphs : textX}" y="${currentTextY_str}">= ${translatedAxiomName}</text>\n`;
			currentY += axiomData.height + fontEm * 0.25;
		}
		for (let i = 0; i < structuredRules.length; i++) {
			const t = structuredRules[i];
			const index = t[0];
			const conclusionData = t[1];
			const proofData = t[2];
			let currentY_str = { value: null }, currentTextY_str = { value: null }, textX = { value: null };
			this.roundAndTrim(currentY, currentY_str);
			this.roundAndTrim(minTextY + currentY, currentTextY_str);
			let _textX = this.roundAndTrim(maxFirstCol + conclusionData.width + shiftX, textX);
			currentY_str = currentY_str.value;
			currentTextY_str = currentTextY_str.value;
			textX = textX.value;
			svg += `<text x="0" y="${currentTextY_str}">${index}</text>\n`;
			if (conclusionData.sequence.length > 0) {
				let formulaX = { value: null };
				this.roundAndTrim(maxFirstCol + (centered ? maxSecondCol - conclusionData.width : 0), formulaX);
				formulaX = formulaX.value;
				svg += this.wordAsSvg(true, formulaX, currentY_str, conclusionData.sequence, conclusionData.depths, conclusionData.indents, conclusionData.polylines, minTextY, shiftX, shiftY, deltaX, polyLineMinX_formulas, polyLineMinY, polyLineMinYEnd);
				svg += `<text x="${centered ? x_eqGlyphs : textX}" y="${currentTextY_str}">= </text>\n`;
			}
			let proofX = { value: null };
			this.roundAndTrim(conclusionData.sequence.length > 0 ? _textX + 2 * shiftX : maxFirstCol + (centered ? maxSecondCol - conclusionData.width : 0), proofX);
			proofX = proofX.value;
			svg += this.wordAsSvg(false, (centered ? x_col3 : proofX), currentY_str, proofData.sequence, proofData.depths, proofData.indents, proofData.polylines, minTextY, shiftX, shiftY, deltaX, polyLineMinX_proofs, polyLineMinY, polyLineMinYEnd);
			currentY += Math.max(conclusionData.height, proofData.height) + fontEm * 0.25;
		}
		svg += "</g>\n</svg>\n";
		if (debug)
			console.log(performance.now() - startTime + " ms taken to assemble SVG.");
		return svg;
	}
}

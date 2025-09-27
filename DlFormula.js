class DlFormula {
	constructor(value = null, children = []) {
		this._value = value;
		this._children = children;
	}
	addChild(child) {
		this._children.push(child);
	}
	getValue() {
		return this._value;
	}
	setValue(value) {
		this._value = value;
	}
	getChildren() {
		return this._children;
	}
	setChildren(children) {
		this._children = children;
	}
	size() {
		let size = 1;
		const recurse = (node) => {
			if (node._children.length > 0) {
				const numChildren = node._children.length;
				size += numChildren;
				for (let i = 0; i < numChildren; i++)
					recurse(node._children[i]);
			}
		};
		recurse(this);
		return size;
	}
	height() {
		let height = 0;
		const recurse = (node, depth) => {
			if (node._children.length === 0) {
				if (depth > height)
					height = depth;
			} else
				for (let i = 0; i < node._children.length; i++)
					recurse(node._children[i], depth + 1);
		};
		recurse(this, 0);
		return height;
	}
	leafCount() {
		let leafCount = 0;
		const recurse = (node) => {
			if (node._children.length === 0)
				leafCount++;
			else
				for (let i = 0; i < node._children.length; i++)
					recurse(node._children[i]);
		};
		recurse(this);
		return leafCount;
	}
	toString() {
		const recurse = (node, indent = 0) => {
			let str = '';
			for (let i = 0; i < indent; i++)
				str += '\t';
			if (node._children.length === 0)
				str += node._value.toString() + '\n';
			else {
				str += node._value.toString() + ' -> [\n';
				for (let i = 0; i < node._children.length; i++)
					str += recurse(node._children[i], indent + 1);
				for (let i = 0; i < indent; i++)
					str += '\t';
				str += ']\n';
			}
			return str;
		};
		return recurse(this);
	}
}

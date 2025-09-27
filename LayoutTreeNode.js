class LayoutTreeNode {
	constructor(value) {
		//if (!value) //### TODO
		//	throw new Error("LayoutTreeNode: Value cannot be null.");
		this._value = value;
		this._thread = null;
		this._ancestor = null;
		this._parent = null;
		this._children = [];
		this._mod = 0;
		this._prelim = 0;
		this._change = 0;
		this._shift = 0;
		this._number = 0;
		this._level = 0;
		this._x = 0;
		this._y = 0;
	}
	getLeftSibling() {
		if (!this.getParent()) return null;
		return this.getNumber() === 0 ? null : this.getParent().getChildren()[this.getNumber() - 1];
	}
	getLeftmostSibling() {
		if (!this.getParent()) return null;
		return this.getNumber() === 0 ? null : this.getParent().getChildren()[0];
	}
	isLeaf() {
		return this.getChildren().length === 0;
	}
	NextLeft() {
		return this.getChildren().length === 0 ? this.getThread() : this.getChildren()[0];
	}
	NextRight() {
		return this.getChildren().length === 0 ? this.getThread() : this.getChildren()[this.getChildren().length - 1];
	}
	_toString(indent) {
		let str = "";
		for (let i = 0; i < indent; i++)
			str += "\t";
		if (this._children.length === 0)
			str += `${this.getValue().toString()} : (${this._x},${this._y})\n`;
		else {
			str += `${this.getValue().toString()} : (${this._x},${this._y}) -> [\n`;
			for (let i = 0; i < this._children.length; i++)
				str += this._children[i]._toString(indent + 1);
			for (let i = 0; i < indent; i++)
				str += "\t";
			str += "]\n";
		}
		return str;
	}
	toString() {
		return this._toString(0);
	}
	addChild(child) {
		this._children.push(child);
	}

	// Getters & setters
	getValue() {
		return this._value;
	}
	setValue(value) {
		if (!value)
			throw new Error("LayoutTreeNode: Value cannot be null.");
		this._value = value;
	}
	getThread() {
		return this._thread;
	}
	setThread(value) {
		this._thread = value;
	}
	getAncestor() {
		return this._ancestor;
	}
	setAncestor(value) {
		this._ancestor = value;
	}
	getParent() {
		return this._parent;
	}
	setParent(value) {
		this._parent = value;
	}
	getChildren() {
		return this._children;
	}
	setChildren(value) {
		this._children = value;
	}
	getMod() {
		return this._mod;
	}
	setMod(value) {
		this._mod = value;
	}
	getPrelim() {
		return this._prelim;
	}
	setPrelim(value) {
		this._prelim = value;
	}
	getChange() {
		return this._change;
	}
	setChange(value) {
		this._change = value;
	}
	getShift() {
		return this._shift;
	}
	setShift(value) {
		this._shift = value;
	}
	getNumber() {
		return this._number;
	}
	setNumber(value) {
		this._number = value;
	}
	getLevel() {
		return this._level;
	}
	setLevel(value) {
		this._level = value;
	}
	getX() {
		return this._x;
	}
	setX(value) {
		this._x = value;
	}
	getY() {
		return this._y;
	}
	setY(value) {
		this._y = value;
	}
}

//#######################################################################################################################################################################################################
//#                  >  >  >  A linear-time extension of the Reingold–Tilford algorithm to calculate coordinates of an esthetically pleasing printed arbitrary rooted tree.  <  <  <                    #
//# Approach taken from http://onlinelibrary.wiley.com/doi/10.1002/spe.713/pdf (Buchheim & Jünger & Leipert - Drawing rooted trees in linear time), gratefully inspired by the C# implementation of     #
//# HeuristicLab (https://dev.heuristiclab.com/trac.fcgi/), especially https://blacketernal.wordpress.com/2013/06/20/a-c-implementation-of-the-reingold-tilford-tree-layout-algorithm-for-heuristiclab/ #
//#######################################################################################################################################################################################################

class LayoutTreeStructs {}
LayoutTreeStructs.RectangleF = class RectangleF {
	constructor(x = 0, y = 0, width = 0, height = 0) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
	}
	// Assignment
	assign(rect) {
		this.x = rect.x;
		this.y = rect.y;
		this.width = rect.width;
		this.height = rect.height;
		return this;
	}
	// Comparative operators
	equals(rect) {
		return this.x === rect.x && this.y === rect.y && this.width === rect.width && this.height === rect.height;
	}
	notEquals(rect) {
		return !this.equals(rect);
	}
	// Printer
	toString() {
		return `(${this.x},${this.y},${this.width},${this.height})`;
	}
}

class LayoutTreeEngine {
	// Construction
	constructor(tree, execute = true) {
		this._minHorizontalSpace = 5;
		this._minVerticalSpace = 5;
		this._nodes = [];
		this._root = null;
		if (tree !== undefined) {
			const nodeVec = TreeNodeAdapter.createLayoutTreeVec(tree, TreeNodeAdapter.convertFuncDefault);
			this.setRoot(nodeVec[0]);
			this.addNodes(nodeVec);
			if (execute)
				this.execute();
		}
	}
	addNode(node) {
		this._nodes.push(node);
	}
	addNodes(nodes) {
		for (const node of nodes)
			this._nodes.push(node);
	}

	// Getters & setters
	getNodesForValue(value) {
		const results = [];
		for (const entry of this._nodes)
			if (entry.getValue() === value)
				results.push(entry);
		return results;
	}
	getNodes() {
		return this._nodes;
	}
	getMinHorizontalSpace() {
		return this._minHorizontalSpace;
	}
	setMinHorizontalSpace(value) {
		this._minHorizontalSpace = value;
	}
	getMinVerticalSpace() {
		return this._minVerticalSpace;
	}
	setMinVerticalSpace(value) {
		this._minVerticalSpace = value;
	}
	getRoot() {
		return this._root;
	}
	setRoot(value) {
		this._root = value;
	}

	// Resets coordinates of all nodes
	resetCoordinates() {
		for (const node of this._nodes) {
			node.setX(0);
			node.setY(0);
		}
	}

	// Transforms LayoutNode coordinates so that all coordinates are positive and start from 0
	normalizeCoordinates() {
		let xmin = 0, ymin = 0;
		for (const node of this._nodes) {
			if (xmin > node.getX())
				xmin = node.getX();
			if (ymin > node.getY())
				ymin = node.getY();
		}
		for (const node of this._nodes) {
			node.setX(node.getX() - xmin);
			node.setY(node.getY() - ymin);
		}
	}

	// Resets nodes
	reset() {
		this._root = null;
		this._nodes = [];
	}

	// Resets layout of all nodes
	resetParameters() {
		for (const node of this._nodes) {
			node.setAncestor(node);
			node.setThread(null);
			node.setChange(0);
			node.setShift(0);
			node.setPrelim(0);
			node.setMod(0);
		}
	}

	// Returns the bounding box for this layout. When the layout is normalized, the rectangle should be (0, 0, xmin, xmax).
	bounds() {
		let xmin = 0, xmax = 0, ymin = 0, ymax = 0;
		for (const node of this._nodes) {
			const x = node.getX(), y = node.getY();
			if (xmin > x)
				xmin = x;
			if (xmax < x)
				xmax = x;
			if (ymin > y)
				ymin = y;
			if (ymax < y)
				ymax = y;
		}
		return new LayoutTreeStructs.RectangleF(xmin, ymin, xmax + this._minHorizontalSpace, ymax + this._minVerticalSpace);
	}

	//##############################################################################################################################
	//# All functions described in APPENDIX A. THE COMPLETE REVISED ALGORITHM, with the extra feature of coordinate normalization. #
	//##############################################################################################################################

	execute() { // TREELAYOUT(T), where T = this
		if (!this._root)
			throw new Error("LayoutTreeEngine::execute(): Root cannot be null.");
		this.resetCoordinates();
		this.resetParameters();
		this._firstWalk(this._root);
		this._secondWalk(this._root, -this._root.getPrelim());
		this.normalizeCoordinates();
	}

	_firstWalk(v) { // FIRSTWALK(v)
		let w;
		if (v.isLeaf()) {
			w = v.getLeftSibling();
			if (w)
				v.setPrelim(w.getPrelim() + this._minHorizontalSpace);
		} else {
			let defaultAncestor = v.getChildren()[0];
			for (const child of v.getChildren()) {
				this._firstWalk(child);
				this._apportion(child, defaultAncestor);
			}
			this._executeShifts(v);
			const leftmost = v.getChildren()[0];
			const rightmost = v.getChildren()[v.getChildren().length - 1];
			const midPoint = (leftmost.getPrelim() + rightmost.getPrelim()) / 2;
			w = v.getLeftSibling();
			if (w) {
				v.setPrelim(w.getPrelim() + this._minHorizontalSpace);
				v.setMod(v.getPrelim() - midPoint);
			} else
				v.setPrelim(midPoint);
		}
	}

	_apportion(v, defaultAncestor) { // APPORTION(v,defaultAncestor)
		let w = v.getLeftSibling();
		if (!w)
			return;
		let vip = v;
		let vop = v;
		let vim = w;
		let vom = vip.getLeftmostSibling();

		let sip = vip.getMod();
		let sop = vop.getMod();
		let sim = vim.getMod();
		let som = vom.getMod();

		while (vim.NextRight() && vip.NextLeft()) {
			vim = vim.NextRight();
			vip = vip.NextLeft();
			vom = vom.NextLeft();
			vop = vop.NextRight();
			vop.setAncestor(v);
			let shift = (vim.getPrelim() + sim) - (vip.getPrelim() + sip) + this._minHorizontalSpace;
			if (shift > 0) {
				let ancestor = this.Ancestor(vim, v, defaultAncestor);
				this._moveSubtree(ancestor, v, shift);
				sip += shift;
				sop += shift;
			}
			sim += vim.getMod();
			sip += vip.getMod();
			som += vom.getMod();
			sop += vop.getMod();
		}
		if (vim.NextRight() && !vop.NextRight()) {
			vop.setThread(vim.NextRight());
			vop.setMod(vop.getMod() + (sim - sop));
		}
		if (vip.NextLeft() && !vom.NextLeft()) {
			vom.setThread(vip.NextLeft());
			vom.setMod(vom.getMod() + (sip - som));
			defaultAncestor = v;
		}
	}

	// NEXTLEFT(v) is LayoutTreeNode<T>::NextLeft()

	// NEXTRIGHT(v) is LayoutTreeNode<T>::NextRight()

	_moveSubtree(w_minus, w_plus, shift) { // MOVESUBTREE(w−,w+,shift)
		const subtrees = w_plus.getNumber() - w_minus.getNumber();
		if (subtrees === 0)
			throw new Error("LayoutTreeEngine::_moveSubtree(): MoveSubtree failed: We have number(w_plus) == number(w_minus), are there cycles?");
		w_plus.setChange(w_plus.getChange() - shift / subtrees);
		w_plus.setShift(w_plus.getShift() + shift);
		w_minus.setChange(w_minus.getChange() + shift / subtrees);
		w_plus.setPrelim(w_plus.getPrelim() + shift);
		w_plus.setMod(w_plus.getMod() + shift);
	}

	_executeShifts(v) { // EXECUTESHIFTS(v)
		if (v.isLeaf())
			return;
		let shift = 0;
		let change = 0;
		for (let i = v.getChildren().length - 1; i >= 0; i--) {
			const w = v.getChildren()[i];
			w.setPrelim(w.getPrelim() + shift);
			w.setMod(w.getMod() + shift);
			change += w.getChange();
			shift += (w.getShift() + change);
		}
	}

	Ancestor(u, v, defaultAncestor) { // ANCESTOR(v^i-,v,defaultAncestor)
		const ancestor = u.getAncestor();
		return ancestor ? (ancestor.getParent() === v.getParent() ? ancestor : defaultAncestor) : defaultAncestor;
	}

	_secondWalk(v, m) { // SECONDWALK(v, m)
		v.setX(v.getPrelim() + m);
		v.setY(v.getLevel() * this._minVerticalSpace);
		if (v.isLeaf())
			return;
		for (const child of v.getChildren())
			this._secondWalk(child, m + v.getMod());
	}
}

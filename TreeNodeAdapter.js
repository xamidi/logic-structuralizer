class TreeNodeAdapter {
	static convertFuncDefault(node) {
		const layoutNode = new LayoutTreeNode();
		layoutNode.setValue(node);
		layoutNode.setAncestor(layoutNode);
		return layoutNode;
	}

	static createLayoutTreeVec(root, convertFunc) {
		// 1. Create layout tree
		const layoutRoot = convertFunc(root);
		layoutRoot.setAncestor(layoutRoot);
		if (root.getChildren().length !== 0)
			this._createLayoutTree(layoutRoot, convertFunc);

		// 2. Put nodes into array
		const nodes = [layoutRoot];
		for (let i = 0; i < nodes.length; i++)
			for (const childNode of nodes[i].getChildren())
				nodes.push(childNode);
		return nodes;
	}

	static createLayoutTreeVec_outVec(outVec, root, convertFunc) {
		// 1. Create layout tree
		const layoutRoot = convertFunc(root);
		layoutRoot.setAncestor(layoutRoot);
		if (root.getChildren().length !== 0)
			this._createLayoutTree(layoutRoot, convertFunc);

		// 2. Put nodes into array
		outVec.push(layoutRoot);
		for (let i = 0; i < outVec.length; i++)
			for (const childNode of outVec[i].getChildren())
				outVec.push(childNode);
	}

	static _createLayoutTree(layoutNode, convertFunc) {
		for (let i = 0; i < layoutNode.getValue().getChildren().length; i++) {
			const childNode = layoutNode.getValue().getChildren()[i];
			const childLayoutNode = convertFunc(childNode);
			childLayoutNode.setParent(layoutNode);
			childLayoutNode.setNumber(i);
			childLayoutNode.setLevel(layoutNode.getLevel() + 1);
			childLayoutNode.setAncestor(childLayoutNode);
			layoutNode.addChild(childLayoutNode);
			if (childNode.getChildren().length !== 0)
				this._createLayoutTree(childLayoutNode, convertFunc);
		}
	}
}

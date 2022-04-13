const horizontalSpace = 1;

class TreeNode {
	constructor(element) {
		this.element = element;
		this.children = new Array();
		this.width = 0;
	}
	
	static fromDict(dict) {
		//the dictionary keys are strings (labels) and values are arrays of dictionaries (subtrees)
		//the leaves are dictionaries with both key and value as labels
		//Really these should be tuples instead of dictionaries... but this matches JSON format a bit better
		for (var key in dict) {
			let root = new TreeNode(key)
			if (typeof(dict[key]) === 'string') {
				root.addChild(new TreeNode(dict[key]))
			} else {
				for (var child in dict[key]) {
					root.addChild(TreeNode.fromDict(dict[key][child]))
				}
			}
			return root
		}
	}
	
	addChild(node) {
		this.children.push(node);
	}
	
	treeHeight() {
		if (this.children.length == 0) {
			return 1
		}
		let childrenHeights = this.children.map(function(child) {
			return child.treeHeight();
		});
		
		let maxHeight = childrenHeights.reduce(function(total, currentValue) {
			return Math.max(total, currentValue);
		}, 0);
		
		return maxHeight + 1;
	}
	
	calculateAndSaveWidth(context) {
		const textWidth = context.measureText(this.element).width;
		
		if (this.children.length == 0) {
			this.width = textWidth;
			return;
		}
		
		//need an array of the children's widths
		const childrenWidths = this.children.map(function(child) {
			if (child.width == 0) {
				child.calculateAndSaveWidth(context)
			}
			return child.width
		});
		
				
		
		let sum = -horizontalSpace
		for (var i = 0; i < this.children.length; i++){
			sum += childrenWidths[i] + horizontalSpace
		}
		this.width = Math.max(this.width, sum);
	}
	
	addToCanvas(context, x, y, width, height, fontSize, spaceBetweenRows) {
		if (this.width === 0) {
			this.calculateAndSaveWidth(context);
		}
		
		if (this.children.length == 0) {
			//These are the leaf nodes
			if (darkMode) {
				context.fillStyle = "white"
			} else {
				//Dark purple in light mode
				context.fillStyle = "#4f26e1";
			}
			context.fillText(this.element, x+width/2, y+fontSize/2);
			
		} else {
			//These are the non-terminal nodes
			if (darkMode) {
				//light blue
				context.fillStyle = "#63b6fe"
			} else {
				//darker blue
				context.fillStyle = "#60b0f4";
			} 
			context.fillText(this.element, x+width/2, y+fontSize/2);
			
			const childY = y+fontSize+spaceBetweenRows;
			const childHeight = height - fontSize - spaceBetweenRows;
			
			let childrensWidths = this.children.map(function(child){
				if (child.width === 0) {
					child.calculateAndSaveWidth(context)
				}
				return child.width;
			}).reduce(function(sum, thisElement) {
				return sum + thisElement
			});
			
			
			if (this.children.length == 1) {
				context.moveTo(x+width/2, y+fontSize);
				context.lineTo(x+width/2, childY);
				context.stroke();
				
				this.children[0].addToCanvas(context, x, childY, width, childHeight, fontSize, spaceBetweenRows, darkMode)
				return;
			}
			
			const spaceBetween = (width - childrensWidths) / (this.children.length - 1);
		
			let xSoFar = x
			for (var i = 0; i < this.children.length; i++) {
				let child = this.children[i];
				
				context.moveTo(x+width/2, y+fontSize);
				context.lineTo(xSoFar+child.width/2, childY);
				context.stroke();
				
				child.addToCanvas(context, xSoFar, childY, child.width, childHeight, fontSize, spaceBetweenRows, darkMode);
				xSoFar += child.width + spaceBetween;
			}
		}
	}
}

function drawTreeInCanvas(treeRoot, canvas, darkMode) {
	let context = canvas.getContext('2d');
	
	const fontSize = 25;
	const spaceBetweenRows = 10;
	
	context.font = fontSize + "px Arial";
	
	treeRoot.calculateAndSaveWidth(context);
	
	const width = Math.max(canvas.width, treeRoot.width)

	canvas.width = width
	
	const height = treeRoot.treeHeight() * (fontSize + spaceBetweenRows);
	context.fillRect(0,0, canvas.width, height);
	
	canvas.height = height
	
	if (darkMode) { //this will change the color of the lines from black to light purple
		context.strokeStyle = "#8177A5"
	}
	
	context.textAlign = "center";
	treeRoot.addToCanvas(context, 0, 0, canvas.width, height, fontSize, spaceBetweenRows, darkMode);
}
//class Utility contains all utility functions related to the UI display
class Utility {

	//function that returns true if the popup box is overflown
	static isOverflown(windowBody, element) {
    	if (!element) {return;}
		
		var isOverflowing = (windowBody.clientWidth < element.scrollWidth) || (windowBody.clientHeight < element.scrollHeight);
		   
	   	return isOverflowing;
	};

	//function that automatically resizes the popup window
	static autoResize(windowBody, element) {
		if (!element) {console.log("!element in autoResize"); return;}

		//sending a message to conent.js that popup content is overflowing along with the new required size
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {

			//*note: when a method is defined as static, it can be called with Class.method() and avoids using this. This resolves the 'method is not a function' uncaught error.
			const isO = Utility.isOverflown(windowBody, element);

			//when an image is enlarged the size of the imagebox will hold the highest value, while document.body.scrollWidth will have it when the image is in the small format.
			var toSendWidth = 0;

			//set toSendWidth to the larger between imageBox' scrollWidth and the popup's scrollWidth
			if(element.scrollWidth > windowBody.scrollWidth){
				toSendWidth = element.scrollWidth;
			}
			else{
				toSendWidth = windowBody.scrollWidth;
			}

			//when an image is enlarged the size of the imagebox will hold the highest value, while document.body.scrollHight will have it when the image is in the small format.
			var toSendHeight = 0;

			//set toSendHeight to the larger between imageBox' scrollHeight and the popup's scrollHeight
			if(element.scrollHeight > windowBody.scrollHeight){
				toSendHeight = element.scrollHeight;
			}
			else{
				toSendHeight = windowBody.scrollHeight;
			}

			//send a message to content.js to resize the popup while it's still active in the webpage
			chrome.tabs.sendMessage(tabs[0].id, {isOverflown: isO, newWidth: toSendWidth, newHeight: toSendHeight}, function(response) {
				//leaving this in here because the messages seem to break without a response
				return;
			});
		});
	};

	static makeOnlyActiveElement(activeElement, allElements){
		for (var i = 0; i < allElements.length; i++){
			if ( allElements[i] == activeElement ) {
				// show current chosen tab
				//TODO: Look at supporting multiple classes
				document.getElementById(allElements[i]).className = 'active';
			} else {
				// change display of other tabs to none
				document.getElementById(allElements[i]).className = '';
			}
		}
	};

	static changeTab(box, boxes){
		for (var i = 0; i < boxes.length; i++){
			if ( boxes[i] == box ) {
				// show current chosen tab
				document.getElementById(boxes[i]).style.display = 'inline-block';
				// resize window
				//Utility.autoResize(document.body, document.getElementById(boxes[i]));
			} else {
				// change display of other tabs to none
				document.getElementById(boxes[i]).style.display = 'none';
			}
		}
	};
};

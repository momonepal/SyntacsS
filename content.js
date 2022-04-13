function createCSS() {
	// Set up the css of the popup window
	const css = window.document.createElementNS( 'http://www.w3.org/1999/xhtml', 'link');
	css.setAttribute('rel', 'stylesheet');
	css.setAttribute('type', 'text/css');
	css.setAttribute('href', chrome.extension.getURL('syntacs-window.css'));
	window.document.getElementsByTagName('head')[0].appendChild(css);
}

function countWords(str) { 
	return str.split(" ").length;
}

function getSelectedText() {
	var text = "";
	if (typeof window.getSelection != "undefined") {
		text = window.getSelection().toString();
	}
	else if (typeof document.selection != "undefined" && document.selection.type == "Text") {
		text = document.selection.createRange().text;
	}
	return text.trim();
}


function featureIsOn(featureName) {
	/*
	input type: str
	parameter featureName: feature name stored for state query such as "popup".
	return type: str
	return value: "ture" is feature is on else "false"
	*/

	// send msg to background.js to querry for the popup's state.
	chrome.runtime.sendMessage({"featureName" : featureName}, function(response) {
		sessionStorage.setItem(featureName, response.state);
	});

	// retrieve the state and return
	let state = sessionStorage.getItem(featureName);
	return state;
}

function popUp(event) {
	if (!chrome.runtime) {
		window.location.reload(true);
		return;
	} 
	// commenting this out and not deleting because I'm not sure if people need this
	// // if alt key is not selected, return
	// if (event.altKey != true) {
	// 	return;
	// }

	// if feature is off, don't show popup window
	if (featureIsOn("popup") == "false") {
		return;
	}
	
	wordCount = countWords(getSelectedText());

	window.savedText = getSelectedText();

	// popup doesn't appear if the string contains only whitespace
	if (!getSelectedText().replace(/\s/g, '').length) {
		return;
	}

	// if the string is too long no popup window will open
	if (wordCount >= 40) {
		console.log("String is too long for translation.");
		return;
	}
	
	let popupHTML = 'popup.html';
	if (wordCount > 1) {
		popupHTML = 'sentence_popup.html';
	}

	// if text is selected
	if (!window.getSelection().isCollapsed) {

		// if popup doesn't exist
		if (!popup) {
			//Make the actual window
			popup = document.createElement('iframe');
			popup.setAttribute('id', 'syntacs-window');
			window.document.documentElement.appendChild(popup);
		}

		// if icon doesn't exist
		if (!icon) {
			//Make the icon
			icon = document.createElement('img');
			icon.src = chrome.runtime.getURL('icons/icon48.png');
			icon.setAttribute('id', 'icon');
			window.document.documentElement.appendChild(icon);
		}

		//add the scroll so that we get the right place on screen
		let x = event.clientX + window.scrollX;
		let y = event.clientY + window.scrollY;

		// update popup so it translates the word every time
		popup.src  = chrome.runtime.getURL(popupHTML);

		//move the window to the correct location
		// popup doesn't display yet, only icon displays at first
		popup.style.left = x + 'px';
		popup.style.top = y + 'px';
		popup.style.display = 'none';

		icon.style.left = x + 'px';
		icon.style.top = y + 'px';
		icon.style.display = 'block';

		// when icon is clicked on, popup displays
		icon.addEventListener('click', function(){
			popup.style.display = 'block';
			icon.style.display = 'none';
		});
	}

}

// create the CSS file
createCSS()

// get the popup & icon
popup = window.document.getElementById('syntacs-window');
icon = window.document.getElementById('icon')

// make popup/icon appear when text is selected
window.addEventListener('mouseup', popUp);

// make popup/icon disappear when mouse clicks elsewhere
window.addEventListener('mousedown', function () {
	if (popup && popup.style.display == 'block') {
		popup.style.display = 'none';
	}

	if (icon && icon.style.display == 'block' && event.target !== icon) {
		icon.style.display = 'none';
	}
});

//listen for a message from popup.js and act if message received
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

	//making sure the values exist, because otherwise height or width will be set to 0 and the image will become invisible
	if (request.newWidth != null || request.newHeight != null){

		if(request.isOverflown){

			//changing the width to new value. The +20 is there to fully get rid of the scroll bar
			popup.style.width = (request.newWidth + 20) + "px";

			//changing the width to new value. The +20 is there to fully get rid of the scroll bar
			popup.style.height = (request.newHeight + 20) + "px";
		}
		else{

			//setting the width to the old default from syntacs-window.css
			popup.style.width = 440 + "px";

			//setting the height to the old default from syntacs-window.css
			popup.style.height = 280 + "px";
			//it's necessary to include this else statement because the popup just stays big when a new, shorter input is selected
		}

		//removing the response part on popup.js seemed to cause problems, so just leaving the default response from google documentation
		sendResponse({farewell: "goodbye"});

	} else if (request.getText == true) {
		sendResponse(window.savedText);
	}
});

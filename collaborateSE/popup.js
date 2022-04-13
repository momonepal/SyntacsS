let highlightedText = ""

let background = chrome.extension.getBackgroundPage();

// imageNumber specifies which image to show when you get image
let imageNumber = 0;

// all definitions variables. make this here to use later
let fullDefinitions = "";
let shortDefinitions = "";
let definitionArray = [];


// localize the extension UI based on system language
function localize() {
	//supporting spanish as a second language
	document.getElementById("detectedLanguage").innerHTML = chrome.i18n.getMessage("detectedLanguage") + ' <span id="detectedText">None</span>'
    
    const detectedT = chrome.i18n.getMessage("detectedText")
    document.getElementById("detectedText").innerHTML = detectedT

	const definitionB = chrome.i18n.getMessage("definitionBtn")
	document.getElementById("definitionBtn").innerHTML = definitionB

	const synonymB = chrome.i18n.getMessage("synonymsBtn")
	document.getElementById("synonymsBtn").innerHTML = synonymB

	const exampleB = chrome.i18n.getMessage("examplesBtn")
	document.getElementById("examplesBtn").innerHTML = exampleB

	const imageB = chrome.i18n.getMessage("imageBtn")
	document.getElementById("imageBtn").innerHTML = imageB
    
    const noDefinition = chrome.i18n.getMessage("no_definition")
    document.getElementById("en_definition").innerHTML = noDefinition
    
    const moreB = chrome.i18n.getMessage("moreBtn")
    document.getElementById("moreDefinition").innerHTML = moreB

	const nextImage = chrome.i18n.getMessage("newImage")
	document.getElementById("newImage").innerHTML = nextImage
    
}

// translateInput compiles all the initial commands for easier calling through events later
async function getTranslation(originalText, L1_code){
	var translation = new Translation;

	if (originalText.length == 0) {
		return ;
	}

	let translatedText = await translation.translateText(originalText, L1_code);
	let detectedLanguage = await translation.detectLanguage(originalText, L1_code);

	// Get the element by id (of popup.html) and change that to the translated text.
	// The span element in the middle is the HTML code for the double arrow.
	document.getElementById('translatedText').innerHTML = originalText + " <span>&#187;</span> " + translatedText;

	// only shows the language if it's a valid input, otherwise show "None"
	if (typeof(detectedLanguage) != 'undefined' && !Meta.removeSpecialCharacters(originalText) == "") {

		// Get the element by id (of popup.html) and change that to the detected source language.
		detectedLanguageName = isoLangs[detectedLanguage].name;

		if (detectedLanguageName == 'English') {
			document.getElementById('detectedText').textContent = chrome.i18n.getMessage("englishLanguage");
		} else {
			document.getElementById('detectedText').textContent = detectedLanguageName;
		}
	}
}

//function that populates the different text tabs in order
async function populateTextContent(text) {
	definitionArray = await Meta.getShortDefinition(text);
	let definitionHTML = document.getElementById('en_definition');

	if(definitionArray && definitionArray[0]) {
		//get definition of input text
		shortDefinitions = definitionArray[0];	
	}

	//if definition is returned. Element 0 is the full definition string. 1 is the first definition for saving
	if (shortDefinitions && shortDefinitions != "") {
		definitionHTML.innerHTML = shortDefinitions;
	}

	// get all definitions for when you click on more button
	const allDefinitions = await Meta.getAllDefinitions(text);

	if (allDefinitions) {
		fullDefinitions = allDefinitions;
	}

	let filteredDefs =  [Meta.removeSpecialCharacters(shortDefinitions), Meta.removeSpecialCharacters(allDefinitions)];

	// if both long and short def are not the same, or if there's definition, show more btn
	if (filteredDefs[0].length != filteredDefs[1].length
		&& !definitionHTML.innerHTML != "No definition available"
		&& shortDefinitions != null) {
		document.getElementById("moreDefinition").style.display = 'inline-block';
	}

    // checks if alphanum, implemented to grey out all buttons 
    if (!(text.match("^[a-zA-Z0-9]*$"))){
    	return;
    }
    
	//get synonyms for input text
	const synonyms = await Meta.getSynonyms(text);

	//if synonyms are returned:
	if (synonyms) {

		//fill in content
		document.getElementById('en_synonym').innerHTML = synonyms;

		//make button clickable
		document.getElementById('synonymsBtn').disabled = false;
	}

	//get usage examples for input text
	const examples = await Meta.getUsageExamples(text);

	//if examples are returned:
	if (examples) {

		//fill in content
		document.getElementById('usageExamples').innerHTML = examples;

		//make button clickable
		document.getElementById('examplesBtn').disabled = false;
	}

}

async function populateImages(text, imageNumber) {
	// display and load image button depending on the browseractions toggles
	background.getChrome().storage.sync.get(background.featuresState, async function(items) {

		// dont display and load image button if setting is set to false
		if (background.featuresState.includePictures == false){
			document.getElementById("imageBtn").style.display = "none";
			
		// if true, get the images.
		} else {

			// image is stored in an array, element 0 = URL, element 1 = photo credit, element 3 = number of photos returned
			const resultArray = await Meta.getImage(text, imageNumber);
			const imageURL = resultArray[0], photoCredit = resultArray[1], numberOfImages = resultArray[3];

			// if only one image, hide "Next Image" button
			if (numberOfImages <= 1) {
				document.getElementById("newImage").display = none
			}

			//if an image is returned:
			if (imageURL) {

				//set the searchedImage element to returned image
				var image = document.getElementById("searchedImage");
				image.src = imageURL;

				//make it visible
				image.style.display = 'block';

				//show photo credit
				document.getElementById("photoCredit").innerHTML = "@" + photoCredit + " - pixabay.com";

				//make button clickable
				document.getElementById('imageBtn').disabled = false;
			}
		}
	});
}

function displayGeneratedContent(selection) {
	// valid queries only, fix property by 0 error.
	if (typeof(selection) == "undefined" || selection.length == 0) {
		return;
	}

	//selection is an array. value 0 is the highlighted portion, value 1 is the string length.
	highlightedText = String(selection).trim();

	chrome.storage.sync.get({L1_code : 'es'}, function(result){
		getTranslation(highlightedText, result.L1_code);
	});

	//after displaying the text, if it's some wacky characters, return and turn off more button.
	if (Meta.removeSpecialCharacters(selection) == "") {
		document.getElementById("moreDefinition").style.display = 'none'
		return;
	}

	populateTextContent(highlightedText);

	// default image number = 0, show the first one first, then show others later.
	populateImages(highlightedText, imageNumber);

	chrome.storage.sync.get('userSavedWords', function(data){
		const wordDict = data.userSavedWords;
		let wordToSave = highlightedText.toLowerCase();
		wordToSave.replace(/[^0-9a-z]/gi, '')


		// add class "saved" if the word is saved already
		if (wordDict && wordDict[wordToSave]) {
			document.getElementById("saveButton").className += "saved";
		}
	});
}

// get access to background page, assign the page handler to bg
var bg = chrome.extension.getBackgroundPage();

bg.getChrome().storage.sync.get(bg.featuresState, function(items) {

	const themeStylesheet = document.getElementById('popup-theme');

	if (items["dark"] == true) {
		themeStylesheet.href = 'popup-dark.css';
	}

	else {
		themeStylesheet.href = 'popup.css';
	}
});

// apply the functions to the buttons
onload = async function() {

	var speechSynth = window.speechSynthesis;

	localize();

	const buttons = ["definitionBtn", "synonymsBtn", "examplesBtn", "imageBtn"];
	const boxes = ["definitionBox", "synonymsBox", "examplesBox", "imageBox"];

	// let is used here as a block-scoped variable
	for (let i = 0; i < buttons.length; i++) {
		document.getElementById(buttons[i]).addEventListener("click",
			function() {

			// switch to correct tab
			Utility.changeTab(boxes[i], boxes);

			Utility.makeOnlyActiveElement(buttons[i], buttons);

		}, true);
	}

	// event listener for clicking on Save button
	document.getElementById("saveButton").addEventListener("click",
		function() {

            let wordToSave = ""
            wordToSave = highlightedText.trim().toLowerCase().replace(/[^A-Za-z0-9]/g, '');



 			// change button style after being clicked. If word is saved, turn to unsave mode.
 			if (this.className == "saved") {

 				Saving.deleteSavedWord(wordToSave);

 				var current = document.getElementsByClassName("saved");
 				current[0].className = current[0].className.replace("saved", "");

 			// fill in the star
 		} else {

		        // don't save if the word is not definable/doesn't make sense
		        if (typeof(definitionArray[0]) == undefined || definitionArray[0] == null) {
		        	console.log('Cannot save a non-word');
		        	return;
		        }

		        Saving.saveWordInfo(wordToSave);
		        this.className += "saved";
		    }

		}, true);

	// event listener for clicking on Pronounce button
	document.getElementById("pronounceWord").addEventListener("click",
		function() {

			if (highlightedText.length > 0) {

				Meta.pronounceWord(speechSynth, highlightedText);
			}

		}, true);

	document.getElementById("newImage").addEventListener("click",
		function() {

			// imageNumber specifies which image to show. Will loop back to the
			// beginning if exceeds total number of imgs.
			imageNumber += 1
			populateImages(highlightedText, imageNumber)

		}, true);

	//add the event listener for clicking to enlarge the image. not sure why but only works correctly if put here.
	SyntacsImage.imageEventListener(document.getElementById("searchedImage"));

	const moreButton = document.getElementById("moreDefinition");

	//bool to keep track of the state of the button
	let moreIsOn = false;

	moreButton.addEventListener("click", function() {
		moreIsOn = !moreIsOn;
		// get original coordinate of the scroll view
		let yCoordinate = window.pageYOffset;

		if(moreIsOn){
			// when press more, show full unfiltered definitions
			document.getElementById('en_definition').innerHTML = fullDefinitions;

			//change more to less
			this.innerText = "less";

			// scroll to original view
			scroll(0, yCoordinate);

		} else {
			// when press less, show short definitions
			document.getElementById('en_definition').innerHTML = shortDefinitions;

			//change less to more
			this.innerText = "more";

			// scroll to original view
			scroll(0, yCoordinate);
		}
	});

	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.sendMessage(tabs[0].id, {getText: true}, displayGeneratedContent);
	});
}

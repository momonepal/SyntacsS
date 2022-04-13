let highlightedText = ""

function populatePopup(selection) {
	if (typeof(selection) === "undefined") {
		return;
	}
	// query is the text highlighted by the user
	highlightedText = selection;
	document.getElementById('originalText').innerText = highlightedText

	chrome.storage.sync.get({L1_code : 'es'}, function(result){
		translateInput(highlightedText, result.L1_code);
	});
	
	tryDefinition(highlightedText);
	fillPOSBox(highlightedText);
	fillSyntaxBox(highlightedText);
}

async function tryDefinition(text) {
	definitionArray = await Meta.getShortDefinition(text);

	//get definition of input text
	const shortDefinitions = definitionArray[0];
	console.log(shortDefinitions);

	let definitionHTML = document.getElementById('en_definition');

	//if definition is returned. Element 0 is the full definition string. 1 is the first definition for saving
	if (!shortDefinitions || shortDefinitions === "No definition available") {
		return;
	}
	
	//turn off translation and turn on definition/examples/synonyms
	document.getElementById('definitionBtn').style.display = 'inline-block';
	document.getElementById('definitionBox').style.display = 'inline-block';
	document.getElementById('examplesBtn').style.display = 'inline-block';
	document.getElementById('synonymsBtn').style.display = 'inline-block';
	document.getElementById('translationBtn').style.display = 'none';
	document.getElementById('translationBox').style.display = 'none';
	
	definitionHTML.innerHTML = shortDefinitions;
	
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

// translateInput compiles all the initial commands for easier calling through events later
async function translateInput(highlightedText, L1_code){
	var translation = new Translation;

	if (highlightedText.length == 0) { return; }

	let translatedText = await translation.translateText(highlightedText, L1_code);

	// Get the element by id (of popup.html) and change that to the translated text.
	// The span element in the middle is the HTML code for the double arrow.
	document.getElementById('translatedText').innerHTML = translatedText;
	
	if (document.getElementById('translationBtn').style.display == 'none') {
		document.getElementById('originalText').innerHTML = highlightedText + " <span>&#187;</span> " + translatedText;
	}

	//calling the autoResize here because we need the width of the content after the content has been populated.
	//Utility.autoResize(document.body);


}

async function fillPOSBox(highlightedText) {
	//[['I', 'PRP'], ['like', 'VB'], ['puppies', 'NN']]
	//A tagged word is of the form: [word, POS tag]
	taggedWords = await DictionaryAPI.getPOS(highlightedText);

	if (taggedWords) {

		let buildPOSHtml = "<ruby>"
		//reminder!  taggedWord[0] is the word, taggedWord[1] is the part of speech tag
		taggedWords.forEach(taggedWord => buildPOSHtml += "&nbsp;&nbsp;" + taggedWord[0] + "&nbsp;&nbsp;" + "<rt>" + tagToPOS(taggedWord[1]) + "</rt>" )
		buildPOSHtml += "</ruby>"

		document.getElementById('partOfSpeech').innerHTML = buildPOSHtml;

		//make button clickable
		document.getElementById('partOfSpeechBtn').disabled = false;
	}
    
    //localization
    let partOS = chrome.i18n.getMessage('partOfSpeechBtn');
    document.getElementById('partOfSpeechBtn').innerText = partOS;

}

async function fillSyntaxBox(highlightedText) {
	let treeDict = await DictionaryAPI.getSyntaxTree(highlightedText);
	
	if (treeDict) {
		let treeObj = TreeNode.fromDict(treeDict);
		drawTreeInCanvas(treeObj, document.getElementById("syntaxBox"), darkMode);
		
		//make button clickable
		document.getElementById('syntaxBtn').disabled = false;
	}

}

// get access to background page, assign the page handler to bg
var bg = chrome.extension.getBackgroundPage();
let darkMode = false

bg.getChrome().storage.sync.get(bg.featuresState, function(items) {
	
	const themeStylesheet = document.getElementById('popup-theme');
	if (items["dark"] == true) {
		themeStylesheet.href = 'popup-dark.css';
		darkMode = true
	}

	else {
		themeStylesheet.href = 'popup.css';
	}
});

// apply the functions to the buttons
onload = function() {
	var speechSynth = window.speechSynthesis;

	const buttons = ["definitionBtn", "translationBtn", "synonymsBtn", "examplesBtn", "partOfSpeechBtn", "syntaxBtn"];
	const boxes = ["definitionBox", "translationBox", "synonymsBox", "examplesBox", "partOfSpeechBox", "syntaxBox"];

	// let is used here as a block-scoped variable
	for (let i = 0; i < buttons.length; i++) {
		document.getElementById(buttons[i]).addEventListener("click",
		function() {

			// switch to correct tab
	      	Utility.changeTab(boxes[i], boxes);

			Utility.makeOnlyActiveElement(buttons[i], buttons);

		}, true);
	}

	// event listener for clicking on Pronounce button
	document.getElementById("pronounceWord").addEventListener("click",
		function() {
			if (highlightedText.length == 0) { return; }

			Meta.pronounceWord(speechSynth, highlightedText);
		}, true);

	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.sendMessage(tabs[0].id, {getText: true}, populatePopup);
	});
	
    //localization
    let translationB = chrome.i18n.getMessage('translationBtn');
    document.getElementById('translationBtn').innerText = translationB;
	let partOS = chrome.i18n.getMessage('partOfSpeechBtn');
	document.getElementById('partOfSpeechBtn').innerText = partOS;
    let syntaxB = chrome.i18n.getMessage('syntaxBtn');
    document.getElementById('syntaxBtn').innerText = syntaxB;
}


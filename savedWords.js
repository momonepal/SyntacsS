function removeHTMLElements(text) {

	if ((text===null) || (text=='')) {
   		return text;
   	}

    return text.replace( /(<([^>]+)>)/ig, '');
}

function downloadAllWords(){
	chrome.storage.sync.get('userSavedWords', function(data){

		// set up the column names for the csv string
		let savedString = "word, definition, time_saved, word_source_url + \n";

		const wordDict = data.userSavedWords;

        if (Object.keys(wordDict).length === 0) {
            alert("You haven't saved anything yet!");
            return;
        }

    	// get words, definition, timestamp, and link URL into an array using a callback func
    	let allWords = Object.keys(wordDict).map(function(key) {
    		return [key, wordDict[key][0], wordDict[key][1], wordDict[key][2]];
    	});

    	// sort words by timestamp by descending order
    	allWords.sort(function(time1, time2) {
    		return Date.parse(time2[2]) - Date.parse(time1[2]);
    	});

    	// for-loop to iterate over each word. add it to a string separated by comma
        for (let i = 0; i < allWords.length; i++) {

        	let definition = allWords[i][1]
        	definition = removeHTMLElements(definition)

            // line break after each word
            savedString += allWords[i][0] + ", " + "\"" + definition + "\"" + ", " 
            			  + allWords[i][2] + "," + allWords[i][3] + "\n";
        }

		// convert array into csv
		const blob = new Blob([savedString],{type: "text/csv"});

		// add url to download csv to device
		const objectURL = window.URL.createObjectURL(blob);

		// make hidden link element that connects button with the download link
		const tempLink = document.createElement('a');
		tempLink.setAttribute('hidden', '');
		tempLink.setAttribute('href',objectURL);
		tempLink.setAttribute('download', 'savedWords.csv');
		document.body.appendChild(tempLink);
		tempLink.click();
		document.body.removeChild(tempLink);
    
	});

}

function deleteAllWords(){
	
	// confirmation prompt
	let confirmation = confirm(chrome.i18n.getMessage("unsaveConfirm"));
	if (confirmation) {

		chrome.storage.sync.get('userSavedWords', function (data){
			// set saved words array to a blank array
			data.userSavedWords = {};
			chrome.storage.sync.set({"userSavedWords":data.userSavedWords}, function(){
        	});

		});
		window.location.reload(true);
	}
}

function showSavedWordsAndDefinitions() {
	//load the saved words into the list
    chrome.storage.sync.get('userSavedWords', function(data){

        let savedWords = data.userSavedWords;
        // get timestamp and words into an array using a callback func
    	let wordTime = Object.keys(savedWords).map(function(key) {
    		return [key, savedWords[key][0], savedWords[key][1]];
    	});

    	// sort words by timestamp by descending order (in terms of timetamp)
    	wordTime.sort(function(time1, time2) {
    		return Date.parse(time2[2]) - Date.parse(time1[2])
    	});

        let wordString = "";

        // for-loop to iterate over each word
        for (let i = 0; i < wordTime.length; i++) {
            // line break after each word
            wordString += wordTime[i][0] + ": " + wordTime[i][1] + "<br>";
        }

        // change innerHTML of the element into the word string   
        let currentElement = document.getElementById("listedWords");
        currentElement.innerHTML = wordString;
    });
}

window.onload = function(){ 
	
	//localization
	let title = chrome.i18n.getMessage("titleList");
	document.getElementById("titleList").innerHTML = title;

	let downloadBtn = chrome.i18n.getMessage("download");
	document.getElementById("download").innerHTML = downloadBtn;

	let unsaveBtn = chrome.i18n.getMessage("unsave");
	document.getElementById("unsave").innerHTML = unsaveBtn;

    document.getElementById("download").onclick = function () {
    	downloadAllWords()
    }
    
    document.getElementById("unsave").onclick = function () {
    	deleteAllWords()
    }
    showSavedWordsAndDefinitions();
};

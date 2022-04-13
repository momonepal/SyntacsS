// get access to background page, assign the page handler to bg
var bg = chrome.extension.getBackgroundPage();

// load features state
bg.getChrome().storage.sync.get(bg.featuresState, function(items) {

	for (const feature in items) {
		var id = feature + "Button";
		var item = document.getElementById(id);

		if (feature == "popup" || feature == "includePictures") {
			if (items[feature] == true) {
				item.className = "toggled";
				item.innerHTML = "ON";
			} else {
				item.className = "";
				item.innerHTML = "OFF";
			}
		}
	}
	
	const themeStylesheet = document.getElementById('theme');
	if (items["dark"] == true) {
		themeStylesheet.href = 'darkBrowseraction.css';
	}

	else {
		themeStylesheet.href = 'lightBrowseraction.css';
	}
});

onload = function() {

	//load the saved words into the list
	chrome.storage.sync.get('userSavedWords', function(data){

    	const wordDict = data.userSavedWords;

    	// get timestamp and words into an array using a callback func
    	let wordTime = Object.keys(wordDict).map(function(key) {
    		return [key, wordDict[key][1]];
    	});

    	// sort words by timestamp by descending order
    	wordTime.sort(function(time1, time2) {
    		return Date.parse(time2[1]) - Date.parse(time1[1])
    	});

    	let stars = document.querySelectorAll("#starButtons")

    	// make this a for loop so that it doesn't save the word "undefined".
		for (let i = 0; i <= wordTime.length; i++) {

			// break if exceeds the 3 words shown
			if (i > 2) {
				break;
			}
			
			let currentElement = document.getElementById("savedWord" + i);
			// show current word to the word list
			if (wordTime[i]) {
				currentElement.children[1].innerHTML = wordTime[i][0];
			
				// star current word
				stars[i].className = "starred";
			}
		}	
    });

	// event listener for toggling "enable popup" button
	document.getElementById("popupButton").addEventListener("click",
		function() {

		//change button style
		if (this.className == "toggled") {
			this.className = "";
			this.innerHTML = "OFF";
			// set popupFeatureState as off
			bg.setFeatureState("popup", false);
		} else {
			this.className = "toggled";
			this.innerHTML = "ON";
			// set popupFeatureState as on
			bg.setFeatureState("popup", true);
		}

	}, true);

	// event listener for toggling "include pictures" button
	document.getElementById("includePicturesButton").addEventListener("click",
		function() {

		//change button style
		if (this.className == "toggled") {
			this.className = "";
			this.innerHTML = "OFF";
			bg.setFeatureState("includePictures", false);
		} else {
			this.className = "toggled";
			this.innerHTML = "ON";
			bg.setFeatureState("includePictures", true);
		}
	}, true);

	//event listener for clicking on stars
	var buttons = document.querySelectorAll("#starButtons");
	for (let i = 0; i < buttons.length; i++) {

		buttons[i].addEventListener("click", function() {
			
			//figure out which word it is
			theWord = this.parentElement.children[1].innerHTML;

			if (this.className == "starred") {
				
				//change button style
				this.className = "";

				//unsave word
				Saving.deleteSavedWord(theWord);

			} else {
				// don't save if it's the default display
				if (theWord != "------") {
					//change button style
					this.className = "starred";
          
				  	//save word
				  	Saving.saveWordInfo(theWord);
				}
			}
		});
	}

	// change browser action to dark mode
    const themeStylesheet = document.getElementById('theme');
    const themeToggle = document.getElementById('theme-toggle');
    themeToggle.addEventListener('click', () => {
        // if it's light -> go dark
        if(themeStylesheet.href.includes('light')){
            themeStylesheet.href = 'darkBrowseraction.css';
            bg.setFeatureState("dark", true);
        } else {
            // if it's dark -> go light
            themeStylesheet.href = 'lightBrowseraction.css';
            bg.setFeatureState("dark", false);
        }
    })
    
    //localization
	let titleSyntacs = chrome.i18n.getMessage("titleS");
	document.getElementById("titleS").innerHTML = titleSyntacs;

	let highlightWord = chrome.i18n.getMessage("enablePopup");
	document.getElementById("enablePopup").innerHTML = highlightWord;

	let includePicture = chrome.i18n.getMessage("includePic");
	document.getElementById("includePic").innerHTML = includePicture;

	let lastSavedWord = chrome.i18n.getMessage("lastSavedW");
	document.getElementById("lastSavedW").innerHTML = lastSavedWord;

	let savedWordButton = chrome.i18n.getMessage("seeAllSavedButton");
	document.getElementById("seeAllSavedButton").innerHTML = savedWordButton;
    
 };
	 
 
 
 



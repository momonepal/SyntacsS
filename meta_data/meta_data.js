//class Meta contains all functions related to information about the input word
class Meta {

    // checks whether the selected text is one word
    static isOneWord(text) {
        // ensure that the text input is only one word
        var isOneWord = false;
        var values = text.split(' ').filter(function(v){return v!==''});

        if (values.length == 1) {
          isOneWord = true;

        }
        else {
            isOneWord = false;
        }

        return isOneWord;
    };

	static formatText(text) {
		text = text.replace(/{bc}/g, "<b>-</b> ");
		text = text.replace(/{inf}/g, "<sub>");
		text = text.replace(/{\/inf}/g, "</sub>");
		text = text.replace(/{ldquo}|{rdquo}/g, '"');
		text = text.replace(/{sup}/g, "<sup>");
		text = text.replace(/{\/sup}/g, "</sup>");
		text = text.replace(/{sc}/g, '<span style="font-variant: small-caps;">');
		text = text.replace(/{\/sc}/g, "</span>");
		text = text.replace(/{phrase}/g, "<b><i>");
		text = text.replace(/{\/phrase}/g, "</i></b>");
		text = text.replace(/{gloss}/g, "[");
		text = text.replace(/{\/gloss}/g, "]");
		text = text.replace(/{wi}|{qword}/g, "<i>");
		text = text.replace(/{\/wi|{\/qword}}/g, "</i>");
		text = text.replace(/{dx}.*{\/dx}/g, "");
		text = text.replace(/{dx_def}.*{\/dx_def}/g, "");

		// these tokens are equivalent to the following HTML elements
        text = text.replace(/{b}/g, "<b>");
        text = text.replace(/{\/b}/g, "</b>");
        text = text.replace(/{it}/g, "<i>");
        text = text.replace(/{\/it}/g, "</i>");
		return text;
	}

    //clean the text from weird symbols and stuff using regex
    static removeSpecialCharacters(text){
        let regExpression = new RegExp(/[^a-zA-Z ]/g)
        text = text.replace(regExpression, '');
        return text;
    }

    static replaceTokens(text) {
        // I used regular expressions with these 'replace' functions
        // All the parts between the / /g is the text in the string that will be replaced/removed
        // 'g' means global, which will help the function replace all instances of that string with another string

        // string clean-up. removes unnecessary tokens from the json info
        text = text.replace(/{bc}|{inf}|{\/inf}|{ldquo}|{\/ldquo}|{rdquo}|{\/rdquo}|{sc}|{\/sc}|{sup}|{\/sup}|{gloss}|{\/gloss}|{parahw}|{\/qword}|{phrase}|{\/phrase}|{qword}|{\/qword}|{wi}|{\/wi}|{dx}|{\/dx}|{dx_def}|{\/dx_def}/g, "");

        // replace tokens with appropriate display keys
        text = text.replace(/\[=/g, "(");
        text = text.replace(/]/g, ")");

        // these tokens are equivalent to the following HTML elements
        text = text.replace(/{b}/g, "<b>");
        text = text.replace(/{\/b}/g, "</b>");
        text = text.replace(/{it}/g, "<i>");
        text = text.replace(/{\/it}/g, "</i>");

        return text;
    }

    static removeDash(text) {

        // only show definition if it's not undefined.
        if (typeof(text) !== "undefined") {

            //check if the definition begins with "-" and remove the hyphen if it does
            var firstChar = text.charAt(0);

            // just writing "-" didn't work, but when I looked at the raw return from the api, the cahracter code is 8212 so let's just stick with that
            if (firstChar == String.fromCharCode(8212)) {
                text = text.substring(1);
            };
        };
        return text;
    };

    static capitalizeFirstChar(text) {
		let inTag = false
		let capitalizedText = ""
		for (var i = 0; i < text.length; i++) {
			if (text[i] == "<") {
				inTag = true
			} else if (text[i] == ">") {
				inTag = false
			}
			if (!inTag && text[i].match(/[a-zA-Z]/)) {
				capitalizedText += text[i].toUpperCase() + text.slice(i+1)
				return capitalizedText
			} else {
				capitalizedText += text[i]
			}
		}
		return capitalizedText
    }

    static makeDefinitionString(array) {
            let definitionStr = "";

            // for loop to add a line break between each definition
            for (var i = 0; i < array.length; i++) {
                var definition = Meta.removeDash(array[i]);
                
                definition = Meta.formatText(definition).trim();

                //capitalize first character of each string
                definition = Meta.capitalizeFirstChar(definition);

                if (definition.includes('<b>-</b> ')) {
                    // add each word into string plus a line break
                    definitionStr += definition + "<br>";
                } else {
                    definitionStr += '<b>-</b> ' + definition + "<br>";
                }
            }
            return definitionStr
    }

    //returns a definition of the input word
    static async getShortDefinition(text) {

        text = Meta.removeSpecialCharacters(text);
    	const regExpression = new RegExp(text + ':\\d', 'i');
        var api = new DictionaryAPI;
        const data = await api.defineAndGetExamples(text);
        const thesaurus = await api.synonymize(text);
        const isOneWord = Meta.isOneWord(text);

        if (!data || data.length == 0) {
            return [];
        }

        // this returns defintion of a phrase and checks if it is not one word, if not a phrase will continue to define one word   
        if (!isOneWord && thesaurus && thesaurus[0] && thesaurus[0].fl == "phrase") {
            var definitionOfPhrase = "- " + thesaurus[0].shortdef[0] + ".";
            definitionOfPhrase = Meta.capitalizeFirstChar(definitionOfPhrase);
            return [definitionOfPhrase, definitionOfPhrase];
        }

		let definitionToSave = "";
        let totalMatches = 0
		// get all defintions into an array
		let relevantDefinitions = new Array();
		for (var i = 0; i < data.length ; i++) {

        	if (data[i].meta && data[i].meta["app-shortdef"] && data[i].meta["app-shortdef"].def
                && !data[i].meta["app-shortdef"].def.includes("") && data[i].meta["app-shortdef"].hw) {

                if (definitionToSave == ""){
                    // get first definintion too so it's easier to access it in saving
                    definitionToSave = Meta.makeDefinitionString([data[i].meta["app-shortdef"].def[0]]);
                }

                // this condition limits the definitions to exact matches only. Can change if want to show all.
                if (data[i].meta["app-shortdef"].hw.match(regExpression) || (totalMatches < 1)) {
                    totalMatches += 1

                    let headword = data[i].meta["app-shortdef"].hw; 
					let pos = data[i].meta["app-shortdef"].fl
				
                    var definitionArr = data[i].meta["app-shortdef"].def;
                    let definitions = Meta.makeDefinitionString(definitionArr)
					relevantDefinitions.push([headword, pos, definitions])
                }
			}
        }
		// put all definitions inside a string
		let definitionStr = ""
		for ( var index in relevantDefinitions) {
			if (relevantDefinitions.length == 1) {
				definitionStr += "<div class='headword'><b>" + relevantDefinitions[index][0].split(':')[0] + "</b>" 

            } else {
				definitionStr += "<div class='headword'><b>" + relevantDefinitions[index][0] + "</b>";
			}

			definitionStr += (relevantDefinitions[index][1]) ? relevantDefinitions[index][1] : "";
			definitionStr += "</div>"
            definitionStr += relevantDefinitions[index][2] + "<br>"
		}
		
        if (definitionStr == "") {
            definitionStr = "No definition available";
            definitionToSave = "No definition available";
        }
		return [definitionStr, definitionToSave]
    }

    static async getAllDefinitions(text) {

        text = Meta.removeSpecialCharacters(text);
        var api = new DictionaryAPI;
        const data = await api.defineAndGetExamples(text);

        if (!data || data.length == 0) {
            return "";
        }
        let definitionStr = "";
        
        for (var i = 0; i < data.length ; i++) {
            if (data[i].meta && data[i].meta["app-shortdef"] && data[i].meta["app-shortdef"].def) {
                
                // in case there's a headword but no definition inside it, like the word "PR"
                if (data[i].meta["app-shortdef"].def == "") {
                    continue
                }
                
                definitionStr += "<div class='headword'><b>" + data[i].meta["app-shortdef"].hw + "</b>" 

                if (data[i].meta["app-shortdef"].fl) {
                    definitionStr += data[i].meta["app-shortdef"].fl + "</div>"
                } else {
                    definitionStr += "</div>"
                }
                var definitionArr = data[i].meta["app-shortdef"].def;
                definitionStr += Meta.makeDefinitionString(definitionArr) + "<br>"
            }
        }

        return definitionStr
    }

    //returns the synonym of the input word
    static async getSynonyms(text){

        text = Meta.removeSpecialCharacters(text);
    	text = text.toLowerCase();
        var api = new DictionaryAPI;
        const data = await api.synonymize(text);

		if (data.length == 0) {
			return ""
		}

        if (data[0].meta) {

            // read more about functional labels here: http://www-ccs.cs.umass.edu/mw/Mwed00000069.html
            var functionalLabel = data[0].fl

            if (functionalLabel == "verb" || functionalLabel == "noun" || 
                functionalLabel == "adjective" || functionalLabel == "phrase") {

                // takes every synonym possible
                var synonymArray = data[0].meta.syns[0].slice();
                var synonymString = "";

                for (var i = 0; i < synonymArray.length; i++) {
                    // add each word into string plus a comma
                    var synonym = await synonymArray[i]

                    // capitalize first character of each string
                    synonym = Meta.capitalizeFirstChar(synonym);

                    // add each word into string plus a new line
                    synonymString += "- " + synonym + "<br>";
                }
                return synonymString;
            }
        }
		return "";
    }

    //returns usage examples of the input word
    static async getUsageExamples(text){

        text = Meta.removeSpecialCharacters(text);
    	text = text.toLowerCase();
        let bool = Meta.isOneWord(text)
        const api = new DictionaryAPI;
        const data = await api.defineAndGetExamples(text);
        const thesaurus = await api.synonymize(text);
        var usageExamples;

        // get data array from json
        if (bool == false && thesaurus[0] && thesaurus[0].def) {
            usageExamples = thesaurus[0].def[0].sseq[0][0][1].dt;

        } else if (data[0] && data[0].def) {
            usageExamples = data[0].def[0].sseq[0][0][1].dt;
        }

        if (usageExamples) {

            // for loop to check which entry in the array has the usage examples
            for (var i = 0; i < usageExamples.length; i++) {

                // vis = verbal illustration. usage examples are usually kept near "vis" in the json file
                if (usageExamples[i][0] == "vis") {
                    usageExamples = usageExamples[i][1];
                    break;
                };
            };

            if (typeof usageExamples[0].t != "undefined") {

                // create usage examples string to be copied into
                var usageExamplesStr = ""
                for (var i = 0; i < usageExamples.length; i++) {

                    // replace/remove API tokens from the string
                    var example = Meta.replaceTokens(usageExamples[i].t);

                    example = Meta.capitalizeFirstChar(example);

                    // add line break between each usage examples
                    usageExamplesStr += "- " + example + "<br>";
                }

                return usageExamplesStr;
            }
        }
		return "";
    };

    //returns an image using google's api
    static async getImage(text){
        
        text = Meta.removeSpecialCharacters(text);
        let imageURL;
        let photoCredit;
        let numberOfImages;

        const api = new DictionaryAPI;
        const imageData = await api.imagize(text);

        if (imageData) {

            numberOfImages = imageData.hits.length;

            /* make sure image loops back to first one if counter passes number of images */
            if (imageNumber >= numberOfImages && numberOfImages != 1) {

                imageNumber = imageNumber % numberOfImages;
            }

            // get the URL for the image
            imageURL = imageData.hits[0 + imageNumber].webformatURL;

            // get photo credit
            photoCredit = imageData.hits[0 + imageNumber].user;
        }

		return [imageURL, photoCredit, numberOfImages];
    };

    //plays an audio pronunciation of the input
    static pronounceWord(speechSynth, userInput) {
        var voices = speechSynth.getVoices();

        chrome.storage.sync.get({voiceCode: 'Alex'}, function(result){
            var pronounce = new SpeechSynthesisUtterance(userInput);

            for (var i = 0; i < voices.length; i++) {
                if(voices[i].name == result.voiceCode) {
                    pronounce.voice = voices[i];
                    break;
                };
            };

            speechSynth.speak(pronounce)
        });
    };

    static getTimestamp() {

        var now = new Date();

        // get current time. weird conditions are to add 0 before the number if minutes and seconds <10
        const currentTime = (now.getMonth() + 1) + '/' + (now.getDate()) + '/' + now.getFullYear() + " " 
        + now.getHours() + ':' 
        + ((now.getMinutes() < 10) ? ("0" + now.getMinutes()) : (now.getMinutes())) + ':' 
        + ((now.getSeconds() < 10) ? ("0" + now.getSeconds()) : (now.getSeconds()));

        return currentTime
    }
};

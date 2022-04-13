//class Saving contains all the functions related to saving and getting words
class Saving{

    static async saveWordInfo(toSave){

        //remove any trailing spaces from the string to be saved
        toSave = toSave.trim().toLowerCase().replace(/[^A-Za-z0-9]/g, '');


        const definitionResults = await Meta.getShortDefinition(toSave);
        const definition = definitionResults[1];
        const timestamp = Meta.getTimestamp();
        let currentURL = "";
        // get current URL of where word was found
        chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
            if (tabs && tabs[0]) {
                currentURL = tabs[0].url;
            } else {
                currentURL = "browseraction.js"
            }
        });

        if (toSave.length > 0) {

            chrome.storage.sync.get('userSavedWords', function(data){
            
                // Check if the key userSavedWords already exists in the chrome storage
                if(typeof(data.userSavedWords) != 'undefined'){

                    // If it exists, push the selection in the key userSavedWords
                    data.userSavedWords[toSave] = [definition, timestamp, currentURL];
                    // Update the storage with the new added selection ie. override the userSavedWords key.
                    chrome.storage.sync.set({"userSavedWords":data.userSavedWords}, function(){

                    });

                } else {                
                    
                    // Create a dictionary containing word and definition
                    let wordDict = {};
                    wordDict[toSave] = [definition, timestamp, currentURL];

                    // If the userSavedWords key is undefined, then make a new key userSavedWords whose value will be the first word that is saved.
                    // This condition will only run once for the first saved word.
                    chrome.storage.sync.set({"userSavedWords": wordDict}, function(){

                    });
                }

            });

        }

    }

    static deleteSavedWord(word) {
        chrome.storage.sync.get('userSavedWords', function(data){

            var wordDict = data.userSavedWords;

            if (wordDict[word]){

                delete wordDict[word];
                chrome.storage.sync.set({"userSavedWords": wordDict}, function(){});

            }
        });
    }
}

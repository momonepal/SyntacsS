//implementation of the display_popup_on_double_click feature:
chrome.tabs.onUpdated.addListener(function(){

	chrome.storage.sync.get({display_popup_on_double_click: false}, function(result){
		if(result.display_popup_on_double_click == true){
            //code for implementing this option goes here
            console.log("display_popup_on_double_click is true");
        } else {
        	console.log("display_popup_on_double_click is false");
        }
    });
});


// store features' state for consistency
// true means on, false means off. default as true
var featuresState = {popup: true, includePictures: true, dark: false};

// function to change featuresState's value in chrome.storage
// also update the global variable featuresState
function setFeatureState(featureName, bool) {
    featuresState[featureName] = bool;
    chrome.storage.sync.set({[featureName] : bool});
}

// return the chrome API to browseraction.js, 
// so that browseraction.js has access to the chrome.storage
function getChrome() {
    if (chrome) {
        return chrome;
    } else {
        return null;
    }
}

// listen and reply when content.js query for features' state
chrome.runtime.onMessage.addListener(queryFeatureState);

function queryFeatureState(request, sender, sendResponse) {
    featureName = Object.values(request)[0];
    response = {state : featuresState[featureName]};
    sendResponse(response);
}
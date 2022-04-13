function fillVoiceList() {

   if (typeof speechSynthesis === 'undefined' && document.getElementById("voiceSelect")) {
     return;
   } 
   
    const voices = speechSynthesis.getVoices().filter(voice => voice.lang.substring(0, 2) == 'en');
  
    for(var i = 0;  i < voices.length; i++) {
        var option = document.createElement('option');
        option.textContent = voices[i].name;

        if(voices[i].default) {
        option.textContent += ' -- DEFAULT';
    }

    option.setAttribute('data-lang', voices[i].lang);
    option.setAttribute('data-name', voices[i].name);

    document.getElementById("voiceSelect").appendChild(option);
     
     
   }
   
   chrome.storage.sync.get({voiceCode: 'Alex'}, function(result){
	   for (var i = 0; i < voices.length; i++) {
		   if(voices[i].name === result.voiceCode) {
                document.getElementById("voiceSelect").selectedIndex = i;
                break;
            }
        }
    });
}



onload = function(){
    
    if (typeof speechSynthesis !== 'undefined' && speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = fillVoiceList;
    }
    
    function getSelectedOption(sel) {
        //the loop is unneccessary for now but will help if more language options are added
        for ( var i = 0; i < sel.options.length; i++ ) {
            var opt = sel.options[i];
            if ( opt.selected == true ) {
                return opt;
            }
        }
        return null;
    }
    
    document.getElementById('save').addEventListener("click", function(){
      console.log("Saved")
        //storing the selected language as target language:
        var sel = document.getElementById("language");
        var selectedOption = getSelectedOption(sel);
        chrome.storage.sync.set({L1_code: selectedOption.value}, function(){
            console.log("L1_code changed to: " + selectedOption.value)
        });

        
        //storing the selected voice
        var voiceSelect = document.getElementById("voiceSelect");
        chrome.storage.sync.set({voiceCode: voiceSelect.selectedOptions[0].getAttribute('data-name')});
    
        //get the user selected option for pop-up on double click
        var checkbox1 = document.getElementById("checkbox1").checked;
        chrome.storage.sync.set({display_popup_on_double_click: checkbox1}, function(){
            console.log("display_popup_on_double_click changed to: " + checkbox1)
        });
        
        //get the user selected option for storing words that are looked up
        var checkbox2 = document.getElementById("checkbox2").checked;
        chrome.storage.sync.set({store_looked_up_words: checkbox2}, function(){
            console.log("store_looked_up_words changed to: " + checkbox2)
        });

        window.location.reload(true);
    });
    
    //when reset is hit default options will be stored
    document.getElementById("reset").addEventListener("click", function(){
        console.log("Reset")
        //default target language is spanish:
        chrome.storage.sync.set({L1_code: "es"}, function(){
            console.log("L1_code changed to: es")
        });

        
        chrome.storage.sync.set({voiceCode: 'Alex'});
    
        //default translation language is english:
        chrome.storage.sync.set({L2_code: "en"}, function(){
            console.log("L1_code changed to: en")
        });
        
        //displaying pop-up on double click is off by default:
        chrome.storage.sync.set({display_popup_on_double_click: false}, function(){
            console.log("display_popup_on_double_click changed to: false")
        });
        
        //storing words that are looked up is off by default:
        chrome.storage.sync.set({store_looked_up_words: false}, function(){
            console.log("store_looked_up_words changed to: false")
        });
        
        loadOptions();

        window.location.reload(true);
    });
    
    //strings localization        
        titleOpt = chrome.i18n.getMessage("titleO")
        document.getElementById("titleOptions").innerHTML = titleOpt
        
        languageMy = chrome.i18n.getMessage("languageM")
        document.getElementById("myLanguage").innerHTML = languageMy
        
        spanish = chrome.i18n.getMessage("language")
        document.getElementById("languageS").innerHTML = spanish
    
        voicePro = chrome.i18n.getMessage("voice")
        document.getElementById("voiceP").innerHTML = voicePro

        saveB = chrome.i18n.getMessage("save")
        document.getElementById("save").innerHTML = saveB
        
        resetB = chrome.i18n.getMessage("reset")
        document.getElementById("reset").innerHTML = resetB
    
};

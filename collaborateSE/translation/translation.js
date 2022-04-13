// put these in variables in case we want to change it later
var L1 = "Spanish";
var L1_code = "es";
var L2 = "English";
var L2_code = "en";

//class Translation holds functions related to translation of the input
class Translation {

    async translateText(text, L1_code){
    // text -> string of text to be translated
    // L1_code -> destination language eg. en, es

        const api = new DictionaryAPI;
        const translatedOutput = await api.translate(text, L1_code);

        if (typeof(translatedOutput.data) !== "undefined") {

            //returns the text translated to the destination language
            return translatedOutput.data.translations[0].translatedText;
        }
    };

    async detectLanguage(text, L1_code){
    // text -> string of text to be translated
    // L1_code -> destination language eg. en, es

        const api = new DictionaryAPI;
        const translatedOutput = await api.translate(text, L1_code);

        if (typeof(translatedOutput.data) !== "undefined") {
            return translatedOutput.data.translations[0].detectedSourceLanguage;
        }
    };
};
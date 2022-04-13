class DictionaryAPI {

  async translate(text, lang) {
    const key = "AIzaSyAMQRr91ZfxFvAYSj64yPK6xPySLqMb0xQ"; // key for google translate api
  	const dest = lang; // Destination language.

    // url, this is just an endpoint to which we are sending request. It also auto detects the source language.
    const url = "https://translation.googleapis.com/language/translate/v2?q="+ text+"&target="+dest+"&key="+ key;

  	// Fetch request to the url and get back the response
  	const response = await fetch(url);

    // Convert the response into JSON
    const data = await response.json();

    //returns the text translated to the destination language
    return data;
  };

  async defineAndGetExamples(text) {
    const key = "960639de-ce46-418b-8148-dd0ddebb064b"; // key for dictonary api

    // url for dictonary api
    const url = "https://www.dictionaryapi.com/api/v3/references/learners/json/"+text+"?key="+key;

    // Fetch request to the url and get back the response
    const response = await fetch(url);

    // Convert the response into JSON
    const data = await response.json();

    return data;
  };

  async synonymize(text) {
    const key = "9dab41df-a08c-4e3e-aa73-5db4d4c61c4e"; // key for thesaurus api

    // url for thesaurus api
    const url = "https://www.dictionaryapi.com/api/v3/references/thesaurus/json/"+text+"?key="+key;

    // Fetch request to the url and get back the response
    const response = await fetch(url);

    // Convert the response into JSON
    const data = await response.json();

    return data;
  };

  // get api using Pixabay API. 5,000 requests per hour
  async imagize(text) {

    const key = '18635603-c52e5e20462e9f6f6664d6079'

    // documentation for this is here: https://pixabay.com/api/docs/
    const filters = {imageType: "&image_type=all",
                    safeSearch: "&safesearch=true",
                    orientation: "&orientation=horizontal",
                    order: "&order=popular",
                    perPage: "&per_page=30"}

    // url for search API. With specified filters above
    const SearchUrl = "https://pixabay.com/api/?key=" + key + "&q=" + text
                      + filters.imageType + filters.safeSearch + filters.orientation
                      + filters.order + filters.perPage;

    const response = await fetch(SearchUrl);
    const imageData = await response.json();

    if (typeof(imageData.hits) !== "undefined") {

      if (imageData.total == "0") {
        return 0;

      } else {

        return imageData;
        
      };

    };
  };

  static async getPOS(text) {
	text = text.replace(/\s/g, '%20');

    const url = "https://syntacs-bennington.herokuapp.com/pos?text="+text;
	
    // Fetch request to the url and get back the response
    const response = await fetch(url);

    // Convert the response into JSON
    const data = await response.json();

    return data;
  };

  static async getMorphemes(text) {

    const url = "https://syntacs-bennington.herokuapp.com/morphemes?text="+text;

    // Fetch request to the url and get back the response
    const response = await fetch(url);

    // Convert the response into JSON
    const data = await response.json();

    return data;
  };

 static async getSyntaxTree(text) {

    const url = "https://syntacs-bennington.herokuapp.com/parse?text="+text;

      // Fetch request to the url and get back the response
    const response = await fetch(url);

      // Convert the response into JSON
    const data = await response.json();

    return data;
  };
};

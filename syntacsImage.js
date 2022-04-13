class SyntacsImage {
	//changes the height of the image to display it with the correct aspect ratio
    static resizeImage(image){
        //getting the original width and height of the image
        const originalWidth = image.naturalWidth;
		const originalHeight = image.naturalHeight;

        //calculating the ratio
        const originalRatio = originalWidth / originalHeight;
        
        //scaling the height to maintain original aspect ratio
		image.height = image.width / originalRatio;
    }
	
	static getCursorStyle(isEnlarged) {
		if (isEnlarged) {
			//setting the cursor to magnifying glass with minus icon
			return "zoom-out";
		} else {
			//setting the cursor to magnifying glass with plus icon
			return "zoom-in";
		}
	}
	
	//adds the event listener to the image so that it can be resized on click
	static imageEventListener(image){

		//boolean for storing current state of image
		var isEnlarged = false;

		//setting the cursor to magnifying glass with plus icon here so that it would appear on first hover
		image.style.cursor = SyntacsImage.getCursorStyle(isEnlarged);

		//saving the original width/height
        const smallWidth = image.width;
		const smallHeight = image.height;

		//setting the max width for an enlarged image
		//TODO: Make this relative to window size
		const maxImageWidth = 400;

		//adding the event listener
        image.addEventListener("click", 
            function(){
				//flipping the state bool
                isEnlarged = !isEnlarged;

                if(isEnlarged){
					//setting size to natural size
                    image.width = maxImageWidth;
					image.height = (maxImageWidth / (image.naturalWidth / image.naturalHeight));
					
					//resizing the image given new sizes
					SyntacsImage.resizeImage(image);
                }
                else{
					//setting size to original display size
                    image.width = smallWidth;
					image.height = smallHeight; 

					//resizing the image given new sizes
					SyntacsImage.resizeImage(image);
				}
				
				image.style.cursor = SyntacsImage.getCursorStyle(isEnlarged);

				//resizing the popup so the image would fit
				Utility.autoResize(document.body, document.getElementById("imageBox"));
			}, true);
	};
};
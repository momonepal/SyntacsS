# Syntacs :globe_with_meridians:
 
This repository consists of files from this work culminating in the creation of Syntacs, a Google Chrome browser extension to expand upon translation and text analysis.

## Goals :white_check_mark:
To assist non native English speakers (for now limited to Spanish L1 learners) to learn English while reading on the web.
The app assists by translating, defining, putting into context, providing synonyms, and enabling to build up a personal dictionary for memorization.

## Features
- Interact with Chrome extension through in-browser text highlighting
- Language detection (given an input string of one or more words)
- Translate highlighted text
- Define the highlighted text
- Synonym list of the highlighted text
- Audio pronunciation
- Save a set of words decided by the user

## Design and Layout
Design:

[Pictures of final design will go here!]

## Getting Started :rocket:
These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites
Must have Google Chrome browser installed (https://www.google.com/chrome/) :computer:

### Installing
A step by step on how to get a development env running

Extensions can be loaded in unpacked mode by following the following steps:

1. Visit chrome://extensions (via omnibox or menu :arrow_right: Tools :arrow_right: Extensions)
2. Enable Developer mode by ticking the checkbox in the upper-right corner
3. Click on the "Load unpacked extension..." button
4. Select the directory containing your unpacked extension.
5. Extension should now display on upper-right corner and can be managed along with other extensions

## Built With :wrench:
Javascript, HTML, CSS

## Contributing :hand:
This is a shared repository model, collaborators are granted push access to a single shared repository and topic branches are created when changes need to be made. Pull requests are useful in this model as they initiate code review and general discussion about a set of changes before the changes are merged into the main development branch.

## Authors :busts_in_silhouette:
Folks in Syntacs Collaborative Software Engineering

## File List and Usage
### background.js
Implements the display pop up on double click feature
### browseraction.css
Contains CSS information for browser action
### browseraction.html
Contains HTML information for browser action
### content.js
Contains all functions concerning the content of the extension i.e CSS, word count, and pop up
### manifest.json
Every extension has a JSON-formatted manifest file. This file gives the browser information about the extension, such as the most important files and the capabilities the extension might use
### options.css
Contains CSS information for options
### options.html
Contains HTML information for options
### options.js
Deals with options JSON
### popup.css
Contains CSS information for pop up
### popup.html
Contains HTML information for pop up
### popup.js
Deals with pop up JSON and contains all functions relating to pop up implementation
### syntacs-window.css
Contains CSS information for Syntacs window
### utlity.js
Creates keyboard shortcut for translate button and includes function for clearing the whole pop up screen

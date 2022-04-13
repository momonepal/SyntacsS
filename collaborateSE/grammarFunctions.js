function tagToPOS(tag) {
	switch (tag) {
		case "CC":
			return "conj";
		case "CD":
			return "#";
		case "DT":
			return "det";
		case "EX":
			return "existential there";
		case "FW":
			return "foreign word";
		case "IN":
			return "prep";
		case "JJ":
			return "adj";
		case "JJR":
			return "adj";
		case "JJS":
			return "adj";
		case "LS":
			return "list";
		case "MD":
			return "modal";
		case "NN":
			return "noun";
		case "NNS":
			return "noun";
		case "NNP":
			return "proper noun";
		case "NNPS":
			return "proper noun";
		case "PDT":
			return "predet";
		case "POS":
			return "possessive";
		case "PRP":
			return "pronoun";
		case "PRP$":
			return "pronoun";
		case "RB":
			return "adv";
		case "RBR":
			return "adv";
		case "RBS":
			return "adv";
		case "RP":
			return "particle";
		case "SYM":
			return "symbol";
		case "TO":
			return "to";
		case "UH":
			return "interjection";
		case "VB":
			return "verb";
		case "VBD":
			return "verb";
		case "VBG":
			return "verb";
		case "VBN":
			return "verb";
		case "VBP":
			return "verb";
		case "VBZ":
			return "verb";
		case "WDT":
			return "determiner";
		case "WP":
			return "pronoun";
		case "WP$":
			return "pronoun";
		case "WRB":
			return "adv";
		default:
			return "";
	}
}
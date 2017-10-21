/* eslint-disable no-console,indent */

const ImageToAscii = require("image-to-ascii");
const Term = require("terminal-kit").terminal;
const PrintUtility = require("./PrintUtilities");

module.exports = class AsciiPrinter {
	constructor() {
		this.printUtility = new PrintUtility();
	}

	printAscii(medium) {
		ImageToAscii(medium.media_url + ":thumb", {
			size: {
				width: 30
			}
		}, (err, converted) => {
			Term(err || converted);
			this.printUtility.newline();
			Term(medium.media_url);
			this.printUtility.newline();
			this.printUtility.drawBorderLine();

		});
	}
};
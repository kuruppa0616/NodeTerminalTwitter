/* eslint-disable no-console,indent */
const ImageToAscii = require("image-to-ascii");
const Term = require("terminal-kit").terminal;


module.exports = class AsciiPrinter {
	printAscii(medium) {
		ImageToAscii(medium.media_url + ":thumb", {
			size: {
				width: 30
			}
		}, (err, converted) => {
			Term(err || converted);
			this.newline();
			Term(medium.media_url);
			this.newline();
			this.drawBorderLine();

		});
	}

	drawBorderLine() {
		Term.dim("―".repeat(Term.width));
		this.newline();
	}

	//改行
	newline() {
		console.log();
	}
};
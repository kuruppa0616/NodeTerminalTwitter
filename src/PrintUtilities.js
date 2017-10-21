/* eslint-disable no-console,indent */
const Term = require("terminal-kit").terminal;

module.exports = class PrintUtility {

	//画面幅一杯のラインを引く
	drawBorderLine() {
		Term.dim("―".repeat(Term.width));
		this.newline();
	}

	//改行
	newline() {
		console.log();
	}

	toLocaleString(date) {
		return [
				date.getFullYear(),
				date.getMonth() + 1,
				date.getDate()
			].join("/") + " " +
			date.toLocaleTimeString();
	}
};
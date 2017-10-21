/* eslint-disable no-console,indent */

const Term = require("terminal-kit").terminal;
const Auth = require("./src/Auth");
const PrintUtility = require("./src/PrintUtilities");
const StreamTwitter = require("./src/StreamTwitter");
const MenuController = require("./src/MenuController");

class Index {
	constructor() {
		console.log("Loading module...");
		this.printUtility = new PrintUtility();
		this.streamTwitter = new StreamTwitter();
		this.menuController = new MenuController();
	}
	start() {
		console.log("Login twitter...");
		Auth.login("./Auth.json");
		Term.bold("START!!!");
		Term.windowTitle("NodeTerminalTwitter");
		this.printUtility.newline();
		this.menuController.setupMenu();
		this.streamTwitter.startStream();
	}
}

new Index().start();
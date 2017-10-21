/* eslint-disable no-console,indent */

console.log("Loading module...");

const Term = require("terminal-kit").terminal;

const Auth = require("./Auth");
const PrintUtility = require("./PrintUtilities");
const StreamTwitter = require("./StreamTwitter");
const MenuController = require("./MenuController");


const printUtility = new PrintUtility();
const streamTwitter = new StreamTwitter();
const menuController = new MenuController();


console.log("Login twitter...");

Auth.login("./Auth.json");


Term.windowTitle("NodeTerminalTwitter");
Term.bold("START!!!");
printUtility.newline();
menuController.setupMenu();
streamTwitter.startStream();
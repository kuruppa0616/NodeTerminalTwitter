/* eslint-disable no-console,indent */

console.log("Loading module...");

const Term = require("terminal-kit").terminal;

const Auth = require("./Auth");
const PrintUtility = require("./PrintUtilities");
const TweetCacheController = require("./TweetCacheController");
const TweetIdListController = require("./TweetIdListController");
const TweetPrinter = require("./TweetPrinter");
const PostTwitter = require("./PostTwitter");
const StreamTwitter = require("./StreamTwitter");

const tweetPrinter = new TweetPrinter();
const postTwitter = new PostTwitter();
const printUtility = new PrintUtility();
const streamTwitter = new StreamTwitter();


console.log(TweetIdListController.test);

console.log("Login twitter...");

Auth.login("./Auth.json");

const MenuItems = ["Tweet", "RT", "Fav", "RT & Fav", "Cancel"];
const MenuOptions = {
	style: Term.blue,
	selectedStyle: Term.inverse,
};


Term.windowTitle("NodeTerminalTwitter");
Term.bold("START!!!");
printUtility.newline();

streamTwitter.startStream();

//キー入力待受
Term.grabInput();

Term.on("key", (name) => {

	//ツイッター終了
	if (name === "CTRL_C") {
		terminate();

		//Tweet入力
	} else if (name === "CTRL_T") {

		TweetCacheController.setIsTweetCache(true);

		Term.singleLineMenu(MenuItems, MenuOptions, (error, response) => {
			switchMenuProcess(response);
		});
	}
});

async function switchMenuProcess(response) {

	let temp;
	switch (response.selectedIndex) {
		case 0:
			temp = await inputPost("Input your kuso tweet");
			await postTwitter.postTweet(temp);
			break;
		case 1:
			temp = await inputPost("Input tweet No");
			await postTwitter.reTweet(temp);
			break;
		case 2:
			temp = await inputPost("Input tweet No");
			await postTwitter.favTweet(temp);
			break;
		case 3:
			temp = await inputPost("Input tweet No");
			await postTwitter.reTweet(temp);
			await postTwitter.favTweet(temp);
			break;
		case 4:
			printUtility.newline();
			Term("Cancelled");
			printUtility.newline();
			break;
	}
	tweetPrinter.releaseCache();
}

//メイン処理ここまで


//入力された値を、引数としてリストで受け取った関数に渡し実行する
function inputPost(message) {
	return new Promise(resolve => {
		printUtility.newline();
		Term(message + ":>>");
		printUtility.newline();
		//入力フィールド表示
		Term.inputField({
			cancelable: true,
			maxLength: 140
		}, (error, input) => {
			resolve(input);
		});
	});
}

//main処理ここまで



//終了
function terminate() {
	Term.grabInput(false);
	Term("good bye");
	printUtility.newline();
	setTimeout(function() {
		process.exit();
	}, 100);
}
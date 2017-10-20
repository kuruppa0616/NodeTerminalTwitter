/* eslint-disable no-console,indent */

console.log("Loading module...");

const Term = require("terminal-kit").terminal;

const Auth = require("./Auth");
const TweetCacheController = require("./TweetCacheController");
const TweetIdListController = require("./TweetIdListController");
const TweetPrinter = require("./TweetPrinter");
const tweetPrinter = new TweetPrinter();

console.log(TweetIdListController.test);

console.log("Login twitter...");

Auth.login("./Auth.json");
let client = Auth.getClient();

const MenuItems = ["Tweet", "RT", "Fav", "RT & Fav", "Cancel"];
const MenuOptions = {
	style: Term.blue,
	selectedStyle: Term.inverse,
};


Term.windowTitle("NodeTerminalTwitter");
Term.bold("START!!!");
newline();

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

			switch (response.selectedIndex) {
				case 0:
					inputTweet([postTweet], "Input your kuso tweet");
					break;

				case 1:
					inputTweet([reTweet], "Input tweet No");
					break;

				case 2:
					inputTweet([favTweet], "Input tweet No");
					break;

				case 3:
					inputTweet([reTweet, favTweet], "Input tweet No");
					break;

				case 4:
					newline();
					Term("Cancelled");
					newline();
					tweetPrinter.releaseCache();
					break;
			}
		});
	}
});

//ストリーム開始
startStream();

//メイン処理ここまで


//入力された値を、引数としてリストで受け取った関数に渡し実行する
function inputTweet(funcList, message) {
	newline();
	Term(message + ":>>");
	newline();
	//入力フィールド表示
	Term.inputField({
		cancelable: true,
		maxLength: 140
	}, (error, input) => {
		if (input) {
			for (let func of funcList) {
				func(input);
			}
		} else {
			Term("Cancelled");
			newline();
		}
		tweetPrinter.releaseCache();
	});

}

//Tweet投稿
function postTweet(input) {

	client.post("statuses/update", {
		status: input
	}, (error) => {
		if (!error) {
			newline();
			Term("Tweet Success!");
			newline();
		} else {
			Term(error);
		}
	});
}

//指定idをリツイートする
function reTweet(tweetID) {
	client.post("statuses/retweet/:id", {
		id: TweetIdListController.getID(tweetID)
	}, (error) => {
		if (!error) {
			newline();
			Term("RT Success!");
			newline();
		} else {
			Term(error);
		}
	});
}

// 指定idをふぁぼる
function favTweet(tweetID) {
	client.post("favorites/create", {
		id: TweetIdListController.getID(tweetID)
	}, (error) => {
		if (!error) {
			newline();
			Term("Fav Success!");
			newline();
		} else {
			Term(error);
		}
	});
}

//main処理ここまで

//ストリーミング処理
function startStream() {
	let stream = client.stream("user");
	stream.on("tweet", (tweet) => {
		// 入力状態のときはTweetを表示せずリストにキャッシュ
		if (TweetCacheController.getIsTweetCache()) {
			TweetCacheController.addCache(tweet);
		} else {
			tweetPrinter.printTweet(tweet);
		}
	});
	stream.on("error", (e) => {
		console.log(e);
	});
}

//改行
function newline() {
	console.log();
}

//終了
function terminate() {
	Term.grabInput(false);
	Term("good bye");
	newline();
	setTimeout(function() {
		process.exit();
	}, 100);
}
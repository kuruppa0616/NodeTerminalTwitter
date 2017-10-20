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
			switchMenuProcess(response);
		});
	}
});

//ストリーム開始
startStream();

async function switchMenuProcess(response) {

	let temp;
	switch (response.selectedIndex) {
		case 0:
			temp = await inputPost("Input your kuso tweet");
			await postTweet(temp);
			break;
		case 1:
			temp = await inputPost("Input tweet No");
			await reTweet(temp);
			break;
		case 2:
			temp = await inputPost("Input tweet No");
			await favTweet(temp);
			break;
		case 3:
			temp = await inputPost("Input tweet No");
			await reTweet(temp);
			await favTweet(temp);
			break;
		case 4:
			newline();
			Term("Cancelled");
			newline();
			break;
	}
	tweetPrinter.releaseCache();
}

//メイン処理ここまで


//入力された値を、引数としてリストで受け取った関数に渡し実行する
function inputPost(message) {
	return new Promise(resolve => {
		newline();
		Term(message + ":>>");
		newline();
		//入力フィールド表示
		Term.inputField({
			cancelable: true,
			maxLength: 140
		}, (error, input) => {
			resolve(input);
		});
	});
}

//Tweet投稿
function postTweet(input) {
	return new Promise(resolve => {
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
			resolve();
		});
	});
}

//指定idをリツイートする
function reTweet(tweetID) {
	return new Promise(resolve => {
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
			resolve();
		});
	});
}

// 指定idをふぁぼる
function favTweet(tweetID) {
	return new Promise(resolve => {
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
			resolve();
		});
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
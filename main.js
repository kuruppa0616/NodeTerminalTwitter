/* eslint-disable no-console,indent */

console.log("Loading module...");

const Term = require("terminal-kit").terminal;
const ImageToAscii = require("image-to-ascii");

const Auth = require("./Auth");
const TweetCacheController = require("./TweetCacheController");
// let auth = new Auth();

console.log("Login twitter...");

Auth.login("./Auth.json");
let client = Auth.getClient();

const MenuItems = ["Tweet", "RT", "Fav", "RT & Fav", "Cancel"];
const MenuOptions = {
	style: Term.blue,
	selectedStyle: Term.inverse,
};

//入力状態中に流れてくるTweetを一時保存しとくための奴ら
let isTweetCache = false;
let tweetCache = [];
//RTとファボ用のTweetIDを保管するためのリスト
let tweetIdList = [];


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

		isTweetCache = true;

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
					releaseCache();
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
		releaseCache();
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
		id: tweetIdList[tweetID - 1]
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
		id: tweetIdList[tweetID - 1]
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


function releaseCache() {
	isTweetCache = false;
	for (let temp of tweetCache) {
		printTweet(temp);
	}
	tweetCache = [];
}


//main処理ここまで

//ストリーミング処理
function startStream() {
	let stream = client.stream("user");
	stream.on("tweet", (tweet) => {
		// 入力状態のときはTweetを表示せずリストにキャッシュ
		if (isTweetCache) {
			tweetCache.push(tweet);
		} else {
			printTweet(tweet);
		}
	});
	stream.on("error", (e) => {
		console.log(e);
	});
}

//Tweet表示
//Templateメソッドだわこれ
function printTweet(tweet) {

	tweet = printRetweet(tweet);
	printUserName(tweet);
	printBody(tweet);
	printImage(tweet);
	printQuoted(tweet);
	drawBorderLine();
	newline();

}

function printRetweet(tweet) {
	//リツートだったときは、名前を表示して元ツイートの詳細を表示
	if (tweet.retweeted_status) {
		Term.dim("RT:" + tweet.user.name + " Retweeted");
		newline();
		tweet = tweet.retweeted_status;
	}
	return tweet;
}

//引用リツイート元を表示させる
function printQuoted(tweet) {
	//引用リツイートだった場合元ツイート表示
	if (tweet.is_quote_status) {
		tweet = tweet.quoted_status;
		Term("Quoted>>");
		newline();
		printUserName(tweet);
		printBody(tweet);
		printImage(tweet);
	}
	return tweet;
}

//Tweet本文を表示する
function printBody(tweet) {
	let syntax_list = [];
	let text = tweet.text;

	// 本文から画像のURLを消す
	if (isMedia(tweet)) {
		for (let medium of tweet.extended_entities.media) {
			if (medium.type == "photo") {
				text = text.replace(medium.url, "");

			}
		}
	}

	//url取り出し
	//短縮URLを元URLと置換
	for (let url of tweet.entities.urls) {
		syntax_list.push(url.display_url.replace("?", "\\?"));
		text = text.replace(url.url, url.display_url);
	}

	//ハッシュタグ取り出し
	for (let hashtag of tweet.entities.hashtags) {
		syntax_list.push("#" + hashtag.text);
	}

	// メンション取り出し
	for (let user_mention of tweet.entities.user_mentions) {
		syntax_list.push("@" + user_mention.screen_name);
	}

	//highlightする文字がある場合
	if (syntax_list.length != 0) {
		let reg = new RegExp("(" + syntax_list.join("|") + ")", "g");
		let textList = text.split(reg);
		for (let str of textList) {
			if (str.search(reg) != -1) {
				Term.blue(str);
			} else {
				Term(str);
			}
		}

		//ない場合は全部一気に表示
	} else {
		Term(text);
	}

	newline();
	return tweet;
}

//ユーザーネーム表示
function printUserName(tweet) {
	Term.bold(tweet.user.name);

	//公式アカウント判定
	if (tweet.user.verified) {
		Term.green(" ✔ ");

	}

	// 鍵アカウント判定
	if (tweet.user.protected) {
		Term(" 鍵 ");
	}

	//スクリーンネーム表示
	Term.dim(" @" + tweet.user.screen_name);

	//時刻表示
	Term.dim("\t" + toLocaleString(new Date(tweet.created_at)));

	Term.dim("\t No:" + tweetIdList.push(tweet.id_str));
	newline();
	return tweet;
}

//画像表示
function printImage(tweet) {
	//Tweetに画像が含まれるかの判定
	if (isMedia(tweet)) {
		//添付されてるメディア要素を全て取り出し
		for (let medium of tweet.extended_entities.media) {
			//画像ならアスキー変換
			if (medium.type == "photo") {
				//アスキー変換のプロミス関数を登録
				printAscii(medium);
			}
		}
	}
	return tweet;
}

//Tweetにメディアが含まれているかの判定
function isMedia(tweet) {
	return tweet.extended_entities && tweet.extended_entities.media;
}

function printAscii(medium) {
	ImageToAscii(medium.media_url + ":thumb", {
		size: {
			width: 30
		}
	}, (err, converted) => {
		Term(err || converted);
		newline();
		Term(medium.media_url);
		newline();
		drawBorderLine();

	});
}

//日付フォーマット変換
function toLocaleString(date) {
	return [
			date.getFullYear(),
			date.getMonth() + 1,
			date.getDate()
		].join("/") + " " +
		date.toLocaleTimeString();
}

//画面幅一杯のラインを引く
function drawBorderLine() {
	Term.dim("―".repeat(Term.width));
	newline();
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
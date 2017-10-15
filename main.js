/* eslint-disable no-console,indent */

console.log("Loading module...");

const TWITTER = require("twit");
const TERM = require("terminal-kit").terminal;
const IMAGE_TO_ASCII = require("image-to-ascii");
const FS = require("fs");

console.log("Login twitter...");

//認証情報を書き込んだjson読み込み
let json = FS.readFileSync("./Auth.json", "utf-8");
let auth = JSON.parse(json);

//ログイン認証
const CLIENT = new TWITTER({
	consumer_key: auth.consumer_key,
	consumer_secret: auth.consumer_secret,
	access_token: auth.access_token_key,
	access_token_secret: auth.access_token_secret
});

let isTweetCache = false;
let tweetCache = [];

TERM.windowTitle("NodeTerminalTwitter");
TERM.bold("START!!!");
newline();

//キー入力待受
TERM.grabInput();

TERM.on("key", (name) => {

	//ツイッター終了
	if (name === "CTRL_C") {
		terminate();

		//Tweet入力
	} else if (name === "CTRL_T") {

		inputConsole();
	}

});

startStream();


function inputConsole() {
	isTweetCache = true;

	newline();
	TERM("Input your kuso tweet:>>");
	newline();
	//入力フィールド表示
	TERM.inputField({
		cancelable: true,
		maxLength: 140
	}, (error, input) => {
		if (input) {
			postTweet(input);
		} else {
			TERM("Cancelled");
			newline();
		}
		isTweetCache = false;
		for (let temp of tweetCache) {
			printTweet(temp);
		}
		tweetCache = [];
	});
}

//Tweet投稿
function postTweet(input) {
	CLIENT.post("statuses/update", {
		status: input
	}, (error) => {
		if (!error) {
			newline();
			TERM("Success!");
			newline();
		} else {
			TERM(error);
		}
	});
}

//main処理ここまで

//ストリーミング処理
function startStream() {
	let stream = CLIENT.stream("user");
	stream.on("tweet", (tweet) => {
		// 入力状態のときはTweetを表示せずリストにキャッシュ
		if (isTweetCache) {
			tweetCache.push(tweet);
		} else {
			printTweet(tweet);
		}
	});
	stream.on("error", function(e) {
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
		TERM.dim("RT:" + tweet.user.name + " Retweeted");
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
		TERM("Quoted>>");
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
				TERM.blue(str);
			} else {
				TERM(str);
			}
		}

		//ない場合は全部一気に表示
	} else {
		TERM(text);
	}

	newline();
	return tweet;
}

//ユーザーネーム表示
function printUserName(tweet) {
	TERM.bold(tweet.user.name);

	//公式アカウント判定
	if (tweet.user.verified) {
		TERM(" ✔ ");
	}

	// 鍵アカウント判定
	if (tweet.user.protected) {
		TERM(" 鍵 ");
	}

	//スクリーンネーム表示
	TERM.dim(" @" + tweet.user.screen_name);

	//時刻表示
	TERM.dim("\t" + toLocaleString(new Date(tweet.created_at)));
	newline();
	return tweet;
}

//画像表示
function printImage(tweet) {
	//Tweetに画像が含まれるかの判定
	if (isMedia(tweet)) {
		//添付されてるメディア要素を全て取り出し
		let tasks = [];
		for (let medium of tweet.extended_entities.media) {
			//画像ならアスキー変換
			if (medium.type == "photo") {
				//アスキー変換のプロミス関数を登録
				tasks.unshift(printAsciiPromise(medium));
			}
		}
		// 登録した関数を逐次処理
		sequenceTasks(tasks);
	}
	return tweet;
}

//Tweetにメディアが含まれているかの判定
function isMedia(tweet) {
	return tweet.extended_entities && tweet.extended_entities.media;
}

//アスキーで画像を表示のプロミス版
function printAsciiPromise(medium) {
	new Promise((resolve) => {
		IMAGE_TO_ASCII(medium.media_url + ":thumb", {
			size: {
				width: 30
			}
		}, (err, converted) => {
			TERM(err || converted);
			newline();
			TERM(medium.media_url);
			newline();
			drawBorderLine();
			resolve();
		});
	});
}

//渡されたpromise関数を逐次処理
function sequenceTasks(tasks) {
	function recordValue(results, value) {
		results.push(value);
		return results;
	}
	var pushValue = recordValue.bind(null, []);
	return tasks.reduce((promise, task) => {
		return promise.then(task).then(pushValue);
	}, Promise.resolve());
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
	TERM.dim("―".repeat(TERM.width));
	newline();
}

//改行
function newline() {
	console.log();
}

//終了
function terminate() {
	TERM.grabInput(false);
	TERM("good bye");
	newline();
	setTimeout(function() {
		process.exit();
	}, 100);
}
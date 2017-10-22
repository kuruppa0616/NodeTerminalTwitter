/* eslint-disable no-console,indent */

const Term = require("terminal-kit").terminal;

const TweetCacheController = require("./TweetCacheController");
const TweetIdListController = require("./TweetIdListController");
const AsciiPrinter = require("./AsciiPrinter");
const PrintUtility = require("./PrintUtilities");

module.exports = class TweetPrinter {
	constructor() {
		this.asciiPrinter = new AsciiPrinter();
		this.printUtility = new PrintUtility();
	}

	printTweet(tweet) {

		tweet = this.printRetweet(tweet);
		this.printUserName(tweet);
		this.printBody(tweet);
		this.printImage(tweet);
		this.printQuoted(tweet);
		this.printUtility.drawBorderLine();
		this.printUtility.newline();
	}

	printRetweet(tweet) {

		//リツートだったときは、名前を表示して元ツイートの詳細を表示
		if (tweet.retweeted_status) {
			Term.dim("RT:" + tweet.user.name + " Retweeted");
			this.printUtility.newline();
			tweet = tweet.retweeted_status;
		}
		return tweet;
	}

	//ユーザーネーム表示
	printUserName(tweet) {
		Term.bold(tweet.user.name.replace(/[\\^$.*+?()[\]{}|]/g, "\\$&"));

		//公式アカウント判定
		if (tweet.user.verified) {
			Term(" ✔ ");

		}
		// 鍵アカウント判定
		if (tweet.user.protected) {
			Term(" 鍵 ");
		}

		//スクリーンネーム表示
		Term.dim(" @" + tweet.user.screen_name);

		//時刻表示
		Term.dim("\t" + this.printUtility.toLocaleString(new Date(tweet.created_at)));

		Term.dim("\t No:" + TweetIdListController.addID(tweet.id_str));
		this.printUtility.newline();
	}


	//Tweet本文を表示する
	printBody(tweet) {
		let syntax_list = [];
		let text = tweet.text;

		// 本文から画像のURLを消す
		if (this.isMedia(tweet)) {
			for (let medium of tweet.extended_entities.media) {
				if (medium.type == "photo") {
					text = text.replace(medium.url, "");

				}
			}
		}

		//url取り出し
		//短縮URLを元URLと置換
		for (let url of tweet.entities.urls) {
			syntax_list.push(url.expanded_url.replace("?", "\\?"));
			text = text.replace(url.url, url.expanded_url);
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
		this.printUtility.newline();
	}

	//画像表示
	async printImage(tweet) {
		//Tweetに画像が含まれるかの判定
		if (this.isMedia(tweet)) {
			//添付されてるメディア要素を全て取り出し
			for (let medium of tweet.extended_entities.media) {
				//画像ならアスキー変換
				if (medium.type == "photo") {
					//アスキー変換のプロミス関数を登録
					await this.asciiPrinter.printAscii(medium);
				}
			}
		}
	}

	//引用リツイート元を表示させる
	printQuoted(tweet) {
		//引用リツイートだった場合元ツイート表示
		if (tweet.is_quote_status) {
			tweet = tweet.quoted_status;
			Term("Quoted>>");
			this.printUtility.newline();
			this.printUserName(tweet);
			this.printBody(tweet);
			this.printImage(tweet);
		}
	}

	//Tweetにメディアが含まれているかの判定
	isMedia(tweet) {
		return tweet.extended_entities && tweet.extended_entities.media;
	}

	releaseCache() {
		TweetCacheController.setIsTweetCache(false);
		for (let temp of TweetCacheController.getTweetCacheList()) {
			this.printTweet(temp);
		}
		TweetCacheController.clearTweetCacheList();
	}

};
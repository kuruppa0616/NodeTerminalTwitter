/* eslint-disable no-console,indent */

const Auth = require("./Auth");
const TweetCacheController = require("./TweetCacheController");
const TweetPrinter = require("./TweetPrinter");


module.exports = class StreamTwitter {
	constructor() {
		this.tweetPrinter = new TweetPrinter();
	}

	startStream() {
		let stream = Auth.getClient().stream("user");
		stream.on("tweet", (tweet) => {
			// 入力状態のときはTweetを表示せずリストにキャッシュ
			if (TweetCacheController.getIsTweetCache()) {
				TweetCacheController.addCache(tweet);
			} else {
				this.tweetPrinter.printTweet(tweet);
			}
		});

		stream.on("error", (e) => {
			console.log(e);
		});

		stream.on("disconnect", () => {
			console.log("接続が切断されました。");
		});

		stream.on("resconnect", () => {
			console.log("接続が再接続されました。");
		});

	}

};
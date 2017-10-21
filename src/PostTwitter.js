/* eslint-disable no-console,indent */
const Term = require("terminal-kit").terminal;

const TweetIdListController = require("./TweetIdListController");
const PrintUtility = require("./PrintUtilities");
const Auth = require("./Auth");

module.exports = class PostTwitter {
	constructor() {
		this.printUtility = new PrintUtility();
	}

	//Tweet投稿
	postTweet(input) {
		return new Promise(resolve => {
			Auth.getClient().post("statuses/update", {
				status: input
			}, (error) => {
				if (!error) {
					this.printUtility.newline();
					Term("Tweet Success!");
					this.printUtility.newline();
				} else {
					Term(error);
				}
				resolve();
			});
		});
	}

	//Tweet投稿
	reply(input, tweetID) {
		return new Promise(resolve => {
			Auth.getClient().post("statuses/update", {
				status: input,
				in_reply_to_status_id: TweetIdListController.getID(tweetID)
			}, (error) => {
				if (!error) {
					this.printUtility.newline();
					Term("Tweet Success!");
					this.printUtility.newline();
				} else {
					Term(error);
				}
				resolve();
			});
		});
	}

	//指定idをリツイートする
	reTweet(tweetID) {
		return new Promise(resolve => {
			Auth.getClient().client.post("statuses/retweet/:id", {
				id: TweetIdListController.getID(tweetID)
			}, (error) => {
				if (!error) {
					this.printUtility.newline();
					Term("RT Success!");
					this.printUtility.newline();
				} else {
					Term(error);
				}
				resolve();
			});
		});
	}

	// 指定idをふぁぼる
	favTweet(tweetID) {
		return new Promise(resolve => {
			Auth.getClient().post("favorites/create", {
				id: TweetIdListController.getID(tweetID)
			}, (error) => {
				if (!error) {
					this.printUtility.newline();
					Term("Fav Success!");
					this.printUtility.newline();
				} else {
					Term(error);
				}
				resolve();
			});
		});
	}

};
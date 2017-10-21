/* eslint-disable no-console,indent */
const PrintUtility = require("./PrintUtilities");
const Term = require("terminal-kit").terminal;
const TweetCacheController = require("./TweetCacheController");

const TweetPrinter = require("./TweetPrinter");
const PostTwitter = require("./PostTwitter");



module.exports = class MenuController {

	constructor() {
		this.tweetPrinter = new TweetPrinter();
		this.postTwitter = new PostTwitter();
		this.printUtility = new PrintUtility();
		this.MenuItems = ["Tweet", "Reply", "RT", "Fav", "RT & Fav", "Cancel"];
		this.MenuOptions = {
			style: Term.blue,
			selectedStyle: Term.inverse,
		};
	}

	setupMenu() {
		Term.grabInput();

		Term.on("key", (name) => {

			//ツイッター終了
			if (name === "CTRL_C") {
				this.terminate();

				//Tweet入力
			} else if (name === "CTRL_T") {

				TweetCacheController.setIsTweetCache(true);

				Term.singleLineMenu(this.MenuItems, this.MenuOptions, (error, response) => {
					this.switchMenuProcess(response);
				});
			}
		});
	}


	async switchMenuProcess(response) {

		let id;
		let str;
		switch (response.selectedIndex) {
			case 0:
				str = await this.inputPost("Input your kuso tweet");
				await this.postTwitter.postTweet(str);
				break;
			case 1:
				id = await this.inputPost("Input tweet No");
				str = await this.inputPost("Input your kuso reply");
				await this.postTwitter.reply(str, id);
				break;
			case 2:
				id = await this.inputPost("Input tweet No");
				await this.postTwitter.reTweet(str);
				break;
			case 3:
				id = await this.inputPost("Input tweet No");
				await this.postTwitter.favTweet(str);
				break;
			case 4:
				id = await this.inputPost("Input tweet No");
				await this.postTwitter.reTweet(str);
				await this.postTwitter.favTweet(str);
				break;
			case 5:
				this.printUtility.newline();
				Term("Cancelled");
				this.printUtility.newline();
				break;
		}
		this.tweetPrinter.releaseCache();
	}

	//入力された値を、引数としてリストで受け取った関数に渡し実行する
	inputPost(message) {
		return new Promise(resolve => {
			this.printUtility.newline();
			Term(message + ":>>");
			this.printUtility.newline();
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
	terminate() {
		Term.grabInput(false);
		Term("good bye");
		this.printUtility.newline();
		setTimeout(function() {
			process.exit();
		}, 100);
	}
};
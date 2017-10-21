/* eslint-disable no-console,indent */
const Fs = require("fs");
const Twitter = require("twit");

let client = null;

module.exports = class Auth {

	//ログイン処理
	static login(file) {
		this.json = Fs.readFileSync(file, "utf-8");
		this.auth = JSON.parse(this.json);
		client = new Twitter({
			consumer_key: this.auth.consumer_key,
			consumer_secret: this.auth.consumer_secret,
			access_token: this.auth.access_token_key,
			access_token_secret: this.auth.access_token_secret
		});
	}

	static getClient() {
		return client;
	}
};
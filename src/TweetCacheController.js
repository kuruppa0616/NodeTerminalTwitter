/* eslint-disable no-console,indent */
//入力状態中に流れてくるTweetを一時保存しとくための奴ら
let isTweetCache = false;
let tweetCache = [];

module.exports = class TweetCacheController {

	static setIsTweetCache(bool) {
		isTweetCache = bool;
	}
	static getIsTweetCache() {
		return isTweetCache;
	}

	static addCache(tweet) {
		tweetCache.push(tweet);
	}

	static getTweetCacheList() {
		return tweetCache;
	}

	static clearTweetCacheList() {
		tweetCache = [];
	}
};
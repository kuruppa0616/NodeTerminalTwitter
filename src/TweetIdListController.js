/* eslint-disable no-console,indent */
let tweetIdList = [];

module.exports = class TweetIdListController {

	//リストにIDを追加して、追加後のリストの長さを返す
	static addID(id) {
		return tweetIdList.push(id);
	}

	static getID(index) {
		return tweetIdList[index - 1];
	}
};
// 'use strict';
const Twitter = require('twitter');
const term = require('terminal-kit').terminal;
term.windowTitle("NodeTerminalTwitter");
const imageToAscii = require("image-to-ascii");
const fs = require('fs');

//認証情報を書き込んだjson読み込み
let json = fs.readFileSync("./Auth.json", "utf-8");
let auth = JSON.parse(json);

//ログイン認証
const client = new Twitter({
    consumer_key: auth.consumer_key,
    consumer_secret: auth.consumer_secret,
    access_token_key: auth.access_token_key,
    access_token_secret: auth.access_token_secret
});

let isTweetCache = false;
let tweetCache = [];

term.bold("START!!!");
newline();

//キー入力待受
term.grabInput();

term.on('key', (name, matches, data) => {

    //ツイッター終了
    if (name === 'CTRL_C') {
        terminate();

        //Tweet入力
    } else if (name === 'CTRL_T') {

        inputTweet();
    }

});

startStream();

function inputTweet() {
    isTweetCache = true;
    term("\nInput your kuso tweet:>>");
    newline();
    //入力フィールド表示
    term.inputField({
        cancelable: true,
        maxLength: 140
    }, (error, input) => {
        if (input) {
            client.post('statuses/update', {
                status: input
            }, (error, tweet, response) => {
                if (!error) {
                    newline();
                    term("Success!");
                    newline();
                } else {
                    term(error);
                }
            });
        } else {
            term("Cancelled");
            newline();
        }
        // drawBorderLine();
        isTweetCache = false;
        // let tasks = [];
        for (let temp of tweetCache) {
            // tasks.unshift(printTweet(temp));
            printTweet(temp);
        }
        tweetCache = [];
        // sequenceTasks(tasks);

    });
}

//main処理ここまで

//ストリーミング処理
function startStream() {
    let stream = client.stream('user');
    stream.on('data', (tweet) => {

        // 入力状態のときはTweetを表示せずリストにキャッシュ
        if (isTweetCache) {
            tweetCache.push(tweet);
        } else {
            printTweet(tweet);
        }

    });
    stream.on('error', function (e) {})
}

//Tweet表示
function printTweet(tweet) {

    tweet = printRetweet(tweet);
    printUserName(tweet);
    printBody(tweet);
    printImage(tweet);
    printQuoted(tweet);
    drawBorderLine()
    newline();
}

//Tweet表示
function printTweetPromise(tweet) {
    new Promise((resolve, reject) => {
        Promise.resolve(tweet)
            .then(printRetweet)
            .then(printUserName)
            .then(printBody)
            .then(printImage)
            .then(printQuoted)
            .then(() => {
                drawBorderLine()
                newline();
                return tweet;
            })
            .catch((error) => {
                console.error(error);
            });
    }, (err, converted) => {

        resolve();
    });

}

function printRetweet(tweet) {
    //リツートだったときは、名前を表示して元ツイートの詳細を表示
    if (tweet.retweeted_status) {
        term.dim("RT:" + tweet.user.name + " Retweeted");
        newline();
        tweet = tweet.retweeted_status;
    }
    return tweet;
}

function printQuoted(tweet) {
    //引用リツイートだった場合元ツイート表示
    if (tweet.is_quote_status) {
        tweet = tweet.quoted_status;
        term("Quoted>>");
        Promise.resolve(tweet)
            .then(printUserName)
            .then(printBody)
            .then(printImage)
            .catch((error) => {
                console.error(error);
            });
    }
    return tweet;
}

function printBody(tweet) {
    //本文を表示
    term(tweet.text);
    newline();
    return tweet;
}

//ユーザーネーム表示
function printUserName(tweet) {
    term.bold(tweet.user.name);

    //公式アカウント判定
    if (tweet.user.verified) {
        term(" ✔ ");
    }

    // 鍵アカウント判定
    if (tweet.user.protected) {
        term(" 鍵 ");
    }

    //スクリーンネーム表示
    term.dim(" @" + tweet.user.screen_name);

    //時刻表示
    term.dim("\t" + toLocaleString(new Date(tweet.created_at)));
    newline();
    return tweet;
}

//画像表示
function printImage(tweet) {
    //Tweetに画像が含まれるかの判定
    if (tweet.extended_entities && tweet.extended_entities.media) {
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

//アスキーで画像を表示のプロミス版
function printAsciiPromise(medium) {
    new Promise((resolve, reject) => {
        imageToAscii(medium.media_url + ":thumb", {
            size: {
                width: 30
            }
        }, (err, converted) => {
            term(err || converted);
            newline();
            term(medium.media_url);
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
        ].join('/') + ' ' +
        date.toLocaleTimeString();
}

//画面幅一杯のラインを引く
function drawBorderLine() {
    term("―".repeat(term.width));
    newline();
}

//改行
function newline() {
    console.log();
}

//終了
function terminate() {
    term.grabInput(false);
    term("good bye");
    newline();
    setTimeout(function () {
        process.exit()
    }, 100);
}
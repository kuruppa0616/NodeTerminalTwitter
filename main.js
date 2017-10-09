// 'use strict';
const Twitter = require('twitter');
const term = require('terminal-kit').terminal;
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

//キー入力待受
term.grabInput();

term.on('key', function (name, matches, data) {

    //ツイッター終了
    if (name === 'CTRL_C') {
        terminate();

        //Tweet入力
    } else if (name === 'CTRL_T') {
        isTweetCache = true;
        term("\nInput your kuso tweet:>>");
        newline();

        //入力フィールド表示
        term.inputField({
            cancelable: true,
            maxLength: 140
        }, function (error, input) {

            if (input) {
                client.post('statuses/update', {
                    status: input
                }, function (error, tweet, response) {
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

            drawBorderLine();

            isTweetCache = false;

            for (let temp of tweetCache) {
                printTweet(temp);
            }

            tweetCache = [];
        });
    }

});

startStream();

//main処理ここまで

//ストリーミング処理
function startStream() {
    let stream = client.stream('user');
    stream.on('data', function (tweet) {

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

    //リツートだったときは、名前を表示して元ツイートの詳細を表示
    if (tweet.retweeted_status) {
        term.dim("RT:" + tweet.user.name + " Retweeted");
        newline();
        tweet = tweet.retweeted_status;
    }

    //ユーザーネーム表示
    printUserName(tweet);

    newline();

    //本文表示
    printBody(tweet);
    // term(tweet.text);

    newline();

    //AA表示
    printImage(tweet);

    //引用リツイートだった場合元ツイート表示
    if (tweet.quoted_status) {
        term("Quoted>>");
        printUserName(tweet.quoted_status.user);

        newline();
        term(tweet.quoted_status.text);
        newline();
    }

    drawBorderLine()
    newline();
}

function printBody(tweet) {
    //本文を表示
    term(tweet.text);
}

//ユーザーネーム表示
function printUserName(tweet) {
    term.bold(tweet.user.name);

    //公式アカウント判定
    if (tweet.user.verified) {
        term(" 公 ");
    }

    // 鍵アカウント判定
    if (tweet.user.protected) {
        term(" 鍵 ");
    }

    //スクリーンネーム表示
    term.dim(" @" + tweet.user.screen_name);

    //時刻表示
    term.dim("\t" + toLocaleString(new Date(tweet.created_at)));
}

//画像表示
function printImage(tweet) {
    //Tweetに画像が含まれるかの判定
    if (tweet.extended_entities && tweet.extended_entities.media) {
        //添付されてる画像を全て取り出し
        for (medium of tweet.extended_entities.media) {
            if (medium.type == "photo") {
                imageToAscii(medium.media_url + ":thumb", {
                    size: {
                        width: 30
                    }
                }, (err, converted) => {
                    term(err || converted);
                    newline();
                    term(medium.media_url);
                    newline();
                    drawBorderLine()
                });
            }
        }
    }
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
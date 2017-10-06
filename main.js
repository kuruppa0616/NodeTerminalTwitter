const Twitter = require('twitter');
const term = require('terminal-kit').terminal;
const imageToAscii = require("image-to-ascii");
const fs = require('fs');

//認証情報を書き込んだjson読み込み
var json = fs.readFileSync("./Auth.json", "utf-8");
var auth = JSON.parse(json);

//ログイン認証
const client = new Twitter({
  consumer_key: auth.consumer_key,
  consumer_secret: auth.consumer_secret,
  access_token_key: auth.access_token_key,
  access_token_secret: auth.access_token_secret
});
var isTweetCache = false;
var tweetCache = [];
var stream;

console.log("start!!!!!!!!");

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
    console.log();

    //入力フィールド表示
    term.inputField({
        cancelable: true,
        maxLength: 140
      },

      function (error, input) {
        if (input) {
          client.post('statuses/update', {
            status: input
          }, function (error, tweet, response) {
            if (!error) {
              console.log();
              term("Success!");
              console.log();
            } else {
              term(error);
            }
          });
        } else {
          term("Cancelled");
          console.log();

        }
        // drawLine();
        // isTweetCache = false;
        // for (temp of tweetCache) {
        //   printTweet(temp);
        // }
        // tweetCache = [];
      }

    );
  }
});

startStream();

//メイン処理ここまで

function startStream() {
  stream = client.stream('user');
  stream.on('data', function (tweet) {
    if (isTweetCache) {
      tweetCache.push(tweet);
    } else {
      printTweet(tweet);
    }

  })
  stream.on('error', function (e) {})
}

//Tweet表示
function printTweet(tweet) {

  console.log();

  //リツートだったときは、名前を表示して元ツイートの詳細を表示
  if (tweet.retweeted_status) {
    term.dim("RT:" + tweet.user.name + " Retweeted");
    console.log();
    tweet = tweet.retweeted_status;
  }

  printUserName(tweet.user);

  term.dim("\t" + toLocaleString(new Date(tweet.created_at)) + "\t");
  console.log();
  //本文を表示
  term(tweet.text);
  console.log();

  //AA表示
  printImage(tweet);

  //引用リツイートだった場合元ツイート表示
  if (tweet.quoted_status) {
    term("Quoted>>");
    printUserName(tweet.quoted_status.user);

    console.log();
    term(tweet.quoted_status.text);
    console.log();
  }

  drawLine()
}

//ユーザーネーム表示
function printUserName(user) {
  term.bold(user.name);
  if (user.verified) {
    term(" 公 ");
  }
  if (user.protected) {
    term(" 鍵 ");
  }
  term.dim(" @" + user.screen_name);
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
          console.log();
          term(medium.media_url);
          console.log();
          drawLine()
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
function drawLine() {
  term("―".repeat(term.width));
  console.log();
}

//終了
function terminate() {
  term.grabInput(false);
  term("good bye");
  drawLine();
  setTimeout(function () {
    process.exit()
  }, 100);
}
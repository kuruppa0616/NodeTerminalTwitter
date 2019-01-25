# Introduction
ターミナルでTwitterができます。画像はいい感じのライブラリを使ってそれっぽくアスキーアートに変換されて表示されます。確か「Control + T」とかでメニューが出ます

多分macでしか動きません。

ユーザーストリーミングが死んだのでタイムラインの代わりに猫に関するツイートを流します。

# インストール
	$ brew install graphicsmagick
	$ npm i 

# 準備
プロジェクト直下にAuth.jsonって名前で↓みたいなファイル作ってください
```
{
  "consumer_key": "hoge",
  "consumer_secret": "hoge",
  "access_token_key": "fuga",
  "access_token_secret": "fuga"
}
```

# 使いかた
	$ node Index.js

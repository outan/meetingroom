var bocco = require('./bocco.js');
var newsFeed = require('./news-feed.js');

// bocco のルームID,アクセストークンを設定
bocco.setRoomId("5b7a1aa7-3bed-4c22-955d-83275818d0dc")
     .setAccessToken("b7bf245a1d619d836869458746c4ebc8b31fb75bf9997f8b3b784f10ae484578");

//メッセージ一覧を取得
//コールバック
var callback_getMessages = function(json){
	console.log("callback_getMessages");
	console.log(json);
};
//bocco.getMessages(callback_getMessages);

//メッセージ送信
//コールバック
var callback_postMessageText = function(json){
	console.log("callback_getMessages");
	console.log(json);
};
//bocco.postMessageText("お腹が空いたね、はやく終わりましょうか",callback_postMessageText);

//音声メディアの取得
var callback_getMessageMediaAudio = function(json){
	console.log("callback_getMessageMediaAudio");
	console.log(json);
};
//bocco.getMessageMediaAudio(callback_getMessageMediaAudio);

//録音した音声のテキスト変換
// node-google-speech-api の修正 が必要
// node_modules/google-speech-api/index.js
// 60行目に モノラルにするメソッドを追加する
// .audioChannels(1)

/*
//変換元 BOCCOで録音した音声
var url = "https://api.bocco.me/1/messages/130467.wav";
//ブラウザAPIキー
var apiKey = "AIzaSyAFltwcHvvnDCYDwo6fezLntFeHFrSXL70";

bocco.wav2text(url,apiKey,function( text ){
	if(text != null){
		//変換に成功
		console.log({text:text});
	}
});
*/

//例) はてなブックマーク テクノロジー
var rss_url = "http://b.hatena.ne.jp/entrylist/it.rss";
var rss_cnt = 0;

//コールバック RSS記事の数だけコールバックされる
var fnc = function( feeds ){
	//console.log( feeds );
	//ランダムに１件 取得してみる
	var i = Math.floor( Math.random()*feeds.length );
	var meta = feeds[i].meta;
	var item = feeds[i];

	console.log("---");
	//日付を取得
	var d = new Date(item['dc:date']['#']);
	var yymmdd = d.getFullYear()+"年" + (d.getMonth()+1)+"月"+d.getDate()+"日";
	//console.log( yymmdd );
	//console.log( item.title );

	//TODO ここで日付とタイトルだけBOCCOに送信
	var msg = item.title;
	console.log( msg );
	bocco.postMessageText(msg,function(json){

	});
};

newsFeed.getFeed(rss_url,fnc);
//インターバル実行
setInterval(function(){ newsFeed.getFeed(rss_url,fnc); }, 3*60*1000);

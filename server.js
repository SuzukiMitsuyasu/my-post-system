const express = require('express');
const { MongoClient } = require('mongodb'); // ← fsの代わりにmongodbを読み込む

const app = express();
const PORT = 3000;

// =================================================================
// !!! 重要 !!! あなたの接続文字列に書き換えてください
// =================================================================
// 先ほどパスワードを書き換えて、あなたが安全に保管した接続文字列を、以下の""の間に貼り付けてください
const MONGODB_URI = process.env.MONGODB_URI;// =================================================================

const dbName = 'poetypost-database'; // これから作るデータベース名
const collectionName = 'poems'; // これから作るコレクション名

// MongoDBクライアントのインスタンスを作成
const client = new MongoClient(MONGODB_URI);
let db; // データベースのインスタンスを保持する変数

// --- データベースへの接続（非同期）---
async function connectDB() {
  try {
    await client.connect();
    console.log('MongoDBに正常に接続しました。');
    db = client.db(dbName); // データベースのインスタンスを取得
  } catch (e) {
    console.error('MongoDBへの接続に失敗しました。', e);
    process.exit(1); // 接続に失敗したらプログラムを終了
  }
}

// ミドルウェアの設定
app.use(express.static('public'));
app.use(express.json());

// --- APIエンドポイントの定義（MongoDBを使うように書き換え）---

// [GET] 特定のポストのテキストを取得するAPI
app.get('/posts/:postNumber', async (req, res) => {
  try {
    const postNumber = parseInt(req.params.postNumber); // 文字列を数値に変換
    const collection = db.collection(collectionName);
    
    // データベースからpostNumberが一致するドキュメントを一つ探す
    const post = await collection.findOne({ post_number: postNumber });

    if (post) {
      res.json({ text: post.text }); // ドキュメントが見つかれば、そのテキストを返す
    } else {
      res.status(404).json({ text: 'そのポストにはテキストがありません。' });
    }
  } catch (e) {
    res.status(500).send('サーバーでエラーが発生しました。');
  }
});

// [POST] 新しいテキストをポストに保存するAPI
app.post('/posts', async (req, res) => {
  try {
    const { postNumber, text } = req.body;
    const postNumberAsInt = parseInt(postNumber);
    const collection = db.collection(collectionName);

    // post_numberが一致するドキュメントを探し、もし存在すれば更新、なければ新規作成(upsert)する
    const result = await collection.updateOne(
      { post_number: postNumberAsInt }, // 検索条件
      { $set: { post_number: postNumberAsInt, text: text } }, // 保存・更新するデータ
      { upsert: true } // trueにすると、データがなければ新規作成してくれる
    );

    res.status(200).send('保存しました。');
  } catch (e) {
    res.status(500).send('保存に失敗しました。');
  }
});

// --- サーバー起動 ---
// データベースに接続してから、Webサーバーを起動する
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`サーバーが http://localhost:${PORT} で起動しました。`);
  });
});
require('dotenv').config(); // ← この行をファイルの先頭に追加

// ...以降のコードはそのまま...
const express = require('express');
const { MongoClient } = require('mongodb');
const session = require('express-session'); // ← ステップ1で追加した道具
const path = require('path');

const app = express();
const PORT = 3000;
const MONGODB_URI = process.env.MONGODB_URI;

// --- ログイン用のIDとパスワードを定義 ---
// 本来はもっと安全な方法で管理しますが、今回は学習のためここに直接書きます。
const ADMIN_USER = 'admin'; // 管理者ID
const ADMIN_PASS = 'mitsuyasu'; // 【重要】あなただけの複雑なパスワードに変更してください！

const dbName = 'poetypost-database';
const collectionName = 'poems';

const client = new MongoClient(MONGODB_URI);
let db;

async function connectDB() {
  try {
    await client.connect();
    console.log('MongoDBに正常に接続しました。');
    db = client.db(dbName);
  } catch (e) {
    console.error('MongoDBへの接続に失敗しました。', e);
    process.exit(1);
  }
}

// --- ① 記憶力：セッション機能のセットアップ ---
app.use(session({
  secret: 'korehan Dareni-mo-shirareteha ikenai himitsukagi', // セッション情報を暗号化するための秘密の言葉
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // 本番環境(https)ではtrueにするのが望ましい
}));

app.use(express.static('public'));
app.use(express.json());

// --- ③ 門番：ログイン状態をチェックする関数 ---
function requireLogin(req, res, next) {
  if (req.session.isLoggedIn) {
    next(); // ログイン済みなら、リクエストされた次の処理へ進む
  } else {
    res.redirect('/login.html'); // 未ログインなら、ログインページへ強制送還
  }
}

// --- APIエンドポイント（APIの受付窓口）の定義 ---

// --- ② 認証能力：ログイン処理API ---
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    // IDとパスワードが一致したら、セッションに「ログイン済み」の印を付ける
    req.session.isLoggedIn = true; 
    res.json({ success: true });
  } else {
    res.json({ success: false, message: 'ユーザー名またはパスワードが違います。' });
  }
});

// ログアウト処理API
app.get('/logout', (req, res) => {
  req.session.destroy((err) => { // セッション情報を破棄する
    res.redirect('/login.html'); // ログインページに戻る
  });
});


// --- ④ 門番の配置 ---

// [GET] 管理者ページへのアクセス。門番(requireLogin)が見張っている。
app.get('/admin.html', requireLogin, (req, res) => {
  // sendFileで、publicフォルダの中のadmin.htmlを送る
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// [POST] 詩の保存API。門番(requireLogin)が見張っている。
app.post('/posts', requireLogin, async (req, res) => {
  try {
    const { postNumber, text } = req.body;
    const postNumberAsInt = parseInt(postNumber);
    const collection = db.collection(collectionName);
    await collection.updateOne(
      { post_number: postNumberAsInt },
      { $set: { post_number: postNumberAsInt, text: text } },
      { upsert: true }
    );
    res.status(200).send('保存しました。');
  } catch (e) {
    res.status(500).send('保存に失敗しました。');
  }
});

// [GET] 詩の取得API (これは誰でも見れるので門番は不要)
app.get('/posts/:postNumber', async (req, res) => {
  try {
    const postNumber = parseInt(req.params.postNumber);
    const collection = db.collection(collectionName);
    const post = await collection.findOne({ post_number: postNumber });
    if (post) {
      res.json({ text: post.text });
    } else {
      res.status(404).json({ text: 'そのポストにはテキストがありません。' });
    }
  } catch (e) {
    res.status(500).send('サーバーでエラーが発生しました。');
  }
});


// --- サーバー起動 ---
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`サーバーが http://localhost:${PORT} で起動しました。`);
  });
});
// --- 準備：必要な道具（プログラム）を読み込む ---
const express = require('express'); // Expressというフレームワーク（厨房の基本設備）
const fs = require('fs');           // File Systemの略。ファイルを読み書きする道具
const path = require('path');       // ファイルの場所を扱うための道具

// --- 初期設定：厨房の基本設定を行う ---
const app = express();              // Expressアプリ（厨房そのもの）を作成
const PORT = 3000;                  // サーバーの受付窓口（ポート番号）を3000番に設定
const DB_PATH = path.join(__dirname, 'database.json'); // 冷蔵庫（データベース）の場所を覚える

// --- ミドルウェア：厨房の自動化ルールを設定 ---
// publicフォルダの中身（メニューやホールスタッフ）を、お客さんに見せる設定
app.use(express.static('public'));
// お客さんからの注文（JSON形式のデータ）を、シェフが読める形に自動で変換する設定
app.use(express.json());

// --- APIエンドポイント：シェフの仕事内容（レシピ）を定義 ---

// [GET] 特定のポストのテキストを渡す（料理を提供する）レシピ
app.get('/posts/:postNumber', (req, res) => {
  const postNumber = req.params.postNumber; // お客さんが指定したポスト番号（注文内容）を取得
  fs.readFile(DB_PATH, 'utf8', (err, data) => { // 冷蔵庫から材料一覧を読み込む
    if (err) {
      return res.status(500).send('サーバーでエラーが発生しました。');
    }
    const db = JSON.parse(data); // 材料一覧をシェフが読める形式に変換
    if (db[postNumber]) { // もし注文された料理の材料があれば...
      res.json({ text: db[postNumber] }); // 出来上がった料理をお客さんに渡す
    } else { // もし材料がなければ...
      res.status(404).json({ text: 'そのポストにはテキストがありません。' }); // 「品切れです」と伝える
    }
  });
});

// [POST] 新しいテキストを保存する（新しい料理を作る）レシピ
app.post('/posts', (req, res) => {
  const { postNumber, text } = req.body; // 新しい料理の注文内容（ポスト番号とテキスト）を受け取る

  fs.readFile(DB_PATH, 'utf8', (err, data) => { // まずは現在の冷蔵庫の中身を確認
    if (err) {
      return res.status(500).send('サーバーでエラーが発生しました。');
    }
    const db = JSON.parse(data);
    db[postNumber] = text; // 新しい料理（データ）を作る

    // 新しい料理を含めた最新の状態で、冷蔵庫の中身を丸ごと上書き保存する
    fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), (err) => {
      if (err) {
        return res.status(500).send('保存に失敗しました。');
      }
      res.status(200).send('保存しました。'); // 「料理ができました」とお客さんに伝える
    });
  });
});

// --- サーバー起動：お店をオープンする ---
app.listen(PORT, () => {
  console.log(`サーバーが http://localhost:${PORT} で起動しました。`);
});
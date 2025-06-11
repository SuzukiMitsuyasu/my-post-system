// ドキュメント（HTML）の読み込みが完了したら、中の処理を実行する
document.addEventListener('DOMContentLoaded', () => {

  // --- 管理者ページの処理 ---
  // admin.htmlにある要素（部品）を取得する
  const saveButton = document.getElementById('saveButton');
  const adminPostNumberInput = document.getElementById('adminPostNumber');
  const adminTextInput = document.getElementById('adminText');
  const adminStatus = document.getElementById('adminStatus');

  // もし保存ボタンがこのページにあれば、以下の処理を準備する
  if (saveButton) {
    // 保存ボタンがクリックされたら、非同期関数を実行する
    saveButton.addEventListener('click', async () => {
      const postNumber = adminPostNumberInput.value;
      const text = adminTextInput.value;

      // サーバーの '/posts' という宛先に対して、POSTメソッドでデータを送信する
      const response = await fetch('/posts', {
        method: 'POST', //「送る」という意思表示
        headers: {
          'Content-Type': 'application/json', // 送るデータはJSON形式です、という宣言
        },
        body: JSON.stringify({ postNumber, text }), // 送る実データ（JSON文字列に変換）
      });

      // サーバーからの返事をステータス欄に表示
      adminStatus.textContent = await response.text();
    });
  }

  // --- ユーザーページの処理 ---
  // index.htmlにある要素（部品）を取得する
  const viewButton = document.getElementById('viewButton');
  const userPostNumberInput = document.getElementById('userPostNumber');
  const postContent = document.getElementById('postContent');

  // もし閲覧ボタンがこのページにあれば、以下の処理を準備する
  if (viewButton) {
    // 閲覧ボタンがクリックされたら、非同期関数を実行する
    viewButton.addEventListener('click', async () => {
      const postNumber = userPostNumberInput.value;

      // サーバーの '/posts/（指定した番号）' という宛先に対して、GETメソッドでデータを要求する
      const response = await fetch(`/posts/${postNumber}`);
      const data = await response.json(); // サーバーからの返事（JSON）をJavaScriptオブジェクトに変換

      // 結果表示欄に、受け取ったテキストを表示
      postContent.textContent = data.text;
    });
  }
});
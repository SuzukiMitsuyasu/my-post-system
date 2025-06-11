document.addEventListener('DOMContentLoaded', () => {
    // HTMLから必要な部品を取得
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginStatus = document.getElementById('loginStatus');

    // ログインフォームが「送信」されたときの処理を準備
    loginForm.addEventListener('submit', async (event) => {
        // formのデフォルトの送信機能を無効化（ページがリロードされるのを防ぐ）
        event.preventDefault(); 

        // 入力された値を取得
        const username = usernameInput.value;
        const password = passwordInput.value;

        // サーバーの'/login'という宛先に、入力されたIDとパスワードを送信
        const response = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
            credentials: 'include' // ← チャットGPTで追加！！！

        });

        // サーバーからの返事を受け取る
        const result = await response.json();

        if (result.success) {
            // もしログインに成功したら、管理者ページへ移動する
            window.location.href = '/admin.html';
        } else {
            // もし失敗したら、エラーメッセージを表示する
            loginStatus.textContent = result.message;
        }
    });
});
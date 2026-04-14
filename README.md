# 2048 Web Game

ブラウザで遊べる2048ゲームです。キーボード（矢印キー / WASD）とモバイルのスワイプ操作に対応しています。

## ローカル実行

```bash
python3 -m http.server 8000
```

その後 `http://localhost:8000` を開いて遊べます。

## GitHub Pages 公開手順

1. このリポジトリを GitHub に push します。
2. GitHub の **Settings > Pages** で **Build and deployment** の Source を **GitHub Actions** に設定します。
3. `main` または `work` ブランチへの push で、`.github/workflows/deploy-pages.yml` が実行されます。
4. デプロイ完了後、Pages の公開URLで 2048 が遊べます。

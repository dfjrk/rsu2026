# RSU Tax JP

米国株RSU 確定申告サポートツール（E*TRADE / Morgan Stanley）

## セットアップ
```bash
git clone https://github.com/<your-username>/rsu-tax-jp.git
cd rsu-tax-jp
npm install
npm run dev
```
→ http://localhost:5173 を開く

## 必要環境
- Node.js 18以上 / npm 9以上

## 使い方
1. **STEP 1**: Release Confirmation PDF をアップロード（複数可）
2. **STEP 2**: 読み込みデータを確認し、売却日・収入・Wire手数料を入力
3. **STEP 3**: TTMレートを確認（自動取得済）。必要なら手動上書き可能
4. **STEP 4**: 確定申告用サマリーを確認

## TTMデータについて
- `src/data/murc_ttm_2025.json` に三菱UFJ銀行 2025年分（245営業日）を収録済み
- 2025/09/01、2025/12/01 はMUFG未公表日のため直前公表日を自動使用
- TTMデータを更新する場合は `murc_ttm_2025.json` を差し替えてください
  - 三菱UFJ: https://www.murc-kawasesouba.jp/fx/past_3month.php

## セキュリティ
- ローカル完結（PDFデータは外部送信されません）

## 免責
本ツールは情報整理目的のみです。申告前に必ず税理士にご確認ください。

# RSU Mate

米国株RSU（譲渡制限付株式）のVest（権利確定）および売却時の確定申告をサポートするローカル専用ツールです。

対応証券会社: E*TRADE、Morgan Stanley

## セットアップ

```bash
git clone https://github.com/dfjrk/rsu2026.git
cd rsu2026
npm install
npm run rsu
```

ブラウザが自動で開きます（http://localhost:5173）

### 必要環境
- Node.js 18以上 / npm 9以上

## 使い方

1. **STEP 1 — PDF読み込み**: Release Confirmation PDF / Trade Confirmation PDF をアップロード（複数可）
2. **STEP 2 — データ確認・編集**: 読み込みデータを確認（Vest明細・売却明細を上下段で表示）。Disbursement Fee を入力
3. **STEP 3 — TTM確認・上書き**: TTMレートを確認（自動取得済）。非営業日は直前公表日を自動参照。必要なら手動上書き可能
4. **STEP 4 — 申告ダッシュボード**: 確定申告用サマリーを確認

## 対応PDF

| PDF種別 | 発行元 | 抽出データ |
|---------|--------|-----------|
| Release Confirmation | Morgan Stanley / E*TRADE | Vest日、株数、FMV/株、ベスト総額 |
| Trade Confirmation | E*TRADE | 売却日、株数、単価、売却収入(Net Amount) |

## TTMデータについて

- `murc_2025.xls`（三菱UFJ銀行発行）からUSD TTMを抽出し `src/data/murc_ttm_2025.json` に変換（243営業日分）
- 土日・祝日はJSONに含まれないため、直前営業日のTTMを自動参照
- TTMデータを更新する場合は `murc_2025.xls` を差し替えて再変換してください
  - 三菱UFJ: https://www.murc-kawasesouba.jp/fx/past_3month.php

## セキュリティ

- すべての処理はローカルで完結します（PDFデータ・個人情報は外部送信されません）
- フォントはセルフホスト（外部CDNへの通信なし）
- Content Security Policy (CSP) ヘッダーで外部リソース読み込みを制限

## 免責事項

本ツールは、RSUに関する情報整理および申告準備を補助することを目的としたものであり、税務アドバイスを提供するものではありません。
実際の申告内容については、ご自身の責任でご確認いただき、必要に応じて税理士等の専門家へご相談ください。

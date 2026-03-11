# RSU Mate

米国株RSUのVestおよび譲渡時の確定申告をサポートします。(E*TRADE、Morgan Stanley)

## セットアップ
```bash
git clone https://github.com/dfjrk/rsu2026.git
cd rsu2026
npm install
npm run dev
```
→ http://localhost:5173 を開く

## 必要環境
- Node.js 18以上 / npm 9以上

## 使い方
1. **STEP 1**: Release Confirmation PDF / Trade Confirmation PDF をアップロード（複数可）
2. **STEP 2**: 読み込みデータを確認（Vest明細・売却明細を上下段で表示）。Wire手数料を入力
3. **STEP 3**: TTMレートを確認（自動取得済）。非営業日は直前公表日を自動参照。必要なら手動上書き可能
4. **STEP 4**: 確定申告用サマリーを確認

## 対応PDF
| PDF種別 | 発行元 | 抽出データ |
|---------|--------|-----------|
| Release Confirmation | Morgan Stanley / E*TRADE | Vest日、株数、FMV/株、ベスト総額 |
| Trade Confirmation | E*TRADE | 売却日、株数、単価、売却収入(Net Amount) |

## TTMデータについて
- `murc_2025.xls`（三菱UFJ銀行発行）からUSD TTMを抽出し `src/data/murc_ttm_2025.json` に変換（243営業日分）
- 土日・祝日はJSONに含まれないため、直前営業日のTTMを自動参照（国税庁ルール）
- TTMデータを更新する場合は `murc_2025.xls` を差し替えて再変換してください
  - 三菱UFJ: https://www.murc-kawasesouba.jp/fx/past_3month.php

## セキュリティ
- ローカル完結（PDFデータは外部送信されません）

## 免責
本ツールは情報整理目的のみです。申告前に必ず税理士にご確認ください。

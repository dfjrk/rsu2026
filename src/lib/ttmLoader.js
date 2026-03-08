import ttmData from "../data/murc_ttm_2025.json";

/**
 * 指定日付のTTMをJSONから取得。
 * 見つからない場合は最大30日前まで遡り、最初に見つかった値を返す。
 *
 * @param {string} dateStr - "YYYY/MM/DD"
 * @returns {{ rate: number|null, resolvedDate: string, isAdjusted: boolean }}
 */
export function lookupTTM(dateStr) {
  const direct = ttmData[dateStr];
  if (direct != null) {
    return { rate: direct, resolvedDate: dateStr, isAdjusted: false };
  }

  const [y, m, d] = dateStr.split("/").map(Number);
  let dt = new Date(y, m - 1, d);
  for (let i = 1; i <= 30; i++) {
    dt.setDate(dt.getDate() - 1);
    const key = [
      dt.getFullYear(),
      String(dt.getMonth() + 1).padStart(2, "0"),
      String(dt.getDate()).padStart(2, "0"),
    ].join("/");
    if (ttmData[key] != null) {
      return { rate: ttmData[key], resolvedDate: key, isAdjusted: true };
    }
  }
  return { rate: null, resolvedDate: dateStr, isAdjusted: true };
}

/**
 * 日付が土日かどうかを確認する
 */
export function isWeekend(dateStr) {
  const [y, m, d] = dateStr.split("/").map(Number);
  const day = new Date(y, m - 1, d).getDay();
  return day === 0 || day === 6;
}

/**
 * JSONに存在しない日付かどうか（祝日・銀行休業日）
 */
export function isMissingFromData(dateStr) {
  return ttmData[dateStr] == null;
}

/**
 * 全データを返す（手動編集用）
 */
export function getAllTTMData() {
  return { ...ttmData };
}

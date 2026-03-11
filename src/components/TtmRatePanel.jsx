import { useMemo } from "react";
import { lookupTTM } from "../lib/ttmLoader";

const DAY_NAMES = ["日", "月", "火", "水", "木", "金", "土"];

function getDayLabel(dateStr) {
  const [y, m, d] = dateStr.split("/").map(Number);
  const dt = new Date(y, m - 1, d);
  return `${y}/${m}/${d}（${DAY_NAMES[dt.getDay()]}）`;
}

const numberInputStyle = `
  input[type=number]::-webkit-inner-spin-button,
  input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
  input[type=number] { -moz-appearance: textfield; }
`;

const styles = {
  container: {
    maxWidth: 800,
    margin: "0 auto",
  },
  sourceNote: {
    fontSize: 12,
    color: "#94a3b8",
    marginBottom: 20,
    padding: "10px 14px",
    background: "rgba(30,45,61,0.4)",
    borderRadius: 8,
    fontFamily: "'IBM Plex Sans', sans-serif",
    lineHeight: 1.6,
  },
  card: (borderColor) => ({
    background: "rgba(15,23,42,0.6)",
    border: `1px solid ${borderColor}`,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  }),
  badgeRow: {
    display: "flex",
    gap: 6,
    flexWrap: "wrap",
    marginBottom: 10,
  },
  badge: (bg) => ({
    fontSize: 10,
    fontWeight: 600,
    padding: "3px 8px",
    borderRadius: 4,
    background: bg,
    color: "#e2e8f0",
    fontFamily: "'IBM Plex Sans', sans-serif",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  }),
  dateLabel: {
    fontSize: 13,
    color: "#94a3b8",
    fontFamily: "'IBM Plex Sans', sans-serif",
    marginBottom: 4,
  },
  adjustReason: {
    fontSize: 11,
    color: "#fbbf24",
    fontFamily: "'IBM Plex Sans', sans-serif",
    marginBottom: 8,
  },
  rateDisplay: {
    fontSize: 28,
    fontWeight: 700,
    color: "#e2e8f0",
    fontFamily: "'IBM Plex Mono', monospace",
    marginBottom: 10,
  },
  overrideRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  overrideLabel: {
    fontSize: 12,
    color: "#64748b",
    fontFamily: "'IBM Plex Sans', sans-serif",
  },
  overrideInput: {
    width: 100,
    background: "rgba(30,45,61,0.6)",
    border: "1px solid #334155",
    borderRadius: 6,
    color: "#e2e8f0",
    padding: "5px 8px",
    fontSize: 13,
    fontFamily: "'IBM Plex Mono', monospace",
    outline: "none",
    MozAppearance: "textfield",
  },
};

export default function TtmRatePanel({
  vestTransactions,
  tradeTransactions,
  manualOverrides,
  setManualOverride,
}) {
  const rateEntries = useMemo(() => {
    const dateMap = new Map();

    vestTransactions.forEach((v) => {
      const lookup = lookupTTM(v.releaseDate);
      const key = lookup.resolvedDate;
      if (!dateMap.has(key)) {
        dateMap.set(key, {
          resolvedDate: key,
          isAdjusted: lookup.isAdjusted,
          rate: lookup.rate,
          sources: [],
        });
      }
      dateMap.get(key).sources.push({
        originalDate: v.releaseDate,
        label: "給与所得",
        type: "vest",
      });
    });

    tradeTransactions.forEach((t) => {
      const lookup = lookupTTM(t.tradeDate);
      const key = lookup.resolvedDate;
      if (!dateMap.has(key)) {
        dateMap.set(key, {
          resolvedDate: key,
          isAdjusted: lookup.isAdjusted,
          rate: lookup.rate,
          sources: [],
        });
      }
      dateMap.get(key).sources.push({
        originalDate: t.tradeDate,
        label: "売却収入",
        type: "trade",
      });
    });

    return Array.from(dateMap.values()).sort((a, b) =>
      a.resolvedDate.localeCompare(b.resolvedDate)
    );
  }, [vestTransactions, tradeTransactions]);

  if (vestTransactions.length === 0 && tradeTransactions.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          color: "#64748b",
          padding: "48px 0",
          fontFamily: "'IBM Plex Sans', sans-serif",
          fontSize: 14,
        }}
      >
        STEP 1 で PDF を読み込んでください
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <style>{numberInputStyle}</style>
      <div style={styles.sourceNote}>
        出典: 三菱UFJ銀行 TTMデータ（murc_ttm_2025.json）
        <br />
        更新方法: JSONを差し替えるか、各フィールドで手動上書き可能
      </div>

      {rateEntries.map((entry) => {
        const overrideValue = manualOverrides[entry.resolvedDate];
        const isOverridden = overrideValue != null;
        const displayRate = isOverridden ? overrideValue : entry.rate;

        let borderColor = "#14532d";
        let statusBadgeBg = "#14532d";
        let statusLabel = "自動取得 ✓";

        if (isOverridden) {
          borderColor = "#1e3a5f";
          statusBadgeBg = "#1e3a5f";
          statusLabel = "手動上書き";
        } else if (entry.isAdjusted) {
          borderColor = "#78350f";
          statusBadgeBg = "#78350f";
          statusLabel = "日付繰上げ";
        }

        const uniqueLabels = [
          ...new Set(entry.sources.map((s) => s.label)),
        ];

        return (
          <div key={entry.resolvedDate} style={styles.card(borderColor)}>
            <div style={styles.badgeRow}>
              <span style={styles.badge(statusBadgeBg)}>{statusLabel}</span>
              {uniqueLabels.map((u) => (
                <span
                  key={u}
                  style={styles.badge(
                    u === "給与所得"
                      ? "rgba(251,191,36,0.2)"
                      : "rgba(96,165,250,0.2)"
                  )}
                >
                  {u}
                </span>
              ))}
            </div>

            {entry.sources.map((src, si) => (
              <div key={si} style={styles.dateLabel}>
                {src.type === "vest" ? "Vest日" : "売却日"}:{" "}
                {getDayLabel(src.originalDate)}
              </div>
            ))}

            {entry.isAdjusted && (
              <div style={styles.adjustReason}>
                {getDayLabel(entry.sources[0].originalDate)} は非営業日 →
                直前の {getDayLabel(entry.resolvedDate)}{" "}
                公表日のTTMを参照
              </div>
            )}

            {!entry.isAdjusted && (
              <div style={styles.dateLabel}>
                TTM参照日: {getDayLabel(entry.resolvedDate)}
              </div>
            )}

            <div style={styles.rateDisplay}>
              ¥{displayRate != null ? displayRate.toFixed(2) : "—"}
            </div>

            <div style={styles.overrideRow}>
              <span style={styles.overrideLabel}>上書き:</span>
              <input
                type="number"
                step="0.01"
                placeholder={entry.rate != null ? entry.rate.toFixed(2) : ""}
                value={isOverridden ? overrideValue : ""}
                onChange={(e) =>
                  setManualOverride(entry.resolvedDate, e.target.value)
                }
                style={styles.overrideInput}
              />
              {isOverridden && (
                <span
                  style={{
                    fontSize: 11,
                    color: "#64748b",
                    fontFamily: "'IBM Plex Sans', sans-serif",
                  }}
                >
                  自動: ¥{entry.rate?.toFixed(2)}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

import { isWeekend, isMissingFromData } from "../lib/ttmLoader";
import { BLACK, BLUE, OLIVE, ORANGE, MINT, RED, withAlpha } from "../lib/colors";

const DAY_NAMES = ["日", "月", "火", "水", "木", "金", "土"];

function getDayName(dateStr) {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("/").map(Number);
  return DAY_NAMES[new Date(y, m - 1, d).getDay()];
}

const styles = {
  container: {
    maxWidth: 960,
    margin: "0 auto",
    overflowX: "auto",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: MINT,
    fontFamily: "'IBM Plex Sans', sans-serif",
    marginBottom: 12,
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  sectionBadge: (color) => ({
    fontSize: 10,
    fontWeight: 600,
    padding: "3px 8px",
    borderRadius: 4,
    background: color,
    color: MINT,
    fontFamily: "'IBM Plex Sans', sans-serif",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  }),
  divider: {
    height: 1,
    background: withAlpha(OLIVE, 0.3),
    margin: "28px 0",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 13,
  },
  th: {
    padding: "10px 8px",
    textAlign: "left",
    color: OLIVE,
    fontWeight: 500,
    borderBottom: `1px solid ${withAlpha(OLIVE, 0.3)}`,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    fontFamily: "'IBM Plex Sans', sans-serif",
    whiteSpace: "nowrap",
  },
  td: {
    padding: "10px 8px",
    color: MINT,
    borderBottom: `1px solid ${withAlpha(OLIVE, 0.2)}`,
    whiteSpace: "nowrap",
  },
  dateWarning: {
    color: ORANGE,
    fontSize: 11,
  },
  input: {
    background: withAlpha(OLIVE, 0.15),
    border: `1px solid ${withAlpha(OLIVE, 0.3)}`,
    borderRadius: 6,
    color: MINT,
    padding: "6px 8px",
    fontSize: 13,
    fontFamily: "'IBM Plex Mono', monospace",
    outline: "none",
    width: 120,
    MozAppearance: "textfield",
  },
  deleteBtn: {
    background: withAlpha(RED, 0.15),
    border: `1px solid ${withAlpha(RED, 0.3)}`,
    borderRadius: 6,
    color: RED,
    padding: "4px 10px",
    cursor: "pointer",
    fontSize: 12,
    fontFamily: "'IBM Plex Sans', sans-serif",
  },
  emptyState: {
    textAlign: "center",
    color: OLIVE,
    padding: "48px 0",
    fontFamily: "'IBM Plex Sans', sans-serif",
    fontSize: 14,
  },
  emptySection: {
    textAlign: "center",
    color: OLIVE,
    padding: "20px 0",
    fontFamily: "'IBM Plex Sans', sans-serif",
    fontSize: 13,
  },
};

const numberInputStyle = `
  input[type=number]::-webkit-inner-spin-button,
  input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
  input[type=number] { -moz-appearance: textfield; }
`;

const fmtU = (n) =>
  "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2 });

export default function TransactionEditor({
  vestData,
  tradeData,
  removeVest,
  removeTrade,
  updateTradeField,
}) {
  if (vestData.length === 0 && tradeData.length === 0) {
    return (
      <div style={styles.emptyState}>
        STEP 1 で PDF を読み込んでください
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <style>{numberInputStyle}</style>

      {/* Vest（給与所得）セクション */}
      <div style={styles.sectionTitle}>
        <span style={styles.sectionBadge(withAlpha(ORANGE, 0.25))}>
          給与所得
        </span>
        Release Confirmation（Vest）
      </div>
      {vestData.length === 0 ? (
        <div style={styles.emptySection}>
          Release Confirmation PDF を読み込んでください
        </div>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>#</th>
              <th style={styles.th}>ベスト日</th>
              <th style={styles.th}>株数</th>
              <th style={styles.th}>FMV/株($)</th>
              <th style={styles.th}>ベスト総額($)</th>
              <th style={styles.th}>Award #</th>
              <th style={styles.th}></th>
            </tr>
          </thead>
          <tbody>
            {vestData.map((v, i) => {
              const needsWarning =
                isWeekend(v.releaseDate) || isMissingFromData(v.releaseDate);
              const dayName = getDayName(v.releaseDate);
              return (
                <tr key={v.releaseDate + v.shares + i}>
                  <td style={styles.td}>{i + 1}</td>
                  <td style={styles.td}>
                    {v.releaseDate}
                    {needsWarning ? (
                      <span style={styles.dateWarning}> ({dayName})</span>
                    ) : (
                      <span style={{ color: withAlpha(OLIVE, 0.7), fontSize: 11 }}>
                        {" "}
                        ({dayName})
                      </span>
                    )}
                  </td>
                  <td style={styles.td}>{v.shares}</td>
                  <td style={styles.td}>{fmtU(v.fmvPerShare)}</td>
                  <td style={styles.td}>{fmtU(v.fmvTotal)}</td>
                  <td style={styles.td}>
                    <span style={{ color: withAlpha(OLIVE, 0.7), fontSize: 12 }}>
                      {v.awardNumber || "—"}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <button
                      style={styles.deleteBtn}
                      onClick={() => removeVest(i)}
                    >
                      削除
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      <div style={styles.divider} />

      {/* Trade（売却）セクション */}
      <div style={styles.sectionTitle}>
        <span style={styles.sectionBadge(withAlpha(BLUE, 0.25))}>
          譲渡所得
        </span>
        Trade Confirmation（売却）
      </div>
      {tradeData.length === 0 ? (
        <div style={styles.emptySection}>
          Trade Confirmation PDF を読み込んでください
        </div>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>#</th>
              <th style={styles.th}>売却日</th>
              <th style={styles.th}>株数</th>
              <th style={styles.th}>単価($)</th>
              <th style={styles.th}>売却収入($)</th>
              <th style={styles.th}>Disbursement Fee($)</th>
              <th style={styles.th}></th>
            </tr>
          </thead>
          <tbody>
            {tradeData.map((t, i) => {
              const dayName = getDayName(t.tradeDate);
              return (
                <tr key={t.tradeDate + t.quantity + i}>
                  <td style={styles.td}>{i + 1}</td>
                  <td style={styles.td}>
                    {t.tradeDate}
                    <span style={{ color: withAlpha(OLIVE, 0.7), fontSize: 11 }}>
                      {" "}
                      ({dayName})
                    </span>
                  </td>
                  <td style={styles.td}>{t.quantity}</td>
                  <td style={styles.td}>{fmtU(t.price)}</td>
                  <td style={styles.td}>{fmtU(t.netAmount)}</td>
                  <td style={styles.td}>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={t.wireFee || ""}
                      onChange={(e) =>
                        updateTradeField(i, "wireFee", e.target.value)
                      }
                      style={styles.input}
                    />
                  </td>
                  <td style={styles.td}>
                    <button
                      style={styles.deleteBtn}
                      onClick={() => removeTrade(i)}
                    >
                      削除
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

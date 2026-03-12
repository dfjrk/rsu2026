import { useState, useEffect } from "react";
import { isWeekend, isMissingFromData } from "../lib/ttmLoader";
import { BLACK, BLUE, OLIVE, ORANGE, MINT, RED, withAlpha } from "../lib/colors";

const DAY_NAMES = ["日", "月", "火", "水", "木", "金", "土"];

function getDayName(dateStr) {
  if (!dateStr) return "";
  const parts = dateStr.split("/").map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return "";
  const [y, m, d] = parts;
  return DAY_NAMES[new Date(y, m - 1, d).getDay()];
}

function isValidDate(dateStr) {
  if (!dateStr) return false;
  const match = dateStr.match(/^(\d{4})\/(\d{2})\/(\d{2})$/);
  if (!match) return false;
  const [, y, m, d] = match.map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d;
}

const EMPTY_VEST = { releaseDate: "", shares: "", fmvPerShare: "" };
const EMPTY_TRADE = { tradeDate: "", quantity: "", price: "", netAmount: "" };

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
  inputSmall: {
    background: withAlpha(OLIVE, 0.15),
    border: `1px solid ${withAlpha(OLIVE, 0.3)}`,
    borderRadius: 6,
    color: MINT,
    padding: "6px 8px",
    fontSize: 13,
    fontFamily: "'IBM Plex Mono', monospace",
    outline: "none",
    width: 100,
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
};

const numberInputStyle = `
  input[type=number]::-webkit-inner-spin-button,
  input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
  input[type=number] { -moz-appearance: textfield; }
`;

const fmtU = (n) =>
  "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2 });

function VestInputRow({ onAdd }) {
  const [draft, setDraft] = useState({ ...EMPTY_VEST });

  const update = (field, value) => {
    const next = { ...draft, [field]: value };
    setDraft(next);
  };

  useEffect(() => {
    const { releaseDate, shares, fmvPerShare } = draft;
    if (
      isValidDate(releaseDate) &&
      shares !== "" && parseFloat(shares) > 0 &&
      fmvPerShare !== "" && parseFloat(fmvPerShare) > 0
    ) {
      const sharesNum = parseFloat(shares);
      const fmvNum = parseFloat(fmvPerShare);
      onAdd({
        type: "release",
        releaseDate,
        shares: sharesNum,
        fmvPerShare: fmvNum,
        fmvTotal: Math.round(sharesNum * fmvNum * 100) / 100,
        awardNumber: "",
        fileName: "手動入力",
      });
      setDraft({ ...EMPTY_VEST });
    }
  }, [draft, onAdd]);

  return (
    <tr>
      <td style={{ ...styles.td, color: withAlpha(OLIVE, 0.5) }}>—</td>
      <td style={styles.td}>
        <input
          type="text"
          placeholder="YYYY/MM/DD"
          value={draft.releaseDate}
          onChange={(e) => update("releaseDate", e.target.value)}
          style={{ ...styles.inputSmall, width: 110 }}
        />
      </td>
      <td style={styles.td}>
        <input
          type="number"
          placeholder="0"
          value={draft.shares}
          onChange={(e) => update("shares", e.target.value)}
          style={{ ...styles.inputSmall, width: 70 }}
        />
      </td>
      <td style={styles.td}>
        <input
          type="number"
          placeholder="0.00"
          value={draft.fmvPerShare}
          onChange={(e) => update("fmvPerShare", e.target.value)}
          style={styles.inputSmall}
        />
      </td>
      <td style={{ ...styles.td, color: withAlpha(OLIVE, 0.5) }}>
        {draft.shares && draft.fmvPerShare
          ? fmtU(parseFloat(draft.shares || 0) * parseFloat(draft.fmvPerShare || 0))
          : "—"}
      </td>
      <td style={styles.td}></td>
      <td style={styles.td}></td>
    </tr>
  );
}

function TradeInputRow({ onAdd }) {
  const [draft, setDraft] = useState({ ...EMPTY_TRADE });

  const update = (field, value) => {
    const next = { ...draft, [field]: value };
    setDraft(next);
  };

  useEffect(() => {
    const { tradeDate, quantity, price, netAmount } = draft;
    if (
      isValidDate(tradeDate) &&
      quantity !== "" && parseFloat(quantity) > 0 &&
      price !== "" && parseFloat(price) > 0 &&
      netAmount !== "" && parseFloat(netAmount) > 0
    ) {
      onAdd({
        type: "trade",
        tradeDate,
        quantity: parseFloat(quantity),
        price: parseFloat(price),
        netAmount: parseFloat(netAmount),
        symbol: "",
        fileName: "手動入力",
      });
      setDraft({ ...EMPTY_TRADE });
    }
  }, [draft, onAdd]);

  return (
    <tr>
      <td style={{ ...styles.td, color: withAlpha(OLIVE, 0.5) }}>—</td>
      <td style={styles.td}>
        <input
          type="text"
          placeholder="YYYY/MM/DD"
          value={draft.tradeDate}
          onChange={(e) => update("tradeDate", e.target.value)}
          style={{ ...styles.inputSmall, width: 110 }}
        />
      </td>
      <td style={styles.td}>
        <input
          type="number"
          placeholder="0"
          value={draft.quantity}
          onChange={(e) => update("quantity", e.target.value)}
          style={{ ...styles.inputSmall, width: 70 }}
        />
      </td>
      <td style={styles.td}>
        <input
          type="number"
          placeholder="0.00"
          value={draft.price}
          onChange={(e) => update("price", e.target.value)}
          style={styles.inputSmall}
        />
      </td>
      <td style={styles.td}>
        <input
          type="number"
          placeholder="0.00"
          value={draft.netAmount}
          onChange={(e) => update("netAmount", e.target.value)}
          style={styles.inputSmall}
        />
      </td>
      <td style={styles.td}>
        <input
          type="number"
          placeholder="0.00"
          disabled
          style={{ ...styles.input, opacity: 0.4 }}
        />
      </td>
      <td style={styles.td}></td>
    </tr>
  );
}

export default function TransactionEditor({
  vestData,
  tradeData,
  addVest,
  addTrade,
  removeVest,
  removeTrade,
  updateTradeField,
}) {
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
              <tr key={v._id}>
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
                    onClick={() => removeVest(v._id)}
                  >
                    削除
                  </button>
                </td>
              </tr>
            );
          })}
          <VestInputRow onAdd={addVest} />
        </tbody>
      </table>

      <div style={styles.divider} />

      {/* Trade（売却）セクション */}
      <div style={styles.sectionTitle}>
        <span style={styles.sectionBadge(withAlpha(BLUE, 0.25))}>
          譲渡所得
        </span>
        Trade Confirmation（売却）
      </div>
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
              <tr key={t._id}>
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
                      updateTradeField(t._id, "wireFee", e.target.value)
                    }
                    style={styles.input}
                  />
                </td>
                <td style={styles.td}>
                  <button
                    style={styles.deleteBtn}
                    onClick={() => removeTrade(t._id)}
                  >
                    削除
                  </button>
                </td>
              </tr>
            );
          })}
          <TradeInputRow onAdd={addTrade} />
        </tbody>
      </table>
    </div>
  );
}

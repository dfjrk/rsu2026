const fmt = (n) => n.toLocaleString("ja-JP", { maximumFractionDigits: 0 });
const fmtU = (n) =>
  "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2 });

const styles = {
  container: {
    maxWidth: 1100,
    margin: "0 auto",
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 14,
    marginBottom: 28,
  },
  summaryCard: (accentColor) => ({
    background: "rgba(15,23,42,0.6)",
    borderRadius: 12,
    padding: "18px 16px",
    borderLeft: `3px solid ${accentColor}`,
  }),
  summaryLabel: {
    fontSize: 11,
    color: "#94a3b8",
    fontFamily: "'IBM Plex Sans', sans-serif",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: 6,
  },
  summaryValue: (color) => ({
    fontSize: 22,
    fontWeight: 700,
    color,
    fontFamily: "'IBM Plex Mono', monospace",
  }),
  sectionTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: "#e2e8f0",
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
    color: "#e2e8f0",
    fontFamily: "'IBM Plex Sans', sans-serif",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  }),
  divider: {
    height: 1,
    background: "#1e293b",
    margin: "24px 0",
  },
  tableWrap: {
    overflowX: "auto",
    marginBottom: 24,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 12,
  },
  th: {
    padding: "8px 6px",
    textAlign: "right",
    color: "#94a3b8",
    fontWeight: 500,
    borderBottom: "1px solid #1e293b",
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    fontFamily: "'IBM Plex Sans', sans-serif",
    whiteSpace: "nowrap",
  },
  thLeft: {
    textAlign: "left",
  },
  td: {
    padding: "8px 6px",
    color: "#e2e8f0",
    borderBottom: "1px solid rgba(30,41,59,0.5)",
    textAlign: "right",
    whiteSpace: "nowrap",
  },
  tdLeft: {
    textAlign: "left",
  },
  adjustedDate: {
    color: "#fcd34d",
    fontSize: 11,
  },
  overriddenDate: {
    color: "#93c5fd",
    fontSize: 11,
  },
  notes: {
    background: "rgba(30,45,61,0.3)",
    borderRadius: 10,
    padding: "16px 18px",
    fontSize: 12,
    color: "#94a3b8",
    lineHeight: 1.8,
    fontFamily: "'IBM Plex Sans', sans-serif",
  },
  emptyState: {
    textAlign: "center",
    color: "#64748b",
    padding: "48px 0",
    fontFamily: "'IBM Plex Sans', sans-serif",
    fontSize: 14,
  },
};

export default function Dashboard({
  vestTransactions,
  tradeTransactions,
  totals,
}) {
  if (vestTransactions.length === 0 && tradeTransactions.length === 0) {
    return (
      <div style={styles.emptyState}>
        データがありません。STEP 1〜3 を完了してください。
      </div>
    );
  }

  const summaryCards = [
    { label: "給与所得算入額", value: totals.kyuyo, color: "#fbbf24" },
    { label: "譲渡収入合計", value: totals.sell, color: "#60a5fa" },
    { label: "取得費合計", value: totals.cost, color: "#94a3b8" },
    { label: "Wire手数料", value: totals.wire, color: "#94a3b8" },
    {
      label: "株式譲渡損益",
      value: totals.jotoPL,
      color: totals.jotoPL < 0 ? "#f87171" : "#34d399",
    },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.summaryGrid}>
        {summaryCards.map((card) => (
          <div key={card.label} style={styles.summaryCard(card.color)}>
            <div style={styles.summaryLabel}>{card.label}</div>
            <div style={styles.summaryValue(card.color)}>
              ¥{fmt(card.value)}
            </div>
          </div>
        ))}
      </div>

      {/* Vest（給与所得）テーブル */}
      <div style={styles.sectionTitle}>
        <span style={styles.sectionBadge("rgba(251,191,36,0.25)")}>
          給与所得
        </span>
        Vest 明細
      </div>
      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              {["#", "ベスト日", "TTM参照日", "株数", "FMV総額($)", "TTM", "給与所得(¥)"].map(
                (h, i) => (
                  <th
                    key={h}
                    style={{ ...styles.th, ...(i <= 2 ? styles.thLeft : {}) }}
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {vestTransactions.map((v, i) => {
              const ttmRefDisplay = v.vestOverridden ? (
                <span style={styles.overriddenDate}>
                  ✎ {v.vestRateDate}
                </span>
              ) : v.vestRateDateAdjusted ? (
                <span style={styles.adjustedDate}>
                  ⚠ {v.vestRateDate}
                </span>
              ) : (
                v.vestRateDate
              );

              return (
                <tr key={i}>
                  <td style={{ ...styles.td, ...styles.tdLeft }}>{i + 1}</td>
                  <td style={{ ...styles.td, ...styles.tdLeft }}>
                    {v.releaseDate}
                  </td>
                  <td style={{ ...styles.td, ...styles.tdLeft }}>
                    {ttmRefDisplay}
                  </td>
                  <td style={styles.td}>{v.shares}</td>
                  <td style={styles.td}>{fmtU(v.fmvTotal)}</td>
                  <td style={styles.td}>
                    {v.vestTTM != null ? `¥${v.vestTTM.toFixed(2)}` : "—"}
                  </td>
                  <td style={styles.td}>
                    {v.kyuyoJPY != null ? `¥${fmt(v.kyuyoJPY)}` : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={styles.divider} />

      {/* Trade（売却）テーブル */}
      <div style={styles.sectionTitle}>
        <span style={styles.sectionBadge("rgba(96,165,250,0.25)")}>
          譲渡所得
        </span>
        売却 明細
      </div>
      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              {[
                "#",
                "売却日",
                "TTM参照日",
                "株数",
                "売却収入($)",
                "TTM",
                "売却収入(¥)",
                "Wire($)",
                "Wire(¥)",
              ].map((h, i) => (
                <th
                  key={h}
                  style={{ ...styles.th, ...(i <= 2 ? styles.thLeft : {}) }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tradeTransactions.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  style={{
                    ...styles.td,
                    ...styles.tdLeft,
                    color: "#64748b",
                    padding: "16px 6px",
                  }}
                >
                  売却データなし
                </td>
              </tr>
            ) : (
              tradeTransactions.map((t, i) => {
                const ttmRefDisplay = t.tradeOverridden ? (
                  <span style={styles.overriddenDate}>
                    ✎ {t.tradeRateDate}
                  </span>
                ) : t.tradeRateDateAdjusted ? (
                  <span style={styles.adjustedDate}>
                    ⚠ {t.tradeRateDate}
                  </span>
                ) : (
                  t.tradeRateDate
                );

                return (
                  <tr key={i}>
                    <td style={{ ...styles.td, ...styles.tdLeft }}>
                      {i + 1}
                    </td>
                    <td style={{ ...styles.td, ...styles.tdLeft }}>
                      {t.tradeDate}
                    </td>
                    <td style={{ ...styles.td, ...styles.tdLeft }}>
                      {ttmRefDisplay}
                    </td>
                    <td style={styles.td}>{t.quantity}</td>
                    <td style={styles.td}>{fmtU(t.netAmount)}</td>
                    <td style={styles.td}>
                      {t.tradeTTM != null
                        ? `¥${t.tradeTTM.toFixed(2)}`
                        : "—"}
                    </td>
                    <td style={styles.td}>
                      {t.sellJPY != null ? `¥${fmt(t.sellJPY)}` : "—"}
                    </td>
                    <td style={styles.td}>{fmtU(t.wireFee)}</td>
                    <td style={styles.td}>
                      {t.wireFeeJPY != null ? `¥${fmt(t.wireFeeJPY)}` : "—"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div style={styles.notes}>
        • TTMデータ出典: 三菱UFJ銀行（murc_ttm_2025.json、245営業日分収録）
        <br />
        • ⚠ 印のTTM参照日はレート未公表日のため直前の公表日を自動使用（国税庁ルール）
        <br />
        • 日本源泉税 $0（Release Confirmation確認済） —
        給与所得・譲渡所得とも自己申告が必要です
        <br />
        • 取得費（③）＝ 給与所得算入額（①）と同額が原則（二重課税防止）
        <br />
        • Wire手数料の譲渡費用控除可否は税理士に確認してください
        <br />
        • 本ツールは情報整理目的のみです。申告前に必ず税理士にご確認ください
      </div>
    </div>
  );
}

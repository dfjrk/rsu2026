import { useState, useEffect, useMemo } from "react";

const fmt = (n) => n.toLocaleString("ja-JP", { maximumFractionDigits: 0 });
const fmtU = (n) =>
  "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2 });

const CONFETTI_COLORS = [
  "#fbbf24",
  "#f87171",
  "#6366f1",
  "#34d399",
  "#60a5fa",
  "#f472b6",
  "#a78bfa",
  "#fb923c",
];

const confettiKeyframes = `
@keyframes confetti-fall {
  0% { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; }
  80% { opacity: 1; }
  100% { transform: translateY(calc(100vh + 40px)) rotate(var(--rot)) scale(0.5); opacity: 0; }
}
@keyframes confetti-burst {
  0% { transform: translate(0, 0) scale(0); opacity: 0; }
  15% { opacity: 1; scale: 1; }
  100% { transform: translate(var(--tx), var(--ty)) rotate(var(--rot)) scale(0.3); opacity: 0; }
}
`;

function generateParticles(count) {
  const particles = [];
  for (let i = 0; i < count; i++) {
    const left = Math.random() * 100;
    const delay = Math.random() * 0.6;
    const duration = 1.8 + Math.random() * 1.5;
    const color =
      CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
    const rot = (Math.random() * 720 - 360) + "deg";
    const size = 6 + Math.random() * 6;
    const isRect = Math.random() > 0.5;

    particles.push({
      id: i,
      style: {
        position: "fixed",
        top: -20,
        left: `${left}%`,
        width: isRect ? size * 1.5 : size,
        height: size,
        borderRadius: isRect ? 2 : "50%",
        background: color,
        animation: `confetti-fall ${duration}s ease-in ${delay}s forwards`,
        zIndex: 9999,
        pointerEvents: "none",
        "--rot": rot,
      },
    });
  }
  return particles;
}

function ConfettiOverlay() {
  const [visible, setVisible] = useState(true);
  const particles = useMemo(() => generateParticles(60), []);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 3500);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <>
      <style>{confettiKeyframes}</style>
      {particles.map((p) => (
        <div key={p.id} style={p.style} />
      ))}
    </>
  );
}

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
    { label: "Disbursement Fee", value: totals.wire, color: "#94a3b8" },
    {
      label: "株式譲渡損益",
      value: totals.jotoPL,
      color: totals.jotoPL < 0 ? "#f87171" : "#34d399",
    },
  ];

  return (
    <div style={styles.container}>
      <ConfettiOverlay />
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
                "D.Fee($)",
                "D.Fee(¥)",
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
        <strong>為替レートについて</strong>
        <br />
        本ツールでは、円換算に使用するTTM（仲値）データとして、三菱UFJ銀行の公表レートをもとに作成したデータを使用しています。
        <br /><br />
        <strong>レートが公表されていない日の扱いについて</strong>
        <br />
        土日祝日などで対象日のTTMが公表されていない場合は、直前の公表日のレートを使用しています。
        <br /><br />
        <strong>日本での源泉徴収について</strong>
        <br />
        Release Confirmation上で日本の源泉徴収額が0と表示されている場合でも、日本での申告が不要になるとは限りません。
        <br />
        RSUの権利確定時の給与課税や、その後の売却に伴う譲渡所得については、ご自身で申告が必要となる場合があります。
        <br /><br />
        <strong>取得費について</strong>
        <br />
        RSUを売却した場合、取得費は原則として、権利確定時に給与所得として計上した金額を基準に考えます。
        <br />
        これは、同じ金額に二重で課税されることを避けるためです。
        <br /><br />
        <strong>手数料の扱いについて</strong>
        <br />
        Disbursement Feeなどの手数料が譲渡費用として控除できるかどうかは、取引内容や申告方法によって判断が分かれる可能性があります。
        <br />
        最終的な取り扱いは、税理士または所轄税務署にご確認ください。
        <br /><br />
        <strong>ご利用上の注意</strong>
        <br />
        本ツールは、RSUに関する情報整理および申告準備を補助することを目的としたものであり、税務アドバイスを提供するものではありません。
        <br />
        実際の申告内容については、ご自身の責任でご確認いただき、必要に応じて税理士等の専門家へご相談ください。
      </div>
    </div>
  );
}

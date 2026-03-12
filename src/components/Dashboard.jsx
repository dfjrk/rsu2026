import { useMemo } from "react";
import { BLACK, BLUE, OLIVE, ORANGE, MINT, RED, withAlpha, CONFETTI_COLORS } from "../lib/colors";

const fmt = (n) => n.toLocaleString("ja-JP", { maximumFractionDigits: 0 });
const fmtU = (n) =>
  "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2 });

const celebrationKeyframes = `
@keyframes confetti-fall {
  0% { transform: translateY(-20px) translateX(0) rotate(0deg) scale(1); opacity: 1; }
  25% { transform: translateY(25vh) translateX(var(--sx)) rotate(var(--r1)) scale(0.95); opacity: 1; }
  50% { transform: translateY(50vh) translateX(calc(var(--sx) * -0.8)) rotate(var(--r2)) scale(0.85); opacity: 0.9; }
  75% { transform: translateY(75vh) translateX(var(--sx)) rotate(var(--r1)) scale(0.7); opacity: 0.6; }
  100% { transform: translateY(calc(100vh + 40px)) translateX(0) rotate(var(--r2)) scale(0.5); opacity: 0; }
}
@keyframes card-glow {
  0% { box-shadow: 0 0 0px transparent; }
  25% { box-shadow: 0 0 10px ${withAlpha(ORANGE, 0.35)}, 0 0 20px ${withAlpha(ORANGE, 0.15)}; }
  50% { box-shadow: 0 0 16px ${withAlpha(ORANGE, 0.5)}, 0 0 32px ${withAlpha(ORANGE, 0.25)}; }
  75% { box-shadow: 0 0 6px ${withAlpha(ORANGE, 0.25)}, 0 0 12px ${withAlpha(ORANGE, 0.1)}; }
  100% { box-shadow: 0 0 0px transparent; }
}
@keyframes pop-in {
  0% { transform: scale(0.6); opacity: 0; }
  50% { transform: scale(1.08); opacity: 1; }
  70% { transform: scale(0.96); }
  100% { transform: scale(1); opacity: 1; }
}
`;

function generateConfetti(count) {
  const particles = [];
  for (let i = 0; i < count; i++) {
    const left = Math.random() * 100;
    const delay = Math.random() * 6;
    const duration = 4 + Math.random() * 4;
    const color =
      CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
    const sx = (15 + Math.random() * 30) * (Math.random() > 0.5 ? 1 : -1) + "px";
    const r1 = (Math.random() * 360) + "deg";
    const r2 = (Math.random() * -360) + "deg";
    const size = 5 + Math.random() * 6;
    const isRect = Math.random() > 0.4;

    particles.push({
      id: i,
      style: {
        position: "fixed",
        top: -20,
        left: `${left}%`,
        width: isRect ? size * 1.6 : size,
        height: size,
        borderRadius: isRect ? 2 : "50%",
        background: color,
        animation: `confetti-fall ${duration}s ease-in ${delay}s infinite`,
        zIndex: 9999,
        pointerEvents: "none",
        opacity: 0,
        "--sx": sx,
        "--r1": r1,
        "--r2": r2,
      },
    });
  }
  return particles;
}

function CelebrationOverlay() {
  const particles = useMemo(() => generateConfetti(50), []);

  return (
    <>
      <style>{celebrationKeyframes}</style>
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
    background: withAlpha(BLACK, 0.6),
    borderRadius: 12,
    padding: "18px 16px",
    borderLeft: `3px solid ${accentColor}`,
    animation: "card-glow 3s ease-in-out infinite",
  }),
  summaryLabel: {
    fontSize: 11,
    color: OLIVE,
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
    color: OLIVE,
    fontWeight: 500,
    borderBottom: `1px solid ${withAlpha(OLIVE, 0.3)}`,
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
    color: MINT,
    borderBottom: `1px solid ${withAlpha(OLIVE, 0.2)}`,
    textAlign: "right",
    whiteSpace: "nowrap",
  },
  tdLeft: {
    textAlign: "left",
  },
  adjustedDate: {
    color: ORANGE,
    fontSize: 11,
  },
  overriddenDate: {
    color: BLUE,
    fontSize: 11,
  },
  notes: {
    background: withAlpha(OLIVE, 0.15),
    borderRadius: 10,
    padding: "16px 18px",
    fontSize: 12,
    color: OLIVE,
    lineHeight: 1.8,
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
    { label: "給与所得算入額", value: totals.kyuyo, color: ORANGE },
    { label: "譲渡収入合計", value: totals.sell, color: BLUE },
    { label: "取得費合計", value: totals.cost, color: OLIVE },
    { label: "Disbursement Fee", value: totals.wire, color: OLIVE },
    {
      label: "株式譲渡損益",
      value: totals.jotoPL,
      color: totals.jotoPL < 0 ? RED : MINT,
    },
  ];

  return (
    <div style={styles.container}>
      <style>{celebrationKeyframes}</style>
      <CelebrationOverlay />
      <div style={styles.summaryGrid}>
        {summaryCards.map((card) => (
          <div key={card.label} style={styles.summaryCard(card.color)}>
            <div style={styles.summaryLabel}>{card.label}</div>
            <div style={{
              ...styles.summaryValue(card.color),
              animation: "pop-in 0.6s ease-out both",
            }}>
              ¥{fmt(card.value)}
            </div>
          </div>
        ))}
      </div>

      {/* Vest（給与所得）テーブル */}
      <div style={styles.sectionTitle}>
        <span style={styles.sectionBadge(withAlpha(ORANGE, 0.25))}>
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
                <tr key={v._id}>
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
        <span style={styles.sectionBadge(withAlpha(BLUE, 0.25))}>
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
                "Tx.Fee($)",
                "売却収入($)",
                "TTM",
                "売却収入(¥)",
                "D.Fee(¥)",
              ].map((h, i) => (
                <th
                  key={h}
                  style={{ ...styles.th, ...(i <= 3 ? styles.thLeft : {}) }}
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
                    color: OLIVE,
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
                  <tr key={t._id}>
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
                    <td style={styles.td}>{fmtU(t.transactionFee)}</td>
                    <td style={styles.td}>{fmtU(t.netAmount)}</td>
                    <td style={styles.td}>
                      {t.tradeTTM != null
                        ? `¥${t.tradeTTM.toFixed(2)}`
                        : "—"}
                    </td>
                    <td style={styles.td}>
                      {t.sellJPY != null ? `¥${fmt(t.sellJPY)}` : "—"}
                    </td>
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

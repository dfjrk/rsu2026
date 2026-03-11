import { useState, useMemo } from "react";
import { useTransactions } from "./lib/useTransactions";
import PdfDropZone from "./components/PdfDropZone";
import TransactionEditor from "./components/TransactionEditor";
import TtmRatePanel from "./components/TtmRatePanel";
import Dashboard from "./components/Dashboard";
import { BLACK, BLUE, OLIVE, ORANGE, MINT, RED, withAlpha } from "./lib/colors";

const STEPS = [
  { id: 1, label: "PDF読み込み" },
  { id: 2, label: "データ確認・編集" },
  { id: 3, label: "TTM確認・上書き" },
  { id: 4, label: "申告ダッシュボード" },
];

const globalStyles = `
  @font-face { font-family: 'IBM Plex Mono'; font-style: normal; font-weight: 400; font-display: swap; src: url('/fonts/IBMPlexMono-400.woff2') format('woff2'); }
  @font-face { font-family: 'IBM Plex Mono'; font-style: normal; font-weight: 500; font-display: swap; src: url('/fonts/IBMPlexMono-500.woff2') format('woff2'); }
  @font-face { font-family: 'IBM Plex Mono'; font-style: normal; font-weight: 600; font-display: swap; src: url('/fonts/IBMPlexMono-600.woff2') format('woff2'); }
  @font-face { font-family: 'IBM Plex Mono'; font-style: normal; font-weight: 700; font-display: swap; src: url('/fonts/IBMPlexMono-700.woff2') format('woff2'); }
  @font-face { font-family: 'IBM Plex Sans'; font-style: normal; font-weight: 400 700; font-display: swap; src: url('/fonts/IBMPlexSans-variable.woff2') format('woff2'); }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    background: ${BLACK};
    color: ${MINT};
    font-family: 'IBM Plex Sans', sans-serif;
    min-height: 100vh;
  }
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: ${withAlpha(OLIVE, 0.5)}; border-radius: 3px; }
`;

const styles = {
  app: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "20px 24px 60px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 28,
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    color: MINT,
    fontFamily: "'IBM Plex Mono', monospace",
    letterSpacing: "-0.02em",
  },
  subtitle: {
    fontSize: 13,
    color: OLIVE,
    marginTop: 4,
    fontFamily: "'IBM Plex Sans', sans-serif",
  },
  resetBtn: {
    background: withAlpha(RED, 0.1),
    border: `1px solid ${withAlpha(RED, 0.3)}`,
    borderRadius: 8,
    color: RED,
    padding: "8px 16px",
    cursor: "pointer",
    fontSize: 13,
    fontFamily: "'IBM Plex Sans', sans-serif",
    fontWeight: 500,
  },
  stepBar: {
    display: "flex",
    gap: 4,
    marginBottom: 28,
    borderRadius: 10,
    overflow: "hidden",
    background: withAlpha(BLACK, 0.5),
  },
  stepTab: (isActive, isCompleted) => ({
    flex: 1,
    padding: "12px 8px",
    textAlign: "center",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    background: isActive ? withAlpha(BLUE, 0.1) : "transparent",
    color: isCompleted ? MINT : isActive ? MINT : withAlpha(OLIVE, 0.7),
    fontFamily: "'IBM Plex Sans', sans-serif",
    transition: "all 0.2s",
    borderBottom: isActive ? `2px solid ${BLUE}` : "2px solid transparent",
  }),
  content: {
    minHeight: 300,
    marginBottom: 24,
  },
  navRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
  },
  navBtn: (isPrimary) => ({
    padding: "10px 28px",
    borderRadius: 8,
    border: isPrimary ? "none" : `1px solid ${withAlpha(OLIVE, 0.3)}`,
    background: isPrimary ? BLUE : "transparent",
    color: isPrimary ? BLACK : OLIVE,
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "'IBM Plex Sans', sans-serif",
  }),
};

export default function App() {
  const [step, setStep] = useState(1);
  const {
    vestData,
    tradeData,
    manualOverrides,
    parsing,
    parseLog,
    vestTransactions,
    tradeTransactions,
    totals,
    handleFiles,
    addVest,
    addTrade,
    removeVest,
    removeTrade,
    updateTradeField,
    setManualOverride,
    resetAll,
  } = useTransactions();

  const hasData = vestData.length > 0 || tradeData.length > 0;

  const deadline = useMemo(() => {
    const target = new Date(2026, 2, 16); // 2026/03/16
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);
    const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
    return diff;
  }, []);

  const stepCompleted = (s) => {
    if (s === 1) return hasData;
    if (s === 2) return hasData;
    if (s === 3) return hasData;
    return false;
  };

  const deadlineStyle = {
    fontSize: 12,
    fontFamily: "'IBM Plex Sans', sans-serif",
    fontWeight: 500,
    padding: "6px 14px",
    borderRadius: 8,
    background:
      deadline <= 0
        ? withAlpha(OLIVE, 0.15)
        : deadline <= 7
          ? withAlpha(RED, 0.15)
          : deadline <= 30
            ? withAlpha(ORANGE, 0.15)
            : withAlpha(MINT, 0.1),
    color:
      deadline <= 0
        ? OLIVE
        : deadline <= 7
          ? RED
          : deadline <= 30
            ? ORANGE
            : MINT,
    border: `1px solid ${
      deadline <= 0
        ? withAlpha(OLIVE, 0.3)
        : deadline <= 7
          ? withAlpha(RED, 0.3)
          : deadline <= 30
            ? withAlpha(ORANGE, 0.3)
            : withAlpha(MINT, 0.2)
    }`,
    maxWidth: 320,
    lineHeight: 1.5,
  };

  return (
    <>
      <style>{globalStyles}</style>
      <div style={styles.app}>
        <div style={styles.header}>
          <div>
            <div style={styles.title}>RSU Mate</div>
            <div style={styles.subtitle}>
              米国株RSUのVestおよび譲渡時の確定申告をサポートします。(E*TRADE from Morgan Stanley)
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={deadlineStyle}>
              {deadline > 0
                ? `確定申告 締切まであと ${deadline}日`
                : "2025年分の確定申告は締切です。念の為、税務署へご確認ください。"}
            </div>
            {hasData && (
              <button
                style={styles.resetBtn}
                onClick={() => {
                  setStep(1);
                  resetAll();
                }}
              >
                リセット
              </button>
            )}
          </div>
        </div>

        <div style={styles.stepBar}>
          {STEPS.map((s) => (
            <div
              key={s.id}
              style={styles.stepTab(step === s.id, stepCompleted(s.id))}
              onClick={() => setStep(s.id)}
            >
              {s.id}. {s.label}
            </div>
          ))}
        </div>

        <div style={styles.content}>
          {step === 1 && (
            <PdfDropZone
              onFiles={handleFiles}
              parsing={parsing}
              parseLog={parseLog}
            />
          )}
          {step === 2 && (
            <TransactionEditor
              vestData={vestData}
              tradeData={tradeData}
              addVest={addVest}
              addTrade={addTrade}
              removeVest={removeVest}
              removeTrade={removeTrade}
              updateTradeField={updateTradeField}
            />
          )}
          {step === 3 && (
            <TtmRatePanel
              vestTransactions={vestTransactions}
              tradeTransactions={tradeTransactions}
              manualOverrides={manualOverrides}
              setManualOverride={setManualOverride}
            />
          )}
          {step === 4 && (
            <Dashboard
              vestTransactions={vestTransactions}
              tradeTransactions={tradeTransactions}
              totals={totals}
            />
          )}
        </div>

        <div style={styles.navRow}>
          <button
            style={styles.navBtn(false)}
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1}
          >
            ← 戻る
          </button>
          {step < 4 && (
            <button
              style={styles.navBtn(true)}
              onClick={() => setStep((s) => Math.min(4, s + 1))}
            >
              次へ →
            </button>
          )}
        </div>
      </div>
    </>
  );
}

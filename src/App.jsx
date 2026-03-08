import { useState } from "react";
import { useTransactions } from "./lib/useTransactions";
import PdfDropZone from "./components/PdfDropZone";
import TransactionEditor from "./components/TransactionEditor";
import TtmRatePanel from "./components/TtmRatePanel";
import Dashboard from "./components/Dashboard";

const STEPS = [
  { id: 1, label: "PDF読み込み" },
  { id: 2, label: "データ確認・編集" },
  { id: 3, label: "TTM確認・上書き" },
  { id: 4, label: "申告ダッシュボード" },
];

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    background: #0a0e1a;
    color: #e2e8f0;
    font-family: 'IBM Plex Sans', sans-serif;
    min-height: 100vh;
  }
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
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
    color: "#e2e8f0",
    fontFamily: "'IBM Plex Mono', monospace",
    letterSpacing: "-0.02em",
  },
  subtitle: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 4,
    fontFamily: "'IBM Plex Sans', sans-serif",
  },
  resetBtn: {
    background: "rgba(248,113,113,0.1)",
    border: "1px solid rgba(248,113,113,0.3)",
    borderRadius: 8,
    color: "#f87171",
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
    background: "rgba(15,23,42,0.5)",
  },
  stepTab: (isActive, isCompleted) => ({
    flex: 1,
    padding: "12px 8px",
    textAlign: "center",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    background: isActive ? "#1e2d3d" : "transparent",
    color: isCompleted ? "#4ade80" : isActive ? "#e2e8f0" : "#64748b",
    fontFamily: "'IBM Plex Sans', sans-serif",
    transition: "all 0.2s",
    borderBottom: isActive ? "2px solid #6366f1" : "2px solid transparent",
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
    border: isPrimary ? "none" : "1px solid #334155",
    background: isPrimary ? "#6366f1" : "transparent",
    color: isPrimary ? "#fff" : "#94a3b8",
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
    removeVest,
    removeTrade,
    updateTradeField,
    setManualOverride,
    resetAll,
  } = useTransactions();

  const hasData = vestData.length > 0 || tradeData.length > 0;

  const stepCompleted = (s) => {
    if (s === 1) return hasData;
    if (s === 2) return hasData;
    if (s === 3) return hasData;
    return false;
  };

  return (
    <>
      <style>{globalStyles}</style>
      <div style={styles.app}>
        <div style={styles.header}>
          <div>
            <div style={styles.title}>RSU Tax JP</div>
            <div style={styles.subtitle}>
              米国株RSU 確定申告サポートツール（E*TRADE / Morgan Stanley）
            </div>
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
          <button
            style={styles.navBtn(true)}
            onClick={() => setStep((s) => Math.min(4, s + 1))}
            disabled={step === 4}
          >
            次へ →
          </button>
        </div>
      </div>
    </>
  );
}

import { useState, useMemo, useCallback } from "react";
import { lookupTTM } from "./ttmLoader";
import {
  extractTextFromPdf,
  parseReleaseConfirmation,
  parseTradeConfirmation,
} from "./parsePdf";

export function useTransactions() {
  const [vestData, setVestData] = useState([]);
  const [tradeData, setTradeData] = useState([]);
  const [manualOverrides, setManualOverrides] = useState({});
  const [parsing, setParsing] = useState(false);
  const [parseLog, setParseLog] = useState([]);

  const addLog = useCallback((msg, type = "success") => {
    setParseLog((prev) => [...prev, { msg, type, ts: Date.now() }]);
  }, []);

  const handleFiles = useCallback(
    async (files) => {
      setParsing(true);
      const fileList = Array.from(files);

      for (const file of fileList) {
        try {
          addLog(`解析中: ${file.name}`, "success");
          const text = await extractTextFromPdf(file);

          const release = parseReleaseConfirmation(text, file.name);
          if (release) {
            setVestData((prev) => {
              const isDuplicate = prev.some(
                (v) =>
                  v.releaseDate === release.releaseDate &&
                  v.shares === release.shares
              );
              if (isDuplicate) {
                addLog(
                  `重複スキップ: ${file.name} (${release.releaseDate}, ${release.shares}株)`,
                  "warn"
                );
                return prev;
              }
              addLog(
                `[Vest] 読み込み完了: ${file.name} → ${release.releaseDate}, ${release.shares}株, $${release.fmvPerShare}/株`,
                "success"
              );
              const next = [...prev, release];
              next.sort((a, b) => a.releaseDate.localeCompare(b.releaseDate));
              return next;
            });
            continue;
          }

          const trade = parseTradeConfirmation(text, file.name);
          if (trade) {
            setTradeData((prev) => {
              const isDuplicate = prev.some(
                (t) =>
                  t.tradeDate === trade.tradeDate &&
                  t.quantity === trade.quantity &&
                  t.netAmount === trade.netAmount
              );
              if (isDuplicate) {
                addLog(
                  `重複スキップ: ${file.name} (${trade.tradeDate}, ${trade.quantity}株)`,
                  "warn"
                );
                return prev;
              }
              addLog(
                `[売却] 読み込み完了: ${file.name} → ${trade.tradeDate}, ${trade.quantity}株, $${trade.price}/株, Net $${trade.netAmount}`,
                "success"
              );
              const next = [...prev, trade];
              next.sort((a, b) => a.tradeDate.localeCompare(b.tradeDate));
              return next;
            });
            continue;
          }

          addLog(`認識できませんでした: ${file.name}`, "error");
        } catch (err) {
          addLog(`エラー: ${file.name} — ${err.message}`, "error");
        }
      }

      setParsing(false);
    },
    [addLog]
  );

  const removeVest = useCallback((idx) => {
    setVestData((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  const removeTrade = useCallback((idx) => {
    setTradeData((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  const updateTradeField = useCallback((idx, field, value) => {
    setTradeData((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  }, []);

  const setManualOverride = useCallback((dateStr, value) => {
    setManualOverrides((prev) => {
      const next = { ...prev };
      if (!value && value !== 0) {
        delete next[dateStr];
      } else {
        next[dateStr] = parseFloat(value);
      }
      return next;
    });
  }, []);

  const addVest = useCallback((data) => {
    setVestData((prev) => {
      const next = [...prev, data];
      next.sort((a, b) => a.releaseDate.localeCompare(b.releaseDate));
      return next;
    });
  }, []);

  const addTrade = useCallback((data) => {
    setTradeData((prev) => {
      const next = [...prev, data];
      next.sort((a, b) => a.tradeDate.localeCompare(b.tradeDate));
      return next;
    });
  }, []);

  const resetAll = useCallback(() => {
    setVestData([]);
    setTradeData([]);
    setManualOverrides({});
    setParseLog([]);
  }, []);

  const vestTransactions = useMemo(() => {
    return vestData.map((v) => {
      const vestLookup = lookupTTM(v.releaseDate);
      const vestRateDate = vestLookup.resolvedDate;
      const vestRateDateAdjusted = vestLookup.isAdjusted;
      const vestTTM = manualOverrides[vestRateDate] ?? vestLookup.rate;
      const vestOverridden = manualOverrides[vestRateDate] != null;
      const kyuyoJPY = vestTTM ? Math.round(v.fmvTotal * vestTTM) : null;

      return {
        ...v,
        vestRateDate,
        vestRateDateAdjusted,
        vestTTM,
        vestOverridden,
        kyuyoJPY,
      };
    });
  }, [vestData, manualOverrides]);

  const tradeTransactions = useMemo(() => {
    return tradeData.map((t) => {
      const tradeLookup = lookupTTM(t.tradeDate);
      const tradeRateDate = tradeLookup.resolvedDate;
      const tradeRateDateAdjusted = tradeLookup.isAdjusted;
      const tradeTTM = manualOverrides[tradeRateDate] ?? tradeLookup.rate;
      const tradeOverridden = manualOverrides[tradeRateDate] != null;
      const wireFee = t.wireFee ? parseFloat(t.wireFee) : 0;
      const sellJPY = tradeTTM ? Math.round(t.netAmount * tradeTTM) : null;
      const wireFeeJPY = tradeTTM ? Math.round(wireFee * tradeTTM) : null;

      return {
        ...t,
        tradeRateDate,
        tradeRateDateAdjusted,
        tradeTTM,
        tradeOverridden,
        wireFee,
        sellJPY,
        wireFeeJPY,
      };
    });
  }, [tradeData, manualOverrides]);

  const totals = useMemo(() => {
    const kyuyo = vestTransactions.reduce((s, v) => s + (v.kyuyoJPY || 0), 0);
    const sell = tradeTransactions.reduce((s, t) => s + (t.sellJPY || 0), 0);
    const wire = tradeTransactions.reduce(
      (s, t) => s + (t.wireFeeJPY || 0),
      0
    );
    const jotoPL = sell - kyuyo - wire;

    return { kyuyo, sell, cost: kyuyo, wire, jotoPL };
  }, [vestTransactions, tradeTransactions]);

  return {
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
  };
}

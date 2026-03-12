import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.mjs",
  import.meta.url
).toString();

function convertDate(mmddyyyy) {
  const [mm, dd, yyyy] = mmddyyyy.split("-");
  return `${yyyy}/${mm}/${dd}`;
}

/**
 * Release Confirmation PDF を解析する
 * @param {string} text - PDFから抽出したテキスト全文
 * @param {string} fileName - ファイル名
 * @returns {object|null}
 */
export function parseReleaseConfirmation(text, fileName) {
  try {
    const releaseDateMatch = text.match(/Release\s+Date\s+(\d{2}-\d{2}-\d{4})/);
    const sharesMatch = text.match(/Shares\s+Released\s+([\d.]+)/);
    const fmvPerShareMatch = text.match(/Market\s+Value\s+Per\s+Share\s+\$([\d.]+)/);
    const fmvTotalMatch = text.match(/Market\s+Value\s+\$([\d,]+\.[\d]+)\s/);
    const awardNumberMatch = text.match(/Award\s+Number\s+(\d+)/);
    const awardDateMatch = text.match(/Award\s+Date\s+(\d{2}-\d{2}-\d{4})/);

    if (!releaseDateMatch || !sharesMatch || !fmvPerShareMatch) {
      return null;
    }

    const shares = parseFloat(sharesMatch[1]);
    const fmvPerShare = parseFloat(fmvPerShareMatch[1]);
    const fmvTotal = fmvTotalMatch
      ? parseFloat(fmvTotalMatch[1].replace(/,/g, ""))
      : shares * fmvPerShare;

    return {
      type: "release",
      releaseDate: convertDate(releaseDateMatch[1]),
      awardDate: awardDateMatch ? convertDate(awardDateMatch[1]) : "",
      awardNumber: awardNumberMatch ? awardNumberMatch[1] : "",
      shares,
      fmvPerShare,
      fmvTotal: Math.round(fmvTotal * 100) / 100,
      symbol: "",
      fileName,
      sellDate: "",
      sellNetUSD: "",
      wireFee: "",
    };
  } catch {
    return null;
  }
}

/**
 * Trade Confirmation PDF（売却確認書）を解析する
 * @param {string} text - PDFから抽出したテキスト全文
 * @param {string} fileName - ファイル名
 * @returns {object|null}
 */
export function parseTradeConfirmation(text, fileName) {
  try {
    if (!/Transaction\s+Type:\s*Sold/i.test(text)) {
      return null;
    }

    // Trade Date: MM/DD/YYYY
    const tradeDateMatch = text.match(
      /Trade\s+Date\s+Settlement\s+Date\s+Quantity\s+Price\s+.*?(\d{2}\/\d{2}\/\d{4})/
    );
    // Settlement Date
    const settlementDateMatch = text.match(
      /(\d{2}\/\d{2}\/\d{4})\s+(\d{2}\/\d{2}\/\d{4})\s+([\d.]+)\s+([\d.]+)/
    );

    if (!settlementDateMatch) {
      return null;
    }

    const tradeDate = settlementDateMatch[1];
    const quantity = parseFloat(settlementDateMatch[3]);
    const price = parseFloat(settlementDateMatch[4]);

    const [mm, dd, yyyy] = tradeDate.split("/");
    const tradeDateFormatted = `${yyyy}/${mm}/${dd}`;

    // Net Amount
    const netAmountMatch = text.match(/Net\s+Amount\s+\$([\d,]+\.[\d]+)/);
    const netAmount = netAmountMatch
      ? parseFloat(netAmountMatch[1].replace(/,/g, ""))
      : Math.round(quantity * price * 100) / 100;

    // Transaction Fee
    const txFeeMatch = text.match(/Transaction\s+Fee\s+\$?([\d,]+\.[\d]+)/);
    const transactionFee = txFeeMatch
      ? parseFloat(txFeeMatch[1].replace(/,/g, ""))
      : 0;

    // Symbol
    const symbolMatch = text.match(/Symbol\s*\/\s*CUSIP\s*\/\s*ISIN\s*:\s*(\w+)/);
    const symbol = symbolMatch ? symbolMatch[1] : "";

    return {
      type: "trade",
      tradeDate: tradeDateFormatted,
      quantity,
      price,
      transactionFee,
      netAmount,
      symbol,
      fileName,
    };
  } catch {
    return null;
  }
}

/**
 * PDFファイルからテキストを抽出する
 * @param {File} file
 * @returns {Promise<string>}
 */
export async function extractTextFromPdf(file) {
  if (!file.name.toLowerCase().endsWith(".pdf")) {
    throw new Error("PDFファイルのみ対応しています");
  }
  if (file.type && file.type !== "application/pdf") {
    throw new Error("無効なファイル形式です");
  }
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pages = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items.map((item) => item.str).join(" ");
    pages.push(text);
  }

  return pages.join("\n");
}

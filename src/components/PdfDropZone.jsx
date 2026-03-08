import { useState, useRef } from "react";

const styles = {
  container: {
    maxWidth: 720,
    margin: "0 auto",
  },
  dropZone: (isDragging) => ({
    border: `2px dashed ${isDragging ? "#6366f1" : "#334155"}`,
    borderRadius: 12,
    padding: "48px 24px",
    textAlign: "center",
    cursor: "pointer",
    background: isDragging ? "rgba(99,102,241,0.08)" : "rgba(30,45,61,0.3)",
    transition: "all 0.2s",
  }),
  icon: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 600,
    color: "#e2e8f0",
    marginBottom: 8,
    fontFamily: "'IBM Plex Sans', sans-serif",
  },
  subtitle: {
    fontSize: 13,
    color: "#94a3b8",
    fontFamily: "'IBM Plex Sans', sans-serif",
  },
  parsingText: {
    fontSize: 14,
    color: "#fbbf24",
    marginTop: 16,
    fontFamily: "'IBM Plex Mono', monospace",
  },
  logContainer: {
    marginTop: 16,
    maxHeight: 140,
    overflowY: "auto",
    borderRadius: 8,
    background: "rgba(15,23,42,0.6)",
    padding: 12,
  },
  logEntry: (type) => ({
    fontSize: 12,
    fontFamily: "'IBM Plex Mono', monospace",
    color:
      type === "success" ? "#86efac" : type === "warn" ? "#fbbf24" : "#f87171",
    marginBottom: 4,
    lineHeight: 1.5,
  }),
};

export default function PdfDropZone({ onFiles, parsing, parseLog }) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) onFiles(files);
  };

  const handleClick = () => inputRef.current?.click();

  const handleChange = (e) => {
    if (e.target.files.length > 0) onFiles(e.target.files);
    e.target.value = "";
  };

  return (
    <div style={styles.container}>
      <div
        style={styles.dropZone(isDragging)}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <div style={styles.icon}>📄</div>
        <div style={styles.title}>
          Release Confirmation PDF をドロップ
        </div>
        <div style={styles.subtitle}>
          またはクリックしてファイルを選択（複数可）
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="application/pdf"
          style={{ display: "none" }}
          onChange={handleChange}
        />
      </div>

      {parsing && <div style={styles.parsingText}>⏳ 解析中...</div>}

      {parseLog.length > 0 && (
        <div style={styles.logContainer}>
          {parseLog.map((log) => (
            <div key={log.ts + log.msg} style={styles.logEntry(log.type)}>
              {log.type === "success"
                ? "✓"
                : log.type === "warn"
                  ? "⚠"
                  : "✗"}{" "}
              {log.msg}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

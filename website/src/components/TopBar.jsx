export default function TopBar() {
  return (
    <div className="top-bar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <span className="text-bright" style={{ letterSpacing: 2 }}>AGENT FACTORY</span>
        <span className="text-muted">V.0.9.2 [BETA]</span>
      </div>
      <div className="system-status">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          СЕТЬ: <span className="text-bright">ONLINE</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          GPU: <span className="text-bright">A100 x8</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          VRAM: <span className="text-bright">640 GB</span>
        </div>
        <div className="status-dot active" />
      </div>
    </div>
  );
}

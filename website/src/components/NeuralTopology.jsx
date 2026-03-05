export default function NeuralTopology({ role }) {
  if (!role) return null;

  return (
    <div className="panel" style={{ flex: 1 }}>
      <div className="panel-header">
        <span>02 // Нейронная топология</span>
        <span>[VIS]</span>
      </div>
      <div className="viz-container">
        {/* Top-left info */}
        <div style={{ position: 'absolute', top: 10, left: 10, fontSize: 10, color: 'var(--text-muted)' }}>
          АКТИВНЫЙ УЗЕЛ: {role.model.toUpperCase()}<br />
          ACTIVE PARAMS: {role.activeParams}<br />
          РОЛЬ: {role.name.toUpperCase()}
        </div>

        {/* Network visualization */}
        <div className="node-network">
          <div className="orbit-ring orbit-1">
            <div className="sat-node" style={{ top: -4, left: '50%' }} />
          </div>
          <div className="orbit-ring orbit-2">
            <div
              className="sat-node"
              style={{
                top: 'auto',
                bottom: -4,
                left: '50%',
                background: 'var(--accent-purple)',
                boxShadow: '0 0 8px var(--accent-purple)',
              }}
            />
          </div>
          <div className="orbit-ring orbit-3">
            <div
              className="sat-node"
              style={{
                top: '50%',
                left: -4,
                background: 'var(--accent-green)',
                boxShadow: '0 0 8px var(--accent-green)',
              }}
            />
          </div>

          <div className="center-node mono-nums">{role.activeParams}</div>

          <svg
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              opacity: 0.3,
            }}
          >
            <line x1="50%" y1="50%" x2="50%" y2="8%" stroke="var(--border-bright)" strokeWidth="1" />
            <line x1="50%" y1="50%" x2="85%" y2="75%" stroke="var(--border-bright)" strokeWidth="1" />
            <line x1="50%" y1="50%" x2="15%" y2="75%" stroke="var(--border-bright)" strokeWidth="1" />
            <line x1="50%" y1="50%" x2="5%" y2="50%" stroke="var(--border-bright)" strokeWidth="1" />
          </svg>
        </div>

        {/* Bottom-right score */}
        <div style={{ position: 'absolute', bottom: 12, right: 12, textAlign: 'right' }}>
          <div className="text-blue mono-nums" style={{ fontSize: 18 }}>
            {role.keyScore}%
          </div>
          <div className="text-muted" style={{ fontSize: 9 }}>{role.keyBenchmark} SCORE</div>
        </div>

        {/* Bottom-left description */}
        <div style={{ position: 'absolute', bottom: 12, left: 12, fontSize: 10, maxWidth: '55%', color: 'var(--text-muted)' }}>
          {role.description}
        </div>
      </div>
    </div>
  );
}

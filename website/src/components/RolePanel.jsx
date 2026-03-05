import { useState, useMemo } from 'react';

export default function RolePanel({ roles, selectedRole, onSelectRole }) {
  const [filter, setFilter] = useState('');
  const [temp, setTemp] = useState(0.7);

  const filtered = useMemo(() => {
    if (!filter) return roles;
    const q = filter.toLowerCase();
    return roles.filter(
      r => r.name.toLowerCase().includes(q) || r.subtitle.toLowerCase().includes(q)
    );
  }, [roles, filter]);

  const sel = roles.find(r => r.id === selectedRole);
  const ctxSegments = sel ? Math.round((sel.keyScore / 100) * 6) : 3;

  return (
    <div className="panel">
      <div className="panel-header">
        <span>01 // Роли агентов</span>
        <span>[ВЫБОР]</span>
      </div>
      <div className="panel-content">
        <input
          type="text"
          className="filter-input"
          placeholder="ПОИСК РОЛЕЙ..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
        />

        {filtered.map(role => (
          <div
            key={role.id}
            className={`role-item${selectedRole === role.id ? ' selected' : ''}`}
            onClick={() => onSelectRole(role.id)}
          >
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <span className="text-bright uppercase" style={{ fontSize: 11 }}>{role.name}</span>
              <span style={{ fontSize: 10, opacity: 0.7 }}>{role.subtitle}</span>
            </div>
            <div className="role-icon">{role.abbr}</div>
          </div>
        ))}

        {sel && (
          <div className="param-section">
            <span className="uppercase text-muted" style={{ fontSize: 10 }}>Параметры</span>

            <div className="param-row">
              <span>Температура</span>
              <span className="text-bright mono-nums">{temp.toFixed(1)}</span>
            </div>
            <input
              type="range"
              className="param-slider"
              min="0"
              max="1"
              step="0.1"
              value={temp}
              onChange={e => setTemp(parseFloat(e.target.value))}
            />

            <div className="param-row">
              <span>Контекст</span>
              <span className="text-bright mono-nums">128k</span>
            </div>
            <div className="ctx-bar">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    height: 4,
                    flex: 1,
                    background: i < ctxSegments ? 'var(--accent-blue)' : 'var(--border-dim)',
                  }}
                />
              ))}
            </div>

            <div className="param-row" style={{ marginTop: 12 }}>
              <span>Модель</span>
              <span className="text-bright" style={{ fontSize: 10 }}>{sel.model}</span>
            </div>
            <div className="param-row">
              <span>Active</span>
              <span className="text-blue mono-nums">{sel.activeParams}</span>
            </div>
            <div className="param-row">
              <span>VRAM</span>
              <span className="mono-nums">{sel.vram}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

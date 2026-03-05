import { useState, useMemo } from 'react';

export default function ComputePlan({ gpuConfigs, selectedRole, roles }) {
  const [selectedGpu, setSelectedGpu] = useState('a100-80');

  const role = roles.find(r => r.id === selectedRole);
  const gpu = gpuConfigs.find(g => g.id === selectedGpu);

  const vramUsed = useMemo(() => {
    if (!role) return 42;
    const v = role.vram;
    if (v === 'shared') return 50;
    return parseInt(v) || 42;
  }, [role]);

  const vramTotal = gpu ? parseInt(gpu.vram) : 80;
  const vramPercent = Math.min(100, Math.round((vramUsed / vramTotal) * 100));

  return (
    <div className="panel">
      <div className="panel-header">
        <span>04 // Вычислительный план</span>
        <span>[КОНФИГ]</span>
      </div>
      <div className="panel-content" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="uppercase text-muted" style={{ fontSize: 10, marginBottom: 8 }}>
          Рекомендуемый кластер
        </div>

        {gpuConfigs.map(cfg => (
          <div
            key={cfg.id}
            className={`hw-card${selectedGpu === cfg.id ? ' active' : ''}`}
            onClick={() => setSelectedGpu(cfg.id)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className={selectedGpu === cfg.id ? 'text-bright' : 'text-muted'}>
                {cfg.name}
              </span>
              <span className={`tag${cfg.tagType === 'blue' ? ' blue' : ''}`}>{cfg.tag}</span>
            </div>

            {selectedGpu === cfg.id && (
              <div className="spec-grid">
                <div className="spec-box">VRAM: {cfg.vram}</div>
                <div className="spec-box">BW: {cfg.bandwidth}</div>
                <div className="spec-box">FP8: {cfg.fp8}</div>
                <div className="spec-box">{cfg.pcie}</div>
              </div>
            )}

            <div className="hw-stat" style={selectedGpu === cfg.id ? { marginTop: 12, borderTop: '1px dashed var(--border-dim)', paddingTop: 4 } : {}}>
              <span>Скорость</span>
              <span className="mono-nums">{cfg.toksPerSec}</span>
            </div>
            <div className="hw-stat">
              <span>Стоимость</span>
              <span className="text-bright mono-nums">{cfg.cost}</span>
            </div>
          </div>
        ))}

        <div style={{ marginTop: 16 }}>
          <div className="uppercase text-muted" style={{ fontSize: 10, marginBottom: 4 }}>
            Загрузка VRAM
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 2 }} className="mono-nums">
            <span>ЗАНЯТО: {vramUsed} GB</span>
            <span>ВСЕГО: {vramTotal} GB</span>
          </div>
          <div className="vram-bar-track">
            <div className="vram-bar-fill" style={{ width: `${vramPercent}%` }} />
          </div>
        </div>

        {role && (
          <div style={{ marginTop: 12, fontSize: 10, padding: '8px', border: '1px dashed var(--border-dim)' }}>
            <div className="text-muted uppercase" style={{ fontSize: 9, marginBottom: 4 }}>Назначение GPU</div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{role.name}</span>
              <span className="text-blue">{role.model}</span>
            </div>
          </div>
        )}

        <div style={{ flex: 1 }} />

        <button className="deploy-btn">
          Развернуть агента
        </button>
      </div>
    </div>
  );
}

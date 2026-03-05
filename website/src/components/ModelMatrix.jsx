import { useState, useMemo } from 'react';

export default function ModelMatrix({ models, selectedRole }) {
  const [sortKey, setSortKey] = useState('mmlu');
  const [sortDir, setSortDir] = useState('desc');

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const sorted = useMemo(() => {
    return [...models].sort((a, b) => {
      const aVal = a[sortKey] ?? 0;
      const bVal = b[sortKey] ?? 0;
      return sortDir === 'desc' ? bVal - aVal : aVal - bVal;
    });
  }, [models, sortKey, sortDir]);

  const thClass = (key) => sortKey === key ? 'sorted' : '';

  return (
    <div className="panel" style={{ flex: 1 }}>
      <div className="panel-header">
        <span>03 // Матрица моделей</span>
        <span>[ВЫБОР]</span>
      </div>
      <div className="panel-content" style={{ padding: 0 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('name')}>Модель</th>
              <th onClick={() => handleSort('arch')}>Арх.</th>
              <th onClick={() => handleSort('mmlu')} className={thClass('mmlu')}>MMLU</th>
              <th onClick={() => handleSort('humanEval')} className={thClass('humanEval')}>HumanEval</th>
              <th onClick={() => handleSort('sweBench')} className={thClass('sweBench')}>SWE</th>
              <th onClick={() => handleSort('vram')}>VRAM</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(model => {
              const isForRole = selectedRole && model.roles.includes(selectedRole);
              return (
                <tr key={model.id} className={isForRole ? 'highlighted' : ''}>
                  <td>
                    <span className={isForRole ? 'text-bright' : ''}>{model.name}</span>
                    {isForRole && (
                      <span className="tag blue" style={{ marginLeft: 6 }}>REC</span>
                    )}
                  </td>
                  <td style={{ fontSize: 10 }}>{model.arch}</td>
                  <td className="mono-nums text-blue">{model.mmlu}</td>
                  <td>
                    <div className="bar-container">
                      <div className="bar-fill" style={{ width: `${model.humanEval}%` }} />
                    </div>
                  </td>
                  <td className="mono-nums" style={{ color: model.sweBench >= 75 ? 'var(--text-bright)' : undefined }}>
                    {model.sweBench}
                  </td>
                  <td className="mono-nums">{model.vram}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

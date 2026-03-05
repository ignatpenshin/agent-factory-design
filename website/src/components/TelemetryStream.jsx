import { useState, useEffect, useRef } from 'react';

const initialLogs = [
  { time: '14:02:44.20', type: 'INFO', text: 'Система инициализирована. Анализ доступных GPU кластеров...' },
  { time: '14:02:44.45', type: 'NET', text: 'Загрузка кэша лидерборда HuggingFace (v.2026.03)' },
  { time: '14:02:45.01', type: 'WARN', text: 'Qwen3.5-397B требует INT4 квантизацию для A100 80GB' },
  { time: '14:02:45.12', type: 'INFO', text: 'Оптимальная конфигурация: A100 PCIe + FlashAttention-2' },
  { time: '14:02:45.88', type: 'INFO', text: 'Загрузка весов модели Qwen3.5-397B (AWQ INT4)...' },
  { time: '14:02:46.34', type: 'NET', text: 'Подключение к SberData inference API...' },
  { time: '14:02:46.91', type: 'INFO', text: 'Матрица моделей обновлена. 12 моделей доступно.' },
  { time: '14:02:47.22', type: 'INFO', text: 'Pipeline агентов готов: 9 ролей, 5 GPU задействовано' },
];

const streamLogs = [
  { type: 'INFO', text: 'Мониторинг утилизации GPU: 17% VRAM (109/640 GB)' },
  { type: 'NET', text: 'Heartbeat от кластера: все 8 нод активны' },
  { type: 'INFO', text: 'Кэш KV обновлён. Свободно: 531 GB' },
  { type: 'WARN', text: 'DeepSeek V3.2 требует 2x A100 для tensor parallelism' },
  { type: 'INFO', text: 'Оркестратор Qwen3.5-397B: latency 24ms, 850 tok/s' },
  { type: 'NET', text: 'Синхронизация с LMSYS Arena leaderboard...' },
  { type: 'INFO', text: 'Билдер Qwen2.5-Coder-32B: HumanEval 92.7% подтверждён' },
  { type: 'INFO', text: 'B200 серверы: статус заказа — в ожидании поставки' },
  { type: 'WARN', text: 'Falcon H1R-7B: обновление доступно (v1.2)' },
  { type: 'NET', text: 'Обновление бенчмарков LiveCodeBench v6...' },
  { type: 'INFO', text: 'GLM-4.7 tau-bench: 87.4% — лидер по tool use' },
  { type: 'INFO', text: 'Автоскейлинг: нагрузка низкая, GPU 6-8 в режиме ожидания' },
];

function getTimestamp() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}.${String(Math.floor(now.getMilliseconds() / 10)).padStart(2, '0')}`;
}

export default function TelemetryStream() {
  const [logs, setLogs] = useState(initialLogs);
  const [latencyBars, setLatencyBars] = useState([40, 60, 30, 90, 50, 70, 45, 80]);
  const logRef = useRef(null);
  const streamIdx = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const log = streamLogs[streamIdx.current % streamLogs.length];
      streamIdx.current++;
      setLogs(prev => [...prev.slice(-30), { ...log, time: getTimestamp() }]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setLatencyBars(prev =>
        prev.map(() => 20 + Math.floor(Math.random() * 80))
      );
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  const latencyVal = 18 + Math.floor(Math.random() * 12);

  return (
    <div className="panel bottom-panel">
      <div className="panel-header">
        <span>05 // Телеметрия</span>
        <span>[ЛОГИ]</span>
      </div>
      <div className="panel-content">
        <div className="telemetry-content">
          <div className="telemetry-logs" ref={logRef}>
            {logs.map((log, i) => (
              <div className="log-entry" key={i}>
                <span className="log-time mono-nums">{log.time}</span>
                <span className={`log-type${log.type === 'WARN' ? ' warn' : ''}`}>
                  [{log.type}]
                </span>
                <span>{log.text}</span>
              </div>
            ))}
          </div>
          <div className="telemetry-sidebar">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="text-muted">ЗАДЕРЖКА</span>
              <span className="mono-nums text-bright">{latencyVal}ms</span>
            </div>
            <div className="latency-bars">
              {latencyBars.map((h, i) => (
                <div
                  key={i}
                  className={`latency-bar${i === latencyBars.length - 2 ? ' active' : ''}`}
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>

            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="text-muted">THROUGHPUT</span>
              <span className="mono-nums text-bright">850 t/s</span>
            </div>

            <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="text-muted">АГЕНТОВ</span>
              <span className="mono-nums text-bright">9 / 12</span>
            </div>

            <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="text-muted">GPU UTIL</span>
              <span className="mono-nums text-blue">17%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

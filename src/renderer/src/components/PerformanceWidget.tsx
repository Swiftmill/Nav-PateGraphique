interface Props {
  performance: { mode: string; stats: { cpuUsage: number; memoryUsage: number }; preset?: any } | null;
}

const PerformanceWidget = ({ performance }: Props) => {
  if (!performance) return null;
  const preset = performance.preset ?? { limitCPU: '∞', limitRAM: '∞' };
  return (
    <div className="pg-glass" style={{ margin: '24px', padding: '24px', borderRadius: '18px' }}>
      <h2>Performance en temps réel</h2>
      <p>Mode actuel : {performance.mode}</p>
      <div style={{ display: 'flex', gap: '24px' }}>
        <div>
          <strong>CPU</strong>
          <div style={{ fontSize: '2rem' }}>{performance.stats.cpuUsage}%</div>
        </div>
        <div>
          <strong>RAM</strong>
          <div style={{ fontSize: '2rem' }}>{performance.stats.memoryUsage}%</div>
        </div>
        <div>
          <strong>Limites</strong>
          <p>CPU max: {preset.limitCPU}</p>
          <p>RAM max: {preset.limitRAM}</p>
        </div>
      </div>
    </div>
  );
};

export default PerformanceWidget;

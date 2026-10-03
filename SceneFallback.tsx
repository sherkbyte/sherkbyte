import type { SceneKind } from './types';

// Static, lightweight vector visual. Shown before WebGL loads, and permanently if WebGL
// is unsupported or the device is too slow.
export default function SceneFallback({ kind }: { kind: SceneKind }) {
  const stroke = '#3B82F6';
  const glow = '#22D3EE';
  const ok = '#34D399';
  const Rack = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect width="70" height="130" rx="4" fill="#081628" stroke={stroke} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <g key={i}><rect x="6" y={8 + i * 20} width="58" height="14" rx="2" fill="#10294A" stroke="#1E4FA8" />
          <circle cx="56" cy={15 + i * 20} r="2" fill={glow} /></g>
      ))}
    </g>
  );
  const Cloud = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => (
    <path transform={`translate(${x} ${y}) scale(${s})`} fill="#12386B" fillOpacity=".7" stroke={stroke}
      d="M20 50a18 18 0 0 1 4-35 24 24 0 0 1 46 6 16 16 0 0 1 2 29z" />
  );
  const Bars = ({ x, y }: { x: number; y: number }) => (
    <g transform={`translate(${x} ${y})`}>
      <rect width="110" height="70" rx="4" fill="#0B1F3A" stroke={stroke} />
      {[24, 40, 30, 52, 38, 58].map((h, i) => <rect key={i} x={10 + i * 16} y={64 - h} width="9" height={h} fill="#1B4FB8" />)}
      <polyline fill="none" stroke={ok} strokeWidth="2" points="14,40 30,26 46,34 62,16 78,24 94,8" />
    </g>
  );
  const Check = ({ x, y }: { x: number; y: number }) => (
    <g transform={`translate(${x} ${y})`}>
      <circle r="16" fill="#0B1F3A" stroke={ok} strokeWidth="2" />
      <path d="M-7 0l5 6 10-12" fill="none" stroke={ok} strokeWidth="3" />
    </g>
  );
  return (
    <div className="absolute inset-0 grid place-items-center bg-hero">
      <svg viewBox="0 0 400 260" className="h-full w-full" preserveAspectRatio="xMidYMid meet" role="img" aria-label={`Illustration: ${kind} technology visual`}>
        <defs><pattern id="g" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="#0D2240" /></pattern></defs>
        <rect width="400" height="260" fill="url(#g)" opacity=".7" />
        {kind === 'hero' && (<>
          <path d="M60 60 C110 20 150 20 190 50 S270 90 320 70" fill="none" stroke={glow} strokeWidth="2" />
          <Rack x={40} y={90} s={0.9} /><Cloud x={120} y={20} /><Bars x={200} y={80} /><Cloud x={250} y={20} s={0.6} /><Check x={340} y={190} />
        </>)}
        {kind === 'infrastructure' && <><Rack x={150} y={60} /><path d="M220 150h90" stroke={glow} strokeWidth="2" /></>}
        {kind === 'cloud' && <><Rack x={60} y={100} s={0.8} /><Cloud x={160} y={40} s={1.3} /><Cloud x={270} y={90} /><path d="M110 100 L180 70" stroke={glow} strokeWidth="2" /></>}
        {kind === 'data' && <><Bars x={230} y={90} />{[60, 100, 140, 180].map((y) => <rect key={y} x="50" y={y - 20} width="14" height="14" fill="#35507A" />)}<path d="M70 90 C150 90 180 120 230 125" stroke={glow} fill="none" strokeWidth="2" /></>}
        {kind === 'ai' && <><rect x="30" y="110" width="60" height="40" rx="3" fill="#0B1F3A" stroke={glow} /><rect x="310" y="110" width="60" height="40" rx="3" fill="#0B1F3A" stroke={ok} />
          <path d="M90 130 L150 90 L210 160 L270 100 L310 130" stroke={glow} fill="none" strokeWidth="2" />
          {[[150, 90], [210, 160], [270, 100]].map(([x, y]) => <rect key={x} x={x - 9} y={y - 9} width="18" height="18" fill="#0D2547" stroke={stroke} transform={`rotate(45 ${x} ${y})`} />)}</>}
        {kind === 'qa' && <>{[0, 1, 2].map((i) => <Check key={i} x={110 + i * 90} y={100} />)}{[0, 1, 2].map((i) => <Check key={i + 3} x={110 + i * 90} y={170} />)}</>}
      </svg>
    </div>
  );
}

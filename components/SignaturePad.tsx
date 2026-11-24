'use client';
import { useEffect, useRef, useState } from 'react';

// Draw-to-sign pad. Emits a trimmed PNG data URL, or '' when cleared.
export default function SignaturePad({ onChange }: { onChange: (png: string) => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [empty, setEmpty] = useState(true);

  useEffect(() => {
    const c = ref.current!;
    const ratio = window.devicePixelRatio || 1;
    c.width = c.offsetWidth * ratio;
    c.height = c.offsetHeight * ratio;
    const ctx = c.getContext('2d')!;
    ctx.scale(ratio, ratio);
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#10223f';
  }, []);

  const pos = (e: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top];
  };
  const down = (e: React.PointerEvent) => {
    e.preventDefault();
    ref.current!.setPointerCapture(e.pointerId);
    drawing.current = true;
    const ctx = ref.current!.getContext('2d')!;
    const [x, y] = pos(e);
    ctx.beginPath(); ctx.moveTo(x, y);
  };
  const move = (e: React.PointerEvent) => {
    if (!drawing.current) return;
    const ctx = ref.current!.getContext('2d')!;
    const [x, y] = pos(e);
    ctx.lineTo(x, y); ctx.stroke();
    setEmpty(false);
  };
  const up = () => {
    if (!drawing.current) return;
    drawing.current = false;
    onChange(trimmed(ref.current!));
  };
  const clear = () => {
    const c = ref.current!;
    c.getContext('2d')!.clearRect(0, 0, c.width, c.height);
    setEmpty(true);
    onChange('');
  };

  return (
    <div>
      <div className="relative rounded-sm border border-[#c9c3b8] bg-white">
        <canvas ref={ref} className="h-36 w-full touch-none" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerLeave={up} />
        <div className="pointer-events-none absolute bottom-6 left-6 right-6 border-b border-dashed border-[#b8b1a5]" />
        {empty && <div className="pointer-events-none absolute inset-0 grid place-items-center text-sm text-[#9a9388]">Sign here with your mouse or finger</div>}
      </div>
      <button type="button" onClick={clear} className="mt-1 text-xs underline">Clear</button>
    </div>
  );
}

function trimmed(c: HTMLCanvasElement) {
  const ctx = c.getContext('2d')!;
  const { data, width, height } = ctx.getImageData(0, 0, c.width, c.height);
  let x0 = width, y0 = height, x1 = 0, y1 = 0;
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    if (data[(y * width + x) * 4 + 3] > 0) { if (x < x0) x0 = x; if (y < y0) y0 = y; if (x > x1) x1 = x; if (y > y1) y1 = y; }
  }
  if (x1 <= x0) return '';
  const pad = 8, w = x1 - x0 + pad * 2, h = y1 - y0 + pad * 2;
  const out = document.createElement('canvas');
  out.width = w; out.height = h;
  out.getContext('2d')!.drawImage(c, x0 - pad, y0 - pad, w, h, 0, 0, w, h);
  return out.toDataURL('image/png');
}

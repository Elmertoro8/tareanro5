import React, { useEffect, useRef, useState } from 'react';

interface CanvasProps {
  colorPincel: string;
  tamanoPincel: number;
  usarGoma: boolean;
}

export default function Canvas({ colorPincel, tamanoPincel, usarGoma }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [estaDibujando, setEstaDibujando] = useState(false);

  // Inicializar tamaño, HiDPI y fondo blanco
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const cssWidth = 900;
    const cssHeight = 560;

    canvas.width = Math.floor(cssWidth * dpr);
    canvas.height = Math.floor(cssHeight * dpr);
    canvas.style.width = `${cssWidth}px`;
    canvas.style.height = `${cssHeight}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Fondo blanco
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, cssWidth, cssHeight);
  }, []);

  const getCtx = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.getContext('2d');
  };

  const aplicarEstiloTrazo = (ctx: CanvasRenderingContext2D) => {
    if (usarGoma) {
      // Borra píxeles: no pinta color, "corta" del bitmap
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)'; // color irrelevante al borrar
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = colorPincel;
    }
    ctx.lineWidth = tamanoPincel;
  };

  const posFromEvent = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const ctx = getCtx();
    if (!ctx) return;

    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    aplicarEstiloTrazo(ctx);

    const { x, y } = posFromEvent(e);
    ctx.beginPath();
    ctx.moveTo(x, y);

    setEstaDibujando(true);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!estaDibujando) return;
    const ctx = getCtx();
    if (!ctx) return;

    aplicarEstiloTrazo(ctx);

    const { x, y } = posFromEvent(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const endStroke = (e?: React.PointerEvent<HTMLCanvasElement>) => {
    const ctx = getCtx();
    if (ctx) {
      ctx.closePath();
    }
    if (e) {
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    }
    setEstaDibujando(false);
  };

  const limpiar = () => {
    const canvas = canvasRef.current;
    const ctx = getCtx();
    if (!canvas || !ctx) return;

    const w = canvas.clientWidth;
    const h = canvas.clientHeight;

    // Reset a modo normal y repintar blanco
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);
  };

  const guardarPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `mini-paint-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="canvas-wrap">
      <div className="canvas-toolbar">
        <button className="btn" onClick={limpiar} title="Limpiar (borrar todo)">
          Limpiar
        </button>
        <button className="btn primary" onClick={guardarPNG} title="Guardar como PNG">
          ⬇Guardar PNG
        </button>
        <span className={`mode ${usarGoma ? 'erase' : 'draw'}`}>
          Modo: {usarGoma ? 'Goma' : 'Pincel'}
        </span>
      </div>

      <canvas
        ref={canvasRef}
        className={`canvas ${usarGoma ? 'cursor-erase' : 'cursor-draw'}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endStroke}
        onPointerLeave={endStroke}
      />
    </div>
  );
}

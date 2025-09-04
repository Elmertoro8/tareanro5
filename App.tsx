import { useState } from 'react';
import './App.css';
import Canvas from './components/Canvas';

export default function App() {
  const [colorPincel, setColorPincel] = useState('#0f172a'); // slate-900
  const [tamanoPincel, setTamanoPincel] = useState(6);
  const [usarGoma, setUsarGoma] = useState(false);

  return (
    <div className="app">
      <h1 className="title">Mini Paint</h1>

      <div className="toolbar">
        <label className="field">
          <span>Color</span>
          <input
            type="color"
            value={colorPincel}
            onChange={(e) => setColorPincel(e.target.value)}
            disabled={usarGoma}
          />
        </label>

        <label className="field">
          <span>Tamaño</span>
          <input
            type="range"
            min={1}
            max={50}
            value={tamanoPincel}
            onChange={(e) => setTamanoPincel(Number(e.target.value))}
          />
          <span className="badge">{tamanoPincel}px</span>
        </label>

        <label className="toggle">
          <input
            type="checkbox"
            checked={usarGoma}
            onChange={() => setUsarGoma((v) => !v)}
          />
          <span className="toggle-slider" />
          <span className="toggle-label">{usarGoma ? 'Goma' : 'Pincel'}</span>
        </label>
      </div>

      <Canvas
        colorPincel={colorPincel}
        tamanoPincel={tamanoPincel}
        usarGoma={usarGoma}
      />
    </div>
  );
}

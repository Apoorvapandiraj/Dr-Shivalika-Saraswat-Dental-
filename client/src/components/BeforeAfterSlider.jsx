import React, { useCallback, useRef, useState } from 'react';
import { Sparkles, MoveHorizontal, ArrowUpRight } from 'lucide-react';

const API_ORIGIN = (import.meta.env.VITE_API_URL || 'https://dr-shivalika-saraswat-dental-1.onrender.com/api').replace(/\/api\/?$/, '');
const mediaUrl = (url) => (url?.startsWith('http') ? url : url ? `${API_ORIGIN}${url}` : '');

export default function BeforeAfterSlider({ cases = [] }) {
  const [active, setActive] = useState(0);
  const [pos, setPos] = useState(50);
  const trackRef = useRef(null);
  const dragging = useRef(false);

  const updateFromClientX = useCallback((clientX) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect?.width) return;
    setPos(Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100)));
  }, []);

  const onMouseDown = (e) => { dragging.current = true; updateFromClientX(e.clientX); };
  const onTouchStart = (e) => { dragging.current = true; updateFromClientX(e.touches[0].clientX); };

  React.useEffect(() => {
    const move = (e) => {
      if (!dragging.current) return;
      updateFromClientX(e.touches ? e.touches[0].clientX : e.clientX);
    };
    const stop = () => { dragging.current = false; };
    window.addEventListener('mousemove', move);
    window.addEventListener('touchmove', move, { passive: true });
    window.addEventListener('mouseup', stop);
    window.addEventListener('touchend', stop);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('touchmove', move);
      window.removeEventListener('mouseup', stop);
      window.removeEventListener('touchend', stop);
    };
  }, [updateFromClientX]);

  const onKey = (e) => {
    if (e.key === 'ArrowLeft') setPos((p) => Math.max(0, p - 4));
    if (e.key === 'ArrowRight') setPos((p) => Math.min(100, p + 4));
  };

  if (!cases.length) return null;
  const current = cases[active];

  return (
    <section id="case-vault" className="case-vault py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12 text-center">
          <div className="mb-3 inline-flex items-center gap-2 text-sm text-[#D33616]">
            <Sparkles size={16} /> The Case Vault
          </div>
          <h2 className="section-heading mb-4">Real Transformations</h2>
          <p className="section-copy mx-auto">Drag the slider to witness clinical outcomes and confidence-first smile design.</p>
        </div>

        <div className="case-showcase glass overflow-hidden">
          <div className="flex flex-wrap gap-2 border-b border-[#F0DDCF] p-4">
            {cases.map((c, i) => (
              <button
                key={c._id || i}
                onClick={() => { setActive(i); setPos(50); }}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${i === active ? 'bg-[#D33616] text-white shadow-lg shadow-[#D33616]/20' : 'bg-[#F7F1ED] text-[#5F5A62] hover:text-[#690A01]'}`}
              >
                {c.category}
              </button>
            ))}
          </div>

          <div className="grid gap-6 p-5 lg:grid-cols-[1.7fr_0.95fr]">
            <div
              ref={trackRef}
              tabIndex={0}
              onKeyDown={onKey}
              onMouseDown={onMouseDown}
              onTouchStart={onTouchStart}
              className="case-slider relative h-[470px] cursor-ew-resize select-none overflow-hidden rounded-[1.5rem] outline-none ring-0 focus:ring-2 focus:ring-[#D33616]/30"
            >
              <img
                src={mediaUrl(current.afterImage?.url)}
                alt={`After ${current.category}`}
                className="absolute inset-0 h-full w-full object-cover contrast-[1.08] saturate-[1.15] brightness-[1.02]"
                draggable={false}
              />
              <div className="absolute inset-0 overflow-hidden" style={{ width: `${pos}%` }}>
                <img
                  src={mediaUrl(current.beforeImage?.url)}
                  alt={`Before ${current.category}`}
                  className="absolute inset-0 h-full w-full object-cover contrast-[1.08] saturate-[1.15] brightness-[1.02]"
                  draggable={false}
                />
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-[#130d0d]/30 via-transparent to-white/10" />

              <div className="absolute bottom-0 top-0 w-1 bg-[#D33616] shadow-[0_0_18px_rgba(211,54,22,0.8)]" style={{ left: `${pos}%` }}>
                <div className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-[#D33616] bg-white/90 shadow-[0_12px_30px_rgba(105,10,1,0.16)]">
                  <MoveHorizontal size={18} className="text-[#D33616]" />
                </div>
              </div>

              <span className="absolute left-4 top-4 rounded-full bg-white/80 px-3 py-1.5 text-[0.62rem] font-bold tracking-[0.2em] text-[#690A01] backdrop-blur-sm">BEFORE</span>
              <span className="absolute right-4 top-4 rounded-full border border-[#D33616]/30 bg-[#D33616]/10 px-3 py-1.5 text-[0.62rem] font-bold tracking-[0.2em] text-[#D33616] backdrop-blur-sm">AFTER</span>
            </div>

            <div className="case-card-rail">
              {cases.map((caseItem, index) => (
                <button
                  key={caseItem._id || index}
                  type="button"
                  onClick={() => { setActive(index); setPos(50); }}
                  className={`case-card ${index === active ? 'active' : ''}`}
                >
                  <div className="case-card-visual">
                    <img src={mediaUrl(caseItem.beforeImage?.url)} alt={caseItem.title} />
                    <div className="case-card-visual-overlay" />
                    <span className="case-badge">{caseItem.category}</span>
                  </div>
                  <div className="case-card-copy">
                    <div className="flex items-center justify-between gap-3">
                      <h3>{caseItem.title}</h3>
                      <ArrowUpRight size={16} />
                    </div>
                    <p>{caseItem.treatmentDuration}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-[#F0DDCF] p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="text-[0.7rem] font-bold uppercase tracking-[0.22em] text-[#D33616]">Featured result</div>
                <h3 className="mt-2 text-2xl font-bold text-[#690A01]">{current.title}</h3>
              </div>
              {current.treatmentDuration && <p className="text-sm font-medium text-[#D33616]">Treatment duration: {current.treatmentDuration}</p>}
            </div>
            {current.description && <p className="mt-3 max-w-3xl text-sm leading-7 text-[#6E6D7A]">{current.description}</p>}
          </div>
        </div>
      </div>
    </section>
  );
}

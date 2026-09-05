import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Sparkles } from 'lucide-react';

const DEFAULT_MATERIALS = [
  { name: 'Ceramic', multiplier: 0.85 },
  { name: 'Zirconia', multiplier: 1 },
  { name: 'Titanium', multiplier: 1.15 },
];
const DEFAULT_SEDATION = [
  { name: 'None', price: 0 },
  { name: 'Local Anesthesia', price: 500 },
  { name: 'Conscious Sedation', price: 3500 },
];

export default function TreatmentCalculator({ profile }) {
  const cfg = profile?.pricingConfig;
  const materials = cfg?.materials?.length ? cfg.materials : DEFAULT_MATERIALS;
  const sedationOptions = cfg?.sedation?.length ? cfg.sedation : DEFAULT_SEDATION;
  const perTooth = cfg?.perToothServices || ['Dental Implants', 'Porcelain Veneers', 'Teeth Whitening'];
  const addFactor = cfg?.additionalToothFactor ?? 0.6;

  const [service, setService] = useState('');
  const [toothCount, setToothCount] = useState(1);
  const [material, setMaterial] = useState('');
  const [sedation, setSedation] = useState('None');

  const services = profile?.services || [];

  const quote = useMemo(() => {
    const svc = services.find((s) => s.name === service);
    if (!svc) return null;
    const isPerTooth = perTooth.includes(service);
    const base = svc.price;
    const toothCost = isPerTooth ? base + (toothCount - 1) * base * addFactor : base;
    const matMult = materials.find((m) => m.name === material)?.multiplier ?? 1;
    const sedPrice = sedationOptions.find((s) => s.name === sedation)?.price ?? 0;
    const subtotal = toothCost * matMult;
    const total = Math.round((subtotal + sedPrice) / 10) * 10;
    return {
      total,
      breakdown: [
        { label: `${service}${isPerTooth ? ` (${toothCount} tooth${toothCount > 1 ? 's' : ''})` : ''}`, value: Math.round(toothCost) },
        ...(material ? [{ label: `${material} material ×${matMult}`, value: Math.round(subtotal - toothCost) }] : []),
        ...(sedPrice ? [{ label: sedation, value: sedPrice }] : []),
      ],
    };
  }, [service, toothCount, material, sedation, services, perTooth, addFactor, materials, sedationOptions]);

  const inputCls = 'w-full rounded-xl border border-[#E8DAD5] bg-white/80 p-3.5 text-[#1C1B1F] focus:border-[#D33616] focus:outline-none transition-colors';

  return (
    <section id="calculator" className="py-24 bg-[radial-gradient(circle_at_top,rgba(211,54,22,0.08),transparent_30%),linear-gradient(180deg,#f7f1ee_0%,#f3e9e4_100%)]">
      <div className="mx-auto max-w-4xl px-6">
        <div className="mb-12 text-center">
          <div className="mb-3 inline-flex items-center gap-2 text-sm text-[#D33616]">
            <Calculator size={16} /> Instant Estimate
          </div>
          <h2 className="text-4xl font-bold text-[#690A01]">Smile Cost Calculator</h2>
          <p className="mt-3 text-[#6E6D7A]">Transparent pricing. No surprises.</p>
        </div>
        <div className="glass grid gap-8 p-8 md:grid-cols-2">
          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm text-[#6E6D7A]">Treatment</label>
              <select value={service} onChange={(e) => setService(e.target.value)} className={inputCls}>
                <option value="">Select a treatment…</option>
                {services.map((s) => (
                  <option key={s.name} value={s.name}>{s.name} — from ₹{s.price.toLocaleString('en-IN')}</option>
                ))}
              </select>
            </div>

            {perTooth.includes(service) && (
              <div>
                <label className="mb-2 block text-sm text-[#6E6D7A]">
                  Teeth involved: <span className="font-semibold text-[#D33616]">{toothCount}</span>
                </label>
                <input
                  type="range" min="1" max="16" value={toothCount}
                  onChange={(e) => setToothCount(Number(e.target.value))}
                  className="w-full accent-[#D33616]"
                />
                <div className="mt-1 flex justify-between text-xs text-[#8B7D78]"><span>1</span><span>16</span></div>
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm text-[#6E6D7A]">Material tier</label>
              <div className="grid grid-cols-3 gap-2">
                {materials.map((m) => (
                  <button
                    key={m.name}
                    onClick={() => setMaterial(material === m.name ? '' : m.name)}
                    className={`rounded-xl border p-3 text-sm transition-all ${material === m.name ? 'border-[#D33616] bg-[#FDEAE5] text-[#D33616]' : 'border-[#E8DAD5] text-[#6E6D7A] hover:border-[#D33616]/35'}`}
                  >
                    {m.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm text-[#6E6D7A]">Sedation</label>
              <div className="grid grid-cols-3 gap-2">
                {sedationOptions.map((s) => (
                  <button
                    key={s.name}
                    onClick={() => setSedation(s.name)}
                    className={`rounded-xl border p-3 text-xs transition-all ${sedation === s.name ? 'border-[#C98A3A] bg-[#F7F0E5] text-[#A16422]' : 'border-[#E8DAD5] text-[#6E6D7A] hover:border-[#D33616]/35'}`}
                  >
                    {s.name}{s.price ? <span className="mt-0.5 block text-[10px]">+₹{s.price}</span> : null}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex flex-1 flex-col rounded-2xl border border-[#F0DDCF] bg-[linear-gradient(135deg,rgba(211,54,22,0.05),transparent)] p-6">
              <div className="mb-4 flex items-center gap-2 text-sm text-[#D33616]">
                <Sparkles size={15} /> Your Estimate
              </div>
              {quote ? (
                <>
                  <div className="mb-6 text-4xl font-bold text-[#690A01]">₹{quote.total.toLocaleString('en-IN')}</div>
                  <div className="flex-1 space-y-2 text-sm">
                    {quote.breakdown.map((b, i) => (
                      <div key={i} className="flex justify-between text-[#6E6D7A]">
                        <span>{b.label}</span>
                        <span className="text-[#1C1B1F]">₹{Math.abs(b.value).toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                  <p className="mt-4 text-[11px] text-[#8B7D78]">
                    Indicative estimate only — final quotation after clinical examination.
                  </p>
                </>
              ) : (
                <div className="flex flex-1 items-center justify-center text-sm text-[#6E6D7A]">
                  Select a treatment to see your live estimate.
                </div>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              disabled={!quote}
              onClick={() => {
                window.dispatchEvent(new CustomEvent('booking:prefill', { detail: { service } }));
                document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="btn-primary mt-4 w-full disabled:pointer-events-none disabled:opacity-30"
            >
              Book This Treatment →
            </motion.button>
          </div>
        </div>
      </div>
    </section>
  );
}

import React from 'react';

export default function LuxuryBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div className="absolute left-[8%] top-[12%] h-[22rem] w-[22rem] rounded-full bg-[#D33616]/10 blur-[120px]" />
      <div className="absolute right-[10%] top-[18%] h-[26rem] w-[26rem] rounded-full bg-[#CF8976]/10 blur-[120px]" />
      <div className="absolute right-[12%] bottom-[8%] h-[18rem] w-[18rem] rounded-full bg-[#F4B39E]/10 blur-[120px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(251,249,248,0.92)_100%)]" />
    </div>
  );
}

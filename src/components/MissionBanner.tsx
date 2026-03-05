'use client';

export default function MissionBanner() {
  return (
    <div className="mb-6 border-b border-[#222] pb-4">
      <p className="text-sm tracking-wide text-[#888]">
        <span className="mr-2 inline-block h-2 w-2 rounded-full bg-[#e94560]" style={{ animation: 'pulseDot 2s ease-in-out infinite' }} />
        We build AI agents that run your operations while you run your vision.
      </p>
    </div>
  );
}

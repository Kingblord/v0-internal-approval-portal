import NetworkSelector from '@/components/NetworkSelector';

export default function CheckerPage() {
  return (
    <main className="min-h-screen bg-[#1a1a1a] text-white overflow-x-hidden relative">
      {/* Content */}
      <div className="relative z-10">
        <NetworkSelector />
      </div>
    </main>
  );
}

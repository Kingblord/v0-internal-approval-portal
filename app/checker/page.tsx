import ApprovalPortal from '@/components/ApprovalPortal';

export default function CheckerPage() {
  return (
    <main className="min-h-screen bg-black text-white overflow-x-hidden relative">
      {/* Starfield Background - same as landing */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-black to-black opacity-80"></div>
        <div className="absolute top-0 left-0 right-0 h-1/2 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.1),transparent)]"></div>
        <div className="absolute inset-0 stars"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <ApprovalPortal />
      </div>
    </main>
  );
}

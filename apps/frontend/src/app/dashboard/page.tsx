import DashboardNavigation from '@/components/DashboardNavigation';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-white text-black py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <DashboardNavigation />
      </div>
    </div>
  );
}

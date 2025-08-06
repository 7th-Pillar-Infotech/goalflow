'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { AnalyticsCards } from '@/components/dashboard/analytics-cards';
import { ProgressChart } from '@/components/dashboard/progress-chart';
import { CreateGoalModal } from '@/components/goals/create-goal-modal';
import { Button } from '@/components/ui/button';
import { Plus, Filter, Download } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useState } from 'react';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [showCreateGoal, setShowCreateGoal] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <DashboardLayout activeTab="dashboard">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome back, {user.profile?.full_name || 'User'}!
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Here's what's happening with your goals this week.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button size="sm" onClick={() => setShowCreateGoal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Goal
            </Button>
          </div>
        </div>

        {/* Analytics Overview */}
        <AnalyticsCards />

        {/* Progress Charts */}
        <ProgressChart />

        {/* Create Goal Modal */}
        <CreateGoalModal
          open={showCreateGoal}
          onOpenChange={setShowCreateGoal}
          onGoalCreated={() => {
            // Refresh data or show success message
            console.log('Goal created successfully!');
          }}
        />
      </div>
    </DashboardLayout>
  );
}
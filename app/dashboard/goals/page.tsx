'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Plus, Filter, Search, MoreHorizontal, Target, Users, Calendar } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export default function GoalsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

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
    return null;
  }

  const mockGoals = [
    {
      id: 1,
      title: "Increase quarterly sales revenue from $1M to $1.3M",
      description: "Focus on enterprise clients and improve conversion rates through better sales processes.",
      type: "team",
      status: "on_track",
      progress: 78,
      dueDate: "Dec 31, 2024",
      team: "Sales Team",
      tags: ["Revenue", "Sales", "Q4"]
    },
    {
      id: 2,
      title: "Launch new product feature for mobile app",
      description: "Develop and deploy the highly requested dark mode feature across all mobile platforms.",
      type: "team",
      status: "at_risk",
      progress: 45,
      dueDate: "Nov 15, 2024",
      team: "Product Team",
      tags: ["Product", "Mobile", "Feature"]
    },
    {
      id: 3,
      title: "Complete professional certification in project management",
      description: "Obtain PMP certification to enhance leadership skills and career advancement.",
      type: "individual",
      status: "on_track",
      progress: 92,
      dueDate: "Dec 15, 2024",
      team: null,
      tags: ["Personal", "Career", "Certification"]
    }
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      on_track: { variant: 'default' as const, text: 'On Track' },
      at_risk: { variant: 'destructive' as const, text: 'At Risk' },
      completed: { variant: 'secondary' as const, text: 'Completed' },
      not_started: { variant: 'outline' as const, text: 'Not Started' },
    };
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.not_started;
  };

  return (
    <DashboardLayout activeTab="goals">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Goals</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage and track your goals and objectives.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New Goal
            </Button>
          </div>
        </div>

        {/* Goals Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {mockGoals.map((goal) => {
            const statusBadge = getStatusBadge(goal.status);
            
            return (
              <Card key={goal.id} className="hover:shadow-lg transition-shadow duration-200 cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 rounded bg-blue-100 dark:bg-blue-900">
                        {goal.type === 'team' ? (
                          <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        ) : (
                          <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        )}
                      </div>
                      <Badge variant={statusBadge.variant}>{statusBadge.text}</Badge>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                    {goal.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {goal.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Progress</span>
                      <span className="font-medium text-gray-900 dark:text-white">{goal.progress}%</span>
                    </div>
                    <Progress value={goal.progress} className="h-2" />
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {goal.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Due {goal.dueDate}
                    </div>
                    {goal.team && (
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {goal.team}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Empty State for when there are no goals */}
        {mockGoals.length === 0 && (
          <Card className="p-12 text-center">
            <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No goals yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Get started by creating your first goal. Set objectives, track progress, and achieve success.
            </p>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Goal
            </Button>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
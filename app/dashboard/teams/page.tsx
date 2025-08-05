'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Plus, Users, Settings, MoreHorizontal, Target, TrendingUp } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export default function TeamsPage() {
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

  const mockTeams = [
    {
      id: 1,
      name: "Product Team",
      description: "Building the next generation of our platform",
      members: [
        { name: "Sarah Chen", avatar: "", initials: "SC", role: "Product Manager" },
        { name: "Marcus Johnson", avatar: "", initials: "MJ", role: "Developer" },
        { name: "Lisa Rodriguez", avatar: "", initials: "LR", role: "Designer" },
        { name: "David Kim", avatar: "", initials: "DK", role: "Developer" }
      ],
      goals: 8,
      progress: 72,
      status: "on_track"
    },
    {
      id: 2,
      name: "Sales Team",
      description: "Driving revenue growth and customer acquisition",
      members: [
        { name: "Emily Watson", avatar: "", initials: "EW", role: "Sales Manager" },
        { name: "John Smith", avatar: "", initials: "JS", role: "Account Executive" },
        { name: "Maria Garcia", avatar: "", initials: "MG", role: "SDR" }
      ],
      goals: 12,
      progress: 85,
      status: "ahead"
    },
    {
      id: 3,
      name: "Marketing Team",
      description: "Growing brand awareness and generating leads",
      members: [
        { name: "Alex Thompson", avatar: "", initials: "AT", role: "Marketing Manager" },
        { name: "Jessica Lee", avatar: "", initials: "JL", role: "Content Creator" },
        { name: "Ryan Brown", avatar: "", initials: "RB", role: "Growth Hacker" }
      ],
      goals: 6,
      progress: 45,
      status: "at_risk"
    }
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ahead: { variant: 'default' as const, text: 'Ahead of Schedule', color: 'text-green-600' },
      on_track: { variant: 'secondary' as const, text: 'On Track', color: 'text-blue-600' },
      at_risk: { variant: 'destructive' as const, text: 'At Risk', color: 'text-red-600' },
    };
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.on_track;
  };

  return (
    <DashboardLayout activeTab="teams">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Teams</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage team goals and track collaborative progress.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Create Team
            </Button>
          </div>
        </div>

        {/* Team Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Teams</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">3</p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Team Goals</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">26</p>
                </div>
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
                  <Target className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Avg Progress</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">67%</p>
                </div>
                <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Teams Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {mockTeams.map((team) => {
            const statusBadge = getStatusBadge(team.status);
            
            return (
              <Card key={team.id} className="hover:shadow-lg transition-shadow duration-200 cursor-pointer">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                        <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                          {team.name}
                        </CardTitle>
                        <CardDescription>{team.description}</CardDescription>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Team Stats */}
                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Goals: </span>
                      <span className="font-medium text-gray-900 dark:text-white">{team.goals}</span>
                    </div>
                    <Badge variant={statusBadge.variant}>{statusBadge.text}</Badge>
                  </div>

                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Team Progress</span>
                      <span className="font-medium text-gray-900 dark:text-white">{team.progress}%</span>
                    </div>
                    <Progress value={team.progress} className="h-2" />
                  </div>

                  {/* Team Members */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Team Members ({team.members.length})
                    </p>
                    <div className="flex items-center gap-2">
                      {team.members.slice(0, 4).map((member, index) => (
                        <Avatar key={index} className="w-8 h-8">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback className="text-xs">
                            {member.initials}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {team.members.length > 4 && (
                        <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                          <span className="text-xs text-gray-600 dark:text-gray-300">
                            +{team.members.length - 4}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {mockTeams.length === 0 && (
          <Card className="p-12 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No teams yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create your first team to start collaborating on goals and projects.
            </p>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Team
            </Button>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
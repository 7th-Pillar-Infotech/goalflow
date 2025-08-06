'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ZoomIn, 
  ZoomOut, 
  Filter, 
  Search, 
  Target, 
  Users, 
  Plus,
  Minus,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export default function StrategicMapPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [zoomLevel, setZoomLevel] = useState(100);

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

  // Mock strategic map data
  const companyGoal = {
    id: 'company-1',
    title: 'Squarepoint.io OKRs Q4 2024',
    description: 'Achieve 40% revenue growth and expand market presence',
    progress: 72,
    status: 'on_track',
    departments: [
      {
        id: 'sales-dept',
        name: 'Sales Department',
        progress: 85,
        status: 'on_track',
        goals: [
          {
            id: 'sales-goal-1',
            title: 'Increase quarterly sales revenue from $1M to $1.3M',
            progress: 78,
            status: 'on_track',
            owner: 'Sarah Chen',
            subgoals: [
              { id: 'sg1', title: 'Improve lead generation by 40%', progress: 85, assignee: 'John Smith' },
              { id: 'sg2', title: 'Increase conversion rate to 25%', progress: 70, assignee: 'Maria Garcia' }
            ]
          }
        ]
      },
      {
        id: 'product-dept',
        name: 'Product Department',
        progress: 65,
        status: 'at_risk',
        goals: [
          {
            id: 'product-goal-1',
            title: 'Launch new mobile features',
            progress: 45,
            status: 'at_risk',
            owner: 'Marcus Johnson',
            subgoals: [
              { id: 'sg3', title: 'Design dark mode UI', progress: 90, assignee: 'Lisa Rodriguez' },
              { id: 'sg4', title: 'Implement push notifications', progress: 20, assignee: 'David Kim' }
            ]
          }
        ]
      },
      {
        id: 'marketing-dept',
        name: 'Marketing Department',
        progress: 92,
        status: 'ahead',
        goals: [
          {
            id: 'marketing-goal-1',
            title: 'Increase brand awareness by 60%',
            progress: 92,
            status: 'on_track',
            owner: 'Emily Watson',
            subgoals: [
              { id: 'sg5', title: 'Launch social media campaign', progress: 100, assignee: 'Alex Thompson' },
              { id: 'sg6', title: 'Increase website traffic by 50%', progress: 85, assignee: 'Jessica Lee' }
            ]
          }
        ]
      }
    ]
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on_track': return 'bg-emerald-500';
      case 'at_risk': return 'bg-orange-500';
      case 'ahead': return 'bg-blue-500';
      case 'completed': return 'bg-green-600';
      default: return 'bg-gray-500';
    }
  };

  const getStatusBadge = (status: string) => {
    const config = {
      on_track: { variant: 'default' as const, text: 'On Track' },
      at_risk: { variant: 'destructive' as const, text: 'At Risk' },
      ahead: { variant: 'secondary' as const, text: 'Ahead' },
      completed: { variant: 'outline' as const, text: 'Completed' },
    };
    return config[status as keyof typeof config] || config.on_track;
  };

  return (
    <DashboardLayout activeTab="strategic-map">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Strategic Map</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Visual hierarchy of organizational objectives and key results.
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
          </div>
        </div>

        {/* Map Controls */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Zoom: {zoomLevel}%</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setZoomLevel(Math.max(50, zoomLevel - 25))}
                    disabled={zoomLevel <= 50}
                  >
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setZoomLevel(100)}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setZoomLevel(Math.min(200, zoomLevel + 25))}
                    disabled={zoomLevel >= 200}
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span>On Track</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <span>At Risk</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span>Ahead</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Strategic Map Canvas */}
        <Card className="min-h-[600px]">
          <CardContent className="p-6">
            <div 
              className="strategic-map-canvas relative overflow-auto"
              style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top left' }}
            >
              {/* Company Goal - Central Node */}
              <div className="flex flex-col items-center space-y-8">
                <Card className="w-80 border-2 border-blue-500 shadow-lg">
                  <CardHeader className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900">
                        <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <Badge variant="secondary">Company OKR</Badge>
                    </div>
                    <CardTitle className="text-lg">{companyGoal.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                      {companyGoal.description}
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Overall Progress</span>
                        <span className="font-medium">{companyGoal.progress}%</span>
                      </div>
                      <Progress value={companyGoal.progress} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                {/* Department Branches */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full max-w-6xl">
                  {companyGoal.departments.map((dept, deptIndex) => (
                    <div key={dept.id} className="space-y-4">
                      {/* Department Header */}
                      <Card className={`border-l-4 ${getStatusColor(dept.status)}`}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Users className="w-5 h-5" />
                              <CardTitle className="text-base">{dept.name}</CardTitle>
                            </div>
                            <Badge variant={getStatusBadge(dept.status).variant}>
                              {getStatusBadge(dept.status).text}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Department Progress</span>
                              <span className="font-medium">{dept.progress}%</span>
                            </div>
                            <Progress value={dept.progress} className="h-2" />
                          </div>
                        </CardContent>
                      </Card>

                      {/* Department Goals */}
                      {dept.goals.map((goal) => (
                        <Card key={goal.id} className="ml-4 border-l-2 border-gray-200 dark:border-gray-700">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-sm font-medium line-clamp-2">
                                {goal.title}
                              </CardTitle>
                              <Badge variant={getStatusBadge(goal.status).variant} className="text-xs">
                                {getStatusBadge(goal.status).text}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-500">Owner: {goal.owner}</p>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs">
                                <span>Progress</span>
                                <span className="font-medium">{goal.progress}%</span>
                              </div>
                              <Progress value={goal.progress} className="h-1.5" />
                            </div>

                            {/* Sub-goals */}
                            <div className="space-y-2">
                              <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                Key Results:
                              </p>
                              {goal.subgoals.map((subgoal) => (
                                <div key={subgoal.id} className="bg-gray-50 dark:bg-gray-800 rounded p-2 space-y-1">
                                  <div className="flex items-center justify-between">
                                    <p className="text-xs font-medium line-clamp-1">{subgoal.title}</p>
                                    <span className="text-xs text-gray-500">{subgoal.progress}%</span>
                                  </div>
                                  <Progress value={subgoal.progress} className="h-1" />
                                  <p className="text-xs text-gray-500">Assigned: {subgoal.assignee}</p>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Map Legend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Map Legend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-500 rounded"></div>
                <span>Company OKR</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-l-4 border-emerald-500 bg-white dark:bg-gray-800 rounded"></div>
                <span>Department</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-l-2 border-gray-300 bg-white dark:bg-gray-800 rounded"></div>
                <span>Goal</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-100 dark:bg-gray-700 rounded"></div>
                <span>Key Result</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Target, 
  TrendingUp, 
  Users, 
  CheckCircle,
  AlertCircle,
  Clock,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'positive' | 'negative' | 'neutral';
  };
  icon: React.ReactNode;
  description?: string;
}

function AnalyticsCard({ title, value, change, icon, description }: AnalyticsCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {title}
        </CardTitle>
        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {value}
            </div>
            {description && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {description}
              </p>
            )}
          </div>
          {change && (
            <div className={`flex items-center gap-1 text-sm ${
              change.type === 'positive' 
                ? 'text-emerald-600 dark:text-emerald-400' 
                : change.type === 'negative'
                ? 'text-red-600 dark:text-red-400'
                : 'text-gray-600 dark:text-gray-400'
            }`}>
              {change.type === 'positive' ? (
                <ArrowUp className="w-4 h-4" />
              ) : change.type === 'negative' ? (
                <ArrowDown className="w-4 h-4" />
              ) : null}
              {Math.abs(change.value)}%
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface GoalProgressCardProps {
  title: string;
  progress: number;
  status: 'on_track' | 'at_risk' | 'completed' | 'not_started';
  dueDate: string;
  team?: string;
}

function GoalProgressCard({ title, progress, status, dueDate, team }: GoalProgressCardProps) {
  const statusConfig = {
    on_track: { color: 'bg-emerald-500', text: 'On Track', variant: 'default' as const },
    at_risk: { color: 'bg-orange-500', text: 'At Risk', variant: 'destructive' as const },
    completed: { color: 'bg-blue-500', text: 'Completed', variant: 'secondary' as const },
    not_started: { color: 'bg-gray-500', text: 'Not Started', variant: 'outline' as const },
  };

  const config = statusConfig[status];

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base font-semibold text-gray-900 dark:text-white line-clamp-2">
            {title}
          </CardTitle>
          <Badge variant={config.variant} className="shrink-0 ml-2">
            {config.text}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Progress</span>
            <span className="font-medium text-gray-900 dark:text-white">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
            <Clock className="w-4 h-4" />
            Due {dueDate}
          </div>
          {team && (
            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
              <Users className="w-4 h-4" />
              {team}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function AnalyticsCards() {
  const analyticsData = [
    {
      title: "Total Goals",
      value: 12,
      change: { value: 8, type: 'positive' as const },
      icon: <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
      description: "Active goals"
    },
    {
      title: "Completion Rate",
      value: "67%",
      change: { value: 12, type: 'positive' as const },
      icon: <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      description: "This quarter"
    },
    {
      title: "At Risk Goals",
      value: 3,
      change: { value: 25, type: 'negative' as const },
      icon: <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />,
      description: "Need attention"
    },
    {
      title: "Team Performance",
      value: "85%",
      change: { value: 5, type: 'positive' as const },
      icon: <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
      description: "Average score"
    }
  ];

  const recentGoals = [
    {
      title: "Increase quarterly sales revenue from $1M to $1.3M",
      progress: 78,
      status: 'on_track' as const,
      dueDate: "Dec 31",
      team: "Sales"
    },
    {
      title: "Launch new product feature for mobile app",
      progress: 45,
      status: 'at_risk' as const,
      dueDate: "Nov 15",
      team: "Product"
    },
    {
      title: "Improve customer satisfaction score to 4.5/5",
      progress: 92,
      status: 'on_track' as const,
      dueDate: "Dec 15",
      team: "Support"
    },
    {
      title: "Reduce customer churn rate by 15%",
      progress: 100,
      status: 'completed' as const,
      dueDate: "Oct 30",
      team: "Marketing"
    },
  ];

  return (
    <div className="space-y-6">
      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {analyticsData.map((data, index) => (
          <AnalyticsCard key={index} {...data} />
        ))}
      </div>

      {/* Recent Goals */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent Goals
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {recentGoals.map((goal, index) => (
            <GoalProgressCard key={index} {...goal} />
          ))}
        </div>
      </div>
    </div>
  );
}
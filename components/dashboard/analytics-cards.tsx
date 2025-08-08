"use client";

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Target,
  TrendingUp,
  Users,
  CheckCircle,
  AlertCircle,
  Clock,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { fetchGoals } from "@/lib/redux/slices/goalsSlice";
import { Goal, GoalStatus } from "@/lib/types";

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: "positive" | "negative" | "neutral";
  };
  icon: React.ReactNode;
  description?: string;
}

function AnalyticsCard({
  title,
  value,
  change,
  icon,
  description,
}: AnalyticsCardProps) {
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
            <div
              className={`flex items-center gap-1 text-sm ${
                change.type === "positive"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : change.type === "negative"
                  ? "text-red-600 dark:text-red-400"
                  : "text-gray-600 dark:text-gray-400"
              }`}
            >
              {change.type === "positive" ? (
                <ArrowUp className="w-4 h-4" />
              ) : change.type === "negative" ? (
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
  status: GoalStatus;
  dueDate: string;
  team?: string;
}

function GoalProgressCard({
  title,
  progress,
  status,
  dueDate,
  team,
}: GoalProgressCardProps) {
  const statusConfig = {
    in_progress: {
      color: "bg-emerald-500",
      text: "In Progress",
      variant: "default" as const,
    },
    at_risk: {
      color: "bg-orange-500",
      text: "At Risk",
      variant: "destructive" as const,
    },
    completed: {
      color: "bg-blue-500",
      text: "Completed",
      variant: "secondary" as const,
    },
    not_started: {
      color: "bg-gray-500",
      text: "Not Started",
      variant: "outline" as const,
    },
    blocked: {
      color: "bg-red-500",
      text: "Blocked",
      variant: "destructive" as const,
    },
  };

  // Use a default config if the status doesn't match any known status
  const config = statusConfig[status] || {
    color: "bg-gray-500",
    text: status
      ? status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
      : "Unknown",
    variant: "outline" as const,
  };

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
            <span className="font-medium text-gray-900 dark:text-white">
              {progress}%
            </span>
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
  const dispatch = useAppDispatch();
  const {
    items: goals,
    status,
    error,
  } = useAppSelector((state) => state.goals);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchGoals());
    }
  }, [dispatch, status]);

  // Calculate analytics data based on goals from Redux
  const calculateAnalyticsData = () => {
    if (!goals || goals.length === 0) {
      return [
        {
          title: "Total Goals",
          value: 0,
          change: { value: 0, type: "neutral" as const },
          icon: <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
          description: "Active goals",
        },
        {
          title: "Completion Rate",
          value: "0%",
          change: { value: 0, type: "neutral" as const },
          icon: (
            <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          ),
          description: "This quarter",
        },
        {
          title: "At Risk Goals",
          value: 0,
          change: { value: 0, type: "neutral" as const },
          icon: (
            <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          ),
          description: "Need attention",
        },
        {
          title: "Team Performance",
          value: "0%",
          change: { value: 0, type: "neutral" as const },
          icon: (
            <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          ),
          description: "Average score",
        },
      ];
    }

    // Count goals by status
    const totalGoals = goals.length;
    const completedGoals = goals.filter(
      (goal) => goal.status === "completed"
    ).length;
    const atRiskGoals = goals.filter(
      (goal) => goal.status === "at_risk"
    ).length;
    const onTrackGoals = goals.filter(
      (goal) => goal.status === "in_progress"
    ).length;

    // Calculate completion rate
    const completionRate =
      totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

    // Calculate team performance (simplified example)
    const teamPerformance =
      totalGoals > 0
        ? Math.round(((completedGoals + onTrackGoals * 0.7) / totalGoals) * 100)
        : 0;

    return [
      {
        title: "Total Goals",
        value: totalGoals,
        change: { value: 8, type: "positive" as const },
        icon: <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
        description: "Active goals",
      },
      {
        title: "Completion Rate",
        value: `${completionRate}%`,
        change: { value: 12, type: "positive" as const },
        icon: (
          <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        ),
        description: "This quarter",
      },
      {
        title: "At Risk Goals",
        value: atRiskGoals,
        change: {
          value: 25,
          type: atRiskGoals > 2 ? ("negative" as const) : ("positive" as const),
        },
        icon: (
          <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
        ),
        description: "Need attention",
      },
      {
        title: "Team Performance",
        value: `${teamPerformance}%`,
        change: { value: 5, type: "positive" as const },
        icon: (
          <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        ),
        description: "Average score",
      },
    ];
  };

  const analyticsData = calculateAnalyticsData();

  // Transform goals data for the recent goals section
  const getRecentGoals = () => {
    if (!goals || goals.length === 0) {
      return [];
    }

    // Get the 4 most recent goals
    return goals.slice(0, 4).map((goal) => {
      // Calculate progress based on subgoals completion
      let progress = 0;
      if (goal.subgoals && goal.subgoals.length > 0) {
        const completedSubgoals = goal.subgoals.filter(
          (sg) => sg.status === "completed"
        ).length;
        progress = Math.round((completedSubgoals / goal.subgoals.length) * 100);
      } else if (goal.status === "completed") {
        progress = 100;
      } else if (goal.status === "in_progress") {
        progress = 70;
      } else if (goal.status === "at_risk") {
        progress = 40;
      } else {
        progress = 10;
      }

      return {
        title: goal.title,
        progress,
        status: goal.status,
        dueDate: goal.deadline
          ? new Date(goal.deadline).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })
          : "No deadline",
        team: goal.team_id ? "Team" : "Individual",
      };
    });
  };

  const recentGoals = getRecentGoals();

  if (status === "loading") {
    return (
      <div className="space-y-6">
        <div className="text-center py-10">
          <p className="text-gray-600 dark:text-gray-400">
            Loading goals data...
          </p>
        </div>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="space-y-6">
        <div className="text-center py-10">
          <p className="text-red-600 dark:text-red-400">
            Error loading goals: {error}
          </p>
        </div>
      </div>
    );
  }

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
        {recentGoals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {recentGoals.map((goal, index) => (
              <GoalProgressCard key={index} {...goal} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-600 dark:text-gray-400">
              No goals found. Create your first goal to get started!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { CreateGoalModal } from "@/components/goals/create-goal-modal";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Plus,
  Filter,
  Search,
  MoreHorizontal,
  Target,
  Users,
  Calendar,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { goalsApi } from "@/lib/api/goals";
import type { Goal } from "@/lib/types";

export default function GoalsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [showCreateGoal, setShowCreateGoal] = useState(false);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth");
    } else if (user) {
      loadGoals();
    }
  }, [user, loading, router]);

  const loadGoals = async () => {
    try {
      setIsLoading(true);
      const userGoals = await goalsApi.getGoals();
      setGoals(userGoals);
    } catch (error) {
      console.error("Error loading goals:", error);
    } finally {
      setIsLoading(false);
    }
  };

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

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      in_progress: { variant: "default" as const, text: "On Track" },
      at_risk: { variant: "destructive" as const, text: "At Risk" },
      completed: { variant: "secondary" as const, text: "Completed" },
      not_started: { variant: "outline" as const, text: "Not Started" },
    };
    return (
      statusConfig[status as keyof typeof statusConfig] ||
      statusConfig.not_started
    );
  };

  return (
    <DashboardLayout activeTab="goals">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Goals
            </h1>
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
            <Button size="sm" onClick={() => setShowCreateGoal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Goal
            </Button>
          </div>
        </div>

        {/* Goals Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {goals.map((goal) => {
              const statusBadge = getStatusBadge(goal.status);
              const completedSubgoals =
                goal.subgoals?.filter((sg) => sg.status === "completed")
                  .length || 0;
              const totalSubgoals = goal.subgoals?.length || 0;
              const progress =
                totalSubgoals > 0
                  ? Math.round((completedSubgoals / totalSubgoals) * 100)
                  : 0;

              return (
                <Card
                  key={goal.id}
                  className="hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 rounded bg-blue-100 dark:bg-blue-900">
                          {goal.goal_type === "team" ? (
                            <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          ) : (
                            <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          )}
                        </div>
                        <Badge variant={statusBadge.variant}>
                          {statusBadge.text}
                        </Badge>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                    <CardTitle
                      className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors"
                      onClick={() => router.push(`/dashboard/goals/${goal.id}`)}
                    >
                      {goal.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {goal.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent
                    className="space-y-4 cursor-pointer"
                    onClick={() => router.push(`/dashboard/goals/${goal.id}`)}
                  >
                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          Progress
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {progress}%
                        </span>
                      </div>
                      <Progress value={progress} className="h-2" />
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
                        {goal.deadline
                          ? `Due ${new Date(
                              goal.deadline
                            ).toLocaleDateString()}`
                          : "No deadline"}
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="w-4 h-4" />
                        {totalSubgoals} sub-goals
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Empty State for when there are no goals */}
        {!isLoading && goals.length === 0 && (
          <Card className="p-12 text-center">
            <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No goals yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Get started by creating your first goal. Set objectives, track
              progress, and achieve success.
            </p>
            <Button onClick={() => setShowCreateGoal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Goal
            </Button>
          </Card>
        )}

        {/* Create Goal Modal */}
        <CreateGoalModal
          open={showCreateGoal}
          onOpenChange={setShowCreateGoal}
          onGoalCreated={loadGoals}
        />
      </div>
    </DashboardLayout>
  );
}

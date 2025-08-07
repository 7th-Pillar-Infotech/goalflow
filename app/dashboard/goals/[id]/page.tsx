"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { format } from "date-fns";
import { goalsApi } from "@/lib/api/goals";
import type { Goal, GoalStatus } from "@/lib/types";
import { useAuth } from "@/hooks/use-auth";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

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
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Target,
  Users,
  Tag,
  Edit3,
  MoreHorizontal,
  CheckCircle,
  AlertCircle,
  PlayCircle,
  PauseCircle,
  Flag,
} from "lucide-react";

export default function GoalDetailPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const goalId = params.id as string;

  const [goal, setGoal] = useState<Goal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth");
    } else if (user && goalId) {
      loadGoal();
    }
  }, [user, loading, router, goalId]);

  const loadGoal = async () => {
    try {
      setIsLoading(true);
      const goalData = await goalsApi.getGoal(goalId);
      setGoal(goalData);
    } catch (error) {
      console.error("Error loading goal:", error);
      setError("Failed to load goal details");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: GoalStatus) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "on_track":
        return <PlayCircle className="w-4 h-4 text-blue-600" />;
      case "at_risk":
        return <AlertCircle className="w-4 h-4 text-orange-600" />;
      default:
        return <PauseCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: GoalStatus) => {
    const statusConfig = {
      completed: {
        variant: "default" as const,
        text: "Completed",
        color:
          "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      },
      on_track: {
        variant: "secondary" as const,
        text: "On Track",
        color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      },
      at_risk: {
        variant: "destructive" as const,
        text: "At Risk",
        color:
          "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      },
      not_started: {
        variant: "outline" as const,
        text: "Not Started",
        color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
      },
    };
    return statusConfig[status] || statusConfig.not_started;
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      high: {
        variant: "destructive" as const,
        text: "High Priority",
        color: "text-red-600",
      },
      medium: {
        variant: "secondary" as const,
        text: "Medium Priority",
        color: "text-orange-600",
      },
      low: {
        variant: "outline" as const,
        text: "Low Priority",
        color: "text-green-600",
      },
    };
    return (
      priorityConfig[priority as keyof typeof priorityConfig] ||
      priorityConfig.medium
    );
  };

  const handleTaskStatusChange = async (taskId: string, checked: boolean) => {
    try {
      const newStatus = checked ? "completed" : "not_started";
      await goalsApi.updateTaskStatus(taskId, newStatus);
      await loadGoal(); // Refresh the goal data
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  const handleSubgoalStatusChange = async (
    subgoalId: string,
    status: GoalStatus
  ) => {
    try {
      await goalsApi.updateSubGoalStatus(subgoalId, status);
      await loadGoal(); // Refresh the goal data
    } catch (error) {
      console.error("Error updating subgoal status:", error);
    }
  };

  if (loading || isLoading) {
    return (
      <DashboardLayout activeTab="goals">
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return null;
  }

  if (error || !goal) {
    return (
      <DashboardLayout activeTab="goals">
        <div className="p-6">
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {error || "Goal not found"}
            </h3>
            <Button onClick={() => router.push("/dashboard/goals")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Goals
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const statusBadge = getStatusBadge(goal.status);
  const completedSubgoals =
    goal.subgoals?.filter((sg) => sg.status === "completed").length || 0;
  const totalSubgoals = goal.subgoals?.length || 0;
  const overallProgress =
    totalSubgoals > 0
      ? Math.round((completedSubgoals / totalSubgoals) * 100)
      : 0;

  return (
    <DashboardLayout activeTab="goals">
      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard/goals")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Goals
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Edit3 className="w-4 h-4 mr-2" />
              Edit Goal
            </Button>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Goal Overview */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                    <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                      {goal.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={statusBadge.color}>
                        {getStatusIcon(goal.status)}
                        <span className="ml-1">{statusBadge.text}</span>
                      </Badge>
                      <Badge variant="outline">
                        {goal.goal_type === "team" ? (
                          <>
                            <Users className="w-3 h-3 mr-1" />
                            Team Goal
                          </>
                        ) : (
                          <>
                            <Target className="w-3 h-3 mr-1" />
                            Individual Goal
                          </>
                        )}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Description */}
            {goal.description && (
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  Description
                </h4>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {goal.description}
                </p>
              </div>
            )}

            {/* Progress */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Overall Progress
                </h4>
                <span className="text-2xl font-bold text-blue-600">
                  {overallProgress}%
                </span>
              </div>
              <Progress value={overallProgress} className="h-3" />
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>
                  {completedSubgoals} of {totalSubgoals} sub-goals completed
                </span>
                <span>
                  {goal.subgoals?.reduce(
                    (acc, sg) => acc + (sg.tasks?.length || 0),
                    0
                  ) || 0}{" "}
                  total tasks
                </span>
              </div>
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>Deadline</span>
                </div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {goal.deadline
                    ? format(new Date(goal.deadline), "MMM dd, yyyy")
                    : "No deadline set"}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>Created</span>
                </div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {format(new Date(goal.created_at), "MMM dd, yyyy")}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>Last Updated</span>
                </div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {format(new Date(goal.updated_at), "MMM dd, yyyy")}
                </p>
              </div>
            </div>

            {/* Tags */}
            {goal.tags && goal.tags.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Tag className="w-4 h-4" />
                  <span>Tags</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {goal.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sub-goals */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Sub-goals ({goal.subgoals?.length || 0})
          </h3>

          {goal.subgoals && goal.subgoals.length > 0 ? (
            <Accordion type="multiple" className="space-y-4">
              {goal.subgoals.map((subgoal, index) => {
                const subgoalStatusBadge = getStatusBadge(subgoal.status);
                const completedTasks =
                  subgoal.tasks?.filter((task) => task.status === "completed")
                    .length || 0;
                const totalTasks = subgoal.tasks?.length || 0;
                const subgoalProgress =
                  totalTasks > 0
                    ? Math.round((completedTasks / totalTasks) * 100)
                    : 0;

                return (
                  <AccordionItem
                    key={subgoal.id}
                    value={subgoal.id}
                    className="border-0"
                  >
                    <Card className="border-l-4 border-l-emerald-500">
                      <AccordionTrigger className="hover:no-underline p-0">
                        <CardHeader className="w-full">
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900">
                                <Target className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                              </div>
                              <div className="text-left">
                                <CardTitle className="text-lg font-semibold">
                                  {subgoal.title}
                                </CardTitle>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge className={subgoalStatusBadge.color}>
                                    {getStatusIcon(subgoal.status)}
                                    <span className="ml-1">
                                      {subgoalStatusBadge.text}
                                    </span>
                                  </Badge>
                                  <span className="text-sm text-gray-500">
                                    {completedTasks}/{totalTasks} tasks
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right mr-4">
                              <div className="text-lg font-bold text-emerald-600">
                                {subgoalProgress}%
                              </div>
                              <Progress
                                value={subgoalProgress}
                                className="w-20 h-2"
                              />
                            </div>
                          </div>
                        </CardHeader>
                      </AccordionTrigger>

                      <AccordionContent className="p-0">
                        <CardContent className="pt-0">
                          {/* Sub-goal Description */}
                          {subgoal.description && (
                            <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <p className="text-gray-600 dark:text-gray-400">
                                {subgoal.description}
                              </p>
                            </div>
                          )}

                          {/* Tasks */}
                          <div className="space-y-3">
                            <h5 className="font-medium text-gray-900 dark:text-white">
                              Tasks ({subgoal.tasks?.length || 0})
                            </h5>

                            {subgoal.tasks && subgoal.tasks.length > 0 ? (
                              <div className="space-y-3">
                                {subgoal.tasks.map((task) => {
                                  const taskStatusBadge = getStatusBadge(
                                    task.status
                                  );
                                  const priorityBadge = getPriorityBadge(
                                    task.priority || "medium"
                                  );

                                  return (
                                    <Card
                                      key={task.id}
                                      className="border border-gray-200 dark:border-gray-700"
                                    >
                                      <CardContent className="p-4">
                                        <div className="flex items-start gap-3">
                                          <Checkbox
                                            checked={
                                              task.status === "completed"
                                            }
                                            onCheckedChange={(checked) =>
                                              handleTaskStatusChange(
                                                task.id,
                                                checked as boolean
                                              )
                                            }
                                            className="mt-1"
                                          />

                                          <div className="flex-1 space-y-2">
                                            <div className="flex items-start justify-between">
                                              <h6 className="font-medium text-gray-900 dark:text-white">
                                                {task.title}
                                              </h6>
                                              <div className="flex items-center gap-2 ml-4">
                                                <Badge
                                                  className={
                                                    taskStatusBadge.color
                                                  }
                                                >
                                                  {taskStatusBadge.text}
                                                </Badge>
                                                <Badge
                                                  variant="outline"
                                                  className={
                                                    priorityBadge.color
                                                  }
                                                >
                                                  <Flag className="w-3 h-3 mr-1" />
                                                  {priorityBadge.text}
                                                </Badge>
                                              </div>
                                            </div>

                                            {task.description && (
                                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {task.description}
                                              </p>
                                            )}

                                            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                              <div className="flex items-center gap-4">
                                                {task.due_date && (
                                                  <div className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    Due{" "}
                                                    {format(
                                                      new Date(task.due_date),
                                                      "MMM dd"
                                                    )}
                                                  </div>
                                                )}
                                                <div className="flex items-center gap-1">
                                                  <Clock className="w-3 h-3" />
                                                  Created{" "}
                                                  {format(
                                                    new Date(task.created_at),
                                                    "MMM dd"
                                                  )}
                                                </div>
                                              </div>

                                              {task.assignee && (
                                                <div className="flex items-center gap-2">
                                                  <Avatar className="w-5 h-5">
                                                    <AvatarFallback className="text-xs">
                                                      {task.assignee
                                                        .full_name?.[0] ||
                                                        task.assignee.email[0]}
                                                    </AvatarFallback>
                                                  </Avatar>
                                                  <span>
                                                    {task.assignee.full_name ||
                                                      task.assignee.email}
                                                  </span>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                                <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p>No tasks in this sub-goal yet.</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </AccordionContent>
                    </Card>
                  </AccordionItem>
                );
              })}
            </Accordion>
          ) : (
            <Card className="p-8 text-center">
              <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No sub-goals yet
              </h4>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Break down this goal into smaller, manageable sub-goals to track
                progress effectively.
              </p>
              <Button>
                <Target className="w-4 h-4 mr-2" />
                Add Sub-goal
              </Button>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

"use client";

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useAppSelector } from "@/lib/redux/hooks";
import { Goal, GoalStatus } from "@/lib/types";

// Define TypeScript interfaces for chart data
interface WeeklyDataItem {
  week: string;
  completed: number;
  inProgress: number;
  atRisk: number;
}

interface DepartmentDataItem {
  department: string;
  progress: number;
  goals: number;
}

interface StatusDataItem {
  name: string;
  value: number;
  color: string;
}

interface DepartmentGroup {
  goals: Goal[];
  progress: number;
}

type DepartmentGroups = Record<string, DepartmentGroup>;

// Default colors for charts
const COLORS = ["#10B981", "#3B82F6", "#F59E0B", "#6B7280"];

// Status color mapping
const STATUS_COLORS: Record<string, string> = {
  completed: "#10B981",
  in_progress: "#3B82F6",
  at_risk: "#F59E0B",
  not_started: "#6B7280",
};

// Department tags mapping (for grouping goals by team/department)
const DEPARTMENT_TAGS: Record<string, string> = {
  sales: "Sales",
  marketing: "Marketing",
  product: "Product",
  support: "Support",
  engineering: "Engineering",
  default: "Other",
};

export function ProgressChart() {
  // Get goals data from Redux store
  const { items: goals, status } = useAppSelector((state) => state.goals);

  // Generate weekly data from goals
  const generateWeeklyData = (): WeeklyDataItem[] => {
    if (!goals || goals.length === 0) {
      return [
        { week: "W1", completed: 0, inProgress: 0, atRisk: 0 },
        { week: "W2", completed: 0, inProgress: 0, atRisk: 0 },
        { week: "W3", completed: 0, inProgress: 0, atRisk: 0 },
        { week: "W4", completed: 0, inProgress: 0, atRisk: 0 },
        { week: "W5", completed: 0, inProgress: 0, atRisk: 0 },
        { week: "W6", completed: 0, inProgress: 0, atRisk: 0 },
      ];
    }

    // Group goals by week (simplified for demo - using fixed weeks)
    // In a real app, you would calculate actual weeks from goal dates
    const weeks = ["W1", "W2", "W3", "W4", "W5", "W6"];

    // Distribute goals across weeks based on creation date
    // This is a simplified approach - in a real app, you'd use actual date logic
    const weeklyData = weeks.map((week, index) => {
      // Filter goals that might belong to this week based on index
      const weekGoals = goals.filter((_, i) => i % weeks.length === index);

      return {
        week,
        completed: weekGoals.filter((g) => g.status === "completed").length,
        inProgress: weekGoals.filter((g) => g.status === "in_progress").length,
        atRisk: weekGoals.filter((g) => g.status === "at_risk").length,
      };
    });

    return weeklyData;
  };

  // Generate department data from goals
  const generateDepartmentData = (): DepartmentDataItem[] => {
    if (!goals || goals.length === 0) {
      return Object.values(DEPARTMENT_TAGS).map((dept) => ({
        department: dept,
        progress: 0,
        goals: 0,
      }));
    }

    // Group goals by department/team based on tags
    const departments: DepartmentGroups = {};

    // Initialize departments
    Object.entries(DEPARTMENT_TAGS).forEach(([key, value]) => {
      departments[value] = { goals: [], progress: 0 };
    });

    // Assign goals to departments based on tags
    goals.forEach((goal) => {
      let assigned = false;

      if (goal.tags && goal.tags.length > 0) {
        for (const tag of goal.tags) {
          const lowerTag = tag.toLowerCase();
          for (const [key, dept] of Object.entries(DEPARTMENT_TAGS)) {
            if (lowerTag.includes(key)) {
              departments[dept].goals.push(goal);
              assigned = true;
              break;
            }
          }
          if (assigned) break;
        }
      }

      // If not assigned to any department, put in 'Other'
      if (!assigned) {
        departments[DEPARTMENT_TAGS.default].goals.push(goal);
      }
    });

    // Calculate progress for each department
    return Object.entries(departments)
      .map(([dept, data]) => {
        const deptGoals = data.goals;
        let progress = 0;

        if (deptGoals.length > 0) {
          const completedGoals = deptGoals.filter(
            (g) => g.status === "completed"
          ).length;
          const onTrackGoals = deptGoals.filter(
            (g) => g.status === "in_progress"
          ).length;

          // Calculate weighted progress
          progress = Math.round(
            (completedGoals * 100 + onTrackGoals * 70) / deptGoals.length
          );
        }

        return {
          department: dept,
          progress: progress,
          goals: deptGoals.length,
        };
      })
      .filter((dept) => dept.goals > 0); // Only show departments with goals
  };

  // Generate status distribution data
  const generateStatusData = (): StatusDataItem[] => {
    if (!goals || goals.length === 0) {
      return [
        { name: "Completed", value: 0, color: STATUS_COLORS.completed },
        { name: "On Track", value: 0, color: STATUS_COLORS.in_progress },
        { name: "At Risk", value: 0, color: STATUS_COLORS.at_risk },
        { name: "Not Started", value: 0, color: STATUS_COLORS.not_started },
      ];
    }

    // Count goals by status
    const completed = goals.filter((g) => g.status === "completed").length;
    const onTrack = goals.filter((g) => g.status === "in_progress").length;
    const atRisk = goals.filter((g) => g.status === "at_risk").length;
    const notStarted = goals.filter((g) => g.status === "not_started").length;

    return [
      { name: "Completed", value: completed, color: STATUS_COLORS.completed },
      { name: "On Track", value: onTrack, color: STATUS_COLORS.in_progress },
      { name: "At Risk", value: atRisk, color: STATUS_COLORS.at_risk },
      {
        name: "Not Started",
        value: notStarted,
        color: STATUS_COLORS.not_started,
      },
    ].filter((item) => item.value > 0); // Only show statuses with values
  };

  // Generate the data for charts
  const weeklyData = generateWeeklyData();
  const departmentData = generateDepartmentData();
  const statusData = generateStatusData();
  // Show loading state when goals are being fetched
  if (status === "loading") {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="lg:col-span-2">
          <CardContent className="flex items-center justify-center py-10">
            <p className="text-gray-600 dark:text-gray-400">
              Loading chart data...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Weekly Progress Trends */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Weekly Progress Trends
            <div className="flex gap-2">
              <Badge
                variant="outline"
                className="text-emerald-600 border-emerald-200"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />
                Completed
              </Badge>
              <Badge
                variant="outline"
                className="text-blue-600 border-blue-200"
              >
                <div className="w-2 h-2 rounded-full bg-blue-500 mr-2" />
                In Progress
              </Badge>
              <Badge
                variant="outline"
                className="text-orange-600 border-orange-200"
              >
                <div className="w-2 h-2 rounded-full bg-orange-500 mr-2" />
                At Risk
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {weeklyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis
                  dataKey="week"
                  className="text-sm"
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis className="text-sm" tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "none",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="completed"
                  stackId="1"
                  stroke="#10B981"
                  fill="#10B981"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="inProgress"
                  stackId="1"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="atRisk"
                  stackId="1"
                  stroke="#F59E0B"
                  fill="#F59E0B"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px]">
              <p className="text-gray-600 dark:text-gray-400">
                No weekly data available
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Department Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Department Performance</CardTitle>
        </CardHeader>
        <CardContent>
          {departmentData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis
                  dataKey="department"
                  className="text-sm"
                  tickLine={false}
                  axisLine={false}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis className="text-sm" tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "none",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <Bar
                  dataKey="progress"
                  fill="#3B82F6"
                  radius={[4, 4, 0, 0]}
                  name="Progress %"
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px]">
              <p className="text-gray-600 dark:text-gray-400">
                No department data available
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Goal Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Goal Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "none",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px]">
              <p className="text-gray-600 dark:text-gray-400">
                No status data available
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

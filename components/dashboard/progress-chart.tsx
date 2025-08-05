'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
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
  Cell
} from 'recharts';

const weeklyData = [
  { week: 'W1', completed: 12, inProgress: 8, atRisk: 2 },
  { week: 'W2', completed: 18, inProgress: 12, atRisk: 3 },
  { week: 'W3', completed: 25, inProgress: 15, atRisk: 1 },
  { week: 'W4', completed: 32, inProgress: 18, atRisk: 2 },
  { week: 'W5', completed: 28, inProgress: 22, atRisk: 4 },
  { week: 'W6', completed: 35, inProgress: 16, atRisk: 2 },
];

const departmentData = [
  { department: 'Sales', progress: 85, goals: 8 },
  { department: 'Marketing', progress: 72, goals: 12 },
  { department: 'Product', progress: 91, goals: 6 },
  { department: 'Support', progress: 68, goals: 4 },
  { department: 'Engineering', progress: 79, goals: 10 },
];

const statusData = [
  { name: 'Completed', value: 35, color: '#10B981' },
  { name: 'On Track', value: 28, color: '#3B82F6' },
  { name: 'At Risk', value: 8, color: '#F59E0B' },
  { name: 'Not Started', value: 4, color: '#6B7280' },
];

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#6B7280'];

export function ProgressChart() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Weekly Progress Trends */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Weekly Progress Trends
            <div className="flex gap-2">
              <Badge variant="outline" className="text-emerald-600 border-emerald-200">
                <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />
                Completed
              </Badge>
              <Badge variant="outline" className="text-blue-600 border-blue-200">
                <div className="w-2 h-2 rounded-full bg-blue-500 mr-2" />
                In Progress
              </Badge>
              <Badge variant="outline" className="text-orange-600 border-orange-200">
                <div className="w-2 h-2 rounded-full bg-orange-500 mr-2" />
                At Risk
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="week" 
                className="text-sm"
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                className="text-sm"
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
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
        </CardContent>
      </Card>

      {/* Department Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Department Performance</CardTitle>
        </CardHeader>
        <CardContent>
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
              <YAxis 
                className="text-sm"
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
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
        </CardContent>
      </Card>

      {/* Goal Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Goal Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
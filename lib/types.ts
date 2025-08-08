export type GoalType = "individual" | "team";
export type GoalStatus = "not_started" | "on_track" | "at_risk" | "completed";

export interface Goal {
  id: string;
  title: string;
  description?: string;
  goal_type: GoalType;
  status: GoalStatus;
  deadline?: string;
  tags: string[];
  created_by: string;
  team_id?: string;
  created_at: string;
  updated_at: string;
  subgoals?: SubGoal[];
}

export interface SubGoal {
  id: string;
  goal_id: string;
  title: string;
  description?: string;
  assigned_to?: string;
  status: GoalStatus;
  created_at: string;
  updated_at: string;
  tasks?: Task[];
  assignee?: {
    id: string;
    full_name: string;
    email: string;
  };
}

export interface Task {
  priority: string;
  id: string;
  subgoal_id: string;
  title: string;
  description?: string;
  assigned_to?: string;
  status: GoalStatus;
  due_date?: string;
  created_at: string;
  updated_at: string;
  assignee?: {
    id: string;
    full_name: string;
    email: string;
  };
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
  team_members?: TeamMember[];
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: string;
  joined_at: string;
  user?: {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
  };
}

export interface AIGoalSuggestion {
  title: string;
  description: string;
  subgoals: {
    title: string;
    description: string;
    tasks: {
      title: string;
      description: string;
      estimated_duration?: string;
    }[];
  }[];
  suggestedTags: string[];
  suggestedDeadline: string;
}

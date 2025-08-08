import { supabase } from "@/lib/supabase";
import type {
  Goal,
  SubGoal,
  Task,
  GoalType,
  GoalStatus,
  Team,
  WeeklySummary,
} from "@/lib/types";

export const goalsApi = {
  // Create a new goal with subgoals and tasks
  async createGoal(goalData: {
    title: string;
    description?: string;
    goal_type: GoalType;
    deadline?: string;
    tags: string[];
    team_id?: string;
    subgoals: {
      title: string;
      description?: string;
      assigned_to?: string;
      tasks: {
        title: string;
        description?: string;
        assigned_to?: string;
        due_date?: string;
      }[];
    }[];
  }) {
    console.log("goalData", goalData);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    // Create the main goal
    const { data: goal, error: goalError } = await supabase
      .from("goals")
      .insert({
        title: goalData.title,
        description: goalData.description,
        goal_type: goalData.goal_type,
        deadline: goalData.deadline,
        tags: goalData.tags,
        team_id: goalData.team_id,
        created_by: user.id,
      })
      .select()
      .single();

    if (goalError) throw goalError;

    // Create subgoals
    const subgoalsToInsert = goalData.subgoals.map((subgoal) => ({
      goal_id: goal.id,
      title: subgoal.title,
      description: subgoal.description,
      status: "not_started", // Set default status for new subgoals
      assigned_to:
        subgoal.assigned_to ||
        (goalData.goal_type === "individual" ? user.id : null),
    }));

    const { data: subgoals, error: subgoalsError } = await supabase
      .from("subgoals")
      .insert(subgoalsToInsert)
      .select();

    if (subgoalsError) throw subgoalsError;

    // Create tasks
    const tasksToInsert = [];
    for (let i = 0; i < goalData.subgoals.length; i++) {
      const subgoal = subgoals[i];
      const subgoalData = goalData.subgoals[i];

      for (const task of subgoalData.tasks) {
        tasksToInsert.push({
          subgoal_id: subgoal.id,
          title: task.title,
          description: task.description,
          status: "not_started", // Set default status for new tasks
          assigned_to:
            task.assigned_to ||
            (goalData.goal_type === "individual" ? user.id : null),
          due_date: task.due_date,
          created_by: user.id,
        });
      }
    }

    if (tasksToInsert.length > 0) {
      const { error: tasksError } = await supabase
        .from("tasks")
        .insert(tasksToInsert);

      if (tasksError) throw tasksError;
    }

    return goal;
  },

  // Get all goals for the current user
  async getGoals() {
    const { data: goals, error } = await supabase
      .from("goals")
      .select(
        `
        *,
        subgoals (
          *,
          tasks (
            *
          )
        )
      `
      )
      .order("created_at", { ascending: false });

    if (error) throw error;
    return goals as Goal[];
  },

  // Get a specific goal with all its subgoals and tasks
  async getGoal(goalId: string) {
    const { data: goal, error } = await supabase
      .from("goals")
      .select(
        `
        *,
        subgoals (
          *,
          tasks (
            *
          )
        )
      `
      )
      .eq("id", goalId)
      .single();

    if (error) throw error;
    return goal as Goal;
  },

  // Update goal status
  async updateGoalStatus(goalId: string, status: GoalStatus) {
    const { error } = await supabase
      .from("goals")
      .update({ status })
      .eq("id", goalId);

    if (error) throw error;
  },

  // Update subgoal status
  async updateSubGoalStatus(subgoalId: string, status: GoalStatus) {
    const { error } = await supabase
      .from("subgoals")
      .update({ status })
      .eq("id", subgoalId);

    if (error) throw error;
  },

  // Update task status
  async updateTaskStatus(taskId: string, status: GoalStatus) {
    const { error } = await supabase
      .from("tasks")
      .update({ status })
      .eq("id", taskId);

    if (error) throw error;
  },

  // Update task status with comment
  async updateTaskWithComment(taskId: string, status: GoalStatus, comment: string) {
    // First get the current task to access existing comments
    const { data: task, error: fetchError } = await supabase
      .from("tasks")
      .select("comments")
      .eq("id", taskId)
      .single();
    
    if (fetchError) throw fetchError;
    
    // Prepare the comments array (append new comment to existing ones)
    const comments = task.comments ? [...task.comments, comment] : [comment];
    
    // Update the task with new status and comments
    const { error } = await supabase
      .from("tasks")
      .update({ status, comments })
      .eq("id", taskId);

    if (error) throw error;
  },

  // Delete a goal (cascades to subgoals and tasks)
  async deleteGoal(goalId: string) {
    const { error } = await supabase.from("goals").delete().eq("id", goalId);

    if (error) throw error;
  },

  // Get team members for assignment
  async getTeamMembers(teamId: string) {
    const { data: members, error } = await supabase
      .from("team_members")
      .select(
        `
        user_id,
        user:user_id (
          id,
          full_name,
          email
        )
      `
      )
      .eq("team_id", teamId);

    if (error) throw error;
    return members.map((member) => member.user).filter(Boolean);
  },

  // Get user's teams
  async getUserTeams() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data: teams, error } = await supabase
      .from("teams")
      .select("*")
      .or(`owner_id.eq.${user.id},id.in.(${await this.getUserTeamIds()})`);

    if (error) throw error;

    return teams as Team[];
  },

  // Helper function to get user's team IDs
  async getUserTeamIds() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return "";

    const { data: teamMembers } = await supabase
      .from("team_members")
      .select("team_id")
      .eq("user_id", user.id);

    return teamMembers?.map((tm) => tm.team_id).join(",") || "";
  },
  
  // Add a weekly summary to a goal
  async addWeeklySummary(goalId: string, summary: WeeklySummary) {
    // First get the current goal to access existing summaries
    const { data: goal, error: fetchError } = await supabase
      .from("goals")
      .select("weekly_summaries")
      .eq("id", goalId)
      .single();
    
    if (fetchError) throw fetchError;
    
    // Prepare the summaries array (append new summary to existing ones)
    const weeklySummaries = goal.weekly_summaries ? [...goal.weekly_summaries, summary] : [summary];
    
    // Update the goal with new summaries
    const { error } = await supabase
      .from("goals")
      .update({ weekly_summaries: weeklySummaries })
      .eq("id", goalId);

    if (error) throw error;
    
    return weeklySummaries;
  },
};

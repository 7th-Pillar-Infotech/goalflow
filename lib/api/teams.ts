import { supabase } from "@/lib/supabase";
import type { Team, TeamMember } from "@/lib/types";

export const teamsApi = {
  // Create a new team
  async createTeam(teamData: {
    name: string;
    description?: string;
    members?: { user_id: string; role: string }[];
  }) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    // Create the team
    const { data: team, error: teamError } = await supabase
      .from("teams")
      .insert({
        name: teamData.name,
        description: teamData.description,
        // Note: We don't store owner_id in teams table
        // Ownership is determined by the 'owner' role in team_members
      })
      .select()
      .single();

    if (teamError) throw teamError;

    // Add the creator as owner to team_members
    const membersToInsert = [
      {
        team_id: team.id,
        user_id: user.id,
        role: "owner",
      },
      // Add additional members if provided
      ...(teamData.members || []).map((member) => ({
        team_id: team.id,
        user_id: member.user_id,
        role: member.role,
      })),
    ];

    const { error: membersError } = await supabase
      .from("team_members")
      .insert(membersToInsert);

    if (membersError) throw membersError;

    return team;
  },

  // Get all teams for the current user
  async getTeams() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    // Get all teams the user is part of (based on team_members table)
    // First get the team IDs the user is a member of
    const teamIds = await this.getUserTeamIds();

    // If user is not in any teams, return empty array
    if (!teamIds.length) {
      return [] as Team[];
    }

    // Get the teams
    const { data: teams, error } = await supabase
      .from("teams")
      .select()
      .in("id", teamIds);

    if (error) throw error;

    // Return just the teams data without team members
    return teams as Team[];
  },

  // Get a specific team with members
  async getTeam(teamId: string) {
    // First get the team details
    const { data: team, error } = await supabase
      .from("teams")
      .select()
      .eq("id", teamId)
      .single();

    if (error) throw error;

    // Then get the team members separately
    const { data: teamMembers, error: membersError } = await supabase
      .from("team_members")
      .select("id, team_id, user_id, role, joined_at")
      .eq("team_id", teamId);

    if (membersError) throw membersError;

    // Attach the team members to the team
    team.team_members = teamMembers || [];

    // If we have team members, fetch the user profiles
    if (team && team.team_members && team.team_members.length > 0) {
      // Extract all user IDs from team members
      const userIds = team.team_members
        .map((member: TeamMember) => member.user_id)
        .filter(Boolean);

      if (userIds.length > 0) {
        // Fetch user profiles
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, email, avatar_url")
          .in("id", userIds);

        // Map profiles to team members
        if (profiles) {
          // Create a properly typed profile map
          const profileMap = new Map<string, TeamMember["user"]>();

          // Add each profile to the map with correct typing
          profiles.forEach((profile) => {
            profileMap.set(profile.id, {
              id: profile.id,
              full_name: profile.full_name,
              email: profile.email,
              avatar_url: profile.avatar_url,
            });
          });

          team.team_members.forEach((member: TeamMember) => {
            member.user = profileMap.get(member.user_id) || undefined;
          });
        }
      }
    }

    return team as Team;
  },

  // Update team information
  async updateTeam(
    teamId: string,
    updates: {
      name?: string;
      description?: string;
    }
  ) {
    const { data: team, error } = await supabase
      .from("teams")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", teamId)
      .select()
      .single();

    if (error) throw error;
    return team;
  },

  // Delete a team
  async deleteTeam(teamId: string) {
    // First check if user is the owner (has 'owner' role in team_members)
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data: membership } = await supabase
      .from("team_members")
      .select("role")
      .eq("team_id", teamId)
      .eq("user_id", user.id)
      .single();

    if (!membership || membership.role !== "owner") {
      throw new Error("Only team owners can delete teams");
    }

    // Delete team (cascade will handle team_members)
    const { error } = await supabase.from("teams").delete().eq("id", teamId);

    if (error) throw error;
  },

  // Add member to team
  async addTeamMember(teamId: string, userId: string, role: string = "member") {
    const { error } = await supabase.from("team_members").insert({
      team_id: teamId,
      user_id: userId,
      role,
    });

    if (error) throw error;
  },

  // Remove member from team
  async removeTeamMember(teamId: string, userId: string) {
    const { error } = await supabase
      .from("team_members")
      .delete()
      .eq("team_id", teamId)
      .eq("user_id", userId);

    if (error) throw error;
  },

  // Update member role
  async updateMemberRole(teamId: string, userId: string, role: string) {
    const { error } = await supabase
      .from("team_members")
      .update({ role })
      .eq("team_id", teamId)
      .eq("user_id", userId);

    if (error) throw error;
  },

  // Get team members
  async getTeamMembers(teamId: string) {
    // Get team members
    const { data: members, error } = await supabase
      .from("team_members")
      .select("id, team_id, user_id, role, joined_at")
      .eq("team_id", teamId);

    if (error) throw error;

    if (members && members.length > 0) {
      // Extract all user IDs
      const userIds = members.map((member) => member.user_id).filter(Boolean);

      if (userIds.length > 0) {
        // Fetch user profiles
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, email, avatar_url")
          .in("id", userIds);

        // Map profiles to members
        if (profiles) {
          // Create a properly typed profile map
          const profileMap = new Map<string, TeamMember["user"]>();

          // Add each profile to the map with correct typing
          profiles.forEach((profile) => {
            profileMap.set(profile.id, {
              id: profile.id,
              full_name: profile.full_name,
              email: profile.email,
              avatar_url: profile.avatar_url,
            });
          });

          // Attach user profiles to members
          members.forEach((member: TeamMember) => {
            member.user = profileMap.get(member.user_id) || undefined;
          });
        }
      }
    }

    return members as TeamMember[];
  },

  // Search users for team invitation
  async searchUsers(query: string) {
    const { data: users, error } = await supabase
      .from("profiles")
      .select("id, full_name, email, avatar_url")
      .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
      .limit(10);

    if (error) throw error;
    return users;
  },

  // Helper function to get user's team IDs
  async getUserTeamIds(): Promise<string[]> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: teamMembers } = await supabase
      .from("team_members")
      .select("team_id")
      .eq("user_id", user.id);

    return teamMembers?.map((tm) => tm.team_id) || [];
  },
};

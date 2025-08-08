"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Search,
  UserPlus,
  UserMinus,
  Crown,
  Shield,
  User,
} from "lucide-react";
import { teamsApi } from "@/lib/api/teams";
import type { Team, TeamMember } from "@/lib/types";

interface ManageMembersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  team: Team | null;
  onMembersUpdated: () => void;
}

export function ManageMembersModal({
  open,
  onOpenChange,
  team,
  onMembersUpdated,
}: ManageMembersModalProps) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (team && open) {
      loadMembers();
    }
  }, [team, open]);

  const loadMembers = async () => {
    if (!team) return;

    setIsLoading(true);
    try {
      const teamMembers = await teamsApi.getTeamMembers(team.id);
      setMembers(teamMembers);
    } catch (error) {
      console.error("Error loading members:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const users = await teamsApi.searchUsers(query);
      // Filter out existing members
      const existingMemberIds = members.map((m) => m.user_id);
      const filteredUsers = users.filter(
        (u) => !existingMemberIds.includes(u.id)
      );
      setSearchResults(filteredUsers);
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddMember = async (user: any) => {
    if (!team) return;

    try {
      await teamsApi.addTeamMember(team.id, user.id, "member");
      await loadMembers();
      onMembersUpdated();
      setSearchQuery("");
      setSearchResults([]);
    } catch (error) {
      console.error("Error adding member:", error);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!team) return;

    try {
      await teamsApi.removeTeamMember(team.id, userId);
      await loadMembers();
      onMembersUpdated();
    } catch (error) {
      console.error("Error removing member:", error);
    }
  };

  const handleUpdateRole = async (userId: string, role: string) => {
    if (!team) return;

    try {
      await teamsApi.updateMemberRole(team.id, userId, role);
      await loadMembers();
      onMembersUpdated();
    } catch (error) {
      console.error("Error updating role:", error);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Crown className="w-4 h-4 text-yellow-600" />;
      case "admin":
        return <Shield className="w-4 h-4 text-blue-600" />;
      default:
        return <User className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRoleBadge = (role: string) => {
    const config = {
      owner: { variant: "default" as const, text: "Owner" },
      admin: { variant: "secondary" as const, text: "Admin" },
      member: { variant: "outline" as const, text: "Member" },
    };
    return config[role as keyof typeof config] || config.member;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Manage Team Members
          </DialogTitle>
          <DialogDescription>
            Add or remove team members and manage their roles.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add New Members */}
          <div className="space-y-4">
            <h4 className="font-medium">Add New Members</h4>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search users by name or email..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  handleSearchUsers(e.target.value);
                }}
                className="pl-10"
              />
              {isSearching && (
                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin" />
              )}
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="border rounded-lg max-h-40 overflow-y-auto">
                {searchResults.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={user.avatar_url} />
                        <AvatarFallback>
                          {user.full_name?.[0] || user.email[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {user.full_name || "Unknown"}
                        </p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => handleAddMember(user)}>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Add
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Current Members */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Current Members</h4>
              <Badge variant="outline">{members.length} members</Badge>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : (
              <div className="space-y-2">
                {members.map((member) => {
                  const roleBadge = getRoleBadge(member.role);
                  const isOwner = member.role === "owner";

                  return (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={member.user?.avatar_url} />
                          <AvatarFallback>
                            {member.user?.full_name?.[0] ||
                              member.user?.email[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">
                              {member.user?.full_name || "Unknown"}
                            </p>
                            {getRoleIcon(member.role)}
                          </div>
                          <p className="text-sm text-gray-500">
                            {member.user?.email}
                          </p>
                          <p className="text-xs text-gray-400">
                            Joined{" "}
                            {new Date(member.joined_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {!isOwner && (
                          <Select
                            value={member.role}
                            onValueChange={(role) =>
                              handleUpdateRole(member.user_id, role)
                            }
                          >
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="member">Member</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        )}

                        <Badge variant={roleBadge.variant}>
                          {roleBadge.text}
                        </Badge>

                        {!isOwner && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveMember(member.user_id)}
                          >
                            <UserMinus className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={() => onOpenChange(false)}>Done</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

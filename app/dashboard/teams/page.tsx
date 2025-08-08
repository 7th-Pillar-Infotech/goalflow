"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { CreateTeamModal } from "@/components/teams/create-team-modal";
import { EditTeamModal } from "@/components/teams/edit-team-modal";
import { ManageMembersModal } from "@/components/teams/manage-members-modal";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Plus,
  Users,
  Settings,
  MoreHorizontal,
  Target,
  TrendingUp,
  Edit3,
  UserPlus,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/use-auth";
import { teamsApi } from "@/lib/api/teams";
import type { Team } from "@/lib/types";
import { useState } from "react";

export default function TeamsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [showEditTeam, setShowEditTeam] = useState(false);
  const [showManageMembers, setShowManageMembers] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth");
    } else if (user) {
      loadTeams();
    }
  }, [user, loading, router]);

  const loadTeams = async () => {
    try {
      setIsLoading(true);
      debugger;
      const userTeams = await teamsApi.getTeams();
      debugger;
      setTeams(userTeams);
    } catch (error) {
      console.error("Error loading teams:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditTeam = (team: Team) => {
    setSelectedTeam(team);
    setShowEditTeam(true);
  };

  const handleManageMembers = (team: Team) => {
    setSelectedTeam(team);
    setShowManageMembers(true);
  };

  const handleDeleteTeam = (team: Team) => {
    setSelectedTeam(team);
    setShowDeleteDialog(true);
  };

  const confirmDeleteTeam = async () => {
    if (!selectedTeam) return;

    try {
      await teamsApi.deleteTeam(selectedTeam.id);
      await loadTeams();
      setShowDeleteDialog(false);
      setSelectedTeam(null);
    } catch (error) {
      console.error("Error deleting team:", error);
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

  // Calculate team stats
  const totalTeams = teams.length;
  // Since we're not fetching team members data anymore
  const totalMembers = 0;
  const avgMembersPerTeam = 0;

  return (
    <DashboardLayout activeTab="teams">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Teams
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage team goals and track collaborative progress.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button size="sm" onClick={() => setShowCreateTeam(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Team
            </Button>
          </div>
        </div>

        {/* Team Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total Teams
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {totalTeams}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total Members
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {totalMembers}
                  </p>
                </div>
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
                  <Users className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Avg Team Size
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {avgMembersPerTeam}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <Users className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Teams Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {teams.map((team) => {
              // Since we're not fetching team members data anymore
              const memberCount = 0;
              // We can't determine ownership from team_members since we're not fetching that data
              // For now, let's assume the user can manage all teams they can see
              const isOwner = true;

              return (
                <Card
                  key={team.id}
                  className="hover:shadow-lg transition-shadow duration-200"
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                          <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                            {team.name}
                          </CardTitle>
                          <CardDescription>{team.description}</CardDescription>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleManageMembers(team)}
                          >
                            <UserPlus className="w-4 h-4 mr-2" />
                            Manage Members
                          </DropdownMenuItem>
                          {isOwner && (
                            <>
                              <DropdownMenuItem
                                onClick={() => handleEditTeam(team)}
                              >
                                <Edit3 className="w-4 h-4 mr-2" />
                                Edit Team
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDeleteTeam(team)}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Team
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Team Members */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Team Members
                      </p>
                      <div className="text-sm text-gray-500">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleManageMembers(team)}
                        >
                          <UserPlus className="w-4 h-4 mr-2" />
                          Manage Members
                        </Button>
                      </div>
                    </div>

                    {/* Team Info */}
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                      <span>
                        Created {new Date(team.created_at).toLocaleDateString()}
                      </span>
                      {isOwner && <Badge variant="outline">Owner</Badge>}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && teams.length === 0 && (
          <Card className="p-12 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No teams yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create your first team to start collaborating on goals and
              projects.
            </p>
            <Button onClick={() => setShowCreateTeam(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Team
            </Button>
          </Card>
        )}

        {/* Modals */}
        <CreateTeamModal
          open={showCreateTeam}
          onOpenChange={setShowCreateTeam}
          onTeamCreated={loadTeams}
        />

        <EditTeamModal
          open={showEditTeam}
          onOpenChange={setShowEditTeam}
          onTeamUpdated={loadTeams}
          team={selectedTeam}
        />

        <ManageMembersModal
          open={showManageMembers}
          onOpenChange={setShowManageMembers}
          team={selectedTeam}
          onMembersUpdated={loadTeams}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Team</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{selectedTeam?.name}"? This
                action cannot be undone. All team members will be removed and
                any team goals may be affected.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDeleteTeam}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete Team
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}

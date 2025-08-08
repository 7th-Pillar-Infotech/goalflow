"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Loader2,
  Sparkles,
  Plus,
  X,
  Target,
  Users,
  Calendar,
  Tag,
  Trash2,
  Edit3,
} from "lucide-react";
import { aiApi } from "@/lib/api/ai";
import { goalsApi } from "@/lib/api/goals";
import type { AIGoalSuggestion, GoalType, Team } from "@/lib/types";
import { useAuth } from "@/hooks/use-auth";

const createGoalSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  goal_type: z.enum(["individual", "team"]),
  deadline: z.string().optional(),
  team_id: z.string().optional(),
});

interface CreateGoalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGoalCreated: () => void;
}

interface SubGoalData {
  title: string;
  description: string;
  assigned_to?: string;
  tasks: TaskData[];
}

interface TaskData {
  title: string;
  description: string;
  assigned_to?: string;
  due_date?: string;
  estimated_duration?: string;
}

export function CreateGoalModal({
  open,
  onOpenChange,
  onGoalCreated,
}: CreateGoalModalProps) {
  const { user } = useAuth();
  const [step, setStep] = useState<"input" | "ai-generation" | "editing">(
    "input"
  );
  const [userInput, setUserInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<AIGoalSuggestion | null>(
    null
  );
  const [subgoals, setSubgoals] = useState<SubGoalData[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const form = useForm<z.infer<typeof createGoalSchema>>({
    resolver: zodResolver(createGoalSchema),
    defaultValues: {
      goal_type: "individual",
    },
  });

  const watchGoalType = form.watch("goal_type");
  const watchTeamId = form.watch("team_id");

  // Load teams when modal opens
  useEffect(() => {
    if (open) {
      loadTeams();
    }
  }, [open]);

  const loadTeams = async () => {
    try {
      const userTeams = await goalsApi.getUserTeams();
      // Properly map the returned data to match the Team interface
      setTeams(userTeams);
    } catch (error) {
      console.error("Error loading teams:", error);
    }
  };

  // Load team members when team is selected
  useEffect(() => {
    if (watchTeamId) {
      loadTeamMembers(watchTeamId);
    }
  }, [watchTeamId]);

  const loadTeamMembers = async (teamId: string) => {
    try {
      const members = await goalsApi.getTeamMembers(teamId);
      setTeamMembers(members);
    } catch (error) {
      console.error("Error loading team members:", error);
    }
  };

  const handleGenerateGoal = async () => {
    if (!userInput.trim()) return;

    setIsGenerating(true);
    try {
      const suggestion = await aiApi.generateGoalSuggestion(userInput);
      setAiSuggestion(suggestion);
      console.log("suggestion", suggestion);

      // Populate form with AI suggestion
      form.setValue("title", suggestion.title);
      form.setValue("description", suggestion.description);
      form.setValue("deadline", suggestion.suggestedDeadline);

      // Map the subgoals and ensure estimated_duration is properly handled
      const mappedSubgoals = suggestion.subgoals.map(subgoal => ({
        ...subgoal,
        tasks: subgoal.tasks.map(task => ({
          ...task,
          // Ensure estimated_duration is a string (for the number input)
          estimated_duration: task.estimated_duration?.toString() || ""
        }))
      }));
      setSubgoals(mappedSubgoals);
      setTags(suggestion.suggestedTags);
      setStep("editing");
    } catch (error) {
      console.error("Error generating goal:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleAddSubgoal = () => {
    setSubgoals([
      ...subgoals,
      {
        title: "",
        description: "",
        tasks: [],
      },
    ]);
  };

  const handleUpdateSubgoal = (
    index: number,
    field: keyof SubGoalData,
    value: any
  ) => {
    const updated = [...subgoals];
    updated[index] = { ...updated[index], [field]: value };
    setSubgoals(updated);
  };

  const handleRemoveSubgoal = (index: number) => {
    setSubgoals(subgoals.filter((_, i) => i !== index));
  };

  const handleAddTask = (subgoalIndex: number) => {
    const updated = [...subgoals];
    updated[subgoalIndex].tasks.push({
      title: "",
      description: "",
    });
    setSubgoals(updated);
  };

  const handleUpdateTask = (
    subgoalIndex: number,
    taskIndex: number,
    field: keyof TaskData,
    value: any
  ) => {
    const updated = [...subgoals];
    updated[subgoalIndex].tasks[taskIndex] = {
      ...updated[subgoalIndex].tasks[taskIndex],
      [field]: value,
    };
    setSubgoals(updated);
  };

  const handleRemoveTask = (subgoalIndex: number, taskIndex: number) => {
    const updated = [...subgoals];
    updated[subgoalIndex].tasks = updated[subgoalIndex].tasks.filter(
      (_, i) => i !== taskIndex
    );
    setSubgoals(updated);
  };

  const handleCreateGoal = async (data: z.infer<typeof createGoalSchema>) => {
    debugger;
    setIsCreating(true);
    try {
      console.log("data", data);
      console.log("subgoals", subgoals);
      console.log("tags", tags);
      await goalsApi.createGoal({
        ...data,
        tags,
        subgoals: subgoals.filter((sg) => sg.title.trim()),
      });

      onGoalCreated();
      handleClose();
    } catch (error) {
      console.error("Error creating goal:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setStep("input");
    setUserInput("");
    setAiSuggestion(null);
    setSubgoals([]);
    setTags([]);
    setNewTag("");
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Create New Goal
          </DialogTitle>
          <DialogDescription>
            {step === "input" &&
              "Describe your goal and let AI help you structure it"}
            {step === "ai-generation" &&
              "AI is generating your goal structure..."}
            {step === "editing" && "Review and customize your goal"}
          </DialogDescription>
        </DialogHeader>

        {step === "input" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">What is your goal?</label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., Increase sales revenue, Launch new product feature, Improve team productivity..."
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleGenerateGoal()}
                />
                <Button
                  onClick={handleGenerateGoal}
                  disabled={!userInput.trim() || isGenerating}
                >
                  {isGenerating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  Generate Goal
                </Button>
              </div>
            </div>

            <div className="text-center text-sm text-gray-500">
              Or{" "}
              <Button
                variant="link"
                className="p-0 h-auto"
                onClick={() => setStep("editing")}
              >
                create manually
              </Button>
            </div>
          </div>
        )}

        {step === "ai-generation" && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin mx-auto" />
              <p>AI is generating your goal structure...</p>
            </div>
          </div>
        )}

        {step === "editing" && (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleCreateGoal)}
              className="space-y-6"
            >
              {/* Goal Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Goal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Goal Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter goal title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your goal in detail"
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="goal_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Goal Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select goal type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="individual">
                                <div className="flex items-center gap-2">
                                  <Target className="w-4 h-4" />
                                  Individual Goal
                                </div>
                              </SelectItem>
                              <SelectItem value="team">
                                <div className="flex items-center gap-2">
                                  <Users className="w-4 h-4" />
                                  Team Goal
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="deadline"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Deadline</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {watchGoalType === "team" && (
                    <FormField
                      control={form.control}
                      name="team_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Team</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select team" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {teams.map((team) => (
                                <SelectItem key={team.id} value={team.id}>
                                  {team.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {/* Tags */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tags</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="gap-1">
                          <Tag className="w-3 h-3" />
                          {tag}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 ml-1"
                            onClick={() => handleRemoveTag(tag)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add tag"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" &&
                          (e.preventDefault(), handleAddTag())
                        }
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleAddTag}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Subgoals */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Sub-goals & Tasks</CardTitle>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddSubgoal}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Sub-goal
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {subgoals.map((subgoal, subgoalIndex) => (
                    <Card
                      key={subgoalIndex}
                      className="border-l-4 border-l-blue-500"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">
                            Sub-goal {subgoalIndex + 1}
                          </CardTitle>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveSubgoal(subgoalIndex)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Title</label>
                            <Input
                              placeholder="Sub-goal title"
                              value={subgoal.title}
                              onChange={(e) =>
                                handleUpdateSubgoal(
                                  subgoalIndex,
                                  "title",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                          {watchGoalType === "team" &&
                            teamMembers.length > 0 && (
                              <div className="space-y-2">
                                <label className="text-sm font-medium">
                                  Assigned To
                                </label>
                                <Select
                                  value={subgoal.assigned_to || ""}
                                  onValueChange={(value) =>
                                    handleUpdateSubgoal(
                                      subgoalIndex,
                                      "assigned_to",
                                      value
                                    )
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select assignee" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {teamMembers.map((member) => (
                                      <SelectItem
                                        key={member.id}
                                        value={member.id}
                                      >
                                        <div className="flex items-center gap-2">
                                          <Avatar className="w-5 h-5">
                                            <AvatarFallback className="text-xs">
                                              {member.full_name?.[0] ||
                                                member.email[0]}
                                            </AvatarFallback>
                                          </Avatar>
                                          {member.full_name || member.email}
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Description
                          </label>
                          <Textarea
                            placeholder="Sub-goal description"
                            rows={2}
                            value={subgoal.description}
                            onChange={(e) =>
                              handleUpdateSubgoal(
                                subgoalIndex,
                                "description",
                                e.target.value
                              )
                            }
                          />
                        </div>

                        {/* Tasks */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-medium">Tasks</label>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleAddTask(subgoalIndex)}
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Add Task
                            </Button>
                          </div>

                          {subgoal.tasks.map((task, taskIndex) => (
                            <div
                              key={taskIndex}
                              className="border rounded-lg p-3 space-y-3"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">
                                  Task {taskIndex + 1}
                                </span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleRemoveTask(subgoalIndex, taskIndex)
                                  }
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <label className="text-xs text-gray-500">
                                    Title
                                  </label>
                                  <Input
                                    placeholder="Task title"
                                    value={task.title}
                                    onChange={(e) =>
                                      handleUpdateTask(
                                        subgoalIndex,
                                        taskIndex,
                                        "title",
                                        e.target.value
                                      )
                                    }
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-xs text-gray-500">
                                    Estimated Duration
                                  </label>
                                  <Input
                                    placeholder="e.g., 2 days"
                                    type="number"
                                    value={task.estimated_duration || ""}
                                    onChange={(e) =>
                                      handleUpdateTask(
                                        subgoalIndex,
                                        taskIndex,
                                        "estimated_duration",
                                        e.target.value
                                      )
                                    }
                                  />
                                </div>
                                {watchGoalType === "team" &&
                                  teamMembers.length > 0 && (
                                    <div className="space-y-1">
                                      <label className="text-xs text-gray-500">
                                        Assigned To
                                      </label>
                                      <Select
                                        value={task.assigned_to || ""}
                                        onValueChange={(value) =>
                                          handleUpdateTask(
                                            subgoalIndex,
                                            taskIndex,
                                            "assigned_to",
                                            value
                                          )
                                        }
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select assignee" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {teamMembers.map((member) => (
                                            <SelectItem
                                              key={member.id}
                                              value={member.id}
                                            >
                                              <div className="flex items-center gap-2">
                                                <Avatar className="w-4 h-4">
                                                  <AvatarFallback className="text-xs">
                                                    {member.full_name?.[0] ||
                                                      member.email[0]}
                                                  </AvatarFallback>
                                                </Avatar>
                                                {member.full_name ||
                                                  member.email}
                                              </div>
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  )}
                              </div>

                              <div className="space-y-1">
                                <label className="text-xs text-gray-500">
                                  Description
                                </label>
                                <Textarea
                                  placeholder="Task description"
                                  rows={2}
                                  value={task.description}
                                  onChange={(e) =>
                                    handleUpdateTask(
                                      subgoalIndex,
                                      taskIndex,
                                      "description",
                                      e.target.value
                                    )
                                  }
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {subgoals.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>
                        No sub-goals yet. Add your first sub-goal to get
                        started.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  Create Goal
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}

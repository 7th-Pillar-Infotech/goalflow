"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { GoalStatus } from "@/lib/types";
import { AlertCircle, CheckCircle, PauseCircle, PlayCircle } from "lucide-react";

interface UpdateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
  taskTitle: string;
  currentStatus: GoalStatus;
  onUpdateTask: (taskId: string, status: GoalStatus, comment: string) => Promise<void>;
}

export function UpdateTaskModal({
  isOpen,
  onClose,
  taskId,
  taskTitle,
  currentStatus,
  onUpdateTask,
}: UpdateTaskModalProps) {
  const [status, setStatus] = useState<GoalStatus>(currentStatus);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!comment.trim()) {
      setError("Please add a comment explaining the update");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onUpdateTask(taskId, status, comment);
      onClose();
    } catch (err) {
      console.error("Error updating task:", err);
      setError("Failed to update task. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status: GoalStatus) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "in_progress":
        return <PlayCircle className="w-4 h-4 text-blue-600" />;
      case "blocked":
        return <AlertCircle className="w-4 h-4 text-orange-600" />;
      default:
        return <PauseCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Task Status</DialogTitle>
          <DialogDescription>
            Update the status of "{taskTitle}" and provide a comment explaining the change.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="status">Task Status</Label>
            <Select value={status} onValueChange={(value) => setStatus(value as GoalStatus)}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="not_started">
                  <div className="flex items-center gap-2">
                    {getStatusIcon("not_started")}
                    <span>Not Started</span>
                  </div>
                </SelectItem>
                <SelectItem value="in_progress">
                  <div className="flex items-center gap-2">
                    {getStatusIcon("in_progress")}
                    <span>In Progress</span>
                  </div>
                </SelectItem>
                <SelectItem value="blocked">
                  <div className="flex items-center gap-2">
                    {getStatusIcon("blocked")}
                    <span>Blocked</span>
                  </div>
                </SelectItem>
                <SelectItem value="completed">
                  <div className="flex items-center gap-2">
                    {getStatusIcon("completed")}
                    <span>Completed</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Comment</Label>
            <Textarea
              id="comment"
              placeholder="Add a comment explaining the status update..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="resize-none"
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Updating..." : "Update Task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

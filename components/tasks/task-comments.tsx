"use client";

import { format } from "date-fns";
import { MessageSquare } from "lucide-react";

interface TaskCommentsProps {
  comments?: string[];
}

export function TaskComments({ comments }: TaskCommentsProps) {
  if (!comments || comments.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
      <h6 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
        <MessageSquare className="w-4 h-4" />
        Comments ({comments.length})
      </h6>
      <div className="space-y-2">
        {comments.map((comment, index) => (
          <div
            key={index}
            className="bg-gray-50 dark:bg-gray-800 p-2 rounded-md text-sm text-gray-600 dark:text-gray-300"
          >
            {comment}
          </div>
        ))}
      </div>
    </div>
  );
}

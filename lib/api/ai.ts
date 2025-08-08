import type { AIGoalSuggestion } from "@/lib/types";

// OpenAI API integration for goal generation
import OpenAI from "openai";

// Helper function to get the week number since goal creation
function getWeekNumber(date: Date, goalCreatedAt?: string): number {
  if (!goalCreatedAt) {
    // Fallback to calendar week if no goal creation date is provided
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear =
      (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  // Calculate weeks since goal creation
  const goalCreationDate = new Date(goalCreatedAt);
  const timeDiff = date.getTime() - goalCreationDate.getTime();
  const daysSinceCreation = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  return Math.ceil((daysSinceCreation + 1) / 7);
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export const aiApi = {
  async generateGoalSuggestion(userInput: string): Promise<AIGoalSuggestion> {
    try {
      console.log("Starting goal generation with input:", userInput);

      // Check if API key is available
      if (!openai.apiKey) {
        throw new Error("OpenAI API key is not configured");
      }

      // Prepare the prompt for OpenAI
      const prompt = `
        Generate a structured goal based on this input: "${userInput}"
        
        The response should be a JSON object with the following structure:
        {
          "title": "A specific, measurable goal title",
          "description": "Detailed description of the goal",
          "subgoals": [
            {
              "title": "Subgoal title",
              "description": "Subgoal description",
              "tasks": [
                { 
                  "title": "Task title", 
                  "description": "Task description",
                  "estimated_duration": "Numeric value representing days needed to complete this task"
                },
                ...
              ]
            },
            ...
          ],
          "suggestedTags": ["tag1", "tag2", ...],
          "suggestedDeadline": "YYYY-MM-DD" (a reasonable deadline for this goal)
        }
        
        Make the goal SMART (Specific, Measurable, Achievable, Relevant, Time-bound).
        Include 2-3 subgoals, each with 2-4 tasks.
        For each task, provide an estimated_duration as a numeric value representing the number of days needed to complete the task.
        Suggest 3-5 relevant tags.
        Set a reasonable deadline based on the scope of the goal.
      `;

      console.log("Calling OpenAI API...");

      // Call OpenAI API
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are an expert goal-setting assistant that helps create structured, actionable goals with clear subgoals and tasks.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1500,
        response_format: { type: "json_object" },
      });

      console.log("OpenAI API response received");

      // Parse the response
      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error("No content in OpenAI response");
      }

      console.log("Raw response content:", content.substring(0, 100) + "...");

      // Parse the JSON response
      const parsedResponse = JSON.parse(content) as AIGoalSuggestion;
      console.log("Successfully parsed response");
      return parsedResponse;
    } catch (error) {
      console.error("Error generating goal with OpenAI:", error);
      if (error instanceof Error) {
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      }

      // Fallback to a default goal if API fails
      return {
        title: `Goal related to: ${userInput}`,
        description: "Please try again or refine your goal description.",
        subgoals: [
          {
            title: "Define specific objectives",
            description:
              "Break down your goal into specific, measurable objectives",
            tasks: [
              {
                title: "Research best practices",
                description: "Find industry standards and best approaches",
                estimated_duration: "2",
              },
              {
                title: "Set measurable targets",
                description: "Define KPIs and success metrics",
                estimated_duration: "1",
              },
            ],
          },
        ],
        suggestedTags: ["Planning", "Goals"],
        suggestedDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
      };
    }
  },

  async generateWeeklySummary(
    checkIns?: { date: string; progress: string; blockers: string }[],
    goal?: any
  ): Promise<{ text: string; created_at: string; week_number?: number }> {
    try {
      if (goal) {
        console.log("Starting weekly summary generation for goal:", goal.title);
      } else if (checkIns) {
        console.log(
          "Starting weekly summary generation with",
          checkIns.length,
          "check-ins"
        );
      } else {
        console.log("No input provided for weekly summary generation");
        throw new Error("No input provided for weekly summary generation");
      }

      // Check if API key is available
      if (!openai.apiKey) {
        throw new Error("OpenAI API key is not configured");
      }

      // Prepare the prompt for OpenAI
      let prompt = "";

      if (goal) {
        // Extract all comments from tasks in subgoals
        const allComments: string[] = [];

        if (goal.subgoals && goal.subgoals.length > 0) {
          goal.subgoals.forEach((subgoal: any) => {
            if (subgoal.tasks && subgoal.tasks.length > 0) {
              subgoal.tasks.forEach((task: any) => {
                if (task.comments && task.comments.length > 0) {
                  // Add task context and its comments
                  allComments.push(
                    `Task: ${task.title}\nComments:\n${task.comments.join(
                      "\n"
                    )}`
                  );
                }
              });
            }
          });
        }

        if (allComments.length === 0) {
          return {
            text: "No task comments available to generate a weekly summary. Please add comments to your tasks first.",
            created_at: new Date().toISOString(),
            week_number: getWeekNumber(new Date(), goal?.created_at),
          };
        }

        prompt = `
          Generate a concise weekly summary for the goal "${
            goal.title
          }" based on these task comments:
          ${allComments.join("\n\n")}
          
          Focus on:
          1. Key actions taken (based on comments)
          2. Notable progress or blockers
          3. Overall sentiment or tone from the comments
          4. What has been achieved this week
          5. Any ongoing tasks and items pending attention
          
          Keep it under 200 words and make it human-readable.
        `;
      } else if (checkIns && checkIns.length > 0) {
        prompt = `
          Generate a concise weekly summary based on these daily check-ins:
          ${checkIns
            .map(
              (ci) =>
                `Date: ${ci.date}\nProgress: ${ci.progress}\nBlockers: ${ci.blockers}`
            )
            .join("\n\n")}
          
          Focus on:
          1. Overall progress made
          2. Common themes in blockers
          3. Recommendations for the coming week
          
          Keep it under 200 words.
        `;
      } else {
        throw new Error(
          "No valid input provided for weekly summary generation"
        );
      }

      console.log("Calling OpenAI API for weekly summary...");

      // Call OpenAI API
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are an expert project manager who provides concise, insightful summaries of weekly progress.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 300,
      });

      console.log("Weekly summary API response received");

      // Return the generated summary
      const summaryText =
        response.choices[0]?.message?.content ||
        "Unable to generate summary at this time.";
      console.log("Generated summary length:", summaryText.length);

      // Create a structured summary object with text and timestamp
      const summaryObject = {
        text: summaryText,
        created_at: new Date().toISOString(),
        // Calculate week number based on weeks since goal creation
        // Week 1 is the first week after goal creation
        week_number: getWeekNumber(new Date(), goal?.created_at),
      };

      return summaryObject;
    } catch (error) {
      console.error("Error generating weekly summary with OpenAI:", error);
      if (error instanceof Error) {
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      }
      return {
        text: "This week showed mixed progress with some tasks completed and others facing challenges. Review the blockers identified in the check-ins and consider adjusting priorities for the coming week.",
        created_at: new Date().toISOString(),
        week_number: getWeekNumber(new Date(), goal?.created_at),
      };
    }
  },
};

import type { AIGoalSuggestion } from "@/lib/types";

// OpenAI API integration for goal generation
import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey:
    process.env.NEXT_PUBLIC_OPENAI_API_KEY ||
    // If you're seeing this in the code, replace with your actual API key in .env.local
    "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",
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
        model: "gpt-3.5-turbo", // Using a more widely available model
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
    checkIns: { date: string; progress: string; blockers: string }[]
  ): Promise<string> {
    try {
      console.log(
        "Starting weekly summary generation with",
        checkIns.length,
        "check-ins"
      );

      // Check if API key is available
      if (!openai.apiKey) {
        throw new Error("OpenAI API key is not configured");
      }

      // Prepare the prompt for OpenAI
      const prompt = `
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
      const summary =
        response.choices[0]?.message?.content ||
        "Unable to generate summary at this time.";
      console.log("Generated summary length:", summary.length);
      return summary;
    } catch (error) {
      console.error("Error generating weekly summary with OpenAI:", error);
      if (error instanceof Error) {
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      }
      return "This week showed mixed progress with some tasks completed and others facing challenges. Review the blockers identified in the check-ins and consider adjusting priorities for the coming week.";
    }
  },
};

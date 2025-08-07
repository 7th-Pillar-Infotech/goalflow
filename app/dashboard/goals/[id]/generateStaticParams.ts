import { goalsApi } from "@/lib/api/goals";

// This function is required for static site generation with dynamic routes
export async function generateStaticParams() {
  try {
    // Fetch all goals to generate static paths
    const goals = await goalsApi.getGoals();
    
    // Return an array of objects with the id parameter
    return goals.map((goal) => ({
      id: goal.id,
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

import type { AIGoalSuggestion } from '@/lib/types';

// Mock AI service for goal generation
// In production, this would call OpenAI API
export const aiApi = {
  async generateGoalSuggestion(userInput: string): Promise<AIGoalSuggestion> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock AI response based on input
    const suggestions = {
      'increase sales': {
        title: 'Increase quarterly sales revenue by 30%',
        description: 'Boost sales performance through improved lead generation, conversion optimization, and customer retention strategies.',
        subgoals: [
          {
            title: 'Improve lead generation by 40%',
            description: 'Implement new marketing strategies and optimize existing channels',
            tasks: [
              { title: 'Launch targeted LinkedIn campaign', description: 'Create and execute LinkedIn ads targeting key demographics' },
              { title: 'Optimize website conversion rate', description: 'A/B test landing pages and improve call-to-action buttons' },
              { title: 'Implement referral program', description: 'Create incentives for existing customers to refer new clients' }
            ]
          },
          {
            title: 'Increase conversion rate to 25%',
            description: 'Optimize sales process and improve closing techniques',
            tasks: [
              { title: 'Revamp sales pitch deck', description: 'Update presentation with latest case studies and ROI data' },
              { title: 'Implement CRM automation', description: 'Set up automated follow-up sequences for leads' },
              { title: 'Train sales team on objection handling', description: 'Conduct workshops on common objections and responses' }
            ]
          }
        ],
        suggestedTags: ['Sales', 'Revenue', 'Growth', 'Q4'],
        suggestedDeadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      },
      'improve product': {
        title: 'Launch new product features to increase user engagement by 50%',
        description: 'Develop and deploy key features that will significantly improve user experience and retention.',
        subgoals: [
          {
            title: 'Design and implement dark mode',
            description: 'Create a comprehensive dark theme for the entire application',
            tasks: [
              { title: 'Design dark mode UI components', description: 'Create design system for dark theme' },
              { title: 'Implement dark mode toggle', description: 'Add theme switching functionality' },
              { title: 'Test across all devices', description: 'Ensure consistent experience on mobile and desktop' }
            ]
          },
          {
            title: 'Add real-time notifications',
            description: 'Implement push notifications and in-app alerts',
            tasks: [
              { title: 'Set up notification infrastructure', description: 'Configure push notification service' },
              { title: 'Design notification UI', description: 'Create notification center and toast components' },
              { title: 'Implement notification preferences', description: 'Allow users to customize notification settings' }
            ]
          }
        ],
        suggestedTags: ['Product', 'Features', 'UX', 'Engagement'],
        suggestedDeadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      },
      'team productivity': {
        title: 'Increase team productivity by 35% through process optimization',
        description: 'Streamline workflows, improve communication, and implement productivity tools to boost team efficiency.',
        subgoals: [
          {
            title: 'Implement agile methodology',
            description: 'Transition team to agile development practices',
            tasks: [
              { title: 'Set up sprint planning process', description: 'Establish 2-week sprint cycles with planning meetings' },
              { title: 'Create backlog management system', description: 'Organize and prioritize work items effectively' },
              { title: 'Implement daily standups', description: 'Establish daily check-ins for team alignment' }
            ]
          },
          {
            title: 'Optimize communication channels',
            description: 'Reduce meeting overhead and improve async communication',
            tasks: [
              { title: 'Audit current meeting schedule', description: 'Identify and eliminate unnecessary meetings' },
              { title: 'Set up async communication guidelines', description: 'Create standards for Slack and email usage' },
              { title: 'Implement documentation system', description: 'Create centralized knowledge base for team' }
            ]
          }
        ],
        suggestedTags: ['Productivity', 'Team', 'Process', 'Efficiency'],
        suggestedDeadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }
    };

    // Find the best match based on input
    const input = userInput.toLowerCase();
    let suggestion = suggestions['team productivity']; // default

    if (input.includes('sales') || input.includes('revenue') || input.includes('money')) {
      suggestion = suggestions['increase sales'];
    } else if (input.includes('product') || input.includes('feature') || input.includes('app')) {
      suggestion = suggestions['improve product'];
    } else if (input.includes('team') || input.includes('productivity') || input.includes('process')) {
      suggestion = suggestions['team productivity'];
    }

    return suggestion;
  },

  async generateWeeklySummary(checkInData: any): Promise<string> {
    // Mock AI-generated weekly summary
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return `This week showed strong progress with 3 out of 5 tasks completed on schedule. The team is maintaining good momentum on the main objectives, though there are some minor blockers in the implementation phase that need attention. Recommended actions: prioritize the blocked tasks and consider reallocating resources to maintain timeline.`;
  }
};
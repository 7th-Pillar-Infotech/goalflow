/*
  # Goal Management System - Complete Schema

  1. New Tables
    - `goals` - Main goals (individual or team)
    - `subgoals` - Sub-goals under main goals  
    - `tasks` - Individual tasks under sub-goals
    - `goal_tags` - Tags for goals (many-to-many)

  2. Enums
    - `goal_type` - individual or team
    - `goal_status` - not_started, on_track, at_risk, completed

  3. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Ensure proper access control for team vs individual goals

  4. Indexes
    - Performance indexes on frequently queried columns
*/

-- Create custom types
CREATE TYPE goal_type AS ENUM ('individual', 'team');
CREATE TYPE goal_status AS ENUM ('not_started', 'on_track', 'at_risk', 'completed');

-- Goals table
CREATE TABLE IF NOT EXISTS goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  goal_type goal_type NOT NULL DEFAULT 'individual',
  status goal_status DEFAULT 'not_started',
  deadline date,
  tags text[] DEFAULT '{}',
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Ensure team goals have a team_id
  CONSTRAINT team_goal_has_team CHECK (
    (goal_type = 'individual') OR 
    (goal_type = 'team' AND team_id IS NOT NULL)
  )
);

-- SubGoals table
CREATE TABLE IF NOT EXISTS subgoals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id uuid REFERENCES goals(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status goal_status DEFAULT 'not_started',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subgoal_id uuid REFERENCES subgoals(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status goal_status DEFAULT 'not_started',
  due_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Goal tags table (normalized approach)
CREATE TABLE IF NOT EXISTS goal_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id uuid REFERENCES goals(id) ON DELETE CASCADE NOT NULL,
  tag text NOT NULL,
  created_at timestamptz DEFAULT now(),
  
  UNIQUE(goal_id, tag)
);

-- Enable Row Level Security
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE subgoals ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_tags ENABLE ROW LEVEL SECURITY;

-- Goals policies
CREATE POLICY "Users can view accessible goals"
  ON goals FOR SELECT
  TO authenticated
  USING (
    created_by = auth.uid() OR
    (goal_type = 'team' AND team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    ))
  );

CREATE POLICY "Users can create goals"
  ON goals FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = auth.uid() AND
    (goal_type = 'individual' OR 
     (goal_type = 'team' AND team_id IN (
       SELECT team_id FROM team_members WHERE user_id = auth.uid()
     )))
  );

CREATE POLICY "Goal creators can update their goals"
  ON goals FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Goal creators can delete their goals"
  ON goals FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- Subgoals policies
CREATE POLICY "Users can view accessible subgoals"
  ON subgoals FOR SELECT
  TO authenticated
  USING (
    goal_id IN (
      SELECT id FROM goals WHERE 
      created_by = auth.uid() OR
      (goal_type = 'team' AND team_id IN (
        SELECT team_id FROM team_members WHERE user_id = auth.uid()
      ))
    )
  );

CREATE POLICY "Users can manage subgoals for their goals"
  ON subgoals FOR ALL
  TO authenticated
  USING (
    goal_id IN (SELECT id FROM goals WHERE created_by = auth.uid()) OR
    assigned_to = auth.uid()
  );

-- Tasks policies
CREATE POLICY "Users can view accessible tasks"
  ON tasks FOR SELECT
  TO authenticated
  USING (
    subgoal_id IN (
      SELECT id FROM subgoals WHERE 
      goal_id IN (
        SELECT id FROM goals WHERE 
        created_by = auth.uid() OR
        (goal_type = 'team' AND team_id IN (
          SELECT team_id FROM team_members WHERE user_id = auth.uid()
        ))
      )
    ) OR
    assigned_to = auth.uid()
  );

CREATE POLICY "Users can manage tasks for their goals or assigned tasks"
  ON tasks FOR ALL
  TO authenticated
  USING (
    subgoal_id IN (
      SELECT id FROM subgoals WHERE 
      goal_id IN (SELECT id FROM goals WHERE created_by = auth.uid())
    ) OR
    assigned_to = auth.uid()
  );

-- Goal tags policies
CREATE POLICY "Users can view tags for accessible goals"
  ON goal_tags FOR SELECT
  TO authenticated
  USING (
    goal_id IN (
      SELECT id FROM goals WHERE 
      created_by = auth.uid() OR
      (goal_type = 'team' AND team_id IN (
        SELECT team_id FROM team_members WHERE user_id = auth.uid()
      ))
    )
  );

CREATE POLICY "Goal creators can manage tags"
  ON goal_tags FOR ALL
  TO authenticated
  USING (
    goal_id IN (SELECT id FROM goals WHERE created_by = auth.uid())
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_goals_created_by ON goals(created_by);
CREATE INDEX IF NOT EXISTS idx_goals_team_id ON goals(team_id);
CREATE INDEX IF NOT EXISTS idx_goals_status ON goals(status);
CREATE INDEX IF NOT EXISTS idx_goals_deadline ON goals(deadline);
CREATE INDEX IF NOT EXISTS idx_subgoals_goal_id ON subgoals(goal_id);
CREATE INDEX IF NOT EXISTS idx_subgoals_assigned_to ON subgoals(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_subgoal_id ON tasks(subgoal_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_goal_tags_goal_id ON goal_tags(goal_id);

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON goals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subgoals_updated_at BEFORE UPDATE ON subgoals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
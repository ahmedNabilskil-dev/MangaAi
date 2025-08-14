-- Migration: Simplify outfit and location templates
-- Description: Simplifies the template tables to match the new simplified entity structure

-- 1. Backup existing data (optional - create views for reference)
CREATE VIEW outfit_templates_backup AS SELECT * FROM outfit_templates;
CREATE VIEW location_templates_backup AS SELECT * FROM location_templates;

-- 2. Drop existing complex tables
DROP TABLE IF EXISTS outfit_templates CASCADE;
DROP TABLE IF EXISTS location_templates CASCADE;

-- 3. Create simplified outfit_templates table
CREATE TABLE outfit_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  ai_prompt TEXT NOT NULL, -- Complete AI generation prompt
  category TEXT NOT NULL CHECK (category IN ('casual', 'formal', 'school', 'special')),
  season TEXT NOT NULL CHECK (season IN ('spring', 'summer', 'autumn', 'winter', 'all')),
  is_default BOOLEAN DEFAULT FALSE,
  tags TEXT[] DEFAULT '{}',
  image_url TEXT,
  manga_project_id UUID NOT NULL REFERENCES manga_projects(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create simplified location_templates table
CREATE TABLE location_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  base_prompt TEXT NOT NULL, -- Core location description for AI
  type TEXT NOT NULL CHECK (type IN ('indoor', 'outdoor')),
  category TEXT NOT NULL CHECK (category IN ('school', 'home', 'public', 'nature', 'fantasy')),
  camera_angles TEXT[] DEFAULT '{}', -- Simple array of angle descriptions
  tags TEXT[] DEFAULT '{}',
  image_url TEXT,
  manga_project_id UUID NOT NULL REFERENCES manga_projects(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create indexes for performance
CREATE INDEX idx_outfit_templates_character_id ON outfit_templates(character_id);
CREATE INDEX idx_outfit_templates_manga_project_id ON outfit_templates(manga_project_id);
CREATE INDEX idx_outfit_templates_category ON outfit_templates(category);
CREATE INDEX idx_outfit_templates_season ON outfit_templates(season);
CREATE INDEX idx_outfit_templates_is_default ON outfit_templates(is_default);

CREATE INDEX idx_location_templates_manga_project_id ON location_templates(manga_project_id);
CREATE INDEX idx_location_templates_type ON location_templates(type);
CREATE INDEX idx_location_templates_category ON location_templates(category);

-- 6. Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_outfit_templates_updated_at 
    BEFORE UPDATE ON outfit_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_location_templates_updated_at 
    BEFORE UPDATE ON location_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. Insert sample data (optional)
-- You can add some basic templates here if needed

-- 8. Grant necessary permissions
GRANT ALL ON outfit_templates TO authenticated;
GRANT ALL ON location_templates TO authenticated;
GRANT ALL ON outfit_templates TO service_role;
GRANT ALL ON location_templates TO service_role;

-- 9. Add RLS policies (Row Level Security)
ALTER TABLE outfit_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_templates ENABLE ROW LEVEL SECURITY;

-- Policies for outfit_templates
CREATE POLICY "Users can view outfit templates" ON outfit_templates
    FOR SELECT USING (true);

CREATE POLICY "Users can insert outfit templates" ON outfit_templates
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update outfit templates" ON outfit_templates
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete outfit templates" ON outfit_templates
    FOR DELETE USING (true);

-- Policies for location_templates
CREATE POLICY "Users can view location templates" ON location_templates
    FOR SELECT USING (true);

CREATE POLICY "Users can insert location templates" ON location_templates
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update location templates" ON location_templates
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete location templates" ON location_templates
    FOR DELETE USING (true);

-- 10. Update any foreign key references if needed
-- This might need to be adjusted based on your existing schema

COMMENT ON TABLE outfit_templates IS 'Simplified outfit templates for character appearances';
COMMENT ON TABLE location_templates IS 'Simplified location templates for scene settings';

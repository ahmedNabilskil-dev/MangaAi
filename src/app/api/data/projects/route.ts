import { NextRequest, NextResponse } from "next/server";

// GET /api/data/projects - Get all projects
export async function GET(request: NextRequest) {
  try {
    const { supabaseDataService } = await import("@/backend/services/supabase.service");
    await supabaseDataService.initialize();

    const projects = await supabaseDataService.getAllProjects();

    return NextResponse.json({
      success: true,
      data: projects,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Projects API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to get projects",
      },
      { status: 500 }
    );
  }
}

// POST /api/data/projects - Create a new project
export async function POST(request: NextRequest) {
  try {
    const projectData = await request.json();

    const { supabaseDataService } = await import("@/backend/services/supabase.service");
    await supabaseDataService.initialize();

    const project = await supabaseDataService.createProject(projectData);

    return NextResponse.json({
      success: true,
      data: project,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Create Project API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to create project",
      },
      { status: 500 }
    );
  }
}

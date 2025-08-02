import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Test database connectivity
    const { supabaseDataService } = await import("@/backend/services/supabase.service");
    await supabaseDataService.initialize();

    // Get some basic stats
    const projects = await supabaseDataService.getAllProjects();

    const status = {
      service: "MangaAI Data API",
      status: "operational",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      database: {
        status: "connected",
        provider: "supabase",
      },
      endpoints: {
        projects: "/api/data/projects",
        chapters: "/api/data/chapters",
        scenes: "/api/data/scenes",
        panels: "/api/data/panels",
        dialogues: "/api/data/dialogues",
        characters: "/api/data/characters",
        templates: "/api/data/templates",
      },
      stats: {
        totalProjects: projects.length,
      },
      features: [
        "crud_operations",
        "cascading_deletes",
        "relational_data",
        "template_management",
        "character_assignment",
        "project_relations",
      ],
    };

    return NextResponse.json({
      success: true,
      ...status,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        service: "MangaAI Data API",
        status: "error",
        error: error instanceof Error ? error.message : "Service check failed",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function HEAD(request: NextRequest) {
  return new NextResponse(null, { status: 200 });
}

import { NextRequest, NextResponse } from "next/server";

// POST /api/data/templates/locations - Create a new location template
export async function POST(request: NextRequest) {
  try {
    const templateData = await request.json();

    const { supabaseDataService } = await import("@/backend/services/supabase.service");
    await supabaseDataService.initialize();

    const template = await supabaseDataService.createLocationTemplate(
      templateData
    );

    return NextResponse.json({
      success: true,
      data: template,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Create Location Template API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to create location template",
      },
      { status: 500 }
    );
  }
}

// GET /api/data/templates/locations - List location templates with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const filters: any = {};
    if (searchParams.get("category"))
      filters.category = searchParams.get("category");
    if (searchParams.get("setting"))
      filters.setting = searchParams.get("setting");
    if (searchParams.get("timeOfDay"))
      filters.timeOfDay = searchParams.get("timeOfDay");
    if (searchParams.get("season")) filters.season = searchParams.get("season");
    if (searchParams.get("mood")) filters.mood = searchParams.get("mood");
    if (searchParams.get("accessibility"))
      filters.accessibility = searchParams.get("accessibility");
    if (searchParams.get("activeOnly"))
      filters.activeOnly = searchParams.get("activeOnly") === "true";

    const { supabaseDataService } = await import("@/backend/services/supabase.service");
    await supabaseDataService.initialize();

    const templates = await supabaseDataService.listLocationTemplates(
      Object.keys(filters).length > 0 ? filters : undefined
    );

    return NextResponse.json({
      success: true,
      data: templates,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("List Location Templates API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to list location templates",
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";

// POST /api/data/panels - Create a new panel
export async function POST(request: NextRequest) {
  try {
    const panelData = await request.json();

    const { supabaseDataService } = await import("@/backend/services/supabase.service");
    await supabaseDataService.initialize();

    const panel = await supabaseDataService.createPanel(panelData);

    return NextResponse.json({
      success: true,
      data: panel,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Create Panel API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to create panel",
      },
      { status: 500 }
    );
  }
}

// GET /api/data/panels?sceneId=xxx - List panels for a scene
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sceneId = searchParams.get("sceneId");

    if (!sceneId) {
      return NextResponse.json(
        {
          success: false,
          error: "sceneId parameter is required",
        },
        { status: 400 }
      );
    }

    const { supabaseDataService } = await import("@/backend/services/supabase.service");
    await supabaseDataService.initialize();

    const panels = await supabaseDataService.listPanels(sceneId);

    return NextResponse.json({
      success: true,
      data: panels,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("List Panels API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to list panels",
      },
      { status: 500 }
    );
  }
}

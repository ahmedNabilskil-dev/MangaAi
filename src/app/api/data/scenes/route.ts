import { NextRequest, NextResponse } from "next/server";

// POST /api/data/scenes - Create a new scene
export async function POST(request: NextRequest) {
  try {
    const sceneData = await request.json();

    const { supabaseDataService } = await import("@/backend/services/supabase.service");
    await supabaseDataService.initialize();

    const scene = await supabaseDataService.createScene(sceneData);

    return NextResponse.json({
      success: true,
      data: scene,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Create Scene API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to create scene",
      },
      { status: 500 }
    );
  }
}

// GET /api/data/scenes?chapterId=xxx - List scenes for a chapter
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chapterId = searchParams.get("chapterId");

    if (!chapterId) {
      return NextResponse.json(
        {
          success: false,
          error: "chapterId parameter is required",
        },
        { status: 400 }
      );
    }

    const { supabaseDataService } = await import("@/backend/services/supabase.service");
    await supabaseDataService.initialize();

    const scenes = await supabaseDataService.listScenes(chapterId);

    return NextResponse.json({
      success: true,
      data: scenes,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("List Scenes API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to list scenes",
      },
      { status: 500 }
    );
  }
}

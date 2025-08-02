import { NextRequest, NextResponse } from "next/server";

// GET /api/data/scenes/all - Get all scenes across all chapters
export async function GET(request: NextRequest) {
  try {
    const { supabaseDataService } = await import("@/backend/services/supabase.service");
    await supabaseDataService.initialize();

    const scenes = await supabaseDataService.getAllScenes();

    return NextResponse.json({
      success: true,
      data: scenes,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Get All Scenes API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to get all scenes",
      },
      { status: 500 }
    );
  }
}

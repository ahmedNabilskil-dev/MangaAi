import { NextRequest, NextResponse } from "next/server";

// GET /api/data/chapters/all - Get all chapters across all projects
export async function GET(request: NextRequest) {
  try {
    const { supabaseDataService } = await import("@/backend/services/supabase.service");
    await supabaseDataService.initialize();

    const chapters = await supabaseDataService.getAllChapters();

    return NextResponse.json({
      success: true,
      data: chapters,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Get All Chapters API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to get all chapters",
      },
      { status: 500 }
    );
  }
}

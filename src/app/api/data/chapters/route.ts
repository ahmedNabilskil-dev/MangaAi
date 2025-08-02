import { NextRequest, NextResponse } from "next/server";

// POST /api/data/chapters - Create a new chapter
export async function POST(request: NextRequest) {
  try {
    const chapterData = await request.json();

    const { supabaseDataService } = await import("@/backend/services/supabase.service");
    await supabaseDataService.initialize();

    const chapter = await supabaseDataService.createChapter(chapterData);

    return NextResponse.json({
      success: true,
      data: chapter,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Create Chapter API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to create chapter",
      },
      { status: 500 }
    );
  }
}

// GET /api/data/chapters?projectId=xxx - List chapters for a project
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json(
        {
          success: false,
          error: "projectId parameter is required",
        },
        { status: 400 }
      );
    }

    const { supabaseDataService } = await import("@/backend/services/supabase.service");
    await supabaseDataService.initialize();

    const chapters = await supabaseDataService.listChapters(projectId);

    return NextResponse.json({
      success: true,
      data: chapters,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("List Chapters API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to list chapters",
      },
      { status: 500 }
    );
  }
}

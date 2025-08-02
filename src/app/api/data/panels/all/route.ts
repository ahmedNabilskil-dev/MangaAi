import { NextRequest, NextResponse } from "next/server";

// GET /api/data/panels/all - Get all panels across all scenes
export async function GET(request: NextRequest) {
  try {
    const { supabaseDataService } = await import("@/backend/services/supabase.service");
    await supabaseDataService.initialize();

    const panels = await supabaseDataService.getAllPanels();

    return NextResponse.json({
      success: true,
      data: panels,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Get All Panels API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to get all panels",
      },
      { status: 500 }
    );
  }
}

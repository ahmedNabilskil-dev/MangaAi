import { NextRequest, NextResponse } from "next/server";

// GET /api/data/dialogues/all - Get all dialogues across all panels
export async function GET(request: NextRequest) {
  try {
    const { supabaseDataService } = await import("@/backend/services/supabase.service");
    await supabaseDataService.initialize();

    const dialogues = await supabaseDataService.getAllPanelDialogues();

    return NextResponse.json({
      success: true,
      data: dialogues,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Get All Dialogues API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get all dialogues",
      },
      { status: 500 }
    );
  }
}

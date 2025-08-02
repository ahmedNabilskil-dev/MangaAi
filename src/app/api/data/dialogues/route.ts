import { NextRequest, NextResponse } from "next/server";

// POST /api/data/dialogues - Create a new dialogue
export async function POST(request: NextRequest) {
  try {
    const dialogueData = await request.json();

    const { supabaseDataService } = await import("@/backend/services/supabase.service");
    await supabaseDataService.initialize();

    const dialogue = await supabaseDataService.createPanelDialogue(
      dialogueData
    );

    return NextResponse.json({
      success: true,
      data: dialogue,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Create Dialogue API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to create dialogue",
      },
      { status: 500 }
    );
  }
}

// GET /api/data/dialogues?panelId=xxx - List dialogues for a panel
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const panelId = searchParams.get("panelId");

    if (!panelId) {
      return NextResponse.json(
        {
          success: false,
          error: "panelId parameter is required",
        },
        { status: 400 }
      );
    }

    const { supabaseDataService } = await import("@/backend/services/supabase.service");
    await supabaseDataService.initialize();

    const dialogues = await supabaseDataService.listPanelDialogues(panelId);

    return NextResponse.json({
      success: true,
      data: dialogues,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("List Dialogues API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to list dialogues",
      },
      { status: 500 }
    );
  }
}

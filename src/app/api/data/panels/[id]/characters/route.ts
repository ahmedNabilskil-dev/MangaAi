import { NextRequest, NextResponse } from "next/server";

// POST /api/data/panels/[id]/characters - Assign character to panel
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: panelId } = await context.params;
    const { characterId } = await request.json();

    if (!characterId) {
      return NextResponse.json(
        {
          success: false,
          error: "characterId is required",
        },
        { status: 400 }
      );
    }

    const { supabaseDataService } = await import("@/backend/services/supabase.service");
    await supabaseDataService.initialize();

    await supabaseDataService.assignCharacterToPanel(panelId, characterId);

    return NextResponse.json({
      success: true,
      message: "Character assigned to panel successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Assign Character to Panel API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to assign character to panel",
      },
      { status: 500 }
    );
  }
}

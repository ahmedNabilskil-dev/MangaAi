import { NextRequest, NextResponse } from "next/server";

// DELETE /api/data/panels/[id]/characters/[characterId] - Remove character from panel
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string; characterId: string }> }
) {
  try {
    const { id: panelId, characterId } = await context.params;

    const { supabaseDataService } = await import("@/backend/services/supabase.service");
    await supabaseDataService.initialize();

    await supabaseDataService.removeCharacterFromPanel(panelId, characterId);

    return NextResponse.json({
      success: true,
      message: "Character removed from panel successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Remove Character from Panel API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to remove character from panel",
      },
      { status: 500 }
    );
  }
}

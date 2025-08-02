import { NextRequest, NextResponse } from "next/server";

// GET /api/data/dialogues/[id] - Get dialogue by ID
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const { supabaseDataService } = await import("@/backend/services/supabase.service");
    await supabaseDataService.initialize();

    const dialogue = await supabaseDataService.getPanelDialogueForContext(id);

    if (!dialogue) {
      return NextResponse.json(
        {
          success: false,
          error: "Dialogue not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: dialogue,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Get Dialogue API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to get dialogue",
      },
      { status: 500 }
    );
  }
}

// PUT /api/data/dialogues/[id] - Update dialogue
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const dialogueData = await request.json();

    const { supabaseDataService } = await import("@/backend/services/supabase.service");
    await supabaseDataService.initialize();

    await supabaseDataService.updatePanelDialogue(id, dialogueData);

    return NextResponse.json({
      success: true,
      message: "Dialogue updated successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Update Dialogue API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to update dialogue",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/data/dialogues/[id] - Delete dialogue
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const { supabaseDataService } = await import("@/backend/services/supabase.service");
    await supabaseDataService.initialize();

    await supabaseDataService.deletePanelDialogue(id);

    return NextResponse.json({
      success: true,
      message: "Dialogue deleted successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Delete Dialogue API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to delete dialogue",
      },
      { status: 500 }
    );
  }
}

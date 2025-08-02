import { NextRequest, NextResponse } from "next/server";

// GET /api/data/panels/[id] - Get panel by ID
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const { supabaseDataService } = await import("@/backend/services/supabase.service");
    await supabaseDataService.initialize();

    const panel = await supabaseDataService.getPanelForContext(id);

    if (!panel) {
      return NextResponse.json(
        {
          success: false,
          error: "Panel not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: panel,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Get Panel API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get panel",
      },
      { status: 500 }
    );
  }
}

// PUT /api/data/panels/[id] - Update panel
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const panelData = await request.json();

    const { supabaseDataService } = await import("@/backend/services/supabase.service");
    await supabaseDataService.initialize();

    await supabaseDataService.updatePanel(id, panelData);

    return NextResponse.json({
      success: true,
      message: "Panel updated successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Update Panel API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to update panel",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/data/panels/[id] - Delete panel
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const { supabaseDataService } = await import("@/backend/services/supabase.service");
    await supabaseDataService.initialize();

    // Delete dialogues first
    const dialogues = await supabaseDataService.listPanelDialogues(id);
    for (const dialogue of dialogues) {
      await supabaseDataService.deletePanelDialogue(dialogue.id);
    }

    await supabaseDataService.deletePanel(id);

    return NextResponse.json({
      success: true,
      message: "Panel deleted successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Delete Panel API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to delete panel",
      },
      { status: 500 }
    );
  }
}

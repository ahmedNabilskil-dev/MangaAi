import { NextRequest, NextResponse } from "next/server";

// GET /api/data/scenes/[id] - Get scene by ID
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const { supabaseDataService } = await import("@/backend/services/supabase.service");
    await supabaseDataService.initialize();

    const scene = await supabaseDataService.getSceneForContext(id);

    if (!scene) {
      return NextResponse.json(
        {
          success: false,
          error: "Scene not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: scene,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Get Scene API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get scene",
      },
      { status: 500 }
    );
  }
}

// PUT /api/data/scenes/[id] - Update scene
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const sceneData = await request.json();

    const { supabaseDataService } = await import("@/backend/services/supabase.service");
    await supabaseDataService.initialize();

    await supabaseDataService.updateScene(id, sceneData);

    return NextResponse.json({
      success: true,
      message: "Scene updated successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Update Scene API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to update scene",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/data/scenes/[id] - Delete scene
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const { supabaseDataService } = await import("@/backend/services/supabase.service");
    await supabaseDataService.initialize();

    // Delete panels with cascade
    const panels = await supabaseDataService.listPanels(id);
    for (const panel of panels) {
      const dialogues = await supabaseDataService.listPanelDialogues(panel.id);
      for (const dialogue of dialogues) {
        await supabaseDataService.deletePanelDialogue(dialogue.id);
      }
      await supabaseDataService.deletePanel(panel.id);
    }

    await supabaseDataService.deleteScene(id);

    return NextResponse.json({
      success: true,
      message: "Scene deleted successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Delete Scene API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to delete scene",
      },
      { status: 500 }
    );
  }
}

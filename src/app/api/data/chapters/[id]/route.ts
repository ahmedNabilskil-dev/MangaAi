import { NextRequest, NextResponse } from "next/server";

// GET /api/data/chapters/[id] - Get chapter by ID
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const { supabaseDataService } = await import("@/backend/services/supabase.service");
    await supabaseDataService.initialize();

    const chapter = await supabaseDataService.getChapterForContext(id);

    if (!chapter) {
      return NextResponse.json(
        {
          success: false,
          error: "Chapter not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: chapter,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Get Chapter API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get chapter",
      },
      { status: 500 }
    );
  }
}

// PUT /api/data/chapters/[id] - Update chapter
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const chapterData = await request.json();

    const { supabaseDataService } = await import("@/backend/services/supabase.service");
    await supabaseDataService.initialize();

    await supabaseDataService.updateChapter(id, chapterData);

    return NextResponse.json({
      success: true,
      message: "Chapter updated successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Update Chapter API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to update chapter",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/data/chapters/[id] - Delete chapter
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const { supabaseDataService } = await import("@/backend/services/supabase.service");
    await supabaseDataService.initialize();

    // Delete scenes with cascade
    const scenes = await supabaseDataService.listScenes(id);
    for (const scene of scenes) {
      const panels = await supabaseDataService.listPanels(scene.id);
      for (const panel of panels) {
        const dialogues = await supabaseDataService.listPanelDialogues(
          panel.id
        );
        for (const dialogue of dialogues) {
          await supabaseDataService.deletePanelDialogue(dialogue.id);
        }
        await supabaseDataService.deletePanel(panel.id);
      }
      await supabaseDataService.deleteScene(scene.id);
    }

    await supabaseDataService.deleteChapter(id);

    return NextResponse.json({
      success: true,
      message: "Chapter deleted successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Delete Chapter API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to delete chapter",
      },
      { status: 500 }
    );
  }
}

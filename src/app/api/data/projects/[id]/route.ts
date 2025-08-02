import { NextRequest, NextResponse } from "next/server";

// GET /api/data/projects/[id] - Get project by ID
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const { supabaseDataService } = await import("@/backend/services/supabase.service");
    await supabaseDataService.initialize();

    const project = await supabaseDataService.getProject(id);

    if (!project) {
      return NextResponse.json(
        {
          success: false,
          error: "Project not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: project,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Get Project API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get project",
      },
      { status: 500 }
    );
  }
}

// PUT /api/data/projects/[id] - Update project
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const projectData = await request.json();

    const { supabaseDataService } = await import("@/backend/services/supabase.service");
    await supabaseDataService.initialize();

    await supabaseDataService.updateProject(id, projectData);

    return NextResponse.json({
      success: true,
      message: "Project updated successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Update Project API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to update project",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/data/projects/[id] - Delete project
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const { supabaseDataService } = await import("@/backend/services/supabase.service");
    await supabaseDataService.initialize();

    // Get chapters to delete them with cascade
    const chapters = await supabaseDataService.listChapters(id);
    for (const chapter of chapters) {
      // Delete scenes for each chapter
      const scenes = await supabaseDataService.listScenes(chapter.id);
      for (const scene of scenes) {
        // Delete panels for each scene
        const panels = await supabaseDataService.listPanels(scene.id);
        for (const panel of panels) {
          // Delete dialogues for each panel
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
      await supabaseDataService.deleteChapter(chapter.id);
    }

    // Delete the project itself
    await supabaseDataService.deleteProject(id);

    return NextResponse.json({
      success: true,
      message: "Project deleted successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Delete Project API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to delete project",
      },
      { status: 500 }
    );
  }
}

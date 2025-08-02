import { NextRequest, NextResponse } from "next/server";

// GET /api/data/projects/[id]/with-relations - Get project with all relations
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

    // Load chapters with their scenes and panels
    const chapters = await supabaseDataService.listChapters(id);
    for (const chapter of chapters) {
      const scenes = await supabaseDataService.listScenes(chapter.id);
      for (const scene of scenes) {
        const panels = await supabaseDataService.listPanels(scene.id);
        for (const panel of panels) {
          const dialogues = await supabaseDataService.listPanelDialogues(
            panel.id
          );
          panel.dialogues = dialogues;
        }
        scene.panels = panels;
      }
      chapter.scenes = scenes;
    }

    // Load characters
    const characters = await supabaseDataService.listCharacters(id);

    const projectWithRelations = {
      ...project,
      chapters,
      characters,
    };

    return NextResponse.json({
      success: true,
      data: projectWithRelations,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Get Project With Relations API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get project with relations",
      },
      { status: 500 }
    );
  }
}

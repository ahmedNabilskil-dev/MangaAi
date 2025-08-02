import { NextRequest, NextResponse } from "next/server";

// POST /api/data/characters - Create a new character
export async function POST(request: NextRequest) {
  try {
    const characterData = await request.json();

    const { supabaseDataService } = await import("@/backend/services/supabase.service");
    await supabaseDataService.initialize();

    const character = await supabaseDataService.createCharacter(characterData);

    return NextResponse.json({
      success: true,
      data: character,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Create Character API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to create character",
      },
      { status: 500 }
    );
  }
}

// GET /api/data/characters?projectId=xxx - List characters for a project
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json(
        {
          success: false,
          error: "projectId parameter is required",
        },
        { status: 400 }
      );
    }

    const { supabaseDataService } = await import("@/backend/services/supabase.service");
    await supabaseDataService.initialize();

    const characters = await supabaseDataService.listCharacters(projectId);

    return NextResponse.json({
      success: true,
      data: characters,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("List Characters API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to list characters",
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";

// GET /api/data/characters/[id] - Get character by ID
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const { supabaseDataService } = await import("@/backend/services/supabase.service");
    await supabaseDataService.initialize();

    const character = await supabaseDataService.getCharacter(id);

    if (!character) {
      return NextResponse.json(
        {
          success: false,
          error: "Character not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: character,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Get Character API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to get character",
      },
      { status: 500 }
    );
  }
}

// PUT /api/data/characters/[id] - Update character
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const characterData = await request.json();

    const { supabaseDataService } = await import("@/backend/services/supabase.service");
    await supabaseDataService.initialize();

    await supabaseDataService.updateCharacter(id, characterData);

    return NextResponse.json({
      success: true,
      message: "Character updated successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Update Character API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to update character",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/data/characters/[id] - Delete character
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const { supabaseDataService } = await import("@/backend/services/supabase.service");
    await supabaseDataService.initialize();

    await supabaseDataService.deleteCharacter(id);

    return NextResponse.json({
      success: true,
      message: "Character deleted successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Delete Character API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to delete character",
      },
      { status: 500 }
    );
  }
}

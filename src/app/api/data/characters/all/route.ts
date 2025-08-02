import { NextRequest, NextResponse } from "next/server";

// GET /api/data/characters/all - Get all characters across all projects
export async function GET(request: NextRequest) {
  try {
    const { supabaseDataService } = await import("@/backend/services/supabase.service");
    await supabaseDataService.initialize();

    const characters = await supabaseDataService.getAllCharacters();

    return NextResponse.json({
      success: true,
      data: characters,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Get All Characters API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get all characters",
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";

// GET /api/data/templates/locations/all - Get all location templates (for dropdowns, etc.)
export async function GET(request: NextRequest) {
  try {
    const { supabaseDataService } = await import("@/backend/services/supabase.service");
    await supabaseDataService.initialize();

    // Get all active location templates by default
    const templates = await supabaseDataService.listLocationTemplates({
      activeOnly: true,
    });

    return NextResponse.json({
      success: true,
      data: templates,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Get All Location Templates API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get all location templates",
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";

// POST /api/data/templates/outfits - Create a new outfit template
export async function POST(request: NextRequest) {
  try {
    const templateData = await request.json();

    const { supabaseDataService } = await import("@/backend/services/supabase.service");
    await supabaseDataService.initialize();

    const template = await supabaseDataService.createOutfitTemplate(
      templateData
    );

    return NextResponse.json({
      success: true,
      data: template,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Create Outfit Template API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to create outfit template",
      },
      { status: 500 }
    );
  }
}

// GET /api/data/templates/outfits - List outfit templates with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const filters: any = {};
    if (searchParams.get("category"))
      filters.category = searchParams.get("category");
    if (searchParams.get("gender")) filters.gender = searchParams.get("gender");
    if (searchParams.get("ageGroup"))
      filters.ageGroup = searchParams.get("ageGroup");
    if (searchParams.get("season")) filters.season = searchParams.get("season");
    if (searchParams.get("style")) filters.style = searchParams.get("style");
    if (searchParams.get("activeOnly"))
      filters.activeOnly = searchParams.get("activeOnly") === "true";

    const { supabaseDataService } = await import("@/backend/services/supabase.service");
    await supabaseDataService.initialize();

    const templates = await supabaseDataService.listOutfitTemplates(
      Object.keys(filters).length > 0 ? filters : undefined
    );

    return NextResponse.json({
      success: true,
      data: templates,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("List Outfit Templates API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to list outfit templates",
      },
      { status: 500 }
    );
  }
}

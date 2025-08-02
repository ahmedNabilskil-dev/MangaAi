import { NextRequest, NextResponse } from "next/server";

// GET /api/data/templates/outfits/[id] - Get a specific outfit template
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { supabaseDataService } = await import("@/backend/services/supabase.service");
    await supabaseDataService.initialize();

    const template = await supabaseDataService.getOutfitTemplate((await context.params).id);

    if (!template) {
      return NextResponse.json(
        {
          success: false,
          error: "Outfit template not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: template,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Get Outfit Template API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get outfit template",
      },
      { status: 500 }
    );
  }
}

// PUT /api/data/templates/outfits/[id] - Update an outfit template
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const updateData = await request.json();

    const { supabaseDataService } = await import("@/backend/services/supabase.service");
    await supabaseDataService.initialize();

    try {
      const template = await supabaseDataService.updateOutfitTemplate(
        (await context.params).id,
        updateData
      );

      return NextResponse.json({
        success: true,
        data: template,
        timestamp: new Date().toISOString(),
      });
    } catch (updateError) {
      // If update fails due to not found, return 404
      if (
        updateError instanceof Error &&
        updateError.message.includes("not found")
      ) {
        return NextResponse.json(
          {
            success: false,
            error: "Outfit template not found",
          },
          { status: 404 }
        );
      }
      throw updateError;
    }
  } catch (error) {
    console.error("Update Outfit Template API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to update outfit template",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/data/templates/outfits/[id] - Delete an outfit template
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { supabaseDataService } = await import("@/backend/services/supabase.service");
    await supabaseDataService.initialize();

    try {
      await supabaseDataService.deleteOutfitTemplate((await context.params).id);

      return NextResponse.json({
        success: true,
        data: { deleted: true },
        timestamp: new Date().toISOString(),
      });
    } catch (deleteError) {
      // If delete fails due to not found, return 404
      if (
        deleteError instanceof Error &&
        deleteError.message.includes("not found")
      ) {
        return NextResponse.json(
          {
            success: false,
            error: "Outfit template not found",
          },
          { status: 404 }
        );
      }
      throw deleteError;
    }
  } catch (error) {
    console.error("Delete Outfit Template API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete outfit template",
      },
      { status: 500 }
    );
  }
}

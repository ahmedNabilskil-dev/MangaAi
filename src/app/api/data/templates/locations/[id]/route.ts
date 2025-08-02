import { NextRequest, NextResponse } from "next/server";

// GET /api/data/templates/locations/[id] - Get a specific location template
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { supabaseDataService } = await import("@/backend/services/supabase.service");
    await supabaseDataService.initialize();

    const template = await supabaseDataService.getLocationTemplate((await context.params).id);

    if (!template) {
      return NextResponse.json(
        {
          success: false,
          error: "Location template not found",
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
    console.error("Get Location Template API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get location template",
      },
      { status: 500 }
    );
  }
}

// PUT /api/data/templates/locations/[id] - Update a location template
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const updateData = await request.json();

    const { supabaseDataService } = await import("@/backend/services/supabase.service");
    await supabaseDataService.initialize();

    try {
      const template = await supabaseDataService.updateLocationTemplate(
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
            error: "Location template not found",
          },
          { status: 404 }
        );
      }
      throw updateError;
    }
  } catch (error) {
    console.error("Update Location Template API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to update location template",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/data/templates/locations/[id] - Delete a location template
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { supabaseDataService } = await import("@/backend/services/supabase.service");
    await supabaseDataService.initialize();

    try {
      await supabaseDataService.deleteLocationTemplate((await context.params).id);

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
            error: "Location template not found",
          },
          { status: 404 }
        );
      }
      throw deleteError;
    }
  } catch (error) {
    console.error("Delete Location Template API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete location template",
      },
      { status: 500 }
    );
  }
}

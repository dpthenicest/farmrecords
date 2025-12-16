// app/api/inventory/[id]/route.ts
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { inventoryService } from "@/services/inventoryService";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth();
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: auth.error } },
        { status: 401 }
      );
    }

    const id = Number(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_INPUT", message: "Invalid inventory ID" } },
        { status: 400 }
      );
    }

    const item = await inventoryService.getById(id, Number(auth.user?.id), auth.user?.role === "ADMIN");

    if (!item) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Inventory item not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    console.error("Error fetching inventory item:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch inventory item" } },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth();
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: auth.error } },
        { status: 401 }
      );
    }

    const id = Number(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_INPUT", message: "Invalid inventory ID" } },
        { status: 400 }
      );
    }

    const body = await req.json();
    
    // Validate the input data
    const validationErrors = inventoryService.validateInventoryData(body);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: validationErrors.join(", ") } },
        { status: 400 }
      );
    }

    const result = await inventoryService.update(id, body, Number(auth.user?.id), auth.user?.role === "ADMIN");

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Error updating inventory item:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to update inventory item" } },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth();
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: auth.error } },
        { status: 401 }
      );
    }

    const id = Number(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_INPUT", message: "Invalid inventory ID" } },
        { status: 400 }
      );
    }

    await inventoryService.remove(id, Number(auth.user?.id), auth.user?.role === "ADMIN");

    return NextResponse.json({ success: true, message: "Inventory item deleted successfully" });
  } catch (error) {
    console.error("Error deleting inventory item:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to delete inventory item" } },
      { status: 500 }
    );
  }
}
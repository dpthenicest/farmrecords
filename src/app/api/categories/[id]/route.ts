import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getCategoryByIdService, updateCategoryService, deleteCategoryService } from "@/services/categoryService";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth();
    if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: 401 });

    const category = await getCategoryByIdService(Number(auth.user?.id), auth.role, Number(params.id));
    if (!category) return NextResponse.json({ success: false, error: "Category not found" }, { status: 404 });

    return NextResponse.json({ success: true, data: category });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth();
    if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: 401 });

    const body = await req.json();
    const updated = await updateCategoryService(Number(auth.user?.id), auth.user?.role, Number(params.id), body);

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth();
    if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: 401 });

    const deleted = await deleteCategoryService(Number(auth.user?.id), auth.user?.role, Number(params.id));

    return NextResponse.json({ success: true, data: deleted });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

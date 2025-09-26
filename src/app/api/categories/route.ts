import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getCategoriesService, createCategoryService } from "@/services/categoryService";

export async function GET(req: Request) {
  try {
    const auth = await requireAuth();
    if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const filters = {
      type: searchParams.get("type"),
      isActive: searchParams.get("isActive"),
      startDate: searchParams.get("startDate"),
      endDate: searchParams.get("endDate"),
    };

    const pagination = {
      page: Number(searchParams.get("page")) || 1,
      limit: Number(searchParams.get("limit")) || 20,
      sortBy: searchParams.get("sortBy") || "createdAt",
      sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") || "desc",
    };

    const result = await getCategoriesService(Number(auth.user?.id), auth.user?.role, filters, pagination);

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAuth();
    if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: 401 });

    const body = await req.json();
    const category = await createCategoryService(Number(auth.user?.id), body);

    return NextResponse.json({ success: true, data: category });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

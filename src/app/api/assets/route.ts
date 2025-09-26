import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getAssets, createAsset } from "@/services/assetService";

export async function GET(req: Request) {
  try {
    const auth = await requireAuth();
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
    }

    const url = new URL(req.url);
    const params = Object.fromEntries(url.searchParams.entries());

    const assets = await getAssets(auth.user, {
      page: Number(params.page) || 1,
      limit: Number(params.limit) || 20,
      assetType: params.assetType,
      conditionStatus: params.conditionStatus,
      startDate: params.startDate,
      endDate: params.endDate,
      sortBy: params.sortBy,
      sortOrder: params.sortOrder as "asc" | "desc",
    });

    return NextResponse.json({ success: true, ...assets }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching assets:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAuth();
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
    }

    const body = await req.json();
    const asset = await createAsset(body, auth.user.id);

    return NextResponse.json({ success: true, data: asset }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating asset:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

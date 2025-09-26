import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getAssetDepreciation } from "@/services/assetService";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth();
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
    }

    const depreciation = await getAssetDepreciation(Number(params.id), auth.user);
    return NextResponse.json({ success: true, data: depreciation }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

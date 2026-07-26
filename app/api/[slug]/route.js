import { NextResponse } from "next/server";
import { requireTenant } from "@/lib/tenant/require-tenant";

export async function GET(request, { params }) {
  const { slug } = await params;
  try {
    const { business } = await requireTenant(slug);
    return NextResponse.json({ business });
  } catch (res) {
    if (res instanceof Response) return res;
    throw res;
  }
}

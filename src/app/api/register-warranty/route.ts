import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { asset_id, asset_name, registered_by } = await request.json();

    if (!asset_id || !asset_name) {
      return NextResponse.json(
        { detail: "asset_id and asset_name are required" },
        { status: 400 }
      );
    }

    const apiUrl = process.env.NEXT_PUBLIC_WARRANTY_API_URL;
    const apiKey = process.env.WARRANTY_API_KEY;

    if (!apiUrl || !apiKey) {
      return NextResponse.json(
        { detail: "Warranty API not configured" },
        { status: 500 }
      );
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
      },
      body: JSON.stringify({
        asset_id,
        asset_name,
        registered_by,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        data || { detail: "Warranty API call failed" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Error in register-warranty API:", err);
    return NextResponse.json(
      { detail: "Internal server error" },
      { status: 500 }
    );
  }
}

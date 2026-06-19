import { NextRequest, NextResponse } from "next/server";

const ALLOWED_HOST = "modelcontextprotocol.io";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return NextResponse.json({ error: "Invalid url" }, { status: 400 });
  }

  if (parsed.hostname !== ALLOWED_HOST) {
    return NextResponse.json({ error: "Host not allowed" }, { status: 403 });
  }

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "remarkable-skills/1.0 (documentation reader)" },
    });
    if (!res.ok) {
      return NextResponse.json({ error: `Upstream ${res.status}` }, { status: res.status });
    }
    const content = await res.text();
    return NextResponse.json({ content });
  } catch {
    return NextResponse.json({ error: "Fetch failed" }, { status: 500 });
  }
}

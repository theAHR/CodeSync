import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

const DATA_DIR = path.join(process.cwd(), "data", "rooms");

function roomFilePath(roomId: string): string {
  const safeId = roomId.replace(/[^a-zA-Z0-9_-]/g, "");
  return path.join(DATA_DIR, `${safeId}.json`);
}

async function ensureDataDir(): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ roomId: string }> },
) {
  const { roomId } = await params;

  try {
    const raw = await readFile(roomFilePath(roomId), "utf-8");
    const data = JSON.parse(raw) as { state: string; updatedAt: string };
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ state: null }, { status: 404 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> },
) {
  const { roomId } = await params;

  try {
    const body = (await request.json()) as { state?: string };
    if (!body.state || typeof body.state !== "string") {
      return NextResponse.json({ error: "Missing state" }, { status: 400 });
    }

    await ensureDataDir();
    const payload = {
      state: body.state,
      updatedAt: new Date().toISOString(),
    };

    await writeFile(roomFilePath(roomId), JSON.stringify(payload), "utf-8");
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}

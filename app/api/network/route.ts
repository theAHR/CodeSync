import os from "os";
import { NextResponse } from "next/server";

export async function GET() {
  const ips: string[] = [];

  for (const interfaces of Object.values(os.networkInterfaces())) {
    for (const iface of interfaces ?? []) {
      if (iface.family === "IPv4" && !iface.internal) {
        ips.push(iface.address);
      }
    }
  }

  return NextResponse.json({
    ips: [...new Set(ips)],
    port: process.env.PORT ?? "3000",
  });
}

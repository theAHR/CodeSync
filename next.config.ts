import os from "os";
import type { NextConfig } from "next";

function getLanDevOrigins(): string[] {
  const port = process.env.PORT ?? "3000";
  const origins = new Set<string>([
    `localhost:${port}`,
    `127.0.0.1:${port}`,
  ]);

  for (const interfaces of Object.values(os.networkInterfaces())) {
    for (const iface of interfaces ?? []) {
      if (iface.family === "IPv4" && !iface.internal) {
        origins.add(`${iface.address}:${port}`);
      }
    }
  }

  if (process.env.ALLOWED_DEV_ORIGINS) {
    for (const origin of process.env.ALLOWED_DEV_ORIGINS.split(",")) {
      origins.add(origin.trim());
    }
  }

  return [...origins];
}

const nextConfig: NextConfig = {
  // Next.js 16 blocks dev assets from non-localhost origins unless allowed
  allowedDevOrigins: getLanDevOrigins(),
};

export default nextConfig;

"use client";

import { useEffect, useMemo, useState } from "react";
import {
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
} from "@codesandbox/sandpack-react";
import { useRoom } from "@/lib/room-context";
import { getAllFileContents } from "@/lib/yjs-provider";

function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

export function LivePreviewPanel() {
  const { files } = useRoom();
  const [contents, setContents] = useState<Record<string, string>>(() =>
    getAllFileContents(files),
  );
  const debouncedContents = useDebouncedValue(contents, 400);

  useEffect(() => {
    const handleUpdate = () => setContents(getAllFileContents(files));
    handleUpdate();
    files.observe(handleUpdate);
    files.observeDeep(handleUpdate);
    return () => {
      files.unobserve(handleUpdate);
      files.unobserveDeep(handleUpdate);
    };
  }, [files]);

  const sandpackFiles = useMemo(() => {
    const result: Record<string, { code: string; active?: boolean }> = {};

    for (const [name, code] of Object.entries(debouncedContents)) {
      result[`/${name}`] = {
        code,
        active: name === "index.html",
      };
    }

    if (!result["/index.html"]) {
      result["/index.html"] = {
        code: "<!DOCTYPE html><html><body><p>No index.html</p></body></html>",
        active: true,
      };
    }

    return result;
  }, [debouncedContents]);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950">
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2">
        <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
          Live Preview
        </span>
        <span className="text-xs text-zinc-600">HTML / CSS / JS</span>
      </div>
      <div className="min-h-0 flex-1">
        <SandpackProvider
          template="static"
          files={sandpackFiles}
          theme="dark"
          options={{
            autorun: true,
            autoReload: true,
            recompileMode: "delayed",
            recompileDelay: 500,
          }}
        >
          <SandpackLayout style={{ height: "100%", border: "none" }}>
            <SandpackPreview
              showOpenInCodeSandbox={false}
              showRefreshButton
              style={{ height: "100%" }}
            />
          </SandpackLayout>
        </SandpackProvider>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef } from "react";
import Editor, { type OnMount } from "@monaco-editor/react";
import { MonacoBinding } from "y-monaco";
import * as Y from "yjs";
import type * as monaco from "monaco-editor";
import { useRoom } from "@/lib/room-context";
import { useAppStore } from "@/lib/store";
import { getLanguageForFile } from "@/lib/constants";
import { FileTabs } from "./FileTabs";
import { UndoRedoToolbar } from "./UndoRedoToolbar";

export function CollaborativeEditor() {
  const { getFileText, awareness } = useRoom();
  const activeFile = useAppStore((state) => state.activeFile);
  const isReadOnly = useAppStore((state) => state.isReadOnly);
  const bindingRef = useRef<MonacoBinding | null>(null);
  const undoManagerRef = useRef<Y.UndoManager | null>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  const bindEditor = (editor: monaco.editor.IStandaloneCodeEditor) => {
    const model = editor.getModel();
    if (!model) return;

    bindingRef.current?.destroy();
    undoManagerRef.current?.destroy();

    const ytext = getFileText(activeFile);
    bindingRef.current = new MonacoBinding(
      ytext,
      model,
      new Set([editor]),
      awareness,
    );

    undoManagerRef.current = new Y.UndoManager(ytext, {
      captureTimeout: 500,
    });

    editor.updateOptions({ readOnly: isReadOnly });
  };

  const handleMount: OnMount = (editor) => {
    editorRef.current = editor;
    bindEditor(editor);
  };

  useEffect(() => {
    if (editorRef.current) {
      bindEditor(editorRef.current);
    }

    return () => {
      bindingRef.current?.destroy();
      undoManagerRef.current?.destroy();
      bindingRef.current = null;
      undoManagerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFile, isReadOnly]);

  useEffect(() => {
    return () => {
      bindingRef.current?.destroy();
      undoManagerRef.current?.destroy();
    };
  }, []);

  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-lg border border-zinc-800 bg-[#1e1e1e]">
      <FileTabs />
      <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/50 px-2">
        <UndoRedoToolbar undoManagerRef={undoManagerRef} disabled={isReadOnly} />
        {isReadOnly && (
          <span className="text-xs font-medium text-amber-400">View only</span>
        )}
      </div>
      <div className="min-h-0 flex-1">
        <Editor
          key={activeFile}
          height="100%"
          language={getLanguageForFile(activeFile)}
          theme="vs-dark"
          onMount={handleMount}
          options={{
            readOnly: isReadOnly,
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: "var(--font-geist-mono), monospace",
            wordWrap: "on",
            scrollBeyondLastLine: false,
            padding: { top: 16, bottom: 16 },
            smoothScrolling: true,
            cursorBlinking: "smooth",
            renderWhitespace: "selection",
            bracketPairColorization: { enabled: true },
          }}
          loading={
            <div className="flex h-full items-center justify-center text-sm text-zinc-500">
              Loading editor…
            </div>
          }
        />
      </div>
    </div>
  );
}

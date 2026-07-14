"use client";

import { useCallback } from "react";
import type * as Y from "yjs";

interface UndoRedoToolbarProps {
  undoManagerRef: React.RefObject<Y.UndoManager | null>;
  disabled?: boolean;
}

export function UndoRedoToolbar({
  undoManagerRef,
  disabled,
}: UndoRedoToolbarProps) {
  const handleUndo = useCallback(() => {
    undoManagerRef.current?.undo();
  }, [undoManagerRef]);

  const handleRedo = useCallback(() => {
    undoManagerRef.current?.redo();
  }, [undoManagerRef]);

  if (disabled) return null;

  return (
    <div className="flex items-center gap-1 py-1">
      <button
        type="button"
        onClick={handleUndo}
        className="rounded px-2 py-1 text-xs text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
        title="Undo your changes"
      >
        Undo
      </button>
      <button
        type="button"
        onClick={handleRedo}
        className="rounded px-2 py-1 text-xs text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
        title="Redo your changes"
      >
        Redo
      </button>
    </div>
  );
}

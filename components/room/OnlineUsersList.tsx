"use client";

import { getInitial } from "@/lib/user-identity";
import { useAppStore } from "@/lib/store";

export function OnlineUsersList() {
  const onlineUsers = useAppStore((state) => state.onlineUsers);
  const localClientId = useAppStore((state) => state.localClientId);

  return (
    <div className="border-b border-zinc-800">
      <div className="px-4 py-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Online
        </h2>
        <p className="mt-1 text-sm text-zinc-300">
          {onlineUsers.length}{" "}
          {onlineUsers.length === 1 ? "collaborator" : "collaborators"}
        </p>
      </div>

      <ul className="max-h-36 space-y-1 overflow-y-auto px-2 pb-2">
        {onlineUsers.map((user) => {
          const isYou = user.clientId === localClientId;
          return (
            <li
              key={user.clientId}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors duration-200 hover:bg-zinc-900"
              style={{ animation: "fadeIn 0.25s ease-out" }}
            >
              <div
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-zinc-950"
                style={{ backgroundColor: user.color }}
              >
                {getInitial(user.name)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-zinc-200">
                  {user.name}
                  {isYou && (
                    <span className="ml-1 text-[10px] font-normal text-zinc-500">
                      (you)
                    </span>
                  )}
                </p>
                <div className="flex items-center gap-1.5">
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: user.color }}
                  />
                  {user.voiceActive && (
                    <span className="text-[10px] text-emerald-500">🎤</span>
                  )}
                </div>
              </div>
            </li>
          );
        })}

        {onlineUsers.length === 0 && (
          <li className="px-3 py-4 text-center text-xs text-zinc-600">
            Waiting for collaborators…
          </li>
        )}
      </ul>
    </div>
  );
}

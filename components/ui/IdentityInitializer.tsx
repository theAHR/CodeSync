"use client";

import { useEffect } from "react";
import { getOrCreateIdentity, saveIdentity } from "@/lib/user-identity";
import { useAppStore } from "@/lib/store";

export function IdentityInitializer() {
  const setCurrentUser = useAppStore((state) => state.setCurrentUser);

  useEffect(() => {
    const identity = getOrCreateIdentity();
    saveIdentity(identity);
    setCurrentUser(identity);
  }, [setCurrentUser]);

  return null;
}

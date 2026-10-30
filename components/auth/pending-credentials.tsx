"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type Credentials = { email: string; password: string };

const PendingCredentialsContext = createContext<{
  credentials: Credentials | null;
  setCredentials: (credentials: Credentials | null) => void;
} | null>(null);

export function PendingCredentialsProvider({
  children,
}: {
  children: ReactNode;
}) {
  // Keep credentials only in memory while navigating the website's auth pages.
  const [credentials, setCredentials] = useState<Credentials | null>(null);

  return (
    <PendingCredentialsContext.Provider value={{ credentials, setCredentials }}>
      {children}
    </PendingCredentialsContext.Provider>
  );
}

export function usePendingCredentials() {
  const context = useContext(PendingCredentialsContext);
  if (!context) {
    throw new Error("Auth forms require PendingCredentialsProvider");
  }
  return context;
}

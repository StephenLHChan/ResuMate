"use server";

import { signIn, signOut } from "@/auth";

export const login = async (provider: string): Promise<void> => {
  await signIn(provider, { callbackUrl: "/home" });
};

export const logout = async (): Promise<void> => {
  await signOut();
};

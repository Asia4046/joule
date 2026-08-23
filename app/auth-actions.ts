"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { login, signup, createSession, safeNextPath } from "@/lib/auth";

const credentialsSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const signupSchema = credentialsSchema.extend({
  name: z.string().min(2, "Enter your name"),
});

export type AuthState = { error?: string } | undefined;

export async function loginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = credentialsSchema.safeParse({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const result = await login(parsed.data.email, parsed.data.password);
  if ("error" in result) return { error: result.error };
  await createSession(result.user);
  redirect(safeNextPath(formData.get("next")));
}

export async function signupAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = signupSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const result = await signup(parsed.data.email, parsed.data.password, parsed.data.name);
  if ("error" in result) return { error: result.error };
  await createSession(result.user);
  redirect("/dashboard");
}

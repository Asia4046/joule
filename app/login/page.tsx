import { safeNextPath } from "@/lib/auth";
import LoginForm from "@/components/auth/LoginForm";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const sp = await searchParams;
  return <LoginForm next={safeNextPath(sp.next)} />;
}

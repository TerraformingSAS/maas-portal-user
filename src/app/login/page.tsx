import { Suspense } from "react";
import LoginPageClient from "./login-client";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-terra border-t-transparent rounded-full animate-spin" /></div>}>
      <LoginPageClient />
    </Suspense>
  );
}

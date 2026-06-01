"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { useVerifyEmailMutation } from "@/lib/api/auth";


function VerifyEmailContent() {
  const params = useSearchParams();
  const verifyEmailMutation = useVerifyEmailMutation();
  const [message, setMessage] = useState("Verifying...");

  useEffect(() => {
    const token = params.get("token");
    if (!token) {
      setMessage("Missing verification token.");
      return;
    }
    verifyEmailMutation.mutateAsync({ token })
      .then(() => setMessage("Email verified. You can return to the app."))
      .catch((error) => setMessage(error instanceof Error ? error.message : "Verification failed"));
  }, [params, verifyEmailMutation]);

  return <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "var(--bg-primary)", color: "var(--text-primary)" }}>{message}</div>;
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "var(--bg-primary)", color: "var(--text-primary)" }}>Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}

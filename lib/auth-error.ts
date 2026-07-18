type AuthMode = "login" | "signup";

export function getAuthErrorMessage(error: unknown, mode: AuthMode) {
  if (!(error instanceof Error)) {
    return "Authentication failed.";
  }

  const message = error.message;

  if (
    mode === "login" &&
    (message.includes("auth/invalid-credential") ||
      message.includes("auth/wrong-password") ||
      message.includes("auth/user-not-found") ||
      message.includes("auth/invalid-login-credentials"))
  ) {
    return "Email or password is wrong.";
  }

  return "Authentication failed.";
}

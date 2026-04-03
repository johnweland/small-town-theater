"use client";

import { FormEvent, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  confirmResetPassword,
  confirmSignIn,
  resetPassword,
  signIn,
} from "aws-amplify/auth";

import { ensureAmplifyConfigured } from "@/lib/amplify/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type FormMode =
  | "signIn"
  | "forgotPasswordRequest"
  | "forgotPasswordConfirm"
  | "mfaChallenge"
  | "mfaSelection";

type MfaChallengeState = {
  helperText: string;
  inputLabel: string;
  signInStep:
    | "CONFIRM_SIGN_IN_WITH_CUSTOM_CHALLENGE"
    | "CONFIRM_SIGN_IN_WITH_EMAIL_CODE"
    | "CONFIRM_SIGN_IN_WITH_PASSWORD"
    | "CONFIRM_SIGN_IN_WITH_SMS_CODE"
    | "CONFIRM_SIGN_IN_WITH_TOTP_CODE";
};

type MfaSelectionState = {
  allowedTypes: string[];
  helperText: string;
};

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "We could not complete that step. Please try again.";
}

function getDeliveryDetailsMessage(
  destination?: string,
  medium?: string
) {
  if (destination && medium) {
    return `We sent a reset code via ${medium.toLowerCase()} to ${destination}.`;
  }

  if (destination) {
    return `We sent a reset code to ${destination}.`;
  }

  return "We sent a reset code for your account.";
}

function getChallengeState(signInStep: MfaChallengeState["signInStep"]): MfaChallengeState {
  switch (signInStep) {
    case "CONFIRM_SIGN_IN_WITH_TOTP_CODE":
      return {
        helperText: "Enter the 6-digit code from your authenticator app.",
        inputLabel: "Authenticator code",
        signInStep,
      };
    case "CONFIRM_SIGN_IN_WITH_EMAIL_CODE":
      return {
        helperText: "Enter the code that was sent to your email.",
        inputLabel: "Email code",
        signInStep,
      };
    case "CONFIRM_SIGN_IN_WITH_SMS_CODE":
      return {
        helperText: "Enter the code that was sent to your phone.",
        inputLabel: "SMS code",
        signInStep,
      };
    case "CONFIRM_SIGN_IN_WITH_PASSWORD":
      return {
        helperText: "Re-enter your password to continue.",
        inputLabel: "Password",
        signInStep,
      };
    default:
      return {
        helperText: "Complete the required sign-in challenge to continue.",
        inputLabel: "Challenge response",
        signInStep,
      };
  }
}

export function SignInForm({
  initialEmail,
  created,
  showBootstrapInvite,
}: {
  initialEmail: string;
  created: boolean;
  showBootstrapInvite: boolean;
}) {
  ensureAmplifyConfigured();

  const router = useRouter();
  const [formMode, setFormMode] = useState<FormMode>("signIn");
  const [email, setEmail] = useState(initialEmail);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [mfaChallenge, setMfaChallenge] = useState<MfaChallengeState | null>(null);
  const [mfaSelection, setMfaSelection] = useState<MfaSelectionState | null>(null);

  async function handleNextSignInStep(
    nextStep: Awaited<ReturnType<typeof signIn>>["nextStep"]
  ) {
    switch (nextStep.signInStep) {
      case "DONE":
        router.replace("/admin");
        router.refresh();
        return;
      case "RESET_PASSWORD":
        setFormMode("forgotPasswordRequest");
        setMessage(
          "This account needs a password reset before it can sign in. Request a reset code below."
        );
        return;
      case "CONFIRM_SIGN_IN_WITH_TOTP_CODE":
      case "CONFIRM_SIGN_IN_WITH_EMAIL_CODE":
      case "CONFIRM_SIGN_IN_WITH_SMS_CODE":
      case "CONFIRM_SIGN_IN_WITH_CUSTOM_CHALLENGE":
      case "CONFIRM_SIGN_IN_WITH_PASSWORD":
        setMfaChallenge(getChallengeState(nextStep.signInStep));
        setMfaSelection(null);
        setFormMode("mfaChallenge");
        setMessage(null);
        return;
      case "CONTINUE_SIGN_IN_WITH_MFA_SELECTION": {
        const allowedTypes = nextStep.allowedMFATypes ?? [];

        if (allowedTypes.length === 1) {
          const result = await confirmSignIn({
            challengeResponse: allowedTypes[0],
          });
          await handleNextSignInStep(result.nextStep);
          return;
        }

        setMfaSelection({
          allowedTypes,
          helperText: "Choose the method you want to use for this sign-in.",
        });
        setMfaChallenge(null);
        setFormMode("mfaSelection");
        setMessage(null);
        return;
      }
      case "CONFIRM_SIGN_UP":
        setError("Your account still needs confirmation before it can sign in.");
        return;
      default:
        setError(`Additional sign-in step required: ${nextStep.signInStep}.`);
    }
  }

  async function handleSignInSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    setError(null);
    setMessage(null);

    const formData = new FormData(event.currentTarget);
    const normalizedEmail = String(formData.get("email") ?? "").trim().toLowerCase();
    const password = String(formData.get("password") ?? "");

    setEmail(normalizedEmail);

    try {
      const result = await signIn({
        username: normalizedEmail,
        password,
      });

      await handleNextSignInStep(result.nextStep);
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setIsPending(false);
    }
  }

  async function handleMfaChallengeSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!mfaChallenge) {
      return;
    }

    setIsPending(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const challengeResponse = String(formData.get("challengeResponse") ?? "").trim();

    try {
      const result = await confirmSignIn({
        challengeResponse,
      });

      await handleNextSignInStep(result.nextStep);
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setIsPending(false);
    }
  }

  async function handleMfaSelectionSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsPending(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const method = String(formData.get("method") ?? "");

    try {
      const result = await confirmSignIn({
        challengeResponse: method,
      });

      await handleNextSignInStep(result.nextStep);
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setIsPending(false);
    }
  }

  async function handleForgotPasswordRequestSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setIsPending(true);
    setError(null);
    setMessage(null);

    const formData = new FormData(event.currentTarget);
    const normalizedEmail = String(formData.get("email") ?? "").trim().toLowerCase();

    setEmail(normalizedEmail);

    try {
      const result = await resetPassword({
        username: normalizedEmail,
      });

      if (result.nextStep.resetPasswordStep === "DONE") {
        setFormMode("signIn");
        setMessage("Password reset is complete. Sign in with your new password.");
        return;
      }

      setFormMode("forgotPasswordConfirm");
      setMessage(
        getDeliveryDetailsMessage(
          result.nextStep.codeDeliveryDetails.destination,
          result.nextStep.codeDeliveryDetails.deliveryMedium
        )
      );
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setIsPending(false);
    }
  }

  async function handleForgotPasswordConfirmSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setIsPending(true);
    setError(null);
    setMessage(null);

    const formData = new FormData(event.currentTarget);
    const confirmationCode = String(formData.get("confirmationCode") ?? "").trim();
    const newPassword = String(formData.get("newPassword") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (newPassword !== confirmPassword) {
      setError("Your new password confirmation did not match.");
      setIsPending(false);
      return;
    }

    try {
      await confirmResetPassword({
        username: email.trim().toLowerCase(),
        confirmationCode,
        newPassword,
      });

      setFormMode("signIn");
      setMessage("Password reset complete. Sign in with your new password.");
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setIsPending(false);
    }
  }

  function resetToSignIn() {
    setFormMode("signIn");
    setError(null);
    setMessage(null);
    setMfaChallenge(null);
    setMfaSelection(null);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <Card className="w-full max-w-md border-border/50 bg-card/95">
        <CardHeader className="space-y-3 text-center">
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            Marquee Admin
          </p>
          <CardTitle className="font-serif text-4xl italic text-primary">
            Theater staff sign in
          </CardTitle>
          <CardDescription>
            Staff access is limited to invited theater accounts.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {formMode === "signIn" ? (
            <form className="flex flex-col gap-4" onSubmit={handleSignInSubmit}>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium">Email</span>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium">Password</span>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                />
              </label>
              {created ? (
                <p className="text-sm text-emerald-700">
                  Your staff account is ready. Sign in with the password you just
                  created.
                </p>
              ) : null}
              {message ? <p className="text-sm text-primary">{message}</p> : null}
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              <Button className="w-full" type="submit" disabled={isPending}>
                {isPending ? "Signing in..." : "Sign in"}
              </Button>
              <Button
                type="button"
                variant="link"
                className="h-auto justify-start px-0"
                onClick={() => {
                  setError(null);
                  setMessage(null);
                  setFormMode("forgotPasswordRequest");
                }}
              >
                Forgot your password?
              </Button>
            </form>
          ) : null}

          {formMode === "forgotPasswordRequest" ? (
            <form
              className="flex flex-col gap-4"
              onSubmit={handleForgotPasswordRequestSubmit}
            >
              <div>
                <p className="text-sm font-medium text-foreground">
                  Reset password
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Enter your staff email and we&apos;ll send a reset code.
                </p>
              </div>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium">Email</span>
                <Input
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </label>
              {message ? <p className="text-sm text-primary">{message}</p> : null}
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              <Button className="w-full" type="submit" disabled={isPending}>
                {isPending ? "Sending code..." : "Send reset code"}
              </Button>
              <Button
                type="button"
                variant="link"
                className="h-auto justify-start px-0"
                onClick={resetToSignIn}
              >
                Back to sign in
              </Button>
            </form>
          ) : null}

          {formMode === "forgotPasswordConfirm" ? (
            <form
              className="flex flex-col gap-4"
              onSubmit={handleForgotPasswordConfirmSubmit}
            >
              <div>
                <p className="text-sm font-medium text-foreground">
                  Finish password reset
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Enter the reset code and choose a new password for {email}.
                </p>
              </div>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium">Reset code</span>
                <Input name="confirmationCode" inputMode="numeric" required />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium">New password</span>
                <Input
                  name="newPassword"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium">Confirm new password</span>
                <Input
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </label>
              {message ? <p className="text-sm text-primary">{message}</p> : null}
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              <Button className="w-full" type="submit" disabled={isPending}>
                {isPending ? "Updating password..." : "Reset password"}
              </Button>
              <Button
                type="button"
                variant="link"
                className="h-auto justify-start px-0"
                onClick={() => {
                  setError(null);
                  setMessage(null);
                  setFormMode("forgotPasswordRequest");
                }}
              >
                Resend or change email
              </Button>
            </form>
          ) : null}

          {formMode === "mfaChallenge" && mfaChallenge ? (
            <form className="flex flex-col gap-4" onSubmit={handleMfaChallengeSubmit}>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Verify your sign-in
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {mfaChallenge.helperText}
                </p>
              </div>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium">{mfaChallenge.inputLabel}</span>
                <Input
                  name="challengeResponse"
                  type={
                    mfaChallenge.signInStep === "CONFIRM_SIGN_IN_WITH_PASSWORD"
                      ? "password"
                      : "text"
                  }
                  autoComplete={
                    mfaChallenge.signInStep === "CONFIRM_SIGN_IN_WITH_PASSWORD"
                      ? "current-password"
                      : "one-time-code"
                  }
                  inputMode={
                    mfaChallenge.signInStep === "CONFIRM_SIGN_IN_WITH_PASSWORD"
                      ? undefined
                      : "numeric"
                  }
                  required
                />
              </label>
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              <Button className="w-full" type="submit" disabled={isPending}>
                {isPending ? "Verifying..." : "Continue"}
              </Button>
            </form>
          ) : null}

          {formMode === "mfaSelection" && mfaSelection ? (
            <form className="flex flex-col gap-4" onSubmit={handleMfaSelectionSubmit}>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Choose a verification method
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {mfaSelection.helperText}
                </p>
              </div>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium">Method</span>
                <select
                  name="method"
                  className="flex h-11 w-full rounded-md border border-border/40 bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/20"
                  required
                  defaultValue={mfaSelection.allowedTypes[0] ?? ""}
                >
                  {mfaSelection.allowedTypes.map((type) => (
                    <option key={type} value={type}>
                      {type === "TOTP" ? "Authenticator app" : type}
                    </option>
                  ))}
                </select>
              </label>
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              <Button className="w-full" type="submit" disabled={isPending}>
                {isPending ? "Continuing..." : "Continue"}
              </Button>
            </form>
          ) : null}

          <div className="text-center text-sm text-muted-foreground">
            <p>
              Need access? Ask an administrator for a temporary staff setup link.{" "}
              <Link className="text-primary underline-offset-4 hover:underline" href="/">
                Return to the public site
              </Link>
            </p>
            {showBootstrapInvite ? (
              <p className="mt-2">
                First staff account?{" "}
                <Link
                  className="text-primary underline-offset-4 hover:underline"
                  href="/admin/bootstrap"
                >
                  Create a bootstrap invite
                </Link>
              </p>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

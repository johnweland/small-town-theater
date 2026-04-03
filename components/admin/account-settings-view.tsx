"use client";

import { FormEvent, useEffect, useState } from "react";

import {
  confirmResetPassword,
  deleteUserAttributes,
  fetchMFAPreference,
  resetPassword,
  setUpTOTP,
  signOut,
  updateMFAPreference,
  updateUserAttributes,
  verifyTOTPSetup,
} from "aws-amplify/auth";
import { ShieldCheck, Smartphone, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { AdminImageUploadField } from "@/components/admin/admin-image-upload-field";
import { AdminPageHeader } from "@/components/admin/page-header";
import { AdminSectionCard } from "@/components/admin/section-card";
import { ResolvedAvatarImage } from "@/components/shared/avatar-image";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ensureAmplifyConfigured } from "@/lib/amplify/client";
import {
  getUserInitials,
  resolveAvatarUrl,
  resolveDisplayName,
} from "@/lib/auth/profile";

type AccountSettingsViewProps = {
  initialAvatarUrl: string | null;
  initialDisplayName: string | null;
  initialEmail: string;
  initialGravatarUrl: string | null;
  initialUploadedAvatarUrl: string | null;
};

type TotpSetupState = {
  code: string;
  secret: string;
  uri: string;
};

export function AccountSettingsView({
  initialAvatarUrl,
  initialDisplayName,
  initialEmail,
  initialGravatarUrl,
  initialUploadedAvatarUrl,
}: AccountSettingsViewProps) {
  ensureAmplifyConfigured();

  const router = useRouter();
  const [displayName, setDisplayName] = useState(initialDisplayName ?? "");
  const [uploadedAvatarUrl, setUploadedAvatarUrl] = useState(
    initialUploadedAvatarUrl ?? ""
  );
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isSendingPasswordReset, setIsSendingPasswordReset] = useState(false);
  const [isConfirmingPasswordReset, setIsConfirmingPasswordReset] = useState(false);
  const [passwordResetRequested, setPasswordResetRequested] = useState(false);
  const [passwordResetMessage, setPasswordResetMessage] = useState<string | null>(null);
  const [isLoadingMfa, setIsLoadingMfa] = useState(true);
  const [isSubmittingMfa, setIsSubmittingMfa] = useState(false);
  const [totpEnabled, setTotpEnabled] = useState(false);
  const [totpSetup, setTotpSetup] = useState<TotpSetupState | null>(null);
  const [isSigningOutEverywhere, setIsSigningOutEverywhere] = useState(false);

  const effectiveAvatarUrl = resolveAvatarUrl({
    uploadedAvatarUrl,
    gravatarUrl: initialGravatarUrl,
  });
  const effectiveDisplayName = resolveDisplayName(displayName, initialEmail);
  const initials = getUserInitials(displayName, initialEmail);

  useEffect(() => {
    let isActive = true;

    async function loadMfaState() {
      try {
        const preference = await fetchMFAPreference();

        if (!isActive) {
          return;
        }

        setTotpEnabled(Boolean(preference.enabled?.includes("TOTP")));
      } catch (error) {
        if (isActive) {
          toast.error("Could not load your current 2FA status.", {
            description: getErrorMessage(error),
          });
        }
      } finally {
        if (isActive) {
          setIsLoadingMfa(false);
        }
      }
    }

    void loadMfaState();

    return () => {
      isActive = false;
    };
  }, []);

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedDisplayName = displayName.trim();

    if (!normalizedDisplayName) {
      toast.error("Display name is required.");
      return;
    }

    setIsSavingProfile(true);

    try {
      await updateUserAttributes({
        userAttributes: {
          name: normalizedDisplayName,
          ...(uploadedAvatarUrl.trim() ? { picture: uploadedAvatarUrl.trim() } : {}),
        },
      });

      if (!uploadedAvatarUrl.trim() && initialUploadedAvatarUrl) {
        await deleteUserAttributes({
          userAttributeKeys: ["picture"],
        });
      }

      toast.success("Account profile updated.", {
        description: "Your display name and avatar are now up to date.",
      });
      router.refresh();
    } catch (error) {
      toast.error("We could not save your profile.", {
        description: getErrorMessage(error),
      });
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handlePasswordResetRequest() {
    setPasswordError(null);
    setPasswordResetMessage(null);
    setIsSendingPasswordReset(true);

    try {
      const result = await resetPassword({
        username: initialEmail,
      });

      setPasswordResetRequested(true);
      setPasswordResetMessage(
        getDeliveryDetailsMessage(
          result.nextStep.codeDeliveryDetails.destination,
          result.nextStep.codeDeliveryDetails.deliveryMedium
        )
      );
    } catch (error) {
      setPasswordError(getErrorMessage(error));
    } finally {
      setIsSendingPasswordReset(false);
    }
  }

  async function handlePasswordResetConfirm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordError(null);
    setIsConfirmingPasswordReset(true);
    const form = event.currentTarget;

    const formData = new FormData(form);
    const confirmationCode = String(formData.get("confirmationCode") ?? "").trim();
    const newPassword = String(formData.get("resetPassword") ?? "");
    const confirmPassword = String(formData.get("confirmResetPassword") ?? "");

    if (newPassword !== confirmPassword) {
      setPasswordError("Your reset password confirmation did not match.");
      setIsConfirmingPasswordReset(false);
      return;
    }

    try {
      await confirmResetPassword({
        username: initialEmail,
        confirmationCode,
        newPassword,
      });

      form.reset();
      setPasswordResetRequested(false);
      setPasswordResetMessage("Password reset complete. Use the new password the next time you sign in.");
      toast.success("Password reset complete.");
    } catch (error) {
      setPasswordError(getErrorMessage(error));
    } finally {
      setIsConfirmingPasswordReset(false);
    }
  }

  async function handleStartTotpSetup() {
    setIsSubmittingMfa(true);

    try {
      const setupDetails = await setUpTOTP();

      setTotpSetup({
        code: "",
        secret: setupDetails.sharedSecret,
        uri: setupDetails.getSetupUri("Marquee Admin", initialEmail).toString(),
      });
    } catch (error) {
      toast.error("Could not start 2FA setup.", {
        description: getErrorMessage(error),
      });
    } finally {
      setIsSubmittingMfa(false);
    }
  }

  async function handleVerifyTotpSetup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!totpSetup) {
      return;
    }

    setIsSubmittingMfa(true);

    try {
      await verifyTOTPSetup({ code: totpSetup.code.trim() });
      await updateMFAPreference({
        totp: "PREFERRED",
      });

      setTotpEnabled(true);
      setTotpSetup(null);
      toast.success("Two-factor authentication is on.", {
        description: "Authenticator codes will now be required at sign-in.",
      });
      router.refresh();
    } catch (error) {
      toast.error("We could not verify that code.", {
        description: getErrorMessage(error),
      });
    } finally {
      setIsSubmittingMfa(false);
    }
  }

  async function handleDisableTotp() {
    setIsSubmittingMfa(true);

    try {
      await updateMFAPreference({
        totp: "DISABLED",
      });

      setTotpEnabled(false);
      setTotpSetup(null);
      toast.success("Two-factor authentication disabled.");
    } catch (error) {
      toast.error("We could not disable 2FA.", {
        description: getErrorMessage(error),
      });
    } finally {
      setIsSubmittingMfa(false);
    }
  }

  async function handleGlobalSignOut() {
    setIsSigningOutEverywhere(true);

    try {
      await signOut({ global: true });
      router.replace("/admin/sign-in");
      router.refresh();
    } catch (error) {
      toast.error("We could not sign out every session.", {
        description: getErrorMessage(error),
      });
      setIsSigningOutEverywhere(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        eyebrow="Account"
        title="Profile, security, and access"
        description="Manage the identity details your staff account uses across the admin tools."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <AdminSectionCard
          title="Profile"
          description="Choose the display name and avatar shown across the admin workspace."
          className="h-full"
        >
          <form className="flex flex-col gap-6" onSubmit={handleProfileSubmit}>
            <div className="flex flex-col gap-4 rounded-xl bg-surface-container-high p-5 sm:flex-row sm:items-center">
              <Avatar className="size-20 ring-1 ring-border/30">
                <ResolvedAvatarImage
                  src={effectiveAvatarUrl}
                  alt={effectiveDisplayName}
                />
                <AvatarFallback className="bg-primary/10 text-xl font-semibold text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-lg font-semibold text-foreground">
                  {effectiveDisplayName}
                </p>
                <p className="truncate text-sm text-muted-foreground">
                  {initialEmail}
                </p>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  Avatar priority: uploaded image, then Gravatar, then your initials.
                </p>
              </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <label className="flex flex-col gap-2">
                <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
                  Display name
                </span>
                <Input
                  name="displayName"
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  autoComplete="name"
                  required
                />
                <span className="text-xs leading-5 text-muted-foreground">
                  This name appears in the admin header and future audit surfaces.
                </span>
              </label>

              <label className="flex flex-col gap-2">
                <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
                  Email
                </span>
                <Input value={initialEmail} readOnly disabled />
                <span className="text-xs leading-5 text-muted-foreground">
                  Staff email is managed through Cognito and staff invitations.
                </span>
              </label>
            </div>

            <AdminImageUploadField
              label="Avatar"
              description="Upload a square image for the cleanest crop. Remove it anytime to fall back to Gravatar or initials."
              uploadPathPrefix={(identityId) =>
                `avatars/${identityId ?? "unknown"}`
              }
              value={uploadedAvatarUrl}
              onChange={setUploadedAvatarUrl}
              previewLabel={
                uploadedAvatarUrl
                  ? "The uploaded avatar will be used immediately after you save."
                  : initialAvatarUrl
                    ? "No uploaded avatar yet. This account is currently using a fallback image."
                    : "No avatar found yet. The UI will fall back to initials."
              }
            />

            <div className="flex justify-end">
              <Button type="submit" disabled={isSavingProfile}>
                {isSavingProfile ? "Saving profile..." : "Save profile"}
              </Button>
            </div>
          </form>
        </AdminSectionCard>

        <div className="flex flex-col gap-6">
          <AdminSectionCard
            title="Password"
            description="Send a reset code to your staff email and set a new password from here."
          >
            <div className="flex flex-col gap-6">
              <div className="rounded-xl border border-border/30 bg-surface-container-high p-4">
                <p className="text-sm font-semibold text-foreground">
                  Password reset
                </p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Send a reset code to {initialEmail}, then enter that code with your
                  new password below.
                </p>
                <div className="mt-4 flex justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => void handlePasswordResetRequest()}
                    disabled={isSendingPasswordReset}
                  >
                    {isSendingPasswordReset ? "Sending code..." : "Send reset code"}
                  </Button>
                </div>
              </div>

              {passwordResetRequested ? (
                <form
                  className="flex flex-col gap-4"
                  onSubmit={handlePasswordResetConfirm}
                >
                  <label className="flex flex-col gap-2">
                    <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
                      Reset code
                    </span>
                    <Input name="confirmationCode" inputMode="numeric" required />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
                      New password
                    </span>
                    <Input
                      name="resetPassword"
                      type="password"
                      autoComplete="new-password"
                      minLength={8}
                      required
                    />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
                      Confirm new password
                    </span>
                    <Input
                      name="confirmResetPassword"
                      type="password"
                      autoComplete="new-password"
                      minLength={8}
                      required
                    />
                  </label>
                  {passwordResetMessage ? (
                    <p className="text-sm text-primary">{passwordResetMessage}</p>
                  ) : null}
                  {passwordError ? (
                    <p className="text-sm text-destructive">{passwordError}</p>
                  ) : null}
                  <div className="flex justify-end">
                    <Button type="submit" disabled={isConfirmingPasswordReset}>
                      {isConfirmingPasswordReset ? "Resetting password..." : "Confirm reset"}
                    </Button>
                  </div>
                </form>
              ) : passwordResetMessage ? (
                <p className="text-sm text-primary">{passwordResetMessage}</p>
              ) : null}
            </div>
          </AdminSectionCard>

          <AdminSectionCard
            title="Two-factor authentication"
            description="Protect this admin account with an authenticator app code."
          >
            <div className="flex flex-col gap-4">
              <div className="rounded-xl bg-surface-container-high p-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 size-5 text-primary" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {isLoadingMfa
                        ? "Loading 2FA status..."
                        : totpEnabled
                          ? "Authenticator app enabled"
                          : "Authenticator app not enabled"}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {totpEnabled
                        ? "You will be asked for a time-based code after entering your password."
                        : "Turn this on to require a second factor during admin sign-in."}
                    </p>
                  </div>
                </div>
              </div>

              {totpSetup ? (
                <form className="flex flex-col gap-4" onSubmit={handleVerifyTotpSetup}>
                  <div className="rounded-xl border border-border/30 bg-surface-container-high p-4">
                    <div className="flex items-start gap-3">
                      <Smartphone className="mt-0.5 size-5 text-primary" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground">
                          Add this account to your authenticator app
                        </p>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                          Use the secret below or paste the setup URI into your authenticator
                          app if it supports manual entry.
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 grid gap-4">
                      <label className="flex flex-col gap-2">
                        <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
                          Secret key
                        </span>
                        <Input value={totpSetup.secret} readOnly />
                      </label>
                      <label className="flex flex-col gap-2">
                        <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
                          Setup URI
                        </span>
                        <Input value={totpSetup.uri} readOnly />
                      </label>
                    </div>
                  </div>

                  <label className="flex flex-col gap-2">
                    <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
                      Verification code
                    </span>
                    <Input
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={totpSetup.code}
                      onChange={(event) =>
                        setTotpSetup((current) =>
                          current
                            ? {
                                ...current,
                                code: event.target.value,
                              }
                            : current
                        )
                      }
                      placeholder="123456"
                      required
                    />
                  </label>

                  <div className="flex flex-wrap justify-end gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setTotpSetup(null)}
                      disabled={isSubmittingMfa}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmittingMfa}>
                      {isSubmittingMfa ? "Verifying..." : "Verify and enable 2FA"}
                    </Button>
                  </div>
                </form>
              ) : totpEnabled ? (
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => void handleDisableTotp()}
                    disabled={isSubmittingMfa || isLoadingMfa}
                  >
                    {isSubmittingMfa ? "Updating..." : "Disable 2FA"}
                  </Button>
                </div>
              ) : (
                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={() => void handleStartTotpSetup()}
                    disabled={isSubmittingMfa || isLoadingMfa}
                  >
                    {isSubmittingMfa ? "Starting setup..." : "Enable 2FA"}
                  </Button>
                </div>
              )}
            </div>
          </AdminSectionCard>

          <AdminSectionCard
            title="Sessions"
            description="Sign out your current account from every browser or device at once."
          >
            <div className="flex flex-col gap-4 rounded-xl bg-surface-container-high p-4">
              <div className="flex items-start gap-3">
                <UserRound className="mt-0.5 size-5 text-primary" />
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Global sign-out
                  </p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    This ends all active sessions, including the one you are using right
                    now.
                  </p>
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void handleGlobalSignOut()}
                  disabled={isSigningOutEverywhere}
                >
                  {isSigningOutEverywhere ? "Signing out..." : "Log out all sessions"}
                </Button>
              </div>
            </div>
          </AdminSectionCard>
        </div>
      </div>
    </div>
  );
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Please try again.";
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

"use client";

import { useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  User as UserIcon,
  Mail,
  Shield,
  Check,
  Loader2,
  ExternalLink,
} from "lucide-react";

interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  has_purchased: boolean;
  created_at: string;
  updated_at: string;
}

export function AccountProfile({
  user,
  profile,
}: {
  user: User;
  profile: Profile | null;
}) {
  const supabase = createClient();
  const [displayName, setDisplayName] = useState(
    profile?.display_name || user.user_metadata?.display_name || ""
  );
  const [saving, setSaving] = useState(false);

  const avatarUrl =
    profile?.avatar_url || user.user_metadata?.avatar_url || null;
  const initials = (displayName || "U")
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  async function handleSave() {
    setSaving(true);
    try {
      // Update profile table
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          display_name: displayName,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (profileError) throw profileError;

      // Update auth metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: { display_name: displayName },
      });

      if (authError) throw authError;

      toast.success("Profile updated successfully");
    } catch {
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Profile Card */}
      <div className="glass-strong rounded-2xl p-8">
        <div className="mb-6 flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={avatarUrl || undefined} alt={displayName} />
            <AvatarFallback className="bg-primary text-lg text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              {displayName || "User"}
            </h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="displayName"
              className="flex items-center gap-2 text-foreground"
            >
              <UserIcon className="h-4 w-4 text-muted-foreground" />
              Display Name
            </Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your display name"
              className="rounded-xl"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label className="flex items-center gap-2 text-foreground">
              <Mail className="h-4 w-4 text-muted-foreground" />
              Email
            </Label>
            <Input
              value={user.email || ""}
              disabled
              className="rounded-xl opacity-60"
            />
          </div>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full rounded-xl sm:w-auto"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </div>

      {/* Purchase Status */}
      <div className="glass-strong rounded-2xl p-8">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
          <Shield className="h-5 w-5 text-primary" />
          License Status
        </h3>

        {profile?.has_purchased ? (
          <div className="flex items-center gap-3 rounded-xl bg-primary/10 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary">
              <Check className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <p className="font-medium text-foreground">
                Creator Pro - Active
              </p>
              <p className="text-sm text-muted-foreground">
                You have lifetime access to all Lumina AI features.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              {
                "You haven't purchased Lumina AI yet. Unlock all features with a one-time purchase."
              }
            </p>
            <a href="/checkout">
              <Button variant="outline" className="gap-2 rounded-xl bg-transparent">
                Purchase Now
                <ExternalLink className="h-4 w-4" />
              </Button>
            </a>
          </div>
        )}
      </div>

      {/* Download Links */}
      <div className="glass-strong rounded-2xl p-8">
        <h3 className="mb-4 text-lg font-semibold text-foreground">
          Download the App
        </h3>
        <p className="mb-4 text-sm text-muted-foreground">
          Get Lumina AI on your device. Sign in with the same account to sync
          your license.
        </p>
        <div className="flex flex-wrap gap-3">
          <a
            href="https://apps.apple.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-xl glass-subtle px-5 py-3 text-foreground transition-all hover:scale-105"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
            </svg>
            <span className="text-sm font-semibold">App Store</span>
          </a>
          <a
            href="https://play.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-xl glass-subtle px-5 py-3 text-foreground transition-all hover:scale-105"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3.609 1.814L13.792 12 3.61 22.186a2.372 2.372 0 0 1-.497-.697L2.51 14.88 2 12c0-.305.05-.604.14-.89l.61-6.608c.094-.25.23-.477.41-.688l.45-.001zm.786-.612L14.63 11.157l2.878-2.878-10.84-6.255a2.375 2.375 0 0 0-2.273-.822zM18.73 8.992l-2.88 2.88 2.88 2.88 2.584-1.493a2.375 2.375 0 0 0 0-4.274L18.73 8.992zM14.63 12.843L4.395 22.798a2.375 2.375 0 0 0 2.273-.822l10.84-6.255-2.878-2.878z" />
            </svg>
            <span className="text-sm font-semibold">Google Play</span>
          </a>
        </div>
      </div>
    </div>
  );
}

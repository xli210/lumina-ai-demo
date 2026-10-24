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
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          display_name: displayName,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (profileError) throw profileError;

      const { error: authError } = await supabase.auth.updateUser({
        data: { display_name: displayName },
      });

      if (authError) throw authError;

      toast.success("Profile updated successfully");
    } catch (err: unknown) {
      const e = err as { message?: string; details?: string; hint?: string; code?: string };
      const parts = [e?.message, e?.details, e?.hint, e?.code ? `(${e.code})` : null].filter(Boolean);
      const message = parts.length > 0 ? parts.join(" — ") : JSON.stringify(err);
      console.error("Profile update failed:", err);
      toast.error(`Failed to update profile: ${message}`);
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
                You have lifetime access to all NanoPocket features.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              {
                "You haven't purchased a license yet. Unlock all features with a one-time purchase."
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
          Desktop apps
        </h3>
        <p className="mb-4 text-sm text-muted-foreground">
          NanoPocket&apos;s desktop apps run on a Windows PC with an NVIDIA graphics card, so your files stay on your computer. Sign in with
          the same account to use your license.
        </p>
        <a
          href="/download"
          className="inline-flex items-center gap-2 rounded-xl glass-subtle px-5 py-3 text-sm font-semibold text-foreground transition-all hover:scale-105"
        >
          See the desktop apps
        </a>
      </div>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ConfirmActionDialog } from "./confirm-action-dialog";
import { AuditLogPanel } from "./audit-log-panel";
import { canBecomeAdmin, describeAge } from "@/lib/admin-confirm";
import {
  Users,
  Key,
  BadgeDollarSign,
  Search,
  Ban,
  CheckCircle2,
  Shield,
  ShieldOff,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Monitor,
  Mail,
  Calendar,
  Activity,
  AlertTriangle,
  ScrollText,
} from "lucide-react";

interface UserProfile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  has_purchased: boolean;
  role: string;
  is_banned: boolean;
  created_at: string;
  updated_at: string;
}

interface License {
  id: string;
  user_id: string | null;
  license_key: string;
  product_id: string;
  max_activations: number;
  is_revoked: boolean;
  created_at: string;
  /** Set only by the Stripe webhook. Its presence is what makes a sale a sale. */
  stripe_payment_intent_id: string | null;
  is_trial: boolean | null;
  trial_ends_at: string | null;
}

interface Activation {
  id: string;
  license_id: string;
  machine_id: string;
  machine_label: string | null;
  activated_at: string;
  last_seen_at: string;
}

type Tab = "users" | "licenses" | "audit";

/** What the confirmation dialog is asking about (see confirm-action-dialog.tsx). */
type Pending =
  | { kind: "role"; user: UserProfile; newRole: "admin" | "user" }
  | { kind: "ban"; user: UserProfile; banned: boolean }
  | { kind: "license"; license: License; revoke: boolean };

/** What the database knows about an account that the profile row does not (admin_user_identity). */
interface Identity {
  email: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  provider: string | null;
  email_confirmed: boolean;
}

const PAGE_SIZE = 20;

/**
 * Badge describing where a license came from.
 *
 * Only `stripe_payment_intent_id` proves money changed hands — every other
 * route leaves it NULL. Note this does not distinguish a free-product claim
 * from a comped copy of a paid product; that needs the catalogue price, and
 * /admin/licenses does it there.
 */
function OriginBadge({ license }: { license: License }) {
  if (license.stripe_payment_intent_id) {
    return (
      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-500">
        Paid
      </span>
    );
  }
  if (license.is_trial) {
    const live =
      license.trial_ends_at !== null &&
      new Date(license.trial_ends_at).getTime() > Date.now();
    return (
      <span
        className={`rounded-full px-2 py-0.5 text-xs ${
          live
            ? "bg-sky-500/10 text-sky-500"
            : "bg-muted text-muted-foreground"
        }`}
      >
        {live ? "Trial" : "Trial expired"}
      </span>
    );
  }
  return (
    <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
      Granted
    </span>
  );
}

export function AdminDashboard() {
  const supabase = createClient();
  const [tab, setTab] = useState<Tab>("users");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Users state
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [userPage, setUserPage] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);

  // Licenses state
  const [licenses, setLicenses] = useState<License[]>([]);
  const [licensePage, setLicensePage] = useState(0);
  const [totalLicenses, setTotalLicenses] = useState(0);

  // Expanded user detail
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [userLicenses, setUserLicenses] = useState<License[]>([]);
  const [userActivations, setUserActivations] = useState<Activation[]>([]);

  // Stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalLicenses: 0,
    paidLicenses: 0,
    totalActivations: 0,
    bannedUsers: 0,
  });

  const fetchStats = useCallback(async () => {
    const [usersRes, licensesRes, paidRes, activationsRes, bannedRes] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("licenses").select("*", { count: "exact", head: true }),
      supabase
        .from("licenses")
        .select("*", { count: "exact", head: true })
        .not("stripe_payment_intent_id", "is", null),
      supabase.from("activations").select("*", { count: "exact", head: true }),
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("is_banned", true),
    ]);
    setStats({
      totalUsers: usersRes.count ?? 0,
      totalLicenses: licensesRes.count ?? 0,
      paidLicenses: paidRes.count ?? 0,
      totalActivations: activationsRes.count ?? 0,
      bannedUsers: bannedRes.count ?? 0,
    });
  }, [supabase]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("profiles")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(userPage * PAGE_SIZE, (userPage + 1) * PAGE_SIZE - 1);

    if (searchQuery) {
      query = query.ilike("display_name", `%${searchQuery}%`);
    }

    const { data, count } = await query;
    setUsers(data ?? []);
    setTotalUsers(count ?? 0);
    setLoading(false);
  }, [supabase, userPage, searchQuery]);

  const fetchLicenses = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("licenses")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(licensePage * PAGE_SIZE, (licensePage + 1) * PAGE_SIZE - 1);

    if (searchQuery) {
      query = query.ilike("license_key", `%${searchQuery}%`);
    }

    const { data, count } = await query;
    setLicenses(data ?? []);
    setTotalLicenses(count ?? 0);
    setLoading(false);
  }, [supabase, licensePage, searchQuery]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    if (tab === "users") {
      fetchUsers();
    } else if (tab === "licenses") {
      fetchLicenses();
    }
  }, [tab, fetchUsers, fetchLicenses]);

  // Dangerous actions never run from a button press. A press opens a dialog that
  // makes the admin type the account's email (or the license key) and wait a few
  // seconds; the database functions (scripts/016_admin_guardrails.sql) then refuse
  // anything that does not name its target, record it in the audit log, and
  // rate-limit it. role and is_banned are not writable from the browser at all
  // (migration 008), and licenses are revoked through admin_set_license_revoked.
  const [pending, setPending] = useState<Pending | null>(null);
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [identityLoading, setIdentityLoading] = useState(false);
  const [identityError, setIdentityError] = useState<string | null>(null);

  function closePending() {
    setPending(null);
    setIdentity(null);
    setIdentityError(null);
    setIdentityLoading(false);
  }

  async function openUserAction(p: Extract<Pending, { kind: "role" | "ban" }>) {
    setPending(p);
    setIdentity(null);
    setIdentityError(null);
    setIdentityLoading(true);
    const { data, error } = await supabase.rpc("admin_user_identity", { p_user_id: p.user.id });
    const row = Array.isArray(data) ? data[0] : data;
    if (error || !row) {
      setIdentityError(error?.message || "Could not load this account's details.");
    } else {
      setIdentity(row as Identity);
    }
    setIdentityLoading(false);
  }

  /** Runs the pending action with what the admin typed. Returns an error message, or null on success. */
  async function runPending(typed: string): Promise<string | null> {
    if (!pending) return "Nothing to do.";
    let res;
    if (pending.kind === "role") {
      res = await supabase.rpc("admin_set_user_role", {
        p_user_id: pending.user.id,
        p_role: pending.newRole,
        p_confirm: typed,
      });
    } else if (pending.kind === "ban") {
      res = await supabase.rpc("admin_set_user_banned", {
        p_user_id: pending.user.id,
        p_banned: pending.banned,
        p_confirm: typed,
      });
    } else {
      res = await supabase.rpc("admin_set_license_revoked", {
        p_license_id: pending.license.id,
        p_revoked: pending.revoke,
        p_confirm: typed,
      });
    }
    if (res.error) return res.error.message || "The change was refused.";

    toast.success(
      pending.kind === "role"
        ? pending.newRole === "admin"
          ? "Admin role granted"
          : "Admin role removed"
        : pending.kind === "ban"
          ? pending.banned
            ? "User banned"
            : "User unbanned"
          : pending.revoke
            ? "License revoked"
            : "License restored"
    );
    return null;
  }

  function afterAction() {
    fetchUsers();
    fetchStats();
    if (tab === "licenses") fetchLicenses();
    if (expandedUser) {
      void supabase
        .from("licenses")
        .select("*")
        .eq("user_id", expandedUser)
        .then(({ data }) => setUserLicenses(data ?? []));
    }
  }

  /** The words and facts the dialog shows for the pending action. */
  function describePending() {
    if (!pending) return null;
    const nowMs = Date.now();

    if (pending.kind === "license") {
      const l = pending.license;
      return {
        title: pending.revoke ? "Revoke this license?" : "Restore this license?",
        summary: pending.revoke
          ? "The license is marked as revoked. Apps that check it will stop accepting it."
          : "The license is marked as active again.",
        consequences: undefined as string[] | undefined,
        target: {
          heading: l.license_key,
          lines: [`Product: ${l.product_id}`, `Created ${formatDate(l.created_at)}`],
        },
        warning: null as string | null,
        block: false,
        expected: l.license_key as string | null,
        expectedLabel: "license key",
        confirmLabel: pending.revoke ? "Revoke license" : "Restore license",
        tone: "danger" as const,
      };
    }

    const u = pending.user;
    const email = identity ? (identity.email ?? u.id) : null;
    const targetLines: string[] = [];
    if (identity) {
      targetLines.push(email ?? "");
      targetLines.push(`Account is ${describeAge(identity.created_at, nowMs)} old (registered ${formatDate(identity.created_at)})`);
      targetLines.push(
        identity.last_sign_in_at
          ? `Last signed in ${formatDate(identity.last_sign_in_at)}`
          : "Has never signed in"
      );
      targetLines.push(`Signs in with: ${identity.provider ?? "unknown"}${identity.email_confirmed ? "" : " (email not confirmed)"}`);
    }
    targetLines.push(`Current role: ${u.role}${u.is_banned ? ", banned" : ""}${u.has_purchased ? ", has a license" : ""}`);
    const target = { heading: u.display_name || "Unnamed", lines: targetLines.filter(Boolean) };

    if (pending.kind === "role" && pending.newRole === "admin") {
      const eligible = identity
        ? canBecomeAdmin(identity.created_at, identity.email_confirmed, nowMs)
        : ({ ok: true } as const);
      return {
        title: `Make ${u.display_name || "this account"} an admin?`,
        summary: "Admins have full control of the service. This is meant for the few people who run NanoPocket.",
        consequences: [
          "Opens this dashboard, the credits and licenses admin pages, and every private demo console (they spend the server's API credits).",
          "Lets the account activate any product with one key (the super license).",
          "Lets the account make other accounts admins.",
        ],
        target,
        warning: identityError ?? (eligible.ok ? null : eligible.reason),
        block: Boolean(identityError) || !eligible.ok,
        expected: email,
        expectedLabel: "account email",
        confirmLabel: "Make admin",
        tone: "danger" as const,
      };
    }

    if (pending.kind === "role") {
      return {
        title: `Remove admin from ${u.display_name || "this account"}?`,
        summary: "The account becomes an ordinary user.",
        consequences: [
          "Loses access to this dashboard and the private demo consoles.",
          "Its licenses and credits are not touched.",
        ],
        target,
        warning: identityError,
        block: Boolean(identityError),
        expected: email,
        expectedLabel: "account email",
        confirmLabel: "Remove admin",
        tone: "caution" as const,
      };
    }

    // ban / unban
    const banning = pending.banned;
    return {
      title: banning ? `Ban ${u.display_name || "this account"}?` : `Unban ${u.display_name || "this account"}?`,
      summary: banning
        ? "The account is marked as banned."
        : "The account is no longer marked as banned.",
      consequences: banning
        ? ["A banned account can no longer claim or activate licenses, or send feedback."]
        : undefined,
      target,
      warning:
        identityError ??
        (banning && u.role === "admin" ? "An admin cannot be banned. Remove the admin role first." : null),
      block: Boolean(identityError) || (banning && u.role === "admin"),
      expected: email,
      expectedLabel: "account email",
      confirmLabel: banning ? "Ban account" : "Unban account",
      tone: banning ? ("danger" as const) : ("caution" as const),
    };
  }

  async function expandUser(userId: string) {
    if (expandedUser === userId) {
      setExpandedUser(null);
      return;
    }
    setExpandedUser(userId);

    const { data: lics } = await supabase
      .from("licenses")
      .select("*")
      .eq("user_id", userId);

    setUserLicenses(lics ?? []);

    if (lics && lics.length > 0) {
      const licenseIds = lics.map((l) => l.id);
      const { data: acts } = await supabase
        .from("activations")
        .select("*")
        .in("license_id", licenseIds);
      setUserActivations(acts ?? []);
    } else {
      setUserActivations([]);
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {[
          { label: "Total Users", value: stats.totalUsers, icon: Users, color: "text-blue-400" },
          { label: "Licenses", value: stats.totalLicenses, icon: Key, color: "text-green-400" },
          { label: "Paid Licenses", value: stats.paidLicenses, icon: BadgeDollarSign, color: "text-emerald-400" },
          { label: "Activations", value: stats.totalActivations, icon: Monitor, color: "text-purple-400" },
          { label: "Banned", value: stats.bannedUsers, icon: Ban, color: "text-red-400" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="glass-strong rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <Icon className={`h-5 w-5 ${stat.color}`} />
                <span className="text-sm text-muted-foreground">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-border pb-3">
        <button
          onClick={() => { setTab("users"); setSearchQuery(""); }}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            tab === "users"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Users className="h-4 w-4" />
          Users
        </button>
        <button
          onClick={() => { setTab("licenses"); setSearchQuery(""); }}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            tab === "licenses"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Key className="h-4 w-4" />
          Licenses
        </button>
        <button
          onClick={() => { setTab("audit"); setSearchQuery(""); }}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            tab === "audit"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <ScrollText className="h-4 w-4" />
          Audit log
        </button>
      </div>

      {/* Search */}
      {tab !== "audit" && (
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={tab === "users" ? "Search by display name..." : "Search by license key..."}
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            if (tab === "users") setUserPage(0);
            else setLicensePage(0);
          }}
          className="pl-10 rounded-xl"
        />
      </div>
      )}

      {/* Content */}
      {tab === "audit" ? (
        <AuditLogPanel />
      ) : loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : tab === "users" ? (
        <>
          <div className="flex flex-col gap-3">
            {users.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No users found.
              </div>
            ) : (
              users.map((u) => (
                <div key={u.id}>
                  <div
                    className={`glass rounded-2xl p-5 transition-all cursor-pointer hover:border-primary/20 ${
                      expandedUser === u.id ? "border-primary/30" : ""
                    }`}
                    onClick={() => expandUser(u.id)}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                          {(u.display_name || "U")[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-foreground truncate">
                              {u.display_name || "Unnamed"}
                            </p>
                            {u.role === "admin" && (
                              <span className="rounded-full bg-purple-500/10 px-2 py-0.5 text-xs font-medium text-purple-400">
                                Admin
                              </span>
                            )}
                            {u.is_banned && (
                              <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-400">
                                Banned
                              </span>
                            )}
                            {u.has_purchased && (
                              <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-400">
                                Purchased
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(u.created_at)}
                            </span>
                            <span className="truncate text-[10px] font-mono opacity-50">
                              {u.id.slice(0, 8)}...
                            </span>
                          </div>
                        </div>
                      </div>

                      <span className="shrink-0 text-xs text-muted-foreground">
                        {expandedUser === u.id ? "Hide" : "Details"}
                      </span>
                    </div>
                  </div>

                  {/* Expanded User Detail */}
                  {expandedUser === u.id && (
                    <div className="ml-6 mt-2 glass rounded-xl p-5 border-l-2 border-primary/30">
                      <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Key className="h-4 w-4 text-primary" />
                        Licenses ({userLicenses.length})
                      </h4>
                      {userLicenses.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No licenses found.</p>
                      ) : (
                        <div className="flex flex-col gap-2">
                          {userLicenses.map((lic) => (
                            <div key={lic.id} className="glass-subtle rounded-lg p-3">
                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                <div>
                                  <span className="font-mono text-sm text-foreground">
                                    {lic.license_key}
                                  </span>
                                  <span className="ml-2 text-xs text-muted-foreground">
                                    ({lic.product_id})
                                  </span>
                                  <span className="ml-2">
                                    <OriginBadge license={lic} />
                                  </span>
                                  {lic.is_revoked && (
                                    <span className="ml-2 rounded-full bg-red-500/10 px-2 py-0.5 text-xs text-red-400">
                                      Revoked
                                    </span>
                                  )}
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {formatDate(lic.created_at)}
                                </span>
                              </div>

                              {/* Activations for this license */}
                              {userActivations
                                .filter((a) => a.license_id === lic.id)
                                .map((act) => (
                                  <div key={act.id} className="mt-2 ml-4 flex items-center gap-2 text-xs text-muted-foreground">
                                    <Monitor className="h-3 w-3" />
                                    <span>{act.machine_label || act.machine_id.slice(0, 16) + "..."}</span>
                                    <span className="flex items-center gap-1">
                                      <Activity className="h-3 w-3" />
                                      Last seen: {formatDate(act.last_seen_at)}
                                    </span>
                                  </div>
                                ))}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Danger zone: kept out of the row on purpose, one more step away from a stray tap */}
                      <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/5 p-4">
                        <h5 className="flex items-center gap-2 text-sm font-semibold text-red-400">
                          <AlertTriangle className="h-4 w-4" />
                          Danger zone
                        </h5>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                          These change what this account can do. Each one shows who it will affect, asks you to type
                          the account&apos;s email and waits a few seconds before it can be confirmed. Every use is
                          recorded in the audit log.
                        </p>
                        <div className="mt-3 flex flex-wrap gap-3">
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1.5 rounded-full bg-transparent text-xs"
                            onClick={() =>
                              void openUserAction({ kind: "role", user: u, newRole: u.role === "admin" ? "user" : "admin" })
                            }
                          >
                            {u.role === "admin" ? (
                              <>
                                <ShieldOff className="h-3.5 w-3.5" />
                                Remove admin…
                              </>
                            ) : (
                              <>
                                <Shield className="h-3.5 w-3.5" />
                                Make admin…
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1.5 rounded-full bg-transparent text-xs text-red-400"
                            onClick={() => void openUserAction({ kind: "ban", user: u, banned: !u.is_banned })}
                          >
                            {u.is_banned ? (
                              <>
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Unban…
                              </>
                            ) : (
                              <>
                                <Ban className="h-3.5 w-3.5" />
                                Ban…
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Showing {userPage * PAGE_SIZE + 1}–{Math.min((userPage + 1) * PAGE_SIZE, totalUsers)} of {totalUsers}
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="rounded-full bg-transparent"
                disabled={userPage === 0}
                onClick={() => setUserPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="rounded-full bg-transparent"
                disabled={(userPage + 1) * PAGE_SIZE >= totalUsers}
                onClick={() => setUserPage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {licenses.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No licenses found.
              </div>
            ) : (
              licenses.map((lic) => (
                <div key={lic.id} className="glass rounded-2xl p-5">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm font-bold text-foreground">
                          {lic.license_key}
                        </span>
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                          {lic.product_id}
                        </span>
                        <OriginBadge license={lic} />
                        {lic.is_revoked && (
                          <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-xs text-red-400">
                            Revoked
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span>Max: {lic.max_activations} machines</span>
                        <span>Created: {formatDate(lic.created_at)}</span>
                        {lic.user_id && (
                          <span className="font-mono opacity-50">
                            User: {lic.user_id.slice(0, 8)}...
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 rounded-full bg-transparent text-xs"
                      onClick={() => setPending({ kind: "license", license: lic, revoke: !lic.is_revoked })}
                    >
                      {lic.is_revoked ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Restore…
                        </>
                      ) : (
                        <>
                          <Ban className="h-3.5 w-3.5" />
                          Revoke…
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Showing {licensePage * PAGE_SIZE + 1}–{Math.min((licensePage + 1) * PAGE_SIZE, totalLicenses)} of {totalLicenses}
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="rounded-full bg-transparent"
                disabled={licensePage === 0}
                onClick={() => setLicensePage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="rounded-full bg-transparent"
                disabled={(licensePage + 1) * PAGE_SIZE >= totalLicenses}
                onClick={() => setLicensePage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}
      {(() => {
        const d = describePending();
        return (
          <ConfirmActionDialog
            open={pending !== null}
            onOpenChange={(v) => {
              if (!v) closePending();
            }}
            title={d?.title ?? ""}
            summary={d?.summary ?? ""}
            consequences={d?.consequences}
            target={d?.target ?? null}
            loadingTarget={identityLoading}
            warning={d?.warning ?? null}
            block={d?.block ?? false}
            expected={d?.expected ?? null}
            expectedLabel={d?.expectedLabel ?? "account email"}
            confirmLabel={d?.confirmLabel ?? "Confirm"}
            tone={d?.tone ?? "danger"}
            onConfirm={runPending}
            onDone={afterAction}
          />
        );
      })()}
    </div>
  );
}

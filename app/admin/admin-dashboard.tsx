"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Users,
  Key,
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
}

interface Activation {
  id: string;
  license_id: string;
  machine_id: string;
  machine_label: string | null;
  activated_at: string;
  last_seen_at: string;
}

type Tab = "users" | "licenses";

const PAGE_SIZE = 20;

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
    totalActivations: 0,
    bannedUsers: 0,
  });

  const fetchStats = useCallback(async () => {
    const [usersRes, licensesRes, activationsRes, bannedRes] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("licenses").select("*", { count: "exact", head: true }),
      supabase.from("activations").select("*", { count: "exact", head: true }),
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("is_banned", true),
    ]);
    setStats({
      totalUsers: usersRes.count ?? 0,
      totalLicenses: licensesRes.count ?? 0,
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
    } else {
      fetchLicenses();
    }
  }, [tab, fetchUsers, fetchLicenses]);

  async function toggleBan(userId: string, currentlyBanned: boolean) {
    const { error } = await supabase
      .from("profiles")
      .update({ is_banned: !currentlyBanned, updated_at: new Date().toISOString() })
      .eq("id", userId);

    if (error) {
      toast.error("Failed to update user status");
      return;
    }

    toast.success(currentlyBanned ? "User unbanned" : "User banned");
    fetchUsers();
    fetchStats();
  }

  async function toggleAdmin(userId: string, currentRole: string) {
    const newRole = currentRole === "admin" ? "user" : "admin";
    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole, updated_at: new Date().toISOString() })
      .eq("id", userId);

    if (error) {
      toast.error("Failed to update user role");
      return;
    }

    toast.success(`User role changed to ${newRole}`);
    fetchUsers();
  }

  async function revokeLicense(licenseId: string, currentlyRevoked: boolean) {
    const { error } = await supabase
      .from("licenses")
      .update({ is_revoked: !currentlyRevoked, updated_at: new Date().toISOString() })
      .eq("id", licenseId);

    if (error) {
      toast.error("Failed to update license");
      return;
    }

    toast.success(currentlyRevoked ? "License restored" : "License revoked");
    fetchLicenses();
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
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: "Total Users", value: stats.totalUsers, icon: Users, color: "text-blue-400" },
          { label: "Licenses", value: stats.totalLicenses, icon: Key, color: "text-green-400" },
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
      </div>

      {/* Search */}
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

      {/* Content */}
      {loading ? (
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

                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5 rounded-full bg-transparent text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleAdmin(u.id, u.role);
                          }}
                        >
                          {u.role === "admin" ? (
                            <>
                              <ShieldOff className="h-3.5 w-3.5" />
                              Demote
                            </>
                          ) : (
                            <>
                              <Shield className="h-3.5 w-3.5" />
                              Promote
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant={u.is_banned ? "default" : "destructive"}
                          className="gap-1.5 rounded-full text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleBan(u.id, u.is_banned);
                          }}
                        >
                          {u.is_banned ? (
                            <>
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Unban
                            </>
                          ) : (
                            <>
                              <Ban className="h-3.5 w-3.5" />
                              Ban
                            </>
                          )}
                        </Button>
                      </div>
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
                      variant={lic.is_revoked ? "default" : "destructive"}
                      className="gap-1.5 rounded-full text-xs"
                      onClick={() => revokeLicense(lic.id, lic.is_revoked)}
                    >
                      {lic.is_revoked ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Restore
                        </>
                      ) : (
                        <>
                          <Ban className="h-3.5 w-3.5" />
                          Revoke
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
    </div>
  );
}

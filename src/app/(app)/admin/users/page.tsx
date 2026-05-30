"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import Cookies from "js-cookie";
import {
  Users, Search, Plus, Pencil, Trash2, X, Check, UserPlus, Shield, User,
} from "lucide-react";
import toast from "react-hot-toast";

type UserItem = {
  _id: string;
  username: string;
  email: string;
  role: string;
};

type UserForm = { username: string; email: string; password: string; role: string };
const EMPTY_FORM: UserForm = { username: "", email: "", password: "", role: "customer" };

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://dakesh-backend.onrender.com";

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.95 },
  show:   { opacity: 1, y: 0,  scale: 1,  transition: { type: "spring" as const, stiffness: 260, damping: 22 } },
  exit:   { opacity: 0, scale: 0.9, y: -10, transition: { duration: 0.2 } },
};

const ROLE_CONFIG = {
  admin:    { gradient: "from-red-500/25 to-rose-500/5",    iconBg: "bg-red-500/20 text-red-300 border-red-400/30",    badge: "bg-red-500/20 text-red-300 border-red-500/30",    glow: "hover:shadow-red-500/20"    },
  customer: { gradient: "from-brand-500/20 to-purple-500/5", iconBg: "bg-brand-500/20 text-brand-300 border-brand-400/30", badge: "bg-brand-500/20 text-brand-300 border-brand-500/30", glow: "hover:shadow-brand-500/20" },
};

function getRoleCfg(role: string) {
  return ROLE_CONFIG[role as keyof typeof ROLE_CONFIG] ?? ROLE_CONFIG.customer;
}

export default function AdminUsersPage() {
  const [users, setUsers]         = useState<UserItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [search, setSearch]       = useState("");

  // Add modal
  const [showAdd, setShowAdd]     = useState(false);
  const [addForm, setAddForm]     = useState<UserForm>(EMPTY_FORM);
  const [addError, setAddError]   = useState("");
  const [addLoading, setAddLoading] = useState(false);

  // Edit modal
  const [editUser, setEditUser]   = useState<UserItem | null>(null);
  const [editForm, setEditForm]   = useState({ email: "", password: "", role: "customer" });
  const [editError, setEditError] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  const token = Cookies.get("token");
  const headers = { Authorization: `Bearer ${token}` };

  const fetchUsers = async () => {
    setIsLoading(true); setError(null);
    try {
      const res = await axios.get(`${API_BASE}/api/admin/users`, { headers });
      setUsers(res.data?.users ?? res.data ?? []);
    } catch { setError("Failed to load users"); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const filtered = useMemo(() =>
    users.filter(u =>
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    ), [users, search]);

  const handleDelete = async (userId: string, username: string) => {
    if (!confirm(`Delete user "${username}"?`)) return;
    try {
      await axios.delete(`${API_BASE}/api/admin/${userId}`, { headers });
      setUsers(prev => prev.filter(u => u._id !== userId));
      toast.success("User deleted.");
    } catch { toast.error("Failed to delete user."); }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setAddError(""); setAddLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/api/admin/users`, addForm, { headers });
      setUsers(prev => [res.data, ...prev]);
      setShowAdd(false); setAddForm(EMPTY_FORM);
      toast.success("User created!");
    } catch (err: any) { setAddError(err.response?.data?.message || "Failed to create user."); }
    finally { setAddLoading(false); }
  };

  const openEdit = (user: UserItem) => {
    setEditUser(user);
    setEditForm({ email: user.email, password: "", role: user.role });
    setEditError("");
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    setEditError(""); setEditLoading(true);
    try {
      const payload: any = { email: editForm.email, role: editForm.role };
      if (editForm.password) payload.password = editForm.password;
      const res = await axios.put(`${API_BASE}/api/admin/${editUser._id}`, payload, { headers });
      setUsers(prev => prev.map(u => u._id === editUser._id ? { ...u, ...res.data } : u));
      setEditUser(null);
      toast.success("User updated!");
    } catch (err: any) { setEditError(err.response?.data?.message || "Failed to update."); }
    finally { setEditLoading(false); }
  };

  return (
    <div className="min-h-screen bg-surface overflow-hidden">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-purple-600/8 rounded-full blur-3xl" />
      </div>

      <div className="relative px-6 py-8 max-w-5xl mx-auto">
        <button onClick={() => window.history.back()} className="mb-10 flex items-center gap-2 text-white/40 hover:text-white/80 text-sm transition-colors">
          ← Back to Admin
        </button>

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center">
              <Users className="w-5 h-5 text-brand-400" />
            </div>
            <p className="text-xs uppercase tracking-[0.2em] text-brand-400/80 font-semibold">Admin · Users</p>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-2 leading-tight">
            Manage<br />
            <span className="bg-gradient-to-r from-brand-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">Users</span>
          </h1>
          <div className="flex gap-3 mt-4 flex-wrap">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5">
              <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
              <span className="text-white/70 text-xs font-medium">{users.length} Users</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5">
              <span className="w-2 h-2 rounded-full bg-red-400" />
              <span className="text-white/70 text-xs font-medium">{users.filter(u => u.role === "admin").length} Admins</span>
            </div>
          </div>
        </div>

        {/* Search + Add */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email…"
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder-white/25 focus:outline-none focus:border-brand-500/60 transition-colors" />
          </div>
          <button onClick={() => { setShowAdd(true); setAddForm(EMPTY_FORM); setAddError(""); }}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-600 to-brand-400 hover:from-brand-500 hover:to-brand-300 text-white font-bold rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand-500/30 text-sm">
            <UserPlus className="w-4 h-4" /> Add User
          </button>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => <div key={i} className="h-36 rounded-2xl bg-white/5 border border-white/10 animate-pulse" />)}
          </div>
        ) : error ? (
          <p className="text-center text-red-400 py-16">{error}</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-white/30 text-sm">No users match "{search}"</div>
        ) : (
          <motion.div variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }} initial="hidden" animate="show"
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <AnimatePresence mode="popLayout">
              {filtered.map((user, i) => {
                const cfg = getRoleCfg(user.role);
                const initial = user.username.charAt(0).toUpperCase();
                return (
                  <motion.div key={user._id} variants={cardVariants} layout exit="exit"
                    className={`group relative overflow-hidden bg-gradient-to-br ${cfg.gradient} backdrop-blur-md border border-white/10 hover:border-white/20 rounded-2xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl ${cfg.glow}`}>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-tr from-white/5 via-transparent to-transparent transition-opacity duration-500 pointer-events-none rounded-2xl" />

                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center flex-shrink-0 text-base font-bold transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 ${cfg.iconBg}`}>
                          {initial}
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border capitalize ${cfg.badge}`}>
                          {user.role}
                        </span>
                      </div>

                      <p className="text-white font-bold text-sm truncate mb-0.5">{user.username}</p>
                      <p className="text-white/40 text-[11px] truncate">{user.email}</p>

                      {/* Actions — appear on hover */}
                      <div className="flex gap-1.5 mt-3 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-200">
                        <button onClick={() => openEdit(user)}
                          className="flex-1 py-1.5 rounded-xl bg-white/8 hover:bg-white/15 border border-white/10 text-white/50 hover:text-white text-xs flex items-center justify-center gap-1 transition-all">
                          <Pencil className="w-3 h-3" /> Edit
                        </button>
                        <button onClick={() => handleDelete(user._id, user.username)}
                          className="flex-1 py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/35 border border-red-500/20 text-red-400 hover:text-red-300 text-xs flex items-center justify-center gap-1 transition-all">
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Add User Modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-surface-elevated border border-white/10 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2"><UserPlus className="w-5 h-5 text-brand-400" /> Add New User</h3>
                <button onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-white transition"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleAddSubmit} className="space-y-4">
                {[
                  { label: "Username", key: "username", type: "text", placeholder: "johndoe" },
                  { label: "Email",    key: "email",    type: "email", placeholder: "john@example.com" },
                  { label: "Password", key: "password", type: "password", placeholder: "Min 6 characters" },
                ].map(({ label, key, type, placeholder }) => (
                  <div key={key} className="space-y-1">
                    <label className="text-sm font-medium text-slate-200">{label}</label>
                    <input type={type} value={(addForm as any)[key]} onChange={e => setAddForm({ ...addForm, [key]: e.target.value })}
                      placeholder={placeholder} required
                      className="w-full rounded-xl bg-white/10 border border-white/15 text-white px-4 py-2.5 placeholder:text-slate-400/80 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/50 transition-all" />
                  </div>
                ))}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-200">Role</label>
                  <select value={addForm.role} onChange={e => setAddForm({ ...addForm, role: e.target.value })}
                    className="w-full rounded-xl bg-white/10 border border-white/15 text-white px-4 py-2.5 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/50 transition-all">
                    <option value="customer">Customer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                {addError && <p className="text-red-400 text-sm flex items-center gap-1"><X className="w-3.5 h-3.5" />{addError}</p>}
                <button type="submit" disabled={addLoading}
                  className="w-full py-2.5 rounded-xl font-semibold bg-gradient-to-r from-brand-600 to-brand-400 hover:from-brand-500 hover:to-brand-300 text-white transition disabled:opacity-50">
                  {addLoading ? "Creating…" : "Create User"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit User Modal */}
      <AnimatePresence>
        {editUser && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-surface-elevated border border-white/10 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Edit <span className="text-brand-400">@{editUser.username}</span></h3>
                <button onClick={() => setEditUser(null)} className="text-slate-400 hover:text-white transition"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-200">Email</label>
                  <input type="email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} required
                    className="w-full rounded-xl bg-white/10 border border-white/15 text-white px-4 py-2.5 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/50 transition-all" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-200">New Password <span className="text-slate-400 font-normal">(leave blank to keep)</span></label>
                  <input type="password" value={editForm.password} onChange={e => setEditForm({ ...editForm, password: e.target.value })}
                    placeholder="Enter new password"
                    className="w-full rounded-xl bg-white/10 border border-white/15 text-white px-4 py-2.5 placeholder:text-slate-400/80 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/50 transition-all" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-200">Role</label>
                  <select value={editForm.role} onChange={e => setEditForm({ ...editForm, role: e.target.value })}
                    className="w-full rounded-xl bg-white/10 border border-white/15 text-white px-4 py-2.5 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/50 transition-all">
                    <option value="customer">Customer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                {editError && <p className="text-red-400 text-sm flex items-center gap-1"><X className="w-3.5 h-3.5" />{editError}</p>}
                <button type="submit" disabled={editLoading}
                  className="w-full py-2.5 rounded-xl font-semibold bg-gradient-to-r from-brand-600 to-brand-400 hover:from-brand-500 hover:to-brand-300 text-white transition disabled:opacity-50">
                  {editLoading ? "Saving…" : "Save Changes"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

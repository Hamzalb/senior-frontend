"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { X, UserPlus, Pencil } from "lucide-react";
import toast from "react-hot-toast";

type User = {
  _id: string;
  username: string;
  email: string;
  role: string;
};

type UserForm = {
  username: string;
  email: string;
  password: string;
  role: string;
};

const EMPTY_FORM: UserForm = { username: "", email: "", password: "", role: "customer" };

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "https://dakesh-backend.onrender.com";

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState<UserForm>(EMPTY_FORM);
  const [addError, setAddError] = useState("");
  const [addLoading, setAddLoading] = useState(false);

  // Edit modal
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState<{ email: string; password: string; role: string }>({
    email: "",
    password: "",
    role: "customer",
  });
  const [editError, setEditError] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  const token = () => Cookies.get("token");

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await axios.get(`${API_BASE}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      setUsers(res.data?.users ?? res.data ?? []);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async (userId: string) => {
    if (!confirm("Delete this user permanently?")) return;
    try {
      await axios.delete(`${API_BASE}/api/admin/${userId}`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      setUsers(users.filter((u) => u._id !== userId));
    } catch {
      toast.error("Failed to delete user.");
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError("");
    setAddLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/api/admin/users`, addForm, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      setUsers((prev) => [res.data, ...prev]);
      setShowAddModal(false);
      setAddForm(EMPTY_FORM);
    } catch (err: any) {
      setAddError(err.response?.data?.message || "Failed to create user.");
    } finally {
      setAddLoading(false);
    }
  };

  const openEdit = (user: User) => {
    setEditUser(user);
    setEditForm({ email: user.email, password: "", role: user.role });
    setEditError("");
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    setEditError("");
    setEditLoading(true);
    try {
      const payload: any = { email: editForm.email, role: editForm.role };
      if (editForm.password) payload.password = editForm.password;
      const res = await axios.put(`${API_BASE}/api/admin/${editUser._id}`, payload, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      setUsers((prev) => prev.map((u) => (u._id === editUser._id ? { ...u, ...res.data } : u)));
      setEditUser(null);
    } catch (err: any) {
      setEditError(err.response?.data?.message || "Failed to update user.");
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <div className="bg-surface p-6 shadow-2xl border border-white/10 backdrop-blur-xl min-h-screen">
      <button
        onClick={() => window.history.back()}
        className="mb-6 inline-flex items-center gap-2 text-brand-200 hover:text-brand-100 font-semibold text-sm transition-all duration-300 ease-out"
      >
        ← Go Back
      </button>

      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-brand-500 drop-shadow-sm">Users</h2>
        <button
          onClick={() => { setShowAddModal(true); setAddForm(EMPTY_FORM); setAddError(""); }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-white font-semibold text-sm transition-all duration-200 shadow-lg shadow-brand-500/30"
        >
          <UserPlus className="w-4 h-4" />
          Add User
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
          <p className="font-semibold">Error: {error}</p>
          <button onClick={fetchUsers} className="mt-2 text-sm px-3 py-1 bg-red-500/30 hover:bg-red-500/40 rounded transition">
            Retry
          </button>
        </div>
      )}

      {isLoading && !error && (
        <div className="text-center py-12 text-slate-300"><p>Loading users...</p></div>
      )}

      {!isLoading && !error && users.length === 0 && (
        <div className="text-center py-12 text-slate-400"><p>No users found</p></div>
      )}

      {!isLoading && users.length > 0 && (
        <div className="overflow-x-auto rounded-xl shadow-lg bg-white/5 backdrop-blur-md border border-white/10">
          <table className="min-w-full text-left text-slate-100 text-sm">
            <thead className="bg-white/10 border-b border-white/10">
              <tr>
                <th className="px-6 py-3 uppercase text-xs font-semibold tracking-wide text-brand-200">Username</th>
                <th className="px-6 py-3 uppercase text-xs font-semibold tracking-wide text-brand-200">Email</th>
                <th className="px-6 py-3 uppercase text-xs font-semibold tracking-wide text-brand-200">Role</th>
                <th className="px-6 py-3 uppercase text-xs font-semibold tracking-wide text-brand-200">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, i) => (
                <tr
                  key={user._id}
                  className={`border-t border-white/10 transition ${i % 2 === 0 ? "bg-white/5" : "bg-white/0"} hover:bg-white/10`}
                >
                  <td className="px-6 py-4 text-white">{user.username}</td>
                  <td className="px-6 py-4 text-brand-200">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.role === "admin" ? "bg-red-600/30 text-red-200 border border-red-400/20" : "bg-brand-600/30 text-brand-200 border border-brand-400/20"}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex items-center gap-2">
                    <button
                      onClick={() => openEdit(user)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-500/20 hover:bg-brand-500/30 text-brand-300 text-sm font-semibold transition"
                    >
                      <Pencil className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(user._id)}
                      className="px-4 py-1.5 rounded-lg bg-red-600/80 hover:bg-red-500 text-white text-sm transition shadow-md"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-surface-elevated border border-white/10 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Add New User</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              {[
                { label: "Username", key: "username", type: "text", placeholder: "johndoe" },
                { label: "Email", key: "email", type: "email", placeholder: "john@example.com" },
                { label: "Password", key: "password", type: "password", placeholder: "Min 6 characters" },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key} className="space-y-1">
                  <label className="text-sm font-medium text-slate-200">{label}</label>
                  <input
                    type={type}
                    value={(addForm as any)[key]}
                    onChange={(e) => setAddForm({ ...addForm, [key]: e.target.value })}
                    placeholder={placeholder}
                    required
                    className="w-full rounded-xl bg-white/10 border border-white/15 text-white px-4 py-2.5 placeholder:text-slate-400/80 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/50 transition-all"
                  />
                </div>
              ))}
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-200">Role</label>
                <select
                  value={addForm.role}
                  onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
                  className="w-full rounded-xl bg-white/10 border border-white/15 text-white px-4 py-2.5 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/50 transition-all"
                >
                  <option value="customer">Customer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              {addError && <p className="text-red-400 text-sm">{addError}</p>}
              <button
                type="submit"
                disabled={addLoading}
                className="w-full py-2.5 rounded-xl font-semibold bg-brand-500 hover:bg-brand-400 text-white transition disabled:opacity-50"
              >
                {addLoading ? "Creating..." : "Create User"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-surface-elevated border border-white/10 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Edit <span className="text-brand-400">@{editUser.username}</span></h3>
              <button onClick={() => setEditUser(null)} className="text-slate-400 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-200">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  required
                  className="w-full rounded-xl bg-white/10 border border-white/15 text-white px-4 py-2.5 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/50 transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-200">New Password <span className="text-slate-400 font-normal">(leave blank to keep current)</span></label>
                <input
                  type="password"
                  value={editForm.password}
                  onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                  placeholder="Enter new password"
                  className="w-full rounded-xl bg-white/10 border border-white/15 text-white px-4 py-2.5 placeholder:text-slate-400/80 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/50 transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-200">Role</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="w-full rounded-xl bg-white/10 border border-white/15 text-white px-4 py-2.5 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/50 transition-all"
                >
                  <option value="customer">Customer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              {editError && <p className="text-red-400 text-sm">{editError}</p>}
              <button
                type="submit"
                disabled={editLoading}
                className="w-full py-2.5 rounded-xl font-semibold bg-brand-500 hover:bg-brand-400 text-white transition disabled:opacity-50"
              >
                {editLoading ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

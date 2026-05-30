"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";

type User = {
  _id: string;
  username: string;
  email: string;
  password: string;
  role: string;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "https://dakesh-backend.onrender.com";

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async (userId: string) => {
    try {
      const token = Cookies.get("token");
      await axios.delete(`${API_BASE}/api/admin/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(users.filter((user) => user._id !== userId)); // Update the state to remove the deleted user
      alert("User deleted successfully!");
    } catch (err) {
      console.error("Error deleting user:", err);
      alert("Failed to delete user.");
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const token = Cookies.get("token");
        const res = await axios.get(`${API_BASE}/api/admin/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUsers(res.data?.users ?? res.data ?? []);
      } catch (err: any) {
        console.error("Error fetching users:", err);
        setError(err.response?.data?.message || "Failed to load users");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUsers();
  }, []);

  return (
    <div className="bg-surface p-6 shadow-2xl border border-white/10 backdrop-blur-xl min-h-screen">
      {/* Go Back */}
      <button
        onClick={() => window.history.back()}
        className="mb-6 inline-flex items-center gap-2 text-brand-200 hover:text-brand-100 font-semibold text-sm transition-all duration-300 ease-out"
      >
        - Go Back
      </button>

      {/* Title */}
      <h2 className="text-3xl font-bold text-brand-500 mb-8 drop-shadow-sm">
        Users
      </h2>

      {/* Error State */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
          <p className="font-semibold">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 text-sm px-3 py-1 bg-red-500/30 hover:bg-red-500/40 rounded transition"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && !error && (
        <div className="text-center py-12 text-slate-300">
          <p>Loading users...</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && users.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <p>No users found</p>
        </div>
      )}

      {/* Table Wrapper */}
      {!isLoading && users.length > 0 && (
      <div className="overflow-x-auto rounded-xl shadow-lg bg-white/5 backdrop-blur-md border border-white/10">
        <table className="min-w-full text-left text-slate-100 text-sm">
          <thead className="bg-white/10 border-b border-white/10">
            <tr>
              <th className="px-6 py-3 uppercase text-xs font-semibold tracking-wide text-brand-200">
                Username
              </th>
              <th className="px-6 py-3 uppercase text-xs font-semibold tracking-wide text-brand-200">
                Email
              </th>
              <th className="px-6 py-3 uppercase text-xs font-semibold tracking-wide text-brand-200">
                Role
              </th>
              <th className="px-6 py-3 uppercase text-xs font-semibold tracking-wide text-brand-200">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {users.map((user: User, i: number) => (
              <tr
                key={user._id}
                className={`
              border-t border-white/10 transition
              ${i % 2 === 0 ? "bg-white/5" : "bg-white/0"}
              hover:bg-white/10
            `}
              >
                <td className="px-6 py-4 text-white">{user.username}</td>
                <td className="px-6 py-4 text-brand-200">{user.email}</td>

                {/* Role Badge */}
                <td className="px-6 py-4">
                  <span
                    className={`
                  px-3 py-1 rounded-full text-xs font-bold 
                  ${
                    user.role === "admin"
                      ? "bg-red-600/30 text-red-200 border border-red-400/20"
                      : "bg-brand-600/30 text-brand-200 border border-brand-400/20"
                  }
                `}
                  >
                    {user.role}
                  </span>
                </td>

                {/* Delete Button */}
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleDelete(user._id)}
                    className="
                  bg-red-600/80 hover:bg-red-500 text-white text-sm
                  px-4 py-1.5 rounded-lg transition shadow-md
                  hover:shadow-red-900/40
                "
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
    </div>
  );
}

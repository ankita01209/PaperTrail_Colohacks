"use client";

import { useState } from 'react';
import { User, Shield, Search, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';

const mockUsers = [
  { uid: 'USR-101', name: 'Alok Nath', email: 'alok.admin@gov.in', role: 'admin', joined: '2026-01-10' },
  { uid: 'USR-102', name: 'Ramesh Kumar', email: 'ramesh.clerk@gov.in', role: 'clerk', joined: '2026-02-15' },
  { uid: 'USR-103', name: 'Anita Singh', email: 'anita.c@gov.in', role: 'clerk', joined: '2026-02-18' },
  { uid: 'USR-104', name: 'Vikram Mehta', email: 'v.mehta@gov.in', role: 'clerk', joined: '2026-03-05' },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState(mockUsers);
  const [filter, setFilter] = useState('all');

  const filteredUsers = filter === 'all' 
    ? users 
    : users.filter(u => u.role === filter);

  const handleRoleChange = (uid: string, currentRole: string) => {
    // Cannot change own role typically, mock simulation:
    if (uid === 'USR-101') {
      toast.error('You cannot change your own role.');
      return;
    }

    const newRole = currentRole === 'admin' ? 'clerk' : 'admin';
    const confirmMsg = `Are you sure you want to ${newRole === 'admin' ? 'promote' : 'demote'} this user to ${newRole}?`;
    
    if (window.confirm(confirmMsg)) {
      setUsers(prev => prev.map(u => 
        u.uid === uid ? { ...u, role: newRole } : u
      ));
      toast.success(`User role updated to ${newRole}`);
    }
  };

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto p-6 lg:p-10 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-white mb-2">User Management</h1>
          <p className="text-[var(--color-on-surface-variant)] text-sm">Manage system access and roles across the digitisation platform.</p>
        </div>
      </div>

      <GlassCard className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-on-surface-variant)]" size={18} />
            <input 
              type="text" 
              placeholder="Search users..." 
              className="w-full h-10 pl-10 pr-4 rounded-md ghost-input text-white focus:outline-none text-sm"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto overflow-x-auto">
            {['all', 'admin', 'clerk'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                  filter === f 
                    ? 'bg-[var(--color-primary)] text-[var(--color-surface-lowest)]' 
                    : 'bg-[var(--color-surface-low)] text-[var(--color-on-surface-variant)] hover:text-white'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}s
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto rounded-md border border-[var(--color-ghost-border)]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--color-surface-low)] border-b border-[var(--color-ghost-border)] text-[var(--color-on-surface-variant)]">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Joined</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-ghost-border)]">
              {filteredUsers.map((u) => (
                <tr key={u.uid} className="hover:bg-[var(--color-surface-high)]/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[var(--color-primary-container)] text-[var(--color-primary)] flex items-center justify-center font-bold text-xs uppercase">
                        {u.name.substring(0,2)}
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm">{u.name}</div>
                        <div className="text-xs text-[var(--color-on-surface-variant)] font-mono mt-0.5">{u.uid}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--color-on-surface)]">{u.email}</td>
                  <td className="px-6 py-4">
                    {u.role === 'admin' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[var(--color-error)]/20 text-[var(--color-error)] text-xs font-bold uppercase">
                        <Shield size={12} /> Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[var(--color-success)]/10 text-[var(--color-success)] text-xs font-bold uppercase">
                        <User size={12} /> Clerk
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--color-on-surface-variant)]">{u.joined}</td>
                  <td className="px-6 py-4 text-right">
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      onClick={() => handleRoleChange(u.uid, u.role)}
                      className="text-xs h-8 px-3"
                      disabled={u.uid === 'USR-101'}
                      title={u.uid === 'USR-101' ? "You cannot change your own role" : ""}
                    >
                      <ArrowUpDown size={14} className="mr-1.5" />
                      {u.role === 'admin' ? 'Demote to Clerk' : 'Promote to Admin'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}

"use client";

import { Users, FileText, CheckCircle, Clock } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';

const summaryStats = [
  { label: 'Total Clerks', value: '45', icon: Users, trend: '+3 this week' },
  { label: 'Total Records Submitted', value: '1,280', icon: FileText, trend: '+14% month-over-month' },
  { label: 'Pending Approvals', value: '3', icon: Clock, trend: 'Action required' },
  { label: 'Records Today', value: '112', icon: CheckCircle, trend: 'On track' }
];

const mockRecentUploads = [
  { id: 'REC-001', clerk: 'Ramesh Kumar', template: 'Registration Form v2', dept: 'Revenue', time: '10 mins ago' },
  { id: 'REC-002', clerk: 'Anita Singh', template: 'ID Application', dept: 'Transport', time: '25 mins ago' },
  { id: 'REC-003', clerk: 'Ramesh Kumar', template: 'Tax Declaration', dept: 'Revenue', time: '1 hour ago' },
  { id: 'REC-004', clerk: 'Vikram Mehta', template: 'Passport App Page 2', dept: 'Foreign Affairs', time: '2 hours ago' },
];

export default function AdminDashboard() {
  return (
    <div className="flex-1 w-full max-w-7xl mx-auto p-6 lg:p-10 space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold text-white mb-2">Admin Dashboard</h1>
        <p className="text-[var(--color-on-surface-variant)] text-sm">System-wide overview of PaperTrail digitisation metrics.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryStats.map((stat, i) => (
          <GlassCard key={i} className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-full bg-[var(--color-surface-highest)] flex items-center justify-center text-[var(--color-primary)]">
                <stat.icon size={20} />
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${stat.label === 'Pending Approvals' ? 'bg-[var(--color-warning)]/20 text-[var(--color-warning)] font-bold' : 'bg-[var(--color-surface-low)] text-[var(--color-on-surface-variant)]'}`}>
                {stat.trend}
              </span>
            </div>
            <div>
              <h3 className="text-3xl font-bold font-mono text-white mb-1">{stat.value}</h3>
              <p className="text-sm font-medium text-[var(--color-on-surface-variant)]">{stat.label}</p>
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="mt-12">
        <h3 className="text-xl font-serif font-bold text-white mb-4">Recent Uploads</h3>
        <GlassCard className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[var(--color-surface-low)] border-b border-[var(--color-ghost-border)]">
                  <th className="px-6 py-4 text-xs font-semibold text-[var(--color-on-surface-variant)] uppercase tracking-wider">Record ID</th>
                  <th className="px-6 py-4 text-xs font-semibold text-[var(--color-on-surface-variant)] uppercase tracking-wider">Clerk</th>
                  <th className="px-6 py-4 text-xs font-semibold text-[var(--color-on-surface-variant)] uppercase tracking-wider">Template</th>
                  <th className="px-6 py-4 text-xs font-semibold text-[var(--color-on-surface-variant)] uppercase tracking-wider">Department</th>
                  <th className="px-6 py-4 text-xs font-semibold text-[var(--color-on-surface-variant)] uppercase tracking-wider">Time</th>
                  <th className="px-6 py-4 text-xs font-semibold text-[var(--color-on-surface-variant)] uppercase tracking-wider text-right">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-ghost-border)]">
                {mockRecentUploads.map((record) => (
                  <tr key={record.id} className="hover:bg-[var(--color-surface-highest)]/20 transition-colors">
                    <td className="px-6 py-4 font-mono text-sm font-semibold text-white">{record.id}</td>
                    <td className="px-6 py-4 text-sm text-[var(--color-on-surface)]">{record.clerk}</td>
                    <td className="px-6 py-4 text-sm text-[var(--color-on-surface-variant)]">{record.template}</td>
                    <td className="px-6 py-4 text-sm text-[var(--color-on-surface-variant)]">{record.dept}</td>
                    <td className="px-6 py-4 text-sm text-[var(--color-on-surface-variant)]">{record.time}</td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="sm">Details</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>

    </div>
  );
}

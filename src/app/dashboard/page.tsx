"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface DashboardStats {
  totalWorkflows: number;
  activeWorkflows: number;
  totalExecutions: number;
  failedExecutions: number;
}

interface RecentExecution {
  id: string;
  workflowName: string;
  status: "COMPLETED" | "FAILED" | "RUNNING" | "PENDING";
  startedAt: string;
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

const statusColors: Record<string, string> = {
  COMPLETED: "bg-green-100 text-green-800",
  FAILED: "bg-red-100 text-red-800",
  RUNNING: "bg-blue-100 text-blue-800",
  PENDING: "bg-yellow-100 text-yellow-800",
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalWorkflows: 0,
    activeWorkflows: 0,
    totalExecutions: 0,
    failedExecutions: 0,
  });
  const [recentExecutions, setRecentExecutions] = useState<RecentExecution[]>([]);

  useEffect(() => {
    fetch("/api/workflows")
      .then((res) => res.json())
      .then((data) => {
        if (data.workflows) {
          const workflows = data.workflows;
          setStats({
            totalWorkflows: workflows.length,
            activeWorkflows: workflows.filter((w: { status: string }) => w.status === "ACTIVE").length,
            totalExecutions: workflows.reduce(
              (sum: number, w: { _count?: { executions: number } }) => sum + (w._count?.executions || 0),
              0
            ),
            failedExecutions: 0,
          });
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of your IT automation workflows</p>
        </div>
        <Link
          href="/workflows"
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
        >
          + New Workflow
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard label="Total Workflows" value={stats.totalWorkflows} color="text-gray-900" />
        <StatCard label="Active" value={stats.activeWorkflows} color="text-green-600" />
        <StatCard label="Total Executions" value={stats.totalExecutions} color="text-primary-600" />
        <StatCard label="Failed" value={stats.failedExecutions} color="text-red-600" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Executions</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {recentExecutions.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              No executions yet. Create and run a workflow to see results here.
            </div>
          ) : (
            recentExecutions.map((execution) => (
              <div key={execution.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{execution.workflowName}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(execution.startedAt).toLocaleString()}
                  </p>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[execution.status]}`}
                >
                  {execution.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

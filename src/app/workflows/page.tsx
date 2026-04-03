"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface Workflow {
  id: string;
  name: string;
  description: string | null;
  status: "DRAFT" | "ACTIVE" | "PAUSED" | "ARCHIVED";
  trigger: string;
  updatedAt: string;
  _count: { executions: number; steps: number };
}

const statusBadge: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-800",
  ACTIVE: "bg-green-100 text-green-800",
  PAUSED: "bg-yellow-100 text-yellow-800",
  ARCHIVED: "bg-red-100 text-red-800",
};

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/workflows")
      .then((res) => res.json())
      .then((data) => setWorkflows(data.workflows || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this workflow?")) return;
    await fetch(`/api/workflows?id=${id}`, { method: "DELETE" });
    setWorkflows((prev) => prev.filter((w) => w.id !== id));
  }

  async function handleRun(id: string) {
    const res = await fetch("/api/workflows", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: "execute" }),
    });
    const data = await res.json();
    if (data.execution) {
      alert(`Execution started: ${data.execution.id}`);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-400">Loading workflows...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Workflows</h1>
          <p className="text-gray-500 mt-1">Manage your automation workflows</p>
        </div>
        <Link
          href="/workflows/new"
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
        >
          + Create Workflow
        </Link>
      </div>

      {workflows.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No workflows yet</h3>
          <p className="text-gray-500 mb-6">
            Create your first automation workflow to get started.
          </p>
          <Link
            href="/workflows/new"
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
          >
            Create Workflow
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {workflows.map((workflow) => (
            <div
              key={workflow.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center justify-between"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-semibold text-gray-900">{workflow.name}</h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge[workflow.status]}`}
                  >
                    {workflow.status}
                  </span>
                </div>
                {workflow.description && (
                  <p className="text-sm text-gray-500 mb-2">{workflow.description}</p>
                )}
                <div className="flex gap-4 text-xs text-gray-400">
                  <span>{workflow._count.steps} steps</span>
                  <span>{workflow._count.executions} executions</span>
                  <span>Trigger: {workflow.trigger}</span>
                  <span>Updated: {new Date(workflow.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => handleRun(workflow.id)}
                  className="px-3 py-1.5 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                >
                  Run
                </button>
                <button
                  onClick={() => handleDelete(workflow.id)}
                  className="px-3 py-1.5 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

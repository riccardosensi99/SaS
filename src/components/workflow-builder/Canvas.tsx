"use client";

import { useCallback, useRef } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Node,
  type Edge,
  type NodeTypes,
  Handle,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";

const stepTypeColors: Record<string, string> = {
  SCRIPT: "#3b82f6",
  HTTP_REQUEST: "#8b5cf6",
  EMAIL_NOTIFICATION: "#f59e0b",
  APPROVAL: "#ef4444",
  CONDITION: "#06b6d4",
  DELAY: "#6b7280",
  CREATE_USER: "#10b981",
  DISABLE_USER: "#f43f5e",
  INSTALL_SOFTWARE: "#8b5cf6",
  RUN_COMMAND: "#3b82f6",
};

function StepNode({ data }: { data: { label: string; type: string; config?: Record<string, unknown> } }) {
  const color = stepTypeColors[data.type] || "#6b7280";

  return (
    <div
      className="bg-white rounded-lg shadow-md border-2 px-4 py-3 min-w-[180px]"
      style={{ borderColor: color }}
    >
      <Handle type="target" position={Position.Top} className="!bg-gray-400" />
      <div className="flex items-center gap-2 mb-1">
        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-xs font-medium text-gray-500">{data.type.replace(/_/g, " ")}</span>
      </div>
      <p className="font-medium text-gray-900 text-sm">{data.label}</p>
      <Handle type="source" position={Position.Bottom} className="!bg-gray-400" />
    </div>
  );
}

const nodeTypes: NodeTypes = {
  step: StepNode,
};

const defaultStepTypes = [
  { type: "SCRIPT", label: "Run Script" },
  { type: "HTTP_REQUEST", label: "HTTP Request" },
  { type: "EMAIL_NOTIFICATION", label: "Send Email" },
  { type: "APPROVAL", label: "Approval Gate" },
  { type: "CONDITION", label: "Condition" },
  { type: "DELAY", label: "Delay" },
  { type: "CREATE_USER", label: "Create User" },
  { type: "DISABLE_USER", label: "Disable User" },
  { type: "INSTALL_SOFTWARE", label: "Install Software" },
  { type: "RUN_COMMAND", label: "Run Command" },
];

interface WorkflowCanvasProps {
  initialNodes?: Node[];
  initialEdges?: Edge[];
  onChange?: (nodes: Node[], edges: Edge[]) => void;
  readOnly?: boolean;
}

export default function WorkflowCanvas({
  initialNodes = [],
  initialEdges = [],
  onChange,
  readOnly = false,
}: WorkflowCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const nodeIdCounter = useRef(initialNodes.length);

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => {
        const newEdges = addEdge({ ...params, animated: true }, eds);
        onChange?.(nodes, newEdges);
        return newEdges;
      });
    },
    [nodes, setEdges, onChange]
  );

  const addNode = useCallback(
    (stepType: string, label: string) => {
      nodeIdCounter.current += 1;
      const newNode: Node = {
        id: `step-${nodeIdCounter.current}`,
        type: "step",
        position: { x: 250, y: nodes.length * 120 + 50 },
        data: { label, type: stepType, config: {} },
      };
      setNodes((nds) => {
        const updated = [...nds, newNode];
        onChange?.(updated, edges);
        return updated;
      });
    },
    [nodes.length, setNodes, edges, onChange]
  );

  return (
    <div className="flex h-[600px] border border-gray-200 rounded-xl overflow-hidden">
      {!readOnly && (
        <div className="w-56 bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Step Types</h3>
          <div className="space-y-1.5">
            {defaultStepTypes.map((step) => (
              <button
                key={step.type}
                onClick={() => addNode(step.type, step.label)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left rounded-lg hover:bg-gray-200 transition-colors"
              >
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: stepTypeColors[step.type] }}
                />
                {step.label}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={readOnly ? undefined : onNodesChange}
          onEdgesChange={readOnly ? undefined : onEdgesChange}
          onConnect={readOnly ? undefined : onConnect}
          nodeTypes={nodeTypes}
          fitView
          deleteKeyCode={readOnly ? null : "Delete"}
        >
          <Background />
          <Controls />
          <MiniMap
            nodeColor={(node) => stepTypeColors[(node.data as { type: string }).type] || "#6b7280"}
            maskColor="rgba(0,0,0,0.1)"
          />
        </ReactFlow>
      </div>
    </div>
  );
}

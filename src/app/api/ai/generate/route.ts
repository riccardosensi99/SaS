import { NextRequest, NextResponse } from "next/server";
import { generateWorkflow } from "@/lib/ai/workflow-generator";
import { analyzeWorkflow, explainStep } from "@/lib/ai/workflow-analyzer";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { action, prompt, nodes, edges } = body;

  if (action === "generate") {
    if (!prompt || typeof prompt !== "string" || prompt.trim().length < 3) {
      return NextResponse.json({ error: "Prompt is required (min 3 chars)" }, { status: 400 });
    }

    try {
      const workflow = await generateWorkflow(prompt.trim());
      return NextResponse.json({ workflow });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Generation failed";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  if (action === "analyze") {
    if (!nodes || !Array.isArray(nodes)) {
      return NextResponse.json({ error: "nodes array is required" }, { status: 400 });
    }
    const result = analyzeWorkflow(nodes, edges || []);
    return NextResponse.json({ analysis: result });
  }

  if (action === "explain") {
    if (!nodes || !Array.isArray(nodes)) {
      return NextResponse.json({ error: "nodes array is required" }, { status: 400 });
    }
    const explanations = nodes.map(explainStep);
    return NextResponse.json({ explanations });
  }

  return NextResponse.json({ error: "Unknown action. Use: generate, analyze, explain" }, { status: 400 });
}

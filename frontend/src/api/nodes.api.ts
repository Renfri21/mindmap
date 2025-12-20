// src/api/nodes.api.ts
import type { Node } from '../types/Node';

export async function fetchNodesApi(): Promise<Node[]> {
  const response = await fetch('/api/nodes');
  if (!response.ok) throw new Error('Failed to fetch nodes');
  return response.json();
}

export async function createNodeApi(node: Node): Promise<Node> {
  const res = await fetch('/api/create-node', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(node),
  });

  if (!res.ok) throw new Error('Failed to add node');
  return res.json();
}

export async function updateNodeApi(id: number, updates: Partial<Node>) {
  await fetch(`/api/nodes/${id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
}

export async function deleteNodeApi(id: number) {
  await fetch(`/api/nodes/${id}`, {
    method: 'DELETE',
  });
}

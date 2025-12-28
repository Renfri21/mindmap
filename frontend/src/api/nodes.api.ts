// src/api/nodes.api.ts
import type { Node } from '../types/Node';

export async function fetchNodesApi(): Promise<Node[]> {
  const response = await fetch('/api/nodes');
  if (!response.ok) throw new Error('Failed to fetch nodes');
  return response.json();
}

export async function createNodeApi(
  x: number, 
  y: number, 
  childType: 'note' | 'image' | 'folder'
): Promise<{ node: Node; child: any }> {
  const res = await fetch('/api/nodes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      x,
      y,
      child_type: childType, // Laravel expects snake_case
      width: 200,
      height: 200,
      content: '', // Empty content for new notes
    }),
  });
  
  if (!res.ok) {
    const error = await res.text();
    console.error('Create node failed:', error);
    throw new Error('Failed to add node');
  }
  
  return res.json();
}

export async function updateNodeApi(id: number, updates: Partial<Node>) {
  const res = await fetch(`/api/nodes/${id}`, {
    method: 'POST', // Browser sends POST
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...updates,
      _method: 'PUT', // Laravel treats it as PUT
    }),
  });
  
  if (!res.ok) throw new Error('Failed to update node');
  return res.json();
}

export async function deleteNodeApi(id: number) {
  const res = await fetch(`/api/nodes/${id}`, {
    method: 'POST', // Browser sends POST
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      _method: 'DELETE', // Laravel treats it as DELETE
    }),
  });
  
  if (!res.ok) throw new Error('Failed to delete node');
}
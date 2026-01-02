<?php

namespace App\Http\Controllers;

use App\Models\Node;
use App\Models\Note;
// use App\Models\Image; // TODO: Uncomment when you add images
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class NodeController extends Controller
{
    /**
     * Get all nodes with their children (notes, images, etc.)
     */
    public function index()
    {
        // Fetch all nodes
        $nodes = Node::all();

        // Load the children relationships
        foreach ($nodes as $node) {
            if ($node->child_type === 'note' && $node->child_id) {
                $node->child = Note::find($node->child_id);
            } 
            // TODO: Add image support later
            // elseif ($node->child_type === 'image' && $node->child_id) {
            //     $node->child = Image::find($node->child_id);
            // }
        }

        return response()->json($nodes);
    }

    /**
     * Create a new node with its child (note, image, etc.)
     */
    public function store(Request $request)
    {
        
        $request->validate([
            'x' => 'required|numeric',
            'y' => 'required|numeric',
            'child_type' => 'required|in:note,image,folder',
            'width' => 'nullable|numeric',
            'height' => 'nullable|numeric',
            'content' => 'nullable|string', // For notes
            // 'url' => 'nullable|string', // For images (later)
        ]);

        DB::beginTransaction();
        
        try {
            $child = null;
            $childId = null;

            // Create the child first based on type
            if ($request->child_type === 'note') {

                $child = Note::create([
                    'content' => $request->input('content', ''), // fallback to ''
                ]);
                $childId = $child->id;
            } 
            // TODO: Add image support later
            // elseif ($request->child_type === 'image') {
            //     $child = Image::create([
            //         'url' => $request->input('url', ''),
            //         'width' => $request->input('width'),
            //         'height' => $request->input('height'),
            //     ]);
            //     $childId = $child->id;
            // }

            // Create the node
            $node = Node::create([
                'x' => $request->x,
                'y' => $request->y,
                'width' => $request->input('width', 200),
                'height' => $request->input('height', 200),
                'child_type' => $request->child_type,
                'child_id' => $childId,
                'z_index' => $request->input('z_index', 0),
            ]);

            // Attach child to node for response
            $node->child = $child;

            DB::commit();

            return response()->json([
                'node' => $node,
                'child' => $child,
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'error' => 'Failed to create node',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update a node's position or size
     */
    public function update(Request $request, $id)
    {
        $node = Node::findOrFail($id);

        $request->validate([
            'x' => 'nullable|numeric',
            'y' => 'nullable|numeric',
            'width' => 'nullable|numeric',
            'height' => 'nullable|numeric',
            'z_index' => 'nullable|integer',
        ]);

        $node->update($request->only(['x', 'y', 'width', 'height', 'z_index']));

        return response()->json($node);
    }

    /**
     * Delete a node and its child
     */
    public function destroy($id)
    {
        $node = Node::findOrFail($id);

        DB::beginTransaction();

        try {
            // Delete the child first
            if ($node->child_type === 'note' && $node->child_id) {
                Note::destroy($node->child_id);
            } 
            // TODO: Add image support later
            // elseif ($node->child_type === 'image' && $node->child_id) {
            //     Image::destroy($node->child_id);
            // }

            // Delete the node
            $node->delete();

            DB::commit();

            return response()->json(['message' => 'Node deleted successfully']);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'error' => 'Failed to delete node',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
<?php

namespace App\Http\Controllers;

use App\Models\Note;
use Illuminate\Http\Request;

class NoteController extends Controller
{
    /**
     * Get all notes
     * (Usually not needed since nodes fetch includes children)
     */
    public function index()
    {
        $notes = Note::all();
        return response()->json($notes);
    }

    /**
     * Update a note's content
     * This is called when user edits the text in a note
     */
    public function update(Request $request, $id)
    {
        $note = Note::findOrFail($id);

    if (!$request->has('content')) {
        return response()->json($note);
    }

    $content = $request->input('content');

    if (!is_string($content)) {
        $content = '';
    }

    $note->update([
        'content' => $content,
    ]);

    return response()->json($note);
    }

    /**
     * Note: We don't need store() or destroy() here because:
     * - Notes are created via NodeController->store()
     * - Notes are deleted via NodeController->destroy()
     */
}
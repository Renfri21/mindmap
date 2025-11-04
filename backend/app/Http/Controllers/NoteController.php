<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Note;

class NoteController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        
        $notes = DB::table('notes')->get();

        return $notes;
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        
        $note = new Note;

        $note->x = $request->x;
        $note->y = $request->y;
        $note->width = 200;
        $note->height = 200;

        $note->save();

        return response()->json($note);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request)
    {
        
        $note = Note::find($request->id);

        if (!$note) {
            return response()->json(['error' => 'Note not found'], 404);
        }

        // Update x coordinate if provided
        if ($request->has('x')) {
            $note->x = intval($request->x);
        }

        // Update y coordinate if provided
        if ($request->has('y')) {
            $note->y = -intval($request->y); //flip int
        }

        // Update note_content if provided
        if ($request->has('content')) {
            $note->content = $request->content;
        }

        // Update width if provided
        if ($request->has('width')) {
            $note->note_content = $request->note_content;
        }

        // Update height if provided
        if ($request->has('height')) {
            $note->note_content = $request->note_content;
        } 

        $note->save();


    }




    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}

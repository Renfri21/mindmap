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
        //
        // $notes = Note::all();
        
        // return $notes;

        $notes = DB::table('notes')->get();

        return $notes;
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
        
        $note = new Note;

        $note->x_coordinate = $request->x_coordinate;

        $note->y_coordinate = $request->y_coordinate;

        $note->save();

        //return redirect('/');
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

        // Update x_coordinate if provided
        if ($request->has('x_coordinate')) {
            $note->x_coordinate = intval($request->x_coordinate);
        }

        // Update y_coordinate if provided
        if ($request->has('y_coordinate')) {
            $note->y_coordinate = -intval($request->y_coordinate); //flip int
        }

        // Update note_content if provided
        if ($request->has('note_content')) {
            $note->note_content = $request->note_content;
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

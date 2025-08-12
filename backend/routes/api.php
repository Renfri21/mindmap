<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/notes', function () {
    // dummy data. i think this should get the notes from the DB. Accassible at http://127.0.0.1:8000/api/notes
    return [
        ['id' => 1, 'title' => 'Note 5'],
        ['id' => 2, 'title' => 'Note 2'],
    ];
});

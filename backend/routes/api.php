<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// controllers
use App\Http\Controllers\NoteController;




Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');


Route::get('/notes', [NoteController::class, 'index']);
Route::post('/create-note', [NoteController::class, 'store']);

Route::post('/notes/{id}', [NoteController::class, 'update']);

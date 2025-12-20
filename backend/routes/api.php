<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// controllers
use App\Http\Controllers\NodeController;
use App\Http\Controllers\NoteController;



Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');


Route::get('/nodes', [NodeController::class, 'index']);
// update x, y, width or height
Route::post('/nodes/{id}', [NodeController::class, 'update']);

Route::post('/create-note', [NoteController::class, 'store']);

//Route::post('/create-image', [ImageController::class, 'store']);


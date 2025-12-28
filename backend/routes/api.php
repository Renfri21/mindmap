<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// controllers
use App\Http\Controllers\NodeController;
use App\Http\Controllers\NoteController;



// Node routes (handles creation/deletion of nodes + their children)
    Route::get('/nodes', [NodeController::class, 'index']);
    Route::post('/nodes', [NodeController::class, 'store']);
    Route::put('/nodes/{id}', [NodeController::class, 'update']);
    Route::delete('/nodes/{id}', [NodeController::class, 'destroy']);

    // Note content updates (for editing text)
    Route::put('/notes/{id}', [NoteController::class, 'update']);




Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');


//Route::post('/create-image', [ImageController::class, 'store']);


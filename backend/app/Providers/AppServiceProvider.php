<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Database\Eloquent\Relations\Relation;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Relation::enforceMorphMap([

        // List of Morph-Aliases has to be exact with the values of child_type in the nodes table

        'note' => 'App\Models\Note',

        'image' => 'App\Models\Image',

        'folder' => 'App\Models\Folder',

        // add more aliases later
        // textbox, soundboard, 

    ]);
    }
}

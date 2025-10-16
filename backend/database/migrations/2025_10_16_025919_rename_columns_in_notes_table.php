<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('notes', function (Blueprint $table) {
            $table->renameColumn('x_coordinate', 'x');
            $table->renameColumn('y_coordinate', 'y');
            $table->renameColumn('note_content', 'content');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('notes', function (Blueprint $table) {
            $table->renameColumn('x', 'x_coordinate');
            $table->renameColumn('y', 'y_coordinate');
            $table->renameColumn('content', 'note_content');
        });
    }
};

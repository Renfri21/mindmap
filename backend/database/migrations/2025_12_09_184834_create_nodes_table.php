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
        Schema::create('nodes', function (Blueprint $table) {
            $table->id();
            $table->float('x');
            $table->float('y');
            $table->float('width')->default(200);
            $table->float('height')->default(200);
            $table->enum('type', ['note', 'image', 'folder']);
            $table->unsignedBigInteger('child_id')->nullable();
            $table->unsignedBigInteger('group_id')->nullable();
            $table->integer('z_index')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('nodes');
    }
};

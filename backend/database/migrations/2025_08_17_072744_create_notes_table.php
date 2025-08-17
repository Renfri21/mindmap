<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 'up' method is used to add new tables, columns, or indexes to the database
     */
    public function up(): void
    {
        Schema::create('notes', function (Blueprint $table) {
            $table->charset('utf8mb4');
            $table->collation('utf8mb4_unicode_ci');
            $table->id()->autoIncrement();
            $table->int('user_id');->nullable();
            $table->text('note_content');->nullable();
            $table->int('x_coordinate');
            $table->int('y_coordinate');
            $table->int('width')->nullable();
            $table->int('height')->nullable();
            $table->timestamps()->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     * down method should reverse the operations performed by the up method
     */
    public function down(): void
    {
        Schema::dropIfExists('notes');
    }
};

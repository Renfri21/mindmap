<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // 1️⃣ Backfill existing NULL content
        DB::table('notes')->whereNull('content')->update(['content' => '']);

        // 2️⃣ Alter column to NOT NULL
        Schema::table('notes', function (Blueprint $table) {
            $table->text('content')->nullable(false)->change();
        });
    }

    public function down(): void
    {
        Schema::table('notes', function (Blueprint $table) {
            $table->text('content')->nullable()->change();
        });
    }
};


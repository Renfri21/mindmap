<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Drop the foreign key first, then the column
        Schema::table('notes', function (Blueprint $table) {
            $table->dropForeign(['node_id']); // drop the foreign key constraint
            $table->dropColumn('node_id');    // then drop the column
        });

        // Make sure nodes.child_id is unsigned bigint and nullable (if not already)
        Schema::table('nodes', function (Blueprint $table) {
            $table->unsignedBigInteger('child_id')->nullable()->change();
        });
    }

    public function down(): void
    {
        // Add node_id back to notes
        Schema::table('notes', function (Blueprint $table) {
            $table->unsignedBigInteger('node_id')->nullable()->after('id');
            $table->foreign('node_id')->references('id')->on('nodes')->onDelete('cascade');
        });
    }
};
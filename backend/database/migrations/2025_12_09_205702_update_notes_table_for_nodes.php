<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('notes', function (Blueprint $table) {
            // add foreign key
            $table->foreignId('node_id')->nullable()->after('id')->constrained('nodes')->onDelete('cascade');

            // remove old columns
            $table->dropColumn(['user_id', 'x', 'y', 'width', 'height']);
        });
    }

    public function down(): void
    {
        Schema::table('notes', function (Blueprint $table) {
            $table->unsignedBigInteger('user_id')->nullable()->after('id');
            $table->integer('x')->default(0)->after('content');
            $table->integer('y')->default(0)->after('x');
            $table->integer('width')->nullable()->after('y');
            $table->integer('height')->nullable()->after('width');

            $table->dropForeign(['node_id']);
            $table->dropColumn('node_id');
        });
    }
};

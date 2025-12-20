<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $notes = DB::table('notes')->orderBy('id')->get();
        $nodes = DB::table('nodes')->orderBy('id')->get();

        foreach ($nodes as $index => $node) {
            if (isset($notes[$index])) {
                DB::table('nodes')->where('id', $node->id)->update([
                    'child_id' => $notes[$index]->id
                ]);
            }
        }
    }

    public function down(): void
    {
        DB::table('nodes')->update(['child_id' => null]);
    }
};
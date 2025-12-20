<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $notes = DB::table('notes')->get();

        foreach ($notes as $note) {
            DB::table('nodes')->insert([
                'x' => $note->x,
                'y' => $note->y,
                'width' => $note->width ?? 200,
                'height' => $note->height ?? 200,
                'type' => 'note',
                'child_id' => $note->id,
                'created_at' => $note->created_at ?? Carbon::now(),
                'updated_at' => $note->updated_at ?? Carbon::now(),
            ]);
        }
        
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Optionally remove nodes linked to notes
        DB::table('nodes')->whereIn('type', ['note'])->delete();
    }
};

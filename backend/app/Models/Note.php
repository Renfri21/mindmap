<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Note extends Model
{
    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'content',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'content' => 'string',
    ];

    /**
     * Get the node that owns this note (inverse relationship)
     * Optional - only if you need to access the node from a note
     */
    public function node()
    {
        return $this->hasOne(Node::class, 'child_id')
            ->where('child_type', 'note');
    }
}
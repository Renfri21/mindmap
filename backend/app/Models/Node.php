<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Node extends Model
{
    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'x',
        'y',
        'width',
        'height',
        'child_type',
        'child_id',
        'group_id',
        'z_index',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'x' => 'float',
        'y' => 'float',
        'width' => 'float',
        'height' => 'float',
        'z_index' => 'integer',
        'child_id' => 'integer',
        'group_id' => 'integer',
    ];

    /**
     * Get the child model (polymorphic relationship)
     * This is a helper method if you want to use it
     */
    public function child()
    {
        if ($this->child_type === 'note') {
            return $this->belongsTo(Note::class, 'child_id');
        } elseif ($this->child_type === 'image') {
            // return $this->belongsTo(Image::class, 'child_id');
        }
        // Add more types as needed
        
        return null;
    }
}
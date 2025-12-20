<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;
class Node extends Model
{

    protected $fillable = [
        'x', 'y', 'width', 'height', 'child_type', 'child_id', 'group_id', 'z_index'
    ];

    // MorphTo relationship to child (note, image)
    public function child(): MorphTo
    {
        return $this->morphTo();
    }
}
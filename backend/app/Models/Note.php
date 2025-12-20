<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphOne; 

class Note extends Model
{

    protected $fillable = ['content'];

    // Morph Note to its Parent Node
    public function node()
    {
        return $this->morphOne(Node::class, 'child', 'child_type', 'child_id');
    }
}

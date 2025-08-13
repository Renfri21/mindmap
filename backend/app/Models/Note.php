<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Note extends Model
{
        const UPDATED_AT = null; // disables updated_at column

    //
    /**

     * The table associated with the model.

     *

     * @var string

     */

    protected $table = 'notes';
}

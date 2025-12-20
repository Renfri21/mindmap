<?php

namespace App\Http\Controllers;

use App\Models\Node;
use App\Models\Note;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;


class NodeController extends Controller
{
    // Request all Nodes with their Childs
    public function index()
    {
        
        $nodes = Node::with('child')->get();
        return $nodes;

    }

}
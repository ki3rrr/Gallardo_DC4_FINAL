<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('users')
            ->where('email', 'admin@library.test')
            ->where('name', 'Elena Cruz')
            ->update(['name' => 'Kier Marvin']);
    }

    public function down(): void
    {
        DB::table('users')
            ->where('email', 'admin@library.test')
            ->where('name', 'Kier Marvin')
            ->update(['name' => 'Elena Cruz']);
    }
};

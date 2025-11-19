<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::create([
            'name' => 'Operator',
            'email' => 'operator@diskominfo.sultengprov.go.id',
            'password' => Hash::make('password'),
        ]);

        User::create([
            'name' => 'Admin Diskominfo',
            'email' => 'admin@diskominfo.sultengprov.go.id',
            'password' => Hash::make('password'),
        ]);
    }
}

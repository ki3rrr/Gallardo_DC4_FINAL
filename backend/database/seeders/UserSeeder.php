<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Demo accounts (password for both: "password")
        User::create([
            'name' => 'Kier Marvin',
            'email' => 'admin@library.test',
            'password' => 'password',
            'role' => User::ROLE_ADMIN,
            'phone' => '09171234567',
        ]);

        $members = [
            ['Maria Santos', 'member@library.test'],
            ['Juan Dela Cruz', 'juan.delacruz@example.com'],
            ['Angela Reyes', 'angela.reyes@example.com'],
            ['Mark Villanueva', 'mark.villanueva@example.com'],
            ['Patricia Gonzales', 'patricia.gonzales@example.com'],
            ['Daniel Bautista', 'daniel.bautista@example.com'],
            ['Sofia Mendoza', 'sofia.mendoza@example.com'],
            ['Carlo Ramirez', 'carlo.ramirez@example.com'],
        ];

        foreach ($members as $i => [$name, $email]) {
            User::create([
                'name' => $name,
                'email' => $email,
                'password' => 'password',
                'role' => User::ROLE_MEMBER,
                'phone' => '0918' . str_pad((string) (2000000 + $i * 137), 7, '0', STR_PAD_LEFT),
            ]);
        }
    }
}

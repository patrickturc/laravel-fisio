<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Cria usuário Admin padrão
        $admin = User::firstOrCreate(
            ['email' => 'paturchette@gmail.com'],
            [
                'name' => 'Patrick Turchetti',
                'password' => bcrypt('password'), // Senha padrão inicial
            ]
        );

        // Chama o seeder de permissões e perfis
        $this->call(AclSeeder::class);
    }
}

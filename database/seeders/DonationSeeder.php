<?php

namespace Database\Seeders;

use App\Models\Donation;
use Carbon\Carbon;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DonationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $donations = [];

        for ($i = 0; $i < 6; $i++) {

            $date = Carbon::now()->subMonths($i);

            $qtd = rand(3, 8);

            for ($j = 0; $j < $qtd; $j++) {

                $donations[] = [
                    'user_id' => 1,
                    'amount' => rand(10, 300),
                    'payment_method' => collect(['pix', 'credit_card', 'boleto'])->random(),
                    'status' => collect(['completed', 'pending'])->random(),
                    'message' => collect([
                        'Força!',
                        'Boa iniciativa',
                        'Continuem!',
                        null
                    ])->random(),
                    'transaction_id' => uniqid('txn_'),
                    'is_anonymous' => rand(0, 1),

                    'created_at' => $date->copy()->day(rand(1, 28)),
                    'updated_at' => now(),
                ];
            }
        }

        Donation::insert($donations);
    }
}

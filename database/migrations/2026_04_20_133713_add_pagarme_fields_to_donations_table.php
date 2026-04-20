<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('donations', function (Blueprint $table) {
            $table->string('pagarme_order_id')->nullable()->after('transaction_id');
            $table->string('pagarme_charge_id')->nullable()->after('pagarme_order_id');
            $table->text('pix_qr_code')->nullable()->after('pagarme_charge_id');
            $table->string('pix_qr_code_url')->nullable()->after('pix_qr_code');
            $table->text('boleto_url')->nullable()->after('pix_qr_code_url');
            $table->string('boleto_barcode')->nullable()->after('boleto_url');
            // dados do doador anônimo
            $table->string('donor_name')->nullable()->after('boleto_barcode');
            $table->string('donor_email')->nullable()->after('donor_name');
            $table->string('donor_cpf')->nullable()->after('donor_email');
            $table->string('donor_phone')->nullable()->after('donor_cpf');
        });
    }

    public function down(): void
    {
        Schema::table('donations', function (Blueprint $table) {
            $table->dropColumn([
                'pagarme_order_id', 'pagarme_charge_id',
                'pix_qr_code', 'pix_qr_code_url',
                'boleto_url', 'boleto_barcode',
                'donor_name', 'donor_email', 'donor_cpf', 'donor_phone',
            ]);
        });
    }
};

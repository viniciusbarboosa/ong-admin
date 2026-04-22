<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Donation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PagarmeWebhookController extends Controller
{
    // ─── Mapeamento de status Pagar.me → status interno ───────────────────────
    private const STATUS_MAP = [
        'paid'               => 'paid',
        'authorized'         => 'paid',
        'waiting_payment'    => 'pending',
        'pending'            => 'pending',
        'processing'         => 'pending',
        'waiting_funds'      => 'pending',
        'refunded'           => 'refunded',
        'refused'            => 'failed',
        'failed'             => 'failed',
        'canceled'           => 'cancelled',
        'chargedback'        => 'chargedback',
    ];

    // ─── Recebe o webhook da Pagar.me ─────────────────────────────────────────

    public function handle(Request $request)
    {
        Log::info('[Webhook][Pagarme] Recebido', [
            'headers' => $request->headers->all(),
            'body'    => $request->all(),
        ]);

        // ── Valida Basic Auth (se configurado) ───────────────────────────────
        $webhookUser = config('services.pagarme.webhook_user');
        $webhookPass = config('services.pagarme.webhook_password');

        if ($webhookUser || $webhookPass) {
            $user = $request->getUser();
            $pass = $request->getPassword();

            if (!hash_equals((string) $webhookUser, (string) $user) ||
                !hash_equals((string) $webhookPass, (string) $pass)) {
                Log::warning('[Webhook][Pagarme] Basic Auth inválido.', ['user_recebido' => $user]);
                return response()->json(['message' => 'Não autorizado.'], 401)
                    ->header('WWW-Authenticate', 'Basic realm="Webhook"');
            }
        }

        $payload = $request->all();
        $type    = $payload['type'] ?? null;

        Log::info('[Webhook][Pagarme] Evento recebido', ['type' => $type]);

        // ── Trata apenas eventos de charge e order ───────────────────────────
        $this->processarEvento($type, $payload);

        return response()->json(['message' => 'ok'], 200);
    }

    // ─── Roteamento de eventos ────────────────────────────────────────────────

    private function processarEvento(string $type, array $payload): void
    {
        match (true) {
            str_starts_with($type, 'charge.')  => $this->handleCharge($payload),
            str_starts_with($type, 'order.')   => $this->handleOrder($payload),
            default => Log::info('[Webhook][Pagarme] Evento ignorado.', ['type' => $type]),
        };
    }

    // ─── Evento de charge (charge.paid, charge.failed, etc.) ─────────────────

    private function handleCharge(array $payload): void
    {
        $charge   = $payload['data'] ?? null;
        $chargeId = $charge['id'] ?? null;

        if (!$chargeId) {
            Log::warning('[Webhook][Pagarme] charge sem id.', ['payload' => $payload]);
            return;
        }

        $donation = Donation::where('pagarme_charge_id', $chargeId)->first();

        if (!$donation) {
            Log::warning('[Webhook][Pagarme] Doação não encontrada para charge.', ['charge_id' => $chargeId]);
            return;
        }

        $pagarmeStatus = $charge['status'] ?? null;
        $novoStatus    = self::STATUS_MAP[$pagarmeStatus] ?? null;

        Log::info('[Webhook][Pagarme] Atualizando doação via charge', [
            'donation_id'    => $donation->id,
            'charge_id'      => $chargeId,
            'pagarme_status' => $pagarmeStatus,
            'novo_status'    => $novoStatus,
        ]);

        $updates = ['webhook_payload' => $payload];

        if ($novoStatus) {
            $updates['status'] = $novoStatus;
        }

        if ($novoStatus === 'paid' && !$donation->paid_at) {
            $updates['paid_at'] = now();
        }

        // Captura QR code/boleto se ainda não estiver salvo
        $lastTransaction = $charge['last_transaction'] ?? [];
        if (!$donation->pix_qr_code && isset($lastTransaction['qr_code'])) {
            $updates['pix_qr_code']     = $lastTransaction['qr_code'];
            $updates['pix_qr_code_url'] = $lastTransaction['qr_code_url'] ?? null;
        }
        if (!$donation->boleto_url && isset($lastTransaction['pdf'])) {
            $updates['boleto_url']     = $lastTransaction['pdf'];
            $updates['boleto_barcode'] = $lastTransaction['line'] ?? null;
        }

        $donation->update($updates);

        Log::info('[Webhook][Pagarme] Doação atualizada.', [
            'donation_id' => $donation->id,
            'status'      => $donation->fresh()->status,
        ]);
    }

    // ─── Evento de order (order.paid, order.canceled, etc.) ──────────────────

    private function handleOrder(array $payload): void
    {
        $order   = $payload['data'] ?? null;
        $orderId = $order['id'] ?? null;

        if (!$orderId) {
            Log::warning('[Webhook][Pagarme] order sem id.', ['payload' => $payload]);
            return;
        }

        $donation = Donation::where('pagarme_order_id', $orderId)->first();

        if (!$donation) {
            Log::warning('[Webhook][Pagarme] Doação não encontrada para order.', ['order_id' => $orderId]);
            return;
        }

        $pagarmeStatus = $order['status'] ?? null;
        $novoStatus    = self::STATUS_MAP[$pagarmeStatus] ?? null;

        Log::info('[Webhook][Pagarme] Atualizando doação via order', [
            'donation_id'    => $donation->id,
            'order_id'       => $orderId,
            'pagarme_status' => $pagarmeStatus,
            'novo_status'    => $novoStatus,
        ]);

        $updates = ['webhook_payload' => $payload];

        if ($novoStatus) {
            $updates['status'] = $novoStatus;
        }

        if ($novoStatus === 'paid' && !$donation->paid_at) {
            $updates['paid_at'] = now();
        }

        $donation->update($updates);

        Log::info('[Webhook][Pagarme] Doação atualizada via order.', [
            'donation_id' => $donation->id,
            'status'      => $donation->fresh()->status,
        ]);
    }
}

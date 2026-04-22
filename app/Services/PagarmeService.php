<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Exception;

class PagarmeService
{
    private string $baseUrl = 'https://api.pagar.me/core/v5';
    private string $token;
    private string $password;

    public function __construct()
    {
        $this->token    = config('services.pagarme.token');
        $this->password = config('services.pagarme.password', '');
    }

    // ─── Cria um pedido PIX ────────────────────────────────────────────────────

    public function criarPix(array $doador, int $valorCentavos): array
    {
        $payload = [
            'items' => [[
                'code'        => 'DOACAO-PIX',
                'amount'      => $valorCentavos,
                'description' => 'Doação - Movimento Pró Criança',
                'quantity'    => 1,
            ]],
            'customer' => $this->montarCliente($doador),
            'payments' => [[
                'payment_method' => 'pix',
                'pix' => [
                    'expires_in' => 3600, // 1 hora
                ],
            ]],
        ];

        $response = $this->post('/orders', $payload);

        $charge = $response['charges'][0] ?? null;
        if (!$charge) {
            throw new Exception('Resposta inesperada da Pagar.me ao criar PIX.');
        }

        $lastTransaction = $charge['last_transaction'] ?? [];

        Log::debug('[Pagarme][PIX] charge completo', ['charge' => $charge]);
        Log::debug('[Pagarme][PIX] last_transaction completo', ['last_transaction' => $lastTransaction]);
        Log::debug('[Pagarme][PIX] campos extraídos', [
            'charge_status'   => $charge['status'] ?? null,
            'qr_code'         => $lastTransaction['qr_code'] ?? null,
            'qr_code_url'     => $lastTransaction['qr_code_url'] ?? null,
            'gateway_errors'  => $lastTransaction['gateway_response']['errors'] ?? null,
            'acquirer_message'=> $lastTransaction['acquirer_message'] ?? null,
        ]);

        if (($charge['status'] ?? '') === 'failed') {
            $msg = $lastTransaction['gateway_response']['errors'][0]['message']
                ?? $lastTransaction['acquirer_message']
                ?? 'PIX recusado pela Pagar.me. Verifique as configurações da conta.';
            Log::error('[Pagarme][PIX] falhou', ['motivo' => $msg, 'last_transaction' => $lastTransaction]);
            throw new Exception($msg);
        }

        return [
            'order_id'     => $response['id'],
            'charge_id'    => $charge['id'],
            'status'       => $charge['status'],
            'qr_code'      => $lastTransaction['qr_code'] ?? null,
            'qr_code_url'  => $lastTransaction['qr_code_url'] ?? null,
        ];
    }

    // ─── Cria um pedido Boleto ─────────────────────────────────────────────────

    public function criarBoleto(array $doador, int $valorCentavos): array
    {
        $vencimento = now()->addDays(3)->format('Y-m-d');

        $payload = [
            'items' => [[
                'code'        => 'DOACAO-BOLETO',
                'amount'      => $valorCentavos,
                'description' => 'Doação - Movimento Pró Criança',
                'quantity'    => 1,
            ]],
            'customer' => $this->montarCliente($doador),
            'payments' => [[
                'payment_method' => 'boleto',
                'boleto' => [
                    'instructions'   => 'Obrigado por apoiar o Movimento Pró Criança!',
                    'due_at'         => $vencimento . 'T23:59:59Z',
                ],
            ]],
        ];

        $response = $this->post('/orders', $payload);

        $charge = $response['charges'][0] ?? null;
        if (!$charge) {
            throw new Exception('Resposta inesperada da Pagar.me ao criar boleto.');
        }

        $lastTransaction = $charge['last_transaction'] ?? [];

        Log::debug('[Pagarme][Boleto] charge completo', ['charge' => $charge]);
        Log::debug('[Pagarme][Boleto] last_transaction completo', ['last_transaction' => $lastTransaction]);
        Log::debug('[Pagarme][Boleto] campos extraídos', [
            'charge_status'  => $charge['status'] ?? null,
            'url'            => $lastTransaction['url'] ?? null,
            'pdf'            => $lastTransaction['pdf'] ?? null,
            'line'           => $lastTransaction['line'] ?? null,
            'barcode'        => $lastTransaction['barcode'] ?? null,
            'boleto_barcode' => $lastTransaction['boleto_barcode'] ?? null,
            'gateway_errors' => $lastTransaction['gateway_response']['errors'] ?? null,
        ]);

        if (($charge['status'] ?? '') === 'failed') {
            $msg = $lastTransaction['gateway_response']['errors'][0]['message']
                ?? 'Boleto recusado pela Pagar.me. Verifique as configurações da conta.';
            Log::error('[Pagarme][Boleto] falhou', ['motivo' => $msg, 'last_transaction' => $lastTransaction]);
            throw new Exception($msg);
        }

        return [
            'order_id'       => $response['id'],
            'charge_id'      => $charge['id'],
            'status'         => $charge['status'],
            'boleto_url'     => $lastTransaction['url'] ?? $lastTransaction['pdf'] ?? null,
            'boleto_barcode' => $lastTransaction['barcode'] ?? $lastTransaction['line'] ?? null,
            'due_at'         => $vencimento,
        ];
    }

    // ─── Cria um pedido Cartão de Crédito ──────────────────────────────────────

    public function criarCartao(array $doador, int $valorCentavos, array $cartao): array
    {
        [$mes, $ano] = explode('/', $cartao['validade']);
        $ano = strlen($ano) === 2 ? '20' . $ano : $ano;

        $payload = [
            'items' => [[
                'code'        => 'DOACAO-CARTAO',
                'amount'      => $valorCentavos,
                'description' => 'Doação - Movimento Pró Criança',
                'quantity'    => 1,
            ]],
            'customer' => $this->montarCliente($doador),
            'payments' => [[
                'payment_method' => 'credit_card',
                'credit_card' => [
                    'installments'    => 1,
                    'statement_descriptor' => 'PRO CRIANCA',
                    'card' => [
                        'number'           => preg_replace('/\D/', '', $cartao['numero']),
                        'holder_name'      => strtoupper($cartao['nome']),
                        'exp_month'        => (int) $mes,
                        'exp_year'         => (int) $ano,
                        'cvv'              => $cartao['cvv'],
                        'billing_address'  => [
                            'line_1'  => 'Rua sem informação, 0',
                            'zip_code' => '50000000',
                            'city'    => 'Recife',
                            'state'   => 'PE',
                            'country' => 'BR',
                        ],
                    ],
                ],
            ]],
        ];

        $response = $this->post('/orders', $payload);

        $charge = $response['charges'][0] ?? null;
        if (!$charge) {
            throw new Exception('Resposta inesperada da Pagar.me ao processar cartão.');
        }

        $status = $charge['status'];
        if ($status === 'failed') {
            $msg = $charge['last_transaction']['gateway_response']['errors'][0]['message']
                ?? 'Pagamento recusado. Verifique os dados do cartão.';
            throw new Exception($msg);
        }

        return [
            'order_id'  => $response['id'],
            'charge_id' => $charge['id'],
            'status'    => $status,
        ];
    }

    // ─── Helpers ───────────────────────────────────────────────────────────────

    private function montarCliente(array $doador): array
    {
        $cliente = [
            'name'          => $doador['nome'],
            'email'         => $doador['email'],
            'type'          => 'individual',
            'document_type' => 'CPF',
            'document'      => preg_replace('/\D/', '', $doador['cpf'] ?? ''),
        ];

        $telefone = preg_replace('/\D/', '', $doador['telefone'] ?? '');
        if (strlen($telefone) >= 10) {
            $cliente['phones'] = [
                'mobile_phone' => [
                    'country_code' => '55',
                    'area_code'    => substr($telefone, 0, 2),
                    'number'       => substr($telefone, 2),
                ],
            ];
        }

        return $cliente;
    }

    private function post(string $path, array $payload): array
    {
        // Mascarar dados sensíveis no log
        $logPayload = $payload;
        if (isset($logPayload['payments'][0]['credit_card']['card']['number'])) {
            $logPayload['payments'][0]['credit_card']['card']['number'] = '****';
            $logPayload['payments'][0]['credit_card']['card']['cvv'] = '***';
        }
        Log::debug('[Pagarme] REQUEST', ['url' => $this->baseUrl . $path, 'payload' => $logPayload]);

        $response = Http::withBasicAuth($this->token, $this->password)
            ->acceptJson()
            ->post($this->baseUrl . $path, $payload);

        Log::debug('[Pagarme] RESPONSE', [
            'status' => $response->status(),
            'body'   => $response->json(),
        ]);

        if ($response->failed()) {
            $body = $response->json();
            $erro = $body['message']
                ?? ($body['errors'][0]['message'] ?? null)
                ?? ($body['error'] ?? null)
                ?? json_encode($body);
            Log::error('[Pagarme] ERRO', ['status' => $response->status(), 'full_body' => $body]);
            throw new Exception($erro);
        }

        return $response->json();
    }
}

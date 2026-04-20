<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Exception;

class PagarmeService
{
    private string $baseUrl = 'https://api.pagar.me/core/v5';
    private string $token;

    public function __construct()
    {
        $this->token = config('services.pagarme.token');
    }

    // ─── Cria um pedido PIX ────────────────────────────────────────────────────

    public function criarPix(array $doador, int $valorCentavos): array
    {
        $payload = [
            'items' => [[
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

        return [
            'order_id'   => $response['id'],
            'charge_id'  => $charge['id'],
            'status'     => $charge['status'],
            'boleto_url'     => $lastTransaction['pdf'] ?? null,
            'boleto_barcode' => $lastTransaction['line'] ?? null,
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
        return [
            'name'  => $doador['nome'],
            'email' => $doador['email'],
            'type'  => 'individual',
            'document_type' => 'CPF',
            'document' => preg_replace('/\D/', '', $doador['cpf']),
            'phones' => [
                'mobile_phone' => $this->formatarTelefone($doador['telefone'] ?? ''),
            ],
        ];
    }

    private function formatarTelefone(string $telefone): array
    {
        $digits = preg_replace('/\D/', '', $telefone);
        return [
            'country_code' => '55',
            'area_code'    => substr($digits, 0, 2),
            'number'       => substr($digits, 2),
        ];
    }

    private function post(string $path, array $payload): array
    {
        $response = Http::withBasicAuth($this->token, '')
            ->acceptJson()
            ->post($this->baseUrl . $path, $payload);

        if ($response->failed()) {
            $erro = $response->json('message')
                ?? $response->json('errors.0.message')
                ?? 'Erro ao comunicar com o gateway de pagamento.';
            throw new Exception($erro);
        }

        return $response->json();
    }
}

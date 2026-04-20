<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Donation;
use App\Services\PagarmeService;
use Illuminate\Http\Request;
use Exception;

class DonationController extends Controller
{
    public function __construct(private PagarmeService $pagarme) {}

    // ─── Doação autenticada ────────────────────────────────────────────────────

    public function store(Request $request)
    {
        $validated = $request->validate([
            'amount'         => 'required|numeric|min:1',
            'payment_method' => 'required|in:pix,boleto,credit_card',
            'message'        => 'nullable|string|max:500',
            // Cartão de crédito
            'card_number'    => 'required_if:payment_method,credit_card|string',
            'card_holder'    => 'required_if:payment_method,credit_card|string',
            'card_expiry'    => 'required_if:payment_method,credit_card|string',
            'card_cvv'       => 'required_if:payment_method,credit_card|string',
        ]);

        $user = $request->user();
        $doador = [
            'nome'     => $user->name,
            'email'    => $user->email,
            'cpf'      => $user->cpf,
            'telefone' => $user->phone ?? '',
        ];

        return $this->processarPagamento($validated, $doador, $user->id, false);
    }

    // ─── Doação anônima ────────────────────────────────────────────────────────

    public function storeAnonymous(Request $request)
    {
        $validated = $request->validate([
            'amount'         => 'required|numeric|min:1',
            'payment_method' => 'required|in:pix,boleto,credit_card',
            'message'        => 'nullable|string|max:500',
            'donor_name'     => 'required|string|max:255',
            'donor_email'    => 'required|email|max:255',
            'donor_cpf'      => 'required|string|size:11',
            'donor_phone'    => 'nullable|string|max:20',
            // Cartão de crédito
            'card_number'    => 'required_if:payment_method,credit_card|string',
            'card_holder'    => 'required_if:payment_method,credit_card|string',
            'card_expiry'    => 'required_if:payment_method,credit_card|string',
            'card_cvv'       => 'required_if:payment_method,credit_card|string',
        ]);

        $doador = [
            'nome'     => $validated['donor_name'],
            'email'    => $validated['donor_email'],
            'cpf'      => $validated['donor_cpf'],
            'telefone' => $validated['donor_phone'] ?? '',
        ];

        return $this->processarPagamento($validated, $doador, null, true);
    }

    // ─── Listagem (autenticado) ────────────────────────────────────────────────

    public function index(Request $request)
    {
        return response()->json(
            Donation::where('user_id', $request->user()->id)->latest()->get()
        );
    }

    // ─── Lógica central de pagamento ──────────────────────────────────────────

    private function processarPagamento(array $dados, array $doador, ?int $userId, bool $anonimo)
    {
        $valorCentavos = (int) round($dados['amount'] * 100);
        $metodo = $dados['payment_method'];

        try {
            $resultado = match ($metodo) {
                'pix'         => $this->pagarme->criarPix($doador, $valorCentavos),
                'boleto'      => $this->pagarme->criarBoleto($doador, $valorCentavos),
                'credit_card' => $this->pagarme->criarCartao($doador, $valorCentavos, [
                    'numero'    => $dados['card_number'],
                    'nome'      => $dados['card_holder'],
                    'validade'  => $dados['card_expiry'],
                    'cvv'       => $dados['card_cvv'],
                ]),
            };
        } catch (Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        $donation = Donation::create([
            'user_id'          => $userId,
            'amount'           => $dados['amount'],
            'payment_method'   => $metodo,
            'message'          => $dados['message'] ?? null,
            'is_anonymous'     => $anonimo,
            'status'           => $resultado['status'] ?? 'pending',
            'transaction_id'   => $resultado['charge_id'] ?? null,
            'pagarme_order_id' => $resultado['order_id'] ?? null,
            'pagarme_charge_id'=> $resultado['charge_id'] ?? null,
            'pix_qr_code'      => $resultado['qr_code'] ?? null,
            'pix_qr_code_url'  => $resultado['qr_code_url'] ?? null,
            'boleto_url'       => $resultado['boleto_url'] ?? null,
            'boleto_barcode'   => $resultado['boleto_barcode'] ?? null,
            'donor_name'       => $anonimo ? $doador['nome'] : null,
            'donor_email'      => $anonimo ? $doador['email'] : null,
            'donor_cpf'        => $anonimo ? $doador['cpf'] : null,
            'donor_phone'      => $anonimo ? $doador['telefone'] : null,
        ]);

        return response()->json([
            'message'  => 'Doação registrada com sucesso!',
            'donation' => $donation,
            'payment'  => $resultado,
        ], 201);
    }
}

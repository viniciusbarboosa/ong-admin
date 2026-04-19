<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ResetPasswordNotification extends Notification
{
    use Queueable;

    public $token;

    public function __construct($token)
    {
        $this->token = $token;
    }

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        $resetUrl = url(route('password.reset', [
            'token' => $this->token,
            'email' => $notifiable->getEmailForPasswordReset(),
        ], false));

        return (new MailMessage)
            ->subject('Redefinição de Senha - Pró-Criança')       
            ->greeting('Olá, ' . $notifiable->name . '!')
            ->line('Você está recebendo este e-mail porque solicitou a redefinição da senha da sua conta.')
            ->action('Redefinir Senha', $resetUrl)
            ->line('Este link de redefinição expirará em 60 minutos.')
            ->line('Se você não solicitou a redefinição, nenhuma ação é necessária.')
            ->salutation('Atenciosamente, Equipe Pró-Criança');
    }
}

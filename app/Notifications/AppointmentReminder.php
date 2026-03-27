<?php

namespace App\Notifications;

use App\Models\Appointment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Carbon\Carbon;

class AppointmentReminder extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Appointment $appointment
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $date = Carbon::parse($this->appointment->appointment_date)->format('d/m/Y');
        $time = substr($this->appointment->start_time, 0, 5);
        $patientName = $this->appointment->patient->name ?? 'Paciente';

        return (new MailMessage)
            ->subject("Lembrete: Sessão amanhã às {$time}")
            ->greeting("Olá!")
            ->line("Lembramos que você tem uma sessão agendada para amanhã:")
            ->line("**Paciente:** {$patientName}")
            ->line("**Data:** {$date}")
            ->line("**Horário:** {$time}")
            ->line("**Duração:** {$this->appointment->duration_minutes} minutos")
            ->action('Ver Agendamento', url("/appointments/{$this->appointment->id}"))
            ->line('Até lá!');
    }
}

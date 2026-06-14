<?php

namespace App\Notifications;

use App\Models\Appointment;
use App\Models\Patient;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AppointmentReminder extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Appointment $appointment,
        public Patient $patient,
    ) {}

    /**
     * @return list<string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $date = Carbon::parse($this->appointment->appointment_date)->format('d/m/Y');
        $time = substr((string) $this->appointment->start_time, 0, 5);

        return (new MailMessage)
            ->subject("Lembrete: sua sessão amanhã às {$time}")
            ->greeting("Olá, {$this->patient->name}!")
            ->line('Lembramos que você tem uma sessão agendada para amanhã:')
            ->line("**Data:** {$date}")
            ->line("**Horário:** {$time}")
            ->line("**Duração:** {$this->appointment->duration_minutes} minutos")
            ->line('Se precisar remarcar ou cancelar, entre em contato com a clínica.')
            ->line('Até lá!');
    }
}

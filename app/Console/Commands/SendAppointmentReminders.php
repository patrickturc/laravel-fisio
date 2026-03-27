<?php

namespace App\Console\Commands;

use App\Models\Appointment;
use App\Models\User;
use App\Notifications\AppointmentReminder;
use Carbon\Carbon;
use Illuminate\Console\Command;

class SendAppointmentReminders extends Command
{
    protected $signature = 'appointments:send-reminders';
    protected $description = 'Send email reminders for appointments scheduled for tomorrow';

    public function handle(): int
    {
        $tomorrow = Carbon::tomorrow()->toDateString();

        $appointments = Appointment::with('patient')
            ->where('appointment_date', $tomorrow)
            ->where('status', 'scheduled')
            ->get();

        if ($appointments->isEmpty()) {
            $this->info('Nenhum agendamento para amanhã.');
            return self::SUCCESS;
        }

        // Notify all users (in a real app, you'd filter by the professional)
        $users = User::all();

        foreach ($appointments as $appointment) {
            foreach ($users as $user) {
                $user->notify(new AppointmentReminder($appointment));
            }
        }

        $this->info("Lembretes enviados para {$appointments->count()} agendamento(s).");
        return self::SUCCESS;
    }
}

<?php

namespace App\Console\Commands;

use App\Models\Appointment;
use App\Notifications\AppointmentReminder;
use Carbon\Carbon;
use Illuminate\Console\Command;

class SendAppointmentReminders extends Command
{
    protected $signature = 'appointments:send-reminders';

    protected $description = 'Send email reminders to patients with an appointment scheduled for tomorrow';

    public function handle(): int
    {
        $tomorrow = Carbon::now(config('app.timezone'))->addDay()->toDateString();

        $appointments = Appointment::with(['patients' => function ($query) {
            $query->wherePivot('status', '!=', 'cancelled')
                ->wherePivotNull('reminder_sent_at');
        }])
            ->where('appointment_date', $tomorrow)
            ->get();

        $sent = 0;

        foreach ($appointments as $appointment) {
            foreach ($appointment->patients as $patient) {
                if (blank($patient->email)) {
                    continue;
                }

                try {
                    $patient->notify(new AppointmentReminder($appointment, $patient));

                    $appointment->patients()->updateExistingPivot($patient->id, [
                        'reminder_sent_at' => now(),
                    ]);

                    $sent++;
                } catch (\Throwable $e) {
                    $this->error("Falha ao enviar lembrete para {$patient->name}: {$e->getMessage()}");
                }
            }
        }

        $this->info("Lembretes enfileirados: {$sent}.");

        return self::SUCCESS;
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Appointment;
use App\Models\GroupClass;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CalendarFeedController extends Controller
{
    public function feed($token)
    {
        $user = User::where('calendar_token', $token)->firstOrFail();

        $today = now()->startOfDay();

        // Get regular appointments
        $appointments = Appointment::with('patients')
            ->where('user_id', $user->id)
            ->where('appointment_date', '>=', $today->toDateString())
            ->where('status', '!=', 'cancelled')
            ->get();

        // Get group classes
        $groupClasses = GroupClass::with('patients')
            ->where('user_id', $user->id)
            ->where('class_date', '>=', $today->toDateString())
            ->where('status', '!=', 'cancelled')
            ->get();

        $ics = "BEGIN:VCALENDAR\r\n";
        $ics .= "VERSION:2.0\r\n";
        $ics .= "PRODID:-//Phisio//Calendar Sync//PT\r\n";
        $ics .= "CALSCALE:GREGORIAN\r\n";
        $ics .= "METHOD:PUBLISH\r\n";
        $ics .= "X-WR-CALNAME:Phisio - " . $user->name . "\r\n";
        $ics .= "X-PUBLISHED-TTL:PT1H\r\n"; // Suggest clients update every hour

        $nowStamp = gmdate('Ymd\THis\Z');

        foreach ($appointments as $app) {
            $startTime = \Carbon\Carbon::createFromFormat('Y-m-d H:i:s', $app->appointment_date . ' ' . $app->start_time, 'America/Sao_Paulo')->utc();
            $endTime = \Carbon\Carbon::createFromFormat('Y-m-d H:i:s', $app->appointment_date . ' ' . $app->end_time, 'America/Sao_Paulo')->utc();
            
            $patients = $app->patients->pluck('name')->implode(', ');
            $summary = $patients ? "Sessão: {$patients}" : "Sessão Agendada";
            
            $uid = "appointment-{$app->id}@phisio";

            $ics .= "BEGIN:VEVENT\r\n";
            $ics .= "UID:{$uid}\r\n";
            $ics .= "DTSTAMP:{$nowStamp}\r\n";
            $ics .= "DTSTART:" . $startTime->format('Ymd\THis\Z') . "\r\n";
            $ics .= "DTEND:" . $endTime->format('Ymd\THis\Z') . "\r\n";
            $ics .= "SUMMARY:{$summary}\r\n";
            $ics .= "STATUS:CONFIRMED\r\n";
            $ics .= "END:VEVENT\r\n";
        }

        foreach ($groupClasses as $gc) {
            $startTime = \Carbon\Carbon::createFromFormat('Y-m-d H:i:s', $gc->class_date . ' ' . $gc->start_time, 'America/Sao_Paulo')->utc();
            $endTime = \Carbon\Carbon::createFromFormat('Y-m-d H:i:s', $gc->class_date . ' ' . $gc->end_time, 'America/Sao_Paulo')->utc();
            
            $summary = "Turma: {$gc->name}";
            if ($gc->patients->count() > 0) {
                $summary .= " (" . $gc->patients->count() . " alunos)";
            }
            
            $uid = "groupclass-{$gc->id}@phisio";

            $ics .= "BEGIN:VEVENT\r\n";
            $ics .= "UID:{$uid}\r\n";
            $ics .= "DTSTAMP:{$nowStamp}\r\n";
            $ics .= "DTSTART:" . $startTime->format('Ymd\THis\Z') . "\r\n";
            $ics .= "DTEND:" . $endTime->format('Ymd\THis\Z') . "\r\n";
            $ics .= "SUMMARY:{$summary}\r\n";
            $ics .= "STATUS:CONFIRMED\r\n";
            $ics .= "END:VEVENT\r\n";
        }

        $ics .= "END:VCALENDAR\r\n";

        return response($ics)
            ->header('Content-Type', 'text/calendar; charset=utf-8')
            ->header('Content-Disposition', 'attachment; filename="phisio-calendar.ics"');
    }
}

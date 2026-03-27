<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Evolution;
use App\Models\Patient;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $selectedDate = $request->query('date', now()->toDateString());
        $carbon = Carbon::parse($selectedDate);

        // Build the week (Mon-Sun) around the selected date
        $startOfWeek = $carbon->copy()->startOfWeek(Carbon::MONDAY);
        $weekDays = [];
        for ($i = 0; $i < 7; $i++) {
            $day = $startOfWeek->copy()->addDays($i);
            $weekDays[] = [
                'date' => $day->toDateString(),
                'dayName' => $day->locale('pt_BR')->isoFormat('ddd'),
                'dayNumber' => $day->day,
                'isToday' => $day->isToday(),
                'isSelected' => $day->toDateString() === $selectedDate,
            ];
        }

        $totalPatients = Patient::count();

        $dayAppointments = Appointment::with('patient')
            ->where('appointment_date', $selectedDate)
            ->orderBy('start_time')
            ->get();

        $pendingEvolutions = Evolution::where('evolucao_status', 'pendente')->count();

        return Inertia::render('dashboard', [
            'totalPatients' => $totalPatients,
            'dayAppointments' => $dayAppointments,
            'dayCount' => $dayAppointments->count(),
            'pendingEvolutions' => $pendingEvolutions,
            'selectedDate' => $selectedDate,
            'weekDays' => $weekDays,
            'weekLabel' => $startOfWeek->locale('pt_BR')->isoFormat('D [de] MMM') . ' — ' . $startOfWeek->copy()->addDays(6)->locale('pt_BR')->isoFormat('D [de] MMM, YYYY'),
        ]);
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use App\Models\Appointment;
use App\Models\Evolution;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ReportController extends Controller
{
    public function index()
    {
        $now = Carbon::now();
        $startOfYear = $now->copy()->startOfYear();

        // Patients stats
        $totalPatients = Patient::count();
        $pilatesCount = Patient::where('type', 'pilates')->count();
        $physioCount = Patient::where('type', 'physiotherapy')->count();

        // Appointments per month (last 12 months)
        $appointmentsPerMonth = Appointment::select(
            DB::raw("to_char(appointment_date, 'YYYY-MM') as month"),
            DB::raw('count(*) as total'),
            DB::raw("count(*) filter (where status = 'completed') as completed"),
            DB::raw("count(*) filter (where status = 'cancelled') as cancelled"),
            DB::raw("count(*) filter (where status = 'scheduled') as scheduled")
        )
            ->where('appointment_date', '>=', $now->copy()->subMonths(11)->startOfMonth())
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        // Evolutions per month (last 12 months)
        $evolutionsPerMonth = Evolution::select(
            DB::raw("to_char(data_atendimento, 'YYYY-MM') as month"),
            DB::raw('count(*) as total')
        )
            ->where('data_atendimento', '>=', $now->copy()->subMonths(11)->startOfMonth())
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        // Top patients by appointment count
        $topPatients = Patient::withCount('appointments')
            ->orderBy('appointments_count', 'desc')
            ->limit(5)
            ->get(['id', 'name', 'type']);

        // Summary stats
        $totalAppointments = Appointment::count();
        $completedAppointments = Appointment::where('status', 'completed')->count();
        $cancelledAppointments = Appointment::where('status', 'cancelled')->count();
        $totalEvolutions = Evolution::count();

        return Inertia::render('reports/index', [
            'stats' => [
                'totalPatients' => $totalPatients,
                'pilatesCount' => $pilatesCount,
                'physioCount' => $physioCount,
                'totalAppointments' => $totalAppointments,
                'completedAppointments' => $completedAppointments,
                'cancelledAppointments' => $cancelledAppointments,
                'totalEvolutions' => $totalEvolutions,
                'completionRate' => $totalAppointments > 0 ? round(($completedAppointments / $totalAppointments) * 100) : 0,
            ],
            'appointmentsPerMonth' => $appointmentsPerMonth,
            'evolutionsPerMonth' => $evolutionsPerMonth,
            'topPatients' => $topPatients,
        ]);
    }
}

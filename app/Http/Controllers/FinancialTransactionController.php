<?php

namespace App\Http\Controllers;

use App\Models\FinancialTransaction;
use App\Models\Patient;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class FinancialTransactionController extends Controller
{
    public function index(Request $request)
    {
        // Determine the month/year to display (default: current)
        $month = $request->input('month', now()->month);
        $year = $request->input('year', now()->year);

        $query = FinancialTransaction::with(['patient', 'membership.commercialPlan'])->orderBy('date', 'desc');

        // Monthly filter
        $query->whereMonth('date', $month)->whereYear('date', $year);

        // Additional filters
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('status')) {
            if ($request->status === 'overdue') {
                $query->overdue();
            } else {
                $query->where('status', $request->status);
            }
        }

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('description', 'ilike', '%' . $request->search . '%')
                  ->orWhere('category', 'ilike', '%' . $request->search . '%')
                  ->orWhereHas('patient', fn($pq) => $pq->where('name', 'ilike', '%' . $request->search . '%'));
            });
        }

        $transactions = $query->paginate(20)->withQueryString();

        // Monthly summary
        $monthQuery = fn() => FinancialTransaction::whereMonth('date', $month)->whereYear('date', $year);

        $summary = [
            'income' => $monthQuery()->where('type', 'income')->where('status', 'paid')->sum('amount'),
            'expense' => $monthQuery()->where('type', 'expense')->where('status', 'paid')->sum('amount'),
            'pending_income' => $monthQuery()->where('type', 'income')->where('status', 'pending')->sum('amount'),
            'pending_expense' => $monthQuery()->where('type', 'expense')->where('status', 'pending')->sum('amount'),
            'overdue_count' => FinancialTransaction::overdue()->count(),
        ];
        $summary['balance'] = $summary['income'] - $summary['expense'];

        // Chart data: last 6 months of income vs expense
        $chartData = [];
        for ($i = 5; $i >= 0; $i--) {
            $d = Carbon::create($year, $month, 1)->subMonths($i);
            $m = $d->month;
            $y = $d->year;
            $chartData[] = [
                'label' => $d->translatedFormat('M/y'),
                'income' => (float) FinancialTransaction::where('type', 'income')
                    ->where('status', 'paid')
                    ->whereMonth('date', $m)->whereYear('date', $y)
                    ->sum('amount'),
                'expense' => (float) FinancialTransaction::where('type', 'expense')
                    ->where('status', 'paid')
                    ->whereMonth('date', $m)->whereYear('date', $y)
                    ->sum('amount'),
            ];
        }

        // Category breakdown for the current month
        $categoryBreakdown = [
            'income' => FinancialTransaction::where('type', 'income')
                ->whereMonth('date', $month)->whereYear('date', $year)
                ->select('category', DB::raw('SUM(amount) as total'))
                ->groupBy('category')
                ->orderByDesc('total')
                ->get()
                ->map(fn($row) => ['category' => $row->category ?: 'Sem categoria', 'total' => (float) $row->total])
                ->values(),
            'expense' => FinancialTransaction::where('type', 'expense')
                ->whereMonth('date', $month)->whereYear('date', $year)
                ->select('category', DB::raw('SUM(amount) as total'))
                ->groupBy('category')
                ->orderByDesc('total')
                ->get()
                ->map(fn($row) => ['category' => $row->category ?: 'Sem categoria', 'total' => (float) $row->total])
                ->values(),
        ];

        $patients = Patient::orderBy('name')->get(['id', 'name']);

        return Inertia::render('financial/index', [
            'transactions' => $transactions,
            'summary' => $summary,
            'chartData' => $chartData,
            'categoryBreakdown' => $categoryBreakdown,
            'filters' => $request->only(['type', 'status', 'search', 'month', 'year']),
            'currentMonth' => (int) $month,
            'currentYear' => (int) $year,
            'patients' => $patients,
        ]);
    }


    public function receivables(Request $request)
    {
        $today = now()->toDateString();

        // All pending income (contas a receber)
        $pending = FinancialTransaction::with('patient')
            ->where('type', 'income')
            ->where('status', 'pending')
            ->orderBy('due_date')
            ->get();

        // Group by patient (transactions with no patient grouped under "Sem paciente")
        $byPatient = $pending->groupBy(fn($t) => $t->patient_id ?? 'none')
            ->map(function ($items) use ($today) {
                $first = $items->first();
                $overdue = $items->filter(fn($t) => $t->due_date && $t->due_date->toDateString() < $today);
                return [
                    'patient_id' => $first->patient_id,
                    'patient_name' => $first->patient?->name ?? 'Sem paciente vinculado',
                    'total_pending' => (float) $items->sum('amount'),
                    'overdue_amount' => (float) $overdue->sum('amount'),
                    'overdue_count' => $overdue->count(),
                    'count' => $items->count(),
                    'oldest_due' => optional($items->whereNotNull('due_date')->sortBy('due_date')->first())->due_date?->toDateString(),
                    'transactions' => $items->map(fn($t) => [
                        'id' => $t->id,
                        'description' => $t->description,
                        'amount' => (float) $t->amount,
                        'due_date' => $t->due_date?->toDateString(),
                        'date' => $t->date?->toDateString(),
                        'category' => $t->category,
                        'is_overdue' => $t->due_date && $t->due_date->toDateString() < $today,
                    ])->values(),
                ];
            })
            ->sortByDesc('overdue_amount')
            ->values();

        $totals = [
            'total_pending' => (float) $pending->sum('amount'),
            'overdue_amount' => (float) $pending->filter(fn($t) => $t->due_date && $t->due_date->toDateString() < $today)->sum('amount'),
            'patient_count' => $byPatient->count(),
        ];

        return Inertia::render('financial/receivables', [
            'groups' => $byPatient,
            'totals' => $totals,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:income,expense',
            'amount' => 'required|numeric|min:0.01',
            'date' => 'required|date',
            'due_date' => 'nullable|date',
            'paid_at' => 'nullable|date',
            'description' => 'required|string|max:255',
            'category' => 'nullable|string|max:100',
            'status' => 'required|in:paid,pending',
            'patient_id' => 'nullable|uuid|exists:patients,id',
        ]);

        // Auto-set paid_at when marking as paid
        if ($validated['status'] === 'paid' && empty($validated['paid_at'])) {
            $validated['paid_at'] = $validated['date'];
        }

        $validated['created_by'] = auth()->id();
        if ($validated['status'] === 'paid') {
            $validated['paid_by'] = auth()->id();
        }

        $transaction = FinancialTransaction::create($validated);
        $transaction->logAction('created', null, $transaction->status);

        return redirect()->route('financial.index')->with('success', 'Transação registrada!');
    }


    public function update(Request $request, FinancialTransaction $financial)
    {
        $validated = $request->validate([
            'type' => 'required|in:income,expense',
            'amount' => 'required|numeric|min:0.01',
            'date' => 'required|date',
            'due_date' => 'nullable|date',
            'paid_at' => 'nullable|date',
            'description' => 'required|string|max:255',
            'category' => 'nullable|string|max:100',
            'status' => 'required|in:paid,pending',
            'patient_id' => 'nullable|uuid|exists:patients,id',
        ]);

        $oldStatus = $financial->status;

        // Auto-set paid_at when marking as paid
        if ($validated['status'] === 'paid' && empty($validated['paid_at'])) {
            $validated['paid_at'] = $financial->paid_at ?: $validated['date'];
        }

        // Clear payment info when reverting to pending
        if ($validated['status'] === 'pending') {
            $validated['paid_at'] = null;
            $validated['paid_by'] = null;
        } elseif ($validated['status'] === 'paid' && $oldStatus !== 'paid') {
            $validated['paid_by'] = auth()->id();
        }

        $financial->update($validated);

        if ($oldStatus !== $financial->status) {
            $financial->logAction('updated', $oldStatus, $financial->status);
        }

        return redirect()->route('financial.index')->with('success', 'Transação atualizada!');
    }

    public function destroy(FinancialTransaction $financial)
    {
        $financial->logAction('deleted', $financial->status, null);
        $financial->delete();
        return redirect()->route('financial.index')->with('success', 'Transação excluída.');
    }

    public function markAsPaid(FinancialTransaction $financial)
    {
        $oldStatus = $financial->status;

        $financial->update([
            'status' => 'paid',
            'paid_at' => now()->toDateString(),
            'paid_by' => auth()->id(),
        ]);

        $financial->logAction('marked_paid', $oldStatus, 'paid');

        return redirect()->back()->with('success', 'Pagamento confirmado!');
    }

    public function markAsPending(FinancialTransaction $financial)
    {
        $oldStatus = $financial->status;

        $financial->update([
            'status' => 'pending',
            'paid_at' => null,
            'paid_by' => null,
        ]);

        $financial->logAction('reverted', $oldStatus, 'pending');

        return redirect()->back()->with('success', 'Pagamento estornado. Voltou para pendente.');
    }
}

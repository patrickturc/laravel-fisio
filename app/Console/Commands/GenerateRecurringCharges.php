<?php

namespace App\Console\Commands;

use App\Models\FinancialTransaction;
use App\Models\Membership;
use App\Models\RecurringExpense;
use Carbon\Carbon;
use Carbon\CarbonInterface;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class GenerateRecurringCharges extends Command
{
    protected $signature = 'charges:generate';

    protected $description = 'Generate recurring expense transactions and membership monthly charges';

    public function handle(): int
    {
        $today = Carbon::today(config('app.timezone'));
        $daysInMonth = $today->daysInMonth;
        $monthStart = $today->copy()->startOfMonth();

        $generated = 0;

        // 1. Recurring Expenses — create the whole month's charge up front as
        //    pending, dated to the month and due on its billing day. It only
        //    turns "overdue" once the due date passes (see FinancialTransaction
        //    scopeOverdue). One charge per cycle (recurrenceIsDue dedups).
        $recurringExpenses = RecurringExpense::where('is_active', true)->get();

        foreach ($recurringExpenses as $expense) {
            if (! $this->recurrenceIsDue($expense->last_generated_at, $expense->recurrence ?? 'monthly', $today)) {
                continue;
            }

            $billingDay = min((int) $expense->day_of_month, $daysInMonth);
            $dueDate = $today->copy()->day($billingDay);

            DB::transaction(function () use ($expense, $today, $monthStart, $dueDate) {
                FinancialTransaction::create([
                    'type' => 'expense',
                    'amount' => $expense->amount,
                    'date' => $monthStart->toDateString(),
                    'due_date' => $dueDate->toDateString(),
                    'description' => $expense->description,
                    'category' => $expense->category,
                    'status' => 'pending',
                    'recurring_expense_id' => $expense->id,
                ]);

                $expense->update(['last_generated_at' => $today]);
            });

            $generated++;
        }

        $this->info("Generated {$generated} recurring expense transactions.");

        // 2. Membership Monthly Charges — create the month's mensalidade up front
        //    as pending, dated to the month and due on the membership's billing
        //    day (clamped to short months). It only shows as "overdue" after the
        //    due date. One charge per month (alreadyBilledThisMonth dedups).
        $membershipGenerated = 0;

        $memberships = Membership::where('status', 'active')
            ->whereNotNull('billing_day')
            ->where('start_date', '<=', $today->toDateString())
            ->with(['patient', 'commercialPlan'])
            ->get();

        foreach ($memberships as $membership) {
            if ($this->alreadyBilledThisMonth($membership->last_billed_at, $today)) {
                continue;
            }

            $billingDay = min((int) $membership->billing_day, $daysInMonth);
            $dueDate = $today->copy()->day($billingDay);

            $planName = $membership->commercialPlan?->name ?? $membership->plan_name ?? 'Plano';
            $patientName = $membership->patient?->name ?? 'Aluno';

            DB::transaction(function () use ($membership, $today, $monthStart, $dueDate, $planName, $patientName) {
                FinancialTransaction::create([
                    'type' => 'income',
                    'amount' => $membership->price,
                    'date' => $monthStart->toDateString(),
                    'due_date' => $dueDate->toDateString(),
                    'description' => "Mensalidade: {$planName} — {$patientName}",
                    'category' => 'Mensalidade',
                    'status' => 'pending',
                    'patient_id' => $membership->patient_id,
                    'membership_id' => $membership->id,
                ]);

                $membership->update(['last_billed_at' => $today]);
            });

            $membershipGenerated++;
        }

        $this->info("Generated {$membershipGenerated} membership billing transactions.");

        // 3. Auto-expire memberships past end_date
        $expired = Membership::where('status', 'active')
            ->where('end_date', '<', $today->toDateString())
            ->update(['status' => 'expired']);

        $this->info("Expired {$expired} memberships past end date.");

        return self::SUCCESS;
    }

    /**
     * Whether a recurring expense is due for a new charge in the current cycle.
     */
    private function recurrenceIsDue(?CarbonInterface $lastGenerated, string $recurrence, CarbonInterface $today): bool
    {
        if ($lastGenerated === null) {
            return true;
        }

        $monthStart = $today->copy()->startOfMonth();

        return match ($recurrence) {
            'quarterly' => $lastGenerated->copy()->addMonthsNoOverflow(3)->startOfMonth()->lte($monthStart),
            'yearly' => $lastGenerated->copy()->addYearNoOverflow()->startOfMonth()->lte($monthStart),
            default => $lastGenerated->format('Y-m') !== $today->format('Y-m'),
        };
    }

    /**
     * Whether a membership has already been billed within the current month.
     */
    private function alreadyBilledThisMonth(?CarbonInterface $lastBilled, CarbonInterface $today): bool
    {
        return $lastBilled !== null && $lastBilled->format('Y-m') === $today->format('Y-m');
    }
}

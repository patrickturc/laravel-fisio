<?php

namespace App\Console\Commands;

use App\Models\FinancialTransaction;
use App\Models\Membership;
use App\Models\RecurringExpense;
use Carbon\Carbon;
use Illuminate\Console\Command;

class GenerateRecurringCharges extends Command
{
    protected $signature = 'charges:generate';
    protected $description = 'Generate recurring expense transactions and membership monthly charges';

    public function handle()
    {
        $today = Carbon::today();
        $currentDay = $today->day;
        $currentMonth = $today->month;
        $currentYear = $today->year;

        $generated = 0;

        // 1. Recurring Expenses
        $recurringExpenses = RecurringExpense::where('is_active', true)
            ->where('day_of_month', $currentDay)
            ->where(function ($q) use ($currentMonth, $currentYear) {
                $q->whereNull('last_generated_at')
                  ->orWhere(function ($q2) use ($currentMonth, $currentYear) {
                      $q2->where(function ($q3) use ($currentMonth, $currentYear) {
                          $q3->whereMonth('last_generated_at', '!=', $currentMonth)
                              ->orWhereYear('last_generated_at', '!=', $currentYear);
                      });
                  });
            })
            ->get();

        foreach ($recurringExpenses as $expense) {
            FinancialTransaction::create([
                'type' => 'expense',
                'amount' => $expense->amount,
                'date' => $today->toDateString(),
                'due_date' => $today->toDateString(),
                'description' => $expense->description,
                'category' => $expense->category,
                'status' => 'pending',
                'recurring_expense_id' => $expense->id,
            ]);

            $expense->update(['last_generated_at' => $today]);
            $generated++;
        }

        $this->info("Generated {$generated} recurring expense transactions.");

        // 2. Membership Monthly Charges
        $membershipGenerated = 0;

        $memberships = Membership::where('status', 'active')
            ->whereNotNull('billing_day')
            ->where('billing_day', $currentDay)
            ->where(function ($q) use ($currentMonth, $currentYear) {
                $q->whereNull('last_billed_at')
                  ->orWhere(function ($q2) use ($currentMonth, $currentYear) {
                      $q2->where(function ($q3) use ($currentMonth, $currentYear) {
                          $q3->whereMonth('last_billed_at', '!=', $currentMonth)
                              ->orWhereYear('last_billed_at', '!=', $currentYear);
                      });
                  });
            })
            ->with(['patient', 'commercialPlan'])
            ->get();

        foreach ($memberships as $membership) {
            $planName = $membership->commercialPlan?->name ?? $membership->plan_name ?? 'Plano';
            $patientName = $membership->patient?->name ?? 'Aluno';

            FinancialTransaction::create([
                'type' => 'income',
                'amount' => $membership->price,
                'date' => $today->toDateString(),
                'due_date' => $today->toDateString(),
                'description' => "Mensalidade: {$planName} — {$patientName}",
                'category' => 'Mensalidade',
                'status' => 'pending',
                'patient_id' => $membership->patient_id,
                'membership_id' => $membership->id,
            ]);

            $membership->update(['last_billed_at' => $today]);
            $membershipGenerated++;
        }

        $this->info("Generated {$membershipGenerated} membership billing transactions.");

        // 3. Auto-expire memberships past end_date
        $expired = Membership::where('status', 'active')
            ->where('end_date', '<', $today->toDateString())
            ->update(['status' => 'expired']);

        $this->info("Expired {$expired} memberships past end date.");

        return Command::SUCCESS;
    }
}

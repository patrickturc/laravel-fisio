<?php

use App\Models\CommercialPlan;
use App\Models\FinancialTransaction;
use App\Models\Membership;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Support\Facades\Artisan;

function activeBillingMembership(): Membership
{
    $user = User::factory()->create();
    $plan = CommercialPlan::create([
        'name' => 'Pilates',
        'category' => 'pilates',
        'price' => 250,
        'duration_months' => 1,
    ]);
    $patient = Patient::create(['name' => 'João', 'user_id' => $user->id]);

    return Membership::create([
        'patient_id' => $patient->id,
        'commercial_plan_id' => $plan->id,
        'plan_name' => $plan->name,
        'start_date' => now()->startOfMonth()->toDateString(),
        'end_date' => now()->addMonth()->toDateString(),
        'price' => 250,
        'status' => 'active',
        'billing_day' => 1,
        'last_billed_at' => null,
    ]);
}

test('charges:generate bills an active membership once', function () {
    $membership = activeBillingMembership();

    Artisan::call('charges:generate');

    expect(FinancialTransaction::where('membership_id', $membership->id)->count())->toBe(1);
});

test('charges:generate is idempotent within the same month', function () {
    $membership = activeBillingMembership();

    Artisan::call('charges:generate');
    Artisan::call('charges:generate');
    Artisan::call('charges:generate');

    expect(FinancialTransaction::where('membership_id', $membership->id)->count())->toBe(1);
});

test('charges:generate does not bill before the membership start date', function () {
    $membership = activeBillingMembership();
    $membership->update([
        'start_date' => now()->addMonth()->startOfMonth()->toDateString(),
    ]);

    Artisan::call('charges:generate');

    expect(FinancialTransaction::where('membership_id', $membership->id)->count())->toBe(0);
});

<?php

use App\Models\Appointment;
use App\Models\CommercialPlan;
use App\Models\Membership;
use App\Models\Patient;
use App\Models\User;

function makeMembershipWithPlan(int $sessionsTotal): Membership
{
    $user = User::factory()->create();
    $plan = CommercialPlan::create([
        'name' => 'Pilates',
        'category' => 'pilates',
        'price' => 200,
        'duration_months' => 1,
        'sessions_total' => $sessionsTotal,
    ]);
    $patient = Patient::create(['name' => 'Maria', 'user_id' => $user->id]);

    return Membership::create([
        'patient_id' => $patient->id,
        'commercial_plan_id' => $plan->id,
        'plan_name' => $plan->name,
        'start_date' => now()->startOfMonth()->toDateString(),
        'end_date' => now()->endOfMonth()->toDateString(),
        'price' => 200,
        'status' => 'active',
        'billing_day' => 5,
    ]);
}

function attendSession(Membership $membership, string $status = 'attended'): void
{
    $appointment = Appointment::create([
        'user_id' => $membership->patient->user_id,
        'appointment_date' => now()->toDateString(),
        'start_time' => '08:00',
        'duration_minutes' => 50,
        'type' => 'group',
        'max_participants' => 4,
        'status' => 'completed',
    ]);
    $appointment->patients()->attach($membership->patient_id, ['status' => $status]);
}

test('attended sessions within the period count as used', function () {
    $membership = makeMembershipWithPlan(2);
    attendSession($membership);

    $membership->load('commercialPlan')->append(['sessions_total', 'sessions_used', 'sessions_remaining']);

    expect($membership->sessions_total)->toBe(2)
        ->and($membership->sessions_used)->toBe(1)
        ->and($membership->sessions_remaining)->toBe(1);
});

test('missed sessions do not count and remaining never goes negative', function () {
    $membership = makeMembershipWithPlan(1);
    attendSession($membership, 'missed');
    attendSession($membership, 'attended');
    attendSession($membership, 'attended');

    $membership->load('commercialPlan')->append(['sessions_used', 'sessions_remaining']);

    expect($membership->sessions_used)->toBe(2)
        ->and($membership->sessions_remaining)->toBe(0);
});

test('a plan without sessions_total is unlimited', function () {
    $membership = makeMembershipWithPlan(0);
    $membership->commercialPlan->update(['sessions_total' => null]);
    attendSession($membership);

    $membership->load('commercialPlan')->append(['sessions_total', 'sessions_remaining']);

    expect($membership->sessions_total)->toBeNull()
        ->and($membership->sessions_remaining)->toBeNull();
});

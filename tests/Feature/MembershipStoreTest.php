<?php

use App\Models\CommercialPlan;
use App\Models\FinancialTransaction;
use App\Models\Membership;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Support\Facades\Artisan;
use Spatie\Permission\Models\Permission;

function actingWithMembershipCreate(): User
{
    Permission::findOrCreate('memberships.manage.create', 'web');
    $user = User::factory()->create();
    $user->givePermissionTo('memberships.manage.create');
    test()->actingAs($user);

    return $user;
}

test('creating a membership generates exactly one charge and marks it billed', function () {
    $user = actingWithMembershipCreate();
    $plan = CommercialPlan::create(['name' => 'Pilates', 'category' => 'pilates', 'price' => 250, 'duration_months' => 1]);
    $patient = Patient::create(['name' => 'Ana', 'user_id' => $user->id]);

    $response = test()->post(route('memberships.store'), [
        'patient_id' => $patient->id,
        'commercial_plan_id' => $plan->id,
        'plan_name' => $plan->name,
        'start_date' => now()->startOfMonth()->toDateString(),
        'end_date' => now()->endOfMonth()->toDateString(),
        'price' => 250,
        'status' => 'active',
        'billing_day' => 5,
    ]);

    $response->assertRedirect(route('memberships.index'));

    $membership = Membership::where('patient_id', $patient->id)->firstOrFail();
    expect(FinancialTransaction::where('membership_id', $membership->id)->count())->toBe(1)
        ->and($membership->last_billed_at)->not->toBeNull();
});

test('the recurring command does not double-bill a freshly created membership', function () {
    $user = actingWithMembershipCreate();
    $plan = CommercialPlan::create(['name' => 'Pilates', 'category' => 'pilates', 'price' => 250, 'duration_months' => 1]);
    $patient = Patient::create(['name' => 'Ana', 'user_id' => $user->id]);

    test()->post(route('memberships.store'), [
        'patient_id' => $patient->id,
        'commercial_plan_id' => $plan->id,
        'plan_name' => $plan->name,
        'start_date' => now()->startOfMonth()->toDateString(),
        'end_date' => now()->endOfMonth()->toDateString(),
        'price' => 250,
        'status' => 'active',
        'billing_day' => 1,
    ]);

    Artisan::call('charges:generate');

    $membership = Membership::where('patient_id', $patient->id)->firstOrFail();
    expect(FinancialTransaction::where('membership_id', $membership->id)->count())->toBe(1);
});

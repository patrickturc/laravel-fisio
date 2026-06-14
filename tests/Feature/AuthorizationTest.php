<?php

use App\Models\Patient;
use App\Models\User;
use Spatie\Permission\Models\Permission;

test('authenticated users without permission cannot access business routes', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->get(route('patients.index'))->assertForbidden();
});

test('users with the matching permission can access business routes', function () {
    Permission::findOrCreate('patients.manage.view', 'web');

    $user = User::factory()->create();
    $user->givePermissionTo('patients.manage.view');

    $this->actingAs($user)->get(route('patients.index'))->assertOk();
});

test('view permission does not grant delete', function () {
    Permission::findOrCreate('patients.manage.view', 'web');
    Permission::findOrCreate('patients.manage.delete', 'web');

    $user = User::factory()->create();
    $user->givePermissionTo('patients.manage.view');
    $patient = Patient::create(['name' => 'Teste', 'user_id' => $user->id]);

    $this->actingAs($user)
        ->delete(route('patients.destroy', $patient->id))
        ->assertForbidden();

    expect(Patient::find($patient->id))->not->toBeNull();
});

<?php

use App\Http\Controllers\GroupClassController;
use App\Models\Appointment;
use App\Models\GroupClass;
use App\Models\GroupClassSchedule;
use App\Models\User;
use Spatie\Permission\Models\Permission;

function userCanManageClasses(): User
{
    foreach (['group_classes.manage.edit', 'group_classes.manage.delete'] as $p) {
        Permission::findOrCreate($p, 'web');
    }
    $user = User::factory()->create();
    $user->givePermissionTo(['group_classes.manage.edit', 'group_classes.manage.delete']);
    test()->actingAs($user);

    return $user;
}

function classWithMondaySchedule(User $user): GroupClass
{
    $gc = GroupClass::create([
        'user_id' => $user->id,
        'name' => 'Pilates Segunda',
        'color' => '#8b5cf6',
        'max_participants' => 4,
        'status' => 'active',
    ]);
    GroupClassSchedule::create([
        'group_class_id' => $gc->id,
        'day_of_week' => 1, // Monday
        'start_time' => '18:00',
        'duration_minutes' => 50,
    ]);

    return $gc;
}

test('extend-active generates appointments for active classes up to the horizon', function () {
    $user = userCanManageClasses();
    $gc = classWithMondaySchedule($user);

    test()->post(route('group-classes.extend-active'))->assertRedirect();

    $count = Appointment::where('group_class_id', $gc->id)->count();
    $weeks = GroupClassController::HORIZON_WEEKS;

    // Roughly one appointment per week within the horizon (allow ±1 for the
    // partial weeks at each end).
    expect($count)->toBeGreaterThanOrEqual($weeks - 1)->toBeLessThanOrEqual($weeks + 1);
    // Every generated appointment is linked back to its schedule slot.
    expect(Appointment::where('group_class_id', $gc->id)->whereNotNull('schedule_id')->count())->toBe($count);
});

test('extend-active is idempotent (no duplicates on a second run)', function () {
    $user = userCanManageClasses();
    $gc = classWithMondaySchedule($user);

    test()->post(route('group-classes.extend-active'));
    $first = Appointment::where('group_class_id', $gc->id)->count();

    test()->post(route('group-classes.extend-active'));
    $second = Appointment::where('group_class_id', $gc->id)->count();

    expect($second)->toBe($first);
});

test('deleting a class soft-deletes it and never orphans its appointments', function () {
    $user = userCanManageClasses();
    $gc = classWithMondaySchedule($user);
    test()->post(route('group-classes.extend-active'));

    test()->delete(route('group-classes.destroy', $gc->id));

    // Class is soft-deleted; appointments keep their group_class_id link.
    expect(GroupClass::withTrashed()->find($gc->id)->trashed())->toBeTrue();
    expect(Appointment::whereNull('group_class_id')->where('type', 'group')->count())->toBe(0);
});

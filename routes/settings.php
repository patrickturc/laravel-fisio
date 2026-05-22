<?php

use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\TwoFactorAuthenticationController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::redirect('settings', '/settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('settings/password', [PasswordController::class, 'edit'])->name('user-password.edit');

    Route::put('settings/password', [PasswordController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('user-password.update');

    Route::inertia('settings/appearance', 'settings/appearance')->name('appearance.edit');

    Route::get('settings/two-factor', [TwoFactorAuthenticationController::class, 'show'])
        ->name('two-factor.show');

    // Users Management
    Route::group(['middleware' => ['permission:settings.users.view']], function () {
        Route::get('settings/users', [App\Http\Controllers\UserController::class, 'index'])->name('users.index');
        Route::post('settings/users', [App\Http\Controllers\UserController::class, 'store'])->name('users.store')->middleware('permission:settings.users.create');
        Route::put('settings/users/{user}', [App\Http\Controllers\UserController::class, 'update'])->name('users.update')->middleware('permission:settings.users.edit');
        Route::delete('settings/users/{user}', [App\Http\Controllers\UserController::class, 'destroy'])->name('users.destroy')->middleware('permission:settings.users.delete');
    });

    // Roles & Permissions Management
    Route::group(['middleware' => ['permission:settings.roles.view']], function () {
        Route::get('settings/roles', [App\Http\Controllers\RoleController::class, 'index'])->name('roles.index');
        Route::post('settings/roles', [App\Http\Controllers\RoleController::class, 'store'])->name('roles.store')->middleware('permission:settings.roles.create');
        Route::put('settings/roles/{role}', [App\Http\Controllers\RoleController::class, 'update'])->name('roles.update')->middleware('permission:settings.roles.edit');
        Route::delete('settings/roles/{role}', [App\Http\Controllers\RoleController::class, 'destroy'])->name('roles.destroy')->middleware('permission:settings.roles.delete');
    });
});

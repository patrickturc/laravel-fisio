<?php

use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [App\Http\Controllers\DashboardController::class, 'index'])->name('dashboard');
    Route::resource('patients', App\Http\Controllers\PatientController::class);
    Route::resource('appointments', App\Http\Controllers\AppointmentController::class);
    Route::resource('evolutions', App\Http\Controllers\EvolutionController::class);
    Route::get('reports', [App\Http\Controllers\ReportController::class, 'index'])->name('reports.index');
    Route::get('evolutions/{evolution}/pdf', [App\Http\Controllers\EvolutionController::class, 'pdf'])->name('evolutions.pdf');
    Route::resource('treatment-plans', App\Http\Controllers\TreatmentPlanController::class);
});

require __DIR__.'/settings.php';

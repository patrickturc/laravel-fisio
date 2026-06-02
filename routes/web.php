<?php

use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [App\Http\Controllers\DashboardController::class, 'index'])->name('dashboard');
    Route::resource('patients', App\Http\Controllers\PatientController::class);
    Route::get('api/appointments/events', [App\Http\Controllers\AppointmentController::class, 'events'])->name('appointments.events');
    Route::get('api/appointments/{appointment}', [App\Http\Controllers\AppointmentController::class, 'details'])->name('appointments.details');
    Route::post('appointments/{appointment}/patients/{patientId}/status', [App\Http\Controllers\AppointmentController::class, 'updateStatus'])->name('appointments.update-status');
    Route::post('appointments/{appointment}/reschedule', [App\Http\Controllers\AppointmentController::class, 'reschedule'])->name('appointments.reschedule');
    Route::resource('appointments', App\Http\Controllers\AppointmentController::class);
    Route::resource('evolutions', App\Http\Controllers\EvolutionController::class)->except(['create', 'edit']);
    Route::post('memberships/{membership}/renew', [App\Http\Controllers\MembershipController::class, 'renew'])->name('memberships.renew');
    Route::resource('memberships', App\Http\Controllers\MembershipController::class);
    Route::post('financial/{financial}/mark-paid', [App\Http\Controllers\FinancialTransactionController::class, 'markAsPaid'])->name('financial.mark-paid');
    Route::resource('financial', App\Http\Controllers\FinancialTransactionController::class)->parameters(['financial' => 'financial']);
    Route::post('recurring-expenses/{recurringExpense}/toggle-active', [App\Http\Controllers\RecurringExpenseController::class, 'toggleActive'])->name('recurring-expenses.toggle-active');
    Route::resource('recurring-expenses', App\Http\Controllers\RecurringExpenseController::class);
    Route::get('reports', [App\Http\Controllers\ReportController::class, 'index'])->name('reports.index');
    Route::get('reports/pdf', [App\Http\Controllers\ReportController::class, 'pdf'])->name('reports.pdf');
    Route::get('evolutions/{evolution}/pdf', [App\Http\Controllers\EvolutionController::class, 'pdf'])->name('evolutions.pdf');
    Route::resource('clinical-protocols', App\Http\Controllers\ClinicalProtocolController::class);
    Route::resource('commercial-plans', App\Http\Controllers\CommercialPlanController::class);
});

require __DIR__.'/settings.php';

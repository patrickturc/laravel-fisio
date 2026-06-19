<?php

use App\Models\Patient;
use App\Models\PatientDocument;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Permission;

function userCanManagePatients(): User
{
    foreach (['patients.manage.edit', 'patients.manage.view'] as $p) {
        Permission::findOrCreate($p, 'web');
    }
    $user = User::factory()->create();
    $user->givePermissionTo(['patients.manage.edit', 'patients.manage.view']);
    test()->actingAs($user);

    return $user;
}

test('user can upload patient document', function () {
    Storage::fake();
    $user = userCanManagePatients();
    $patient = Patient::create(['name' => 'John Doe', 'user_id' => $user->id]);

    $file = UploadedFile::fake()->create('contract.pdf', 100);

    $response = test()->post(route('patients.documents.store', $patient->id), [
        'file' => $file,
        'description' => 'Contrato de Pilates',
    ]);

    $response->assertRedirect();
    
    $doc = PatientDocument::first();
    expect($doc)->not->toBeNull();
    expect($doc->original_name)->toBe('contract.pdf');
    expect($doc->description)->toBe('Contrato de Pilates');
    expect($doc->patient_id)->toBe($patient->id);
    expect($doc->user_id)->toBe($user->id);
    
    Storage::assertExists($doc->file_path);
});

test('user can download patient document', function () {
    Storage::fake();
    $user = userCanManagePatients();
    $patient = Patient::create(['name' => 'John Doe', 'user_id' => $user->id]);

    $file = UploadedFile::fake()->create('contract.pdf', 100);
    $path = Storage::putFile('patients/documents', $file);

    $document = PatientDocument::create([
        'patient_id' => $patient->id,
        'file_path' => $path,
        'original_name' => 'contract.pdf',
        'description' => 'Contrato',
        'user_id' => $user->id,
    ]);

    $response = test()->get(route('patients.documents.download', $document->id));
    
    $response->assertStatus(200);
    $response->assertHeader('Content-Disposition', 'attachment; filename="contract.pdf"');
});

test('user can delete patient document', function () {
    Storage::fake();
    $user = userCanManagePatients();
    $patient = Patient::create(['name' => 'John Doe', 'user_id' => $user->id]);

    $file = UploadedFile::fake()->create('contract.pdf', 100);
    $path = Storage::putFile('patients/documents', $file);

    $document = PatientDocument::create([
        'patient_id' => $patient->id,
        'file_path' => $path,
        'original_name' => 'contract.pdf',
        'description' => 'Contrato',
        'user_id' => $user->id,
    ]);

    Storage::assertExists($path);

    $response = test()->delete(route('patients.documents.destroy', $document->id));
    
    $response->assertRedirect();
    expect(PatientDocument::find($document->id))->toBeNull();
    Storage::assertMissing($path);
});

test('invalid file type upload is rejected', function () {
    Storage::fake();
    $user = userCanManagePatients();
    $patient = Patient::create(['name' => 'John Doe', 'user_id' => $user->id]);

    $file = UploadedFile::fake()->create('script.js', 50);

    $response = test()->post(route('patients.documents.store', $patient->id), [
        'file' => $file,
        'description' => 'Malicious Script',
    ]);

    $response->assertSessionHasErrors('file');
    expect(PatientDocument::count())->toBe(0);
});

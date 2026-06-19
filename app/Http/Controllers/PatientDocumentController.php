<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use App\Models\PatientDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PatientDocumentController extends Controller
{
    /**
     * Store a newly created document in storage.
     */
    public function store(Request $request, Patient $patient)
    {
        $request->validate([
            'file' => 'required|file|mimes:pdf,png,jpg,jpeg|max:10240', // Max 10MB
            'description' => 'nullable|string|max:255',
        ]);

        $file = $request->file('file');

        // Store the file securely using the default disk
        $path = $file->store('patients/documents');

        $patient->documents()->create([
            'file_path' => $path,
            'original_name' => $file->getClientOriginalName(),
            'description' => $request->input('description'),
            'user_id' => auth()->id(),
        ]);

        return back()->with('success', 'Documento enviado com sucesso!');
    }

    /**
     * Preview the specified document inline.
     */
    public function preview(PatientDocument $patientDocument)
    {
        if (! Storage::exists($patientDocument->file_path)) {
            abort(404, 'Arquivo não encontrado.');
        }

        $mimeType = Storage::mimeType($patientDocument->file_path);

        return response(Storage::get($patientDocument->file_path))
            ->header('Content-Type', $mimeType)
            ->header('Content-Disposition', 'inline; filename="'.$patientDocument->original_name.'"');
    }

    /**
     * Download the specified document securely.
     */
    public function download(PatientDocument $patientDocument)
    {
        if (! Storage::exists($patientDocument->file_path)) {
            abort(404, 'Arquivo não encontrado.');
        }

        return Storage::download($patientDocument->file_path, $patientDocument->original_name);
    }

    /**
     * Remove the specified document from storage.
     */
    public function destroy(PatientDocument $patientDocument)
    {
        if (Storage::exists($patientDocument->file_path)) {
            Storage::delete($patientDocument->file_path);
        }

        $patientDocument->delete();

        return back()->with('success', 'Documento excluído com sucesso!');
    }
}

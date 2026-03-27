<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Evolution extends Model
{
    use HasUuids;

    protected $table = 'evolutions';

    public $timestamps = false;

    protected $fillable = [
        'paciente_id',
        'agendamento_id',
        'profissional_id',
        'data_atendimento',
        'tipo_atendimento',
        'dor_eva',
        'localizacao_dor',
        'tipo_dor',
        'queixa_principal',
        'relato_paciente',
        'intercorrencias',
        'pressao_arterial',
        'frequencia_cardiaca',
        'saturacao',
        'amplitude_movimento',
        'forca_muscular',
        'avaliacao_funcional',
        'avaliacao_postural',
        'condutas_realizadas',
        'parametros_conduta',
        'resposta_tratamento',
        'evolucao_status',
        'analise_profissional',
        'conduta_planejada',
        'orientacoes_domiciliares',
        'proxima_sessao',
        'assinatura_digital'
    ];
    
    protected function casts(): array
    {
        return [
            'data_atendimento' => 'datetime',
            'proxima_sessao' => 'date',
        ];
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class, 'paciente_id');
    }
    
    public function appointment()
    {
        return $this->belongsTo(Appointment::class, 'agendamento_id');
    }
    
    public function professional()
    {
        return $this->belongsTo(User::class, 'profissional_id');
    }
    
    public function photos()
    {
        return $this->hasMany(EvolutionPhoto::class, 'evolucao_id');
    }
}

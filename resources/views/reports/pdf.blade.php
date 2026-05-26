<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Relatório de Atendimentos</title>
    <style>
        body { font-family: sans-serif; color: #333; margin: 0; padding: 20px; }
        .header { text-align: center; border-bottom: 2px solid #10b981; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { margin: 0; color: #111827; }
        .header p { margin: 5px 0 0; color: #6b7280; font-size: 14px; }
        .grid { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        .grid td { padding: 15px; border: 1px solid #e5e7eb; width: 50%; }
        .stat-label { font-size: 12px; text-transform: uppercase; color: #6b7280; font-weight: bold; }
        .stat-value { font-size: 24px; font-weight: bold; color: #111827; margin-top: 5px; }
        .footer { text-align: center; font-size: 12px; color: #9ca3af; margin-top: 50px; border-top: 1px solid #e5e7eb; padding-top: 20px; }
    </style>
</head>
<body>

    <div class="header">
        <h1>Relatório Gerencial de Atendimentos</h1>
        <p>Período: {{ $startDate }} a {{ $endDate }}</p>
    </div>

    <table class="grid">
        <tr>
            <td>
                <div class="stat-label">Total de Agendamentos</div>
                <div class="stat-value">{{ $totalAppointments }}</div>
            </td>
            <td>
                <div class="stat-label">Taxa de Conclusão</div>
                <div class="stat-value">{{ $completionRate }}%</div>
            </td>
        </tr>
        <tr>
            <td>
                <div class="stat-label">Realizados</div>
                <div class="stat-value" style="color: #10b981;">{{ $completedAppointments }}</div>
            </td>
            <td>
                <div class="stat-label">Cancelados</div>
                <div class="stat-value" style="color: #ef4444;">{{ $cancelledAppointments }}</div>
            </td>
        </tr>
    </table>

    <div class="footer">
        Gerado em {{ now()->format('d/m/Y H:i') }} pelo sistema Phisio.
    </div>

</body>
</html>

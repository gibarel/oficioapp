<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Presupuesto #{{ $budget->budget_number }}</title>
    <style>
        body { font-family: Helvetica, Arial, sans-serif; color: #1e293b; margin: 0; padding: 20px; font-size: 13px; }
        .header { border-bottom: 2px solid #e2e8f0; padding-bottom: 15px; margin-bottom: 20px; }
        .title { font-size: 22px; font-weight: bold; color: #0f172a; text-transform: uppercase; }
        .subtitle { font-size: 11px; color: #64748b; margin-top: 4px; }
        .client-box { background-color: #f8fafc; border-radius: 8px; padding: 12px; margin-bottom: 20px; }
        .client-title { font-size: 10px; font-weight: bold; color: #94a3b8; text-transform: uppercase; margin-bottom: 4px; }
        .table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .table th { text-align: left; background-color: #f1f5f9; padding: 8px 10px; font-size: 10px; text-transform: uppercase; color: #475569; }
        .table td { padding: 10px; border-bottom: 1px solid #f1f5f9; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .totals { width: 250px; float: right; margin-top: 10px; }
        .totals-row { display: table; width: 100%; margin-bottom: 4px; }
        .totals-label { display: table-cell; text-align: left; color: #64748b; }
        .totals-value { display: table-cell; text-align: right; font-family: monospace; }
        .total-final { font-size: 16px; font-weight: bold; color: #0f172a; border-top: 1px solid #cbd5e1; padding-top: 6px; }
        .conditions { clear: both; padding-top: 30px; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; margin-top: 30px; }
    </style>
</head>
<body>

    <div class="header">
        <div class="title">Presupuesto</div>
        <div class="subtitle">N° #{{ $budget->budget_number }} | Fecha: {{ \Carbon\Carbon::parse($budget->issued_at)->format('d/m/Y') }}</div>
    </div>

    <div class="client-box">
        <div class="client-title">Cliente</div>
        <div style="font-size: 14px; font-weight: bold; color: #0f172a;">{{ $budget->client_name }}</div>
        @if($budget->client_phone) <div>Teléfono: {{ $budget->client_phone }}</div> @endif
        @if($budget->client_address) <div>Ubicación / Obra: {{ $budget->client_address }}</div> @endif
    </div>

    <table class="table">
        <thead>
            <tr>
                <th>Descripción / Item</th>
                <th class="text-center">Cant.</th>
                <th class="text-right">P. Unitario</th>
                <th class="text-right">Subtotal</th>
            </tr>
        </thead>
        <tbody>
            @foreach($budget->items as $item)
                <tr>
                    <td><strong>{{ $item->work_name_snapshot }}</strong></td>
                    <td class="text-center">{{ $item->quantity }}</td>
                    <td class="text-right">${{ number_format($item->unit_price, 2) }}</td>
                    <td class="text-right"><strong>${{ number_format($item->subtotal_price, 2) }}</strong></td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="totals">
        <div class="totals-row">
            <span class="totals-label">Subtotal:</span>
            <span class="totals-value">${{ number_format($budget->subtotal_cost, 2) }}</span>
        </div>
        <div class="totals-row">
            <span class="totals-label">Imprevistos:</span>
            <span class="totals-value">${{ number_format($budget->contingency_amount, 2) }}</span>
        </div>
        <div class="totals-row">
            <span class="totals-label">Margen:</span>
            <span class="totals-value">${{ number_format($budget->profit_amount, 2) }}</span>
        </div>
        <div class="totals-row total-final">
            <span class="totals-label">TOTAL:</span>
            <span class="totals-value">${{ number_format($budget->total_price, 2) }} {{ $budget->currency }}</span>
        </div>
    </div>

    @if($budget->execution_conditions)
        <div class="conditions">
            <strong>Condiciones de Trabajo / Términos:</strong><br>
            {{ $budget->execution_conditions }}
        </div>
    @endif

</body>
</html>
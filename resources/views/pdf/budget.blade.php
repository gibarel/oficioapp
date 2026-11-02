<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Presupuesto #{{ $budget->budget_number }}</title>
    <style>
        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            color: #1e293b;
            font-size: 12px;
            margin: 0;
            padding: 20px;
        }
        .header {
            width: 100%;
            margin-bottom: 30px;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 15px;
        }
        .title {
            font-size: 22px;
            font-weight: bold;
            color: #0f172a;
            margin: 0;
        }
        .sub-title {
            font-size: 12px;
            color: #64748b;
        }
        .info-grid {
            width: 100%;
            margin-bottom: 25px;
        }
        .info-grid td {
            vertical-align: top;
            width: 50%;
        }
        .label {
            font-size: 10px;
            text-transform: uppercase;
            color: #94a3b8;
            font-weight: bold;
        }
        .value {
            font-size: 13px;
            font-weight: bold;
            color: #0f172a;
        }
        table.items {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 25px;
        }
        table.items th {
            background-color: #f8fafc;
            color: #475569;
            text-align: left;
            padding: 8px;
            font-size: 10px;
            text-transform: uppercase;
            border-bottom: 1px solid #cbd5e1;
        }
        table.items td {
            padding: 10px 8px;
            border-bottom: 1px solid #f1f5f9;
        }
        .text-right {
            text-align: right;
        }
        .totals {
            width: 40%;
            margin-left: auto;
            border-collapse: collapse;
        }
        .totals td {
            padding: 6px 8px;
        }
        .total-row {
            font-size: 15px;
            font-weight: bold;
            border-top: 2px solid #0f172a;
            color: #0f172a;
        }
        .conditions {
            margin-top: 30px;
            padding: 12px;
            background-color: #f8fafc;
            border-radius: 6px;
            border: 1px solid #e2e8f0;
            font-size: 11px;
            color: #475569;
        }
    </style>
</head>
<body>

    <table class="header">
        <tr>
            <td>
                <h1 class="title">PRESUPUESTO</h1>
                <p class="sub-title">Nº {{ $budget->budget_number }}</p>
            </td>
            <td class="text-right">
                <span class="label">Fecha de Emisión</span>
                <div class="value">{{ \Carbon\Carbon::parse($budget->issued_at)->format('d/m/Y') }}</div>
            </td>
        </tr>
    </table>

    <table class="info-grid">
        <tr>
            <td>
                <span class="label">Cliente</span>
                <div class="value">{{ $budget->client_name }}</div>
                @if($budget->client_phone)
                    <div style="color: #64748b;">Tel: {{ $budget->client_phone }}</div>
                @endif
                @if($budget->client_address)
                    <div style="color: #64748b;">Dir: {{ $budget->client_address }}</div>
                @endif
            </td>
            <td class="text-right">
                <span class="label">Estado</span>
                <div class="value" style="text-transform: uppercase;">{{ $budget->status }}</div>
            </td>
        </tr>
    </table>

    <table class="items">
        <thead>
            <tr>
                <th>Descripción del Trabajo / Ítem</th>
                <th class="text-right">Cant.</th>
                <th class="text-right">Unidad</th>
                <th class="text-right">Precio Unit.</th>
                <th class="text-right">Total</th>
            </tr>
        </thead>
        <tbody>
            @foreach($budget->items as $item)
                <tr>
                    <td>
                        <strong>{{ $item->description }}</strong>
                    </td>
                    <td class="text-right">{{ number_format($item->quantity, 2) }}</td>
                    <td class="text-right">{{ $item->unit ?? '-' }}</td>
                    <td class="text-right">${{ number_format($item->unit_price, 2) }}</td>
                    <td class="text-right"><strong>${{ number_format($item->total_price, 2) }}</strong></td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <table class="totals">
        <tr class="total-row">
            <td>Total ({{ $budget->currency }}):</td>
            <td class="text-right">${{ number_format($budget->total_price, 2) }}</td>
        </tr>
    </table>

    @if($budget->execution_conditions)
        <div class="conditions">
            <strong>Condiciones de Trabajo / Pago:</strong><br>
            {{ $budget->execution_conditions }}
        </div>
    @endif

</body>
</html>
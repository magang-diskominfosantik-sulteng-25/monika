<!DOCTYPE html>
<html>
<head>
    <title>Ringkasan Capaian Kinerja OPD</title>
    <style>
        body { font-family: sans-serif; font-size: 10pt; }
        table { width: 100%; border-collapse: collapse; }
        .title-row th { border: none; text-align: center; }
        .header-row th { border: 1px solid #000; background-color: #f0f0f0; padding: 5px; text-align: left; }
        .data-row td { border: 1px solid #000; padding: 5px; text-align: left; }
    </style>
</head>
<body>
    <table>
        <thead>
            <tr class="title-row">
                <th colspan="7" style="font-size: 16pt; font-weight: bold; text-align: center; border: none;">Ringkasan Capaian Kinerja OPD</th>
            </tr>
            <tr class="title-row">
                <th colspan="7" style="font-size: 10pt; text-align: center; border: none;">Generated at: {{ $generatedAt->format('d M Y H:i') }}</th>
            </tr>
            <tr class="header-row">
                <th style="border: 1px solid #000; font-weight: bold; background-color: #f0f0f0;">OPD</th>
                <th style="border: 1px solid #000; font-weight: bold; background-color: #f0f0f0; text-align: center;">Total Indikator</th>
                <th style="border: 1px solid #000; font-weight: bold; background-color: #f0f0f0; text-align: center;">Terealisasi</th>
                <th style="border: 1px solid #000; font-weight: bold; background-color: #f0f0f0; text-align: center;">IKU</th>
                <th style="border: 1px solid #000; font-weight: bold; background-color: #f0f0f0; text-align: center;">IKD</th>
                <th style="border: 1px solid #000; font-weight: bold; background-color: #f0f0f0; text-align: center;">IKK</th>
                <th style="border: 1px solid #000; font-weight: bold; background-color: #f0f0f0; text-align: center;">Rata-rata Capaian (%)</th>
            </tr>
        </thead>
        <tbody>
            @foreach($opdSummaries as $summary)
                <tr class="data-row">
                    <td style="border: 1px solid #000;">{{ $summary['opd'] }}</td>
                    <td style="border: 1px solid #000; text-align: center;">{{ $summary['total_indicators'] }}</td>
                    <td style="border: 1px solid #000; text-align: center;">{{ $summary['filled_indicators'] }}</td>
                    <td style="border: 1px solid #000; text-align: center;">{{ $summary['iku_count'] }}</td>
                    <td style="border: 1px solid #000; text-align: center;">{{ $summary['ikd_count'] }}</td>
                    <td style="border: 1px solid #000; text-align: center;">{{ $summary['ikk_count'] }}</td>
                    <td style="border: 1px solid #000; text-align: center;">{{ number_format($summary['average_achievement'], 2) }}%</td>
                </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>

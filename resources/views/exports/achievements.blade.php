<!DOCTYPE html>
<html>
<head>
    <title>Laporan Capaian Kinerja</title>
    <style>
        body { font-family: sans-serif; font-size: 10pt; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #000; padding: 5px; text-align: left; }
        th { background-color: #f0f0f0; }
        .header { text-align: center; margin-bottom: 20px; }
        .meta { margin-bottom: 10px; }
    </style>
</head>
<body>
    <div class="header">
        <h2>Laporan Capaian Kinerja</h2>
        <p>Generated at: {{ $generatedAt->format('d M Y H:i') }}</p>
    </div>

    <div class="meta">
        <strong>Total Data:</strong> {{ $dataset['counts']['total'] }}
    </div>

    <table>
        <thead>
            <tr>
                <th>Organisasi Perangkat Daerah</th>
                <th>Indikator</th>
                <th>Periode</th>
                <th>Target</th>
                <th>Realisasi</th>
                <th>Tingkat Capaian (%)</th>
            </tr>
        </thead>
        <tbody>
            @foreach($dataset['rows'] as $row)
            <tr>
                <td>{{ $row['opd'] }}</td>
                <td>{{ $row['indicator'] }}</td>
                <td>{{ $row['period'] }}</td>
                <td>{{ $row['target'] }}</td>
                <td>{{ $row['realisasi'] }}</td>
                <td>
                    @if($row['achievement_rate'] !== null)
                        {{ $row['achievement_rate'] }}%
                    @else
                        -
                    @endif
                </td>
            </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>

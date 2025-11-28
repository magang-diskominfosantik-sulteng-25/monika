<!DOCTYPE html>
<html>
<head>
    <title>Laporan Capaian Kinerja</title>
    <style>
        body { font-family: sans-serif; font-size: 10pt; }
        table { width: 100%; border-collapse: collapse; }

        /* Title styles */
        .title-row th { border: none; text-align: center; }

        /* Header and Data styles */
        .header-row th { border: 1px solid #000; background-color: #f0f0f0; padding: 5px; text-align: left; }
        .data-row td { border: 1px solid #000; padding: 5px; text-align: left; }

        /* Spacer styles */
        .spacer-row td, .spacer-row th { border: none; height: 20px; }
    </style>
</head>
<body>
    <table>
        <thead>
            <tr class="title-row">
                <th colspan="7" style="font-size: 16pt; font-weight: bold; text-align: center; border: none;">Laporan Capaian
                    Kinerja</th>
            </tr>
            @if($selectedOpd)
                <tr class="title-row">
                    <th colspan="7" style="font-size: 14pt; font-weight: bold; text-align: center; border: none;">OPD:
                        {{ $selectedOpd }}</th>
                </tr>
            @endif
            <tr class="title-row">
                <th colspan="7" style="font-size: 10pt; text-align: center; border: none;">Generated at:
                    {{ $generatedAt->format('d M Y H:i') }}</th>
            </tr>
            <tr class="spacer-row">
                <th colspan="7" style="border: none;"></th>
            </tr>
            <tr class="header-row">
                <th style="border: 1px solid #000; font-weight: bold; background-color: #f0f0f0;">Indikator</th>
                <th style="border: 1px solid #000; font-weight: bold; background-color: #f0f0f0;">Jenis</th>
                <th style="border: 1px solid #000; font-weight: bold; background-color: #f0f0f0;">Satuan</th>
                <th style="border: 1px solid #000; font-weight: bold; background-color: #f0f0f0;">Periode</th>
                <th style="border: 1px solid #000; font-weight: bold; background-color: #f0f0f0;">Target</th>
                <th style="border: 1px solid #000; font-weight: bold; background-color: #f0f0f0;">Realisasi</th>
                <th style="border: 1px solid #000; font-weight: bold; background-color: #f0f0f0;">Tingkat Capaian (%)</th>
            </tr>
        </thead>
        <tbody>
            @foreach($groupedRows as $opdName => $rows)
                <tr class="data-row">
                    <td colspan="7" style="background-color: #e0e0e0; font-weight: bold; border: 1px solid #000;">OPD: {{ $opdName }}</td>
                </tr>
                @foreach($rows as $row)
                    <tr class="data-row">
                        <td style="border: 1px solid #000;">{{ $row['indicator'] }}</td>
                        <td style="border: 1px solid #000;">{{ $row['jenis'] }}</td>
                        <td style="border: 1px solid #000;">{{ $row['satuan'] }}</td>
                        <td style="border: 1px solid #000;">{{ $row['period'] }}</td>
                        <td style="border: 1px solid #000;">{{ $row['target'] }}</td>
                        <td style="border: 1px solid #000;">{{ $row['realisasi'] }}</td>
                        <td style="border: 1px solid #000;">
                            @if($row['achievement_rate'] !== null)
                                {{ $row['achievement_rate'] }}%
                            @else
                                -
                            @endif
                        </td>
                    </tr>
                @endforeach
                {{-- <tr class="spacer-row">
                    <td colspan="7" style="border: none; height: 20px;"></td>
                </tr> --}}
            @endforeach
        </tbody>
    </table>
</body>
</html>

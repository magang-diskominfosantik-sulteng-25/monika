<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReportExportTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_export_report_as_pdf()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/api/v1/reports/export?format=pdf');

        $response->assertStatus(200);
        $response->assertHeader('content-type', 'application/pdf');
    }

    public function test_can_export_report_as_excel()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/api/v1/reports/export?format=excel');

        $response->assertStatus(200);
        $response->assertHeader('content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    }
}

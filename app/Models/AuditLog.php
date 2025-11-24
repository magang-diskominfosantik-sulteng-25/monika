<?php

namespace App\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AuditLog extends Model
{
    use HasFactory;

    protected $table = 'audit_logs';
    protected $guarded = ['id'];
    protected $casts = [
        'before' => 'array',
        'after'  => 'array',
    ];

    /** @return BelongsTo<User, AuditLog> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get a human-readable description of the entity.
     */
    public function getEntityDescription(): string
    {
        $map = [
            'users'             => User::class,
            'opds'              => \App\Models\Opd::class,
            'indicator_masters' => \App\Models\IndicatorMaster::class,
            'periods'           => \App\Models\Period::class,
            'achievements'      => \App\Models\Achievement::class,
            'targets'           => \App\Models\Target::class,
            'evidences'         => \App\Models\Evidence::class,
        ];

        if (!array_key_exists($this->entity, $map)) {
            return (string) $this->entity_id;
        }

        $modelClass = $map[$this->entity];
        $record = $modelClass::find($this->entity_id);

        if (!$record) {
            return $this->entity_id . ' (Terhapus)';
        }

        if ($record instanceof User) {
            return $record->name;
        }
        if ($record instanceof \App\Models\Opd) {
            return $record->nama;
        }
        if ($record instanceof \App\Models\IndicatorMaster) {
            return $record->nama;
        }
        if ($record instanceof \App\Models\Period) {
            return $record->period_key;
        }
        if ($record instanceof \App\Models\Achievement) {
            $record->loadMissing('indicator');
            return 'Capaian: ' . ($record->indicator->nama ?? '-');
        }
        if ($record instanceof \App\Models\Target) {
            $record->loadMissing('indicator');
            return 'Target: ' . ($record->indicator->nama ?? '-');
        }
        if ($record instanceof \App\Models\Evidence) {
            return 'Bukti Dukung: ' . ($record->deskripsi ?? '-');
        }

        return (string) $this->entity_id;
    }
}

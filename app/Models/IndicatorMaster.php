<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;

class IndicatorMaster extends Model
{
    use HasFactory;

    public const JENIS = ['IKU','IKD','IKK'];
    public const TYPES = ['numeric','percent','index','text'];
    public const FREQS = ['annual','semester','quarter','month'];

    protected $table = 'indicator_masters';
    protected $guarded = ['id'];
    protected $casts = [
        'aktif'   => 'boolean',
        'version' => 'integer',
    ];

    /** @return HasMany<Target> */
    public function targets(): HasMany
    {
        return $this->hasMany(Target::class, 'indicator_id');
    }

    /** @return HasMany<Achievement> */
    public function achievements(): HasMany
    {
        return $this->hasMany(Achievement::class, 'indicator_id');
    }

    /* Helpers */
    public function isPercent(): bool { return $this->indicator_type === 'percent'; }

    /* Scopes */
    public function scopeActive($q) { return $q->where('aktif', true); }
    public function scopeJenis($q, string $jenis) { return $q->where('jenis', strtoupper($jenis)); }
    public function scopeFrequency($q, string $freq) { return $q->where('frequency', $freq); }
}

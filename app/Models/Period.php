<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Period extends Model
{
    use HasFactory;

    protected $table = 'periods';
    protected $guarded = ['id'];
    protected $casts = [
        'tahun'      => 'integer',
        'quarter'    => 'integer',
        'month'      => 'integer',
        'start_date' => 'date',
        'end_date'   => 'date',
    ];

    /** @return HasMany<Target> */
    public function targets(): HasMany
    {
        return $this->hasMany(Target::class);
    }

    /** @return HasMany<Achievement> */
    public function achievements(): HasMany
    {
        return $this->hasMany(Achievement::class);
    }

    /* Accessor ringkas untuk tampilan */
    public function getLabelAttribute(): string
    {
        if ($this->frequency === 'annual') return (string) $this->tahun;
        if ($this->frequency === 'semester') return $this->period_key;     // ex: 2026-S1
        if ($this->frequency === 'quarter')  return $this->period_key;     // ex: 2026-Q3
        if ($this->frequency === 'month')    return $this->period_key;     // ex: 2026-05
        return $this->period_key;
    }

    /* Scopes */
    public function scopeKey($q, string $key) { return $q->where('period_key', $key); }
    public function scopeYear($q, int $y)     { return $q->where('tahun', $y); }
}

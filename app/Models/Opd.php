<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Opd extends Model
{
    use HasFactory;

    protected $table = 'opds';
    protected $guarded = ['id'];
    protected $casts = [
        'aktif' => 'boolean',
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

    /* Scopes */
    public function scopeActive($q) { return $q->where('aktif', true); }
}

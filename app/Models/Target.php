<?php

namespace App\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Target extends Model
{
    use HasFactory;

    protected $table = 'targets';
    protected $guarded = ['id'];
    protected $casts = [
        'nilai_target_num' => 'decimal:4',
    ];

    /** @return BelongsTo<IndicatorMaster, Target> */
    public function indicator(): BelongsTo
    {
        return $this->belongsTo(IndicatorMaster::class, 'indicator_id');
    }

    /** @return BelongsTo<Opd, Target> */
    public function opd(): BelongsTo
    {
        return $this->belongsTo(Opd::class);
    }

    /** @return BelongsTo<Period, Target> */
    public function period(): BelongsTo
    {
        return $this->belongsTo(Period::class);
    }

    /** @return BelongsTo<User, Target> */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /* Scopes praktis */
    public function scopeFor($q, int $indicatorId, int $opdId, int $periodId)
    {
        return $q->where([
            'indicator_id' => $indicatorId,
            'opd_id'       => $opdId,
            'period_id'    => $periodId,
        ]);
    }
}

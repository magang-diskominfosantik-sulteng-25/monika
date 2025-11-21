<?php

namespace App\Models;

use App\Models\Target;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Collection;

class Achievement extends Model
{
    use HasFactory;

    protected $table = 'achievements';
    protected $guarded = ['id'];
    protected $casts = [
        'nilai_realisasi_num' => 'decimal:4',
    ];

    /** @return BelongsTo<IndicatorMaster, Achievement> */
    public function indicator(): BelongsTo
    {
        return $this->belongsTo(IndicatorMaster::class, 'indicator_id');
    }

    /** @return BelongsTo<Opd, Achievement> */
    public function opd(): BelongsTo
    {
        return $this->belongsTo(Opd::class);
    }

    /** @return BelongsTo<Period, Achievement> */
    public function period(): BelongsTo
    {
        return $this->belongsTo(Period::class);
    }

    /** @return BelongsTo<User, Achievement> */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /** @return BelongsTo<User, Achievement> */
    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /** @return HasMany<Evidence> */
    public function evidences(): HasMany
    {
        return $this->hasMany(Evidence::class);
    }

    /* Scopes */
    public function scopeFor($q, int $indicatorId, int $opdId, int $periodId)
    {
        return $q->where([
            'indicator_id' => $indicatorId,
            'opd_id'       => $opdId,
            'period_id'    => $periodId,
        ]);
    }

    /**
     * Attach matched targets to the provided achievements to avoid N+1 queries.
     *
     * @param  \Illuminate\Support\Collection<int, Achievement>|array<int, Achievement>  $achievements
     */
    public static function hydrateTargets(Collection|array $achievements): void
    {
        $collection = $achievements instanceof Collection ? $achievements : collect($achievements);

        if ($collection->isEmpty()) {
            return;
        }

        $indicatorIds = $collection->pluck('indicator_id')->unique()->all();
        $opdIds = $collection->pluck('opd_id')->unique()->all();
        $periodIds = $collection->pluck('period_id')->unique()->all();

        $targets = Target::query()
            ->whereIn('indicator_id', $indicatorIds)
            ->whereIn('opd_id', $opdIds)
            ->whereIn('period_id', $periodIds)
            ->get()
            ->keyBy(fn (Target $target) => self::targetKey($target->indicator_id, $target->opd_id, $target->period_id));

        $collection->each(function (self $achievement) use ($targets): void {
            $key = self::targetKey($achievement->indicator_id, $achievement->opd_id, $achievement->period_id);
            $achievement->setRelation('target', $targets->get($key));
        });
    }

    private static function targetKey(int $indicatorId, int $opdId, int $periodId): string
    {
        return "{$indicatorId}-{$opdId}-{$periodId}";
    }
}

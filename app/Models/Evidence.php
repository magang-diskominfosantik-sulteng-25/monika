<?php

namespace App\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Evidence extends Model
{
    use HasFactory;

    protected $table = 'evidences';
    protected $guarded = ['id'];
    protected $casts = [
        'file_size' => 'integer',
    ];

    /** @return BelongsTo<Achievement, Evidence> */
    public function achievement(): BelongsTo
    {
        return $this->belongsTo(Achievement::class);
    }

    /** @return BelongsTo<User, Evidence> */
    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}

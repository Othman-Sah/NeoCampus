<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\Succursale;
use App\Models\EtablissementSetting;
use App\Models\Eleve;
use App\Models\PlatformSetting;

#[Fillable([
    'nom',
    'adresse',
    'code',
    'logo',
    'plan_tier',
    'subscription_status',
    'stripe_customer_id',
    'stripe_subscription_id',
    'trial_ends_at',
    'subscription_ends_at'
])]
class Etablissement extends Model
{
    use HasFactory;

    /**
     * Get the users registered under this establishment.
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    /**
     * Get the branches (succursales) belonging to this establishment.
     */
    public function succursales(): HasMany
    {
        return $this->hasMany(Succursale::class);
    }

    /**
     * Get the students registered under this establishment.
     */
    public function eleves(): HasMany
    {
        return $this->hasMany(Eleve::class);
    }

    /**
     * Get the settings for this establishment.
     */
    public function settings(): HasMany
    {
        return $this->hasMany(EtablissementSetting::class);
    }

    /**
     * Get a setting value.
     */
    public function getSetting(string $key, $default = null)
    {
        $setting = $this->settings()->where('key', $key)->first();
        return $setting ? $setting->value : $default;
    }

    /**
     * Set a setting value.
     */
    public function setSetting(string $key, $value): void
    {
        $this->settings()->updateOrCreate(
            ['key' => $key],
            ['value' => $value]
        );
    }

    /**
     * Check if the establishment has reached its branch limit.
     */
    public function hasReachedBranchLimit(): bool
    {
        if ($this->plan_tier === 'enterprise') {
            return false;
        }

        $limit = (int) $this->getSetting('max_branches', $this->getDefaultBranchLimit());
        return $this->succursales()->count() >= $limit;
    }

    /**
     * Check if the establishment has reached its student limit.
     */
    public function hasReachedStudentLimit(): bool
    {
        if ($this->plan_tier === 'enterprise') {
            return false;
        }

        $limit = (int) $this->getSetting('max_students', $this->getDefaultStudentLimit());
        
        // Count students across all branches of the establishment
        $count = Eleve::where('etablissement_id', $this->id)->count();
        return $count >= $limit;
    }

    private function getPlansConfig(): array
    {
        try {
            $setting = PlatformSetting::where('key', 'plans')->first();
            if ($setting) {
                return $setting->value;
            }
        } catch (\Exception $e) {}

        return [
            'free' => ['price' => 0, 'max_branches' => 1, 'max_students' => 50],
            'basic' => ['price' => 49, 'max_branches' => 1, 'max_students' => 200],
            'premium' => ['price' => 99, 'max_branches' => 5, 'max_students' => 1000],
            'enterprise' => ['price' => 199, 'max_branches' => 999, 'max_students' => 99999],
        ];
    }

    /**
     * Get default branch limit based on plan tier.
     */
    private function getDefaultBranchLimit(): int
    {
        $plans = $this->getPlansConfig();
        return (int) ($plans[$this->plan_tier]['max_branches'] ?? 1);
    }

    /**
     * Get default student limit based on plan tier.
     */
    private function getDefaultStudentLimit(): int
    {
        $plans = $this->getPlansConfig();
        return (int) ($plans[$this->plan_tier]['max_students'] ?? 50);
    }
}

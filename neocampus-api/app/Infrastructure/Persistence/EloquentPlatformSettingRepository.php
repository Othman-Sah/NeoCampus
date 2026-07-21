<?php

namespace App\Infrastructure\Persistence;

use App\Domain\Ports\PlatformSettingRepositoryInterface;
use App\Models\PlatformSetting;

class EloquentPlatformSettingRepository implements PlatformSettingRepositoryInterface
{
    /**
     * Get a setting value by its key.
     */
    public function get(string $key, $default = null)
    {
        $setting = PlatformSetting::where('key', $key)->first();
        return $setting ? $setting->value : $default;
    }

    /**
     * Set/save a setting value.
     */
    public function set(string $key, $value): void
    {
        PlatformSetting::updateOrCreate(
            ['key' => $key],
            ['value' => $value]
        );
    }

    /**
     * Retrieve all platform settings.
     */
    public function all(): array
    {
        return PlatformSetting::all()->pluck('value', 'key')->toArray();
    }
}

<?php

namespace App\Domain\Ports;

interface PlatformSettingRepositoryInterface
{
    /**
     * Get a setting value by its key.
     *
     * @param string $key
     * @param mixed $default
     * @return mixed
     */
    public function get(string $key, $default = null);

    /**
     * Set/save a setting value.
     *
     * @param string $key
     * @param mixed $value
     * @return void
     */
    public function set(string $key, $value): void;

    /**
     * Retrieve all platform settings as a key-value associative array.
     *
     * @return array
     */
    public function all(): array;
}

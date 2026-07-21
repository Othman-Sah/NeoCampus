<?php

namespace App\Application\DTOs;

class PlatformSettingDTO
{
    public function __construct(
        public string $key,
        public array $value
    ) {}

    public static function fromRequest(string $key, array $value): self
    {
        return new self($key, $value);
    }
}

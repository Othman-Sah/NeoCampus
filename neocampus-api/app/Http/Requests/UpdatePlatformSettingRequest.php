<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePlatformSettingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'super-admin';
    }

    public function rules(): array
    {
        return [
            'key' => 'required|string|in:plans,defaults,feature_flags,maintenance',
            'value' => 'required|array',
        ];
    }
}

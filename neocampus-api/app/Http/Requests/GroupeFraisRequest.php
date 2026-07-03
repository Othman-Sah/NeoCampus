<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class GroupeFraisRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $tenantId = $this->user()->etablissement_id;
        $groupId = $this->route('group'); // resource route parameter name is 'group' (singular of groups)

        return [
            'nom' => [
                'required',
                'string',
                'max:100',
                Rule::unique('groupe_frais', 'nom')
                    ->where('etablissement_id', $tenantId)
                    ->ignore($groupId)
            ],
            'description' => 'nullable|string|max:1000',
        ];
    }
}

<?php

namespace App\Http\Requests\Library;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CreateLoanRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        $tenantId = $this->user()->etablissement_id;

        return [
            'livre_id' => [
                'required',
                'integer',
                Rule::exists('livres', 'id')->where(function ($query) use ($tenantId) {
                    return $query->where('etablissement_id', $tenantId)->whereNull('deleted_at');
                })
            ],
            'adherent_id' => [
                'required',
                'integer',
                Rule::exists('adherents', 'id')->where(function ($query) use ($tenantId) {
                    return $query->where('etablissement_id', $tenantId)->whereNull('deleted_at');
                })
            ],
        ];
    }
}

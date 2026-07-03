<?php

namespace App\Http\Requests\Library;

use App\Models\Emprunt;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ReturnLoanRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $loanId = $this->route('id') ?? $this->input('id');
        if ($loanId) {
            $loan = Emprunt::find($loanId);
            if (!$loan || $loan->etablissement_id !== $this->user()->etablissement_id) {
                return false; // Triggers 403 Forbidden
            }
        }
        return true;
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'id' => $this->route('id'),
        ]);
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        $tenantId = $this->user()->etablissement_id;

        return [
            'id' => [
                'required',
                'integer',
                Rule::exists('emprunts', 'id')->where(function ($query) use ($tenantId) {
                    return $query->where('etablissement_id', $tenantId)->whereNull('deleted_at');
                })
            ],
        ];
    }
}

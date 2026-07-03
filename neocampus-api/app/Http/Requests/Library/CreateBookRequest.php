<?php

namespace App\Http\Requests\Library;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CreateBookRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Enforced via Policy / Controller / Middleware
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        $tenantId = $this->user()->etablissement_id;

        return [
            'titre' => ['required', 'string', 'max:255'],
            'auteur' => ['required', 'string', 'max:255'],
            'isbn' => [
                'required',
                'string',
                'max:13',
                Rule::unique('livres', 'isbn')->where(function ($query) use ($tenantId) {
                    return $query->where('etablissement_id', $tenantId)->whereNull('deleted_at');
                })
            ],
            'genre' => ['nullable', 'string', 'max:100'],
            'quantite_stock' => ['integer', 'min:1'],
        ];
    }
}

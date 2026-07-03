<?php

namespace App\Http\Requests\Library;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateBookRequest extends FormRequest
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
        $bookId = $this->route('id');

        return [
            'titre' => ['sometimes', 'required', 'string', 'max:255'],
            'auteur' => ['sometimes', 'required', 'string', 'max:255'],
            'isbn' => [
                'sometimes',
                'required',
                'string',
                'max:13',
                Rule::unique('livres', 'isbn')->where(function ($query) use ($tenantId) {
                    return $query->where('etablissement_id', $tenantId)->whereNull('deleted_at');
                })->ignore($bookId)
            ],
            'genre' => ['nullable', 'string', 'max:100'],
            'quantite_stock' => ['sometimes', 'integer', 'min:1'],
        ];
    }
}

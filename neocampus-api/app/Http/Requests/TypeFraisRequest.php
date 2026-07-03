<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TypeFraisRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $tenantId = $this->user()->etablissement_id;
        $typeId = $this->route('type'); // resource route parameter

        return [
            'libelle' => [
                'required',
                'string',
                'max:100',
                Rule::unique('type_frais', 'libelle')
                    ->where('etablissement_id', $tenantId)
                    ->where('groupe_frais_id', $this->input('groupe_frais_id'))
                    ->ignore($typeId)
            ],
            'groupe_frais_id' => [
                'required',
                'integer',
                Rule::exists('groupe_frais', 'id')->where('etablissement_id', $tenantId)
            ],
            'montant_par_defaut' => 'required|numeric|min:0',
        ];
    }
}

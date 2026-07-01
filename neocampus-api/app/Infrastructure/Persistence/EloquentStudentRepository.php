<?php

namespace App\Infrastructure\Persistence;

use App\Domain\Ports\StudentPortInterface;
use App\Models\Eleve;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class EloquentStudentRepository implements StudentPortInterface
{
    /**
     * Generate a random 8-character alphanumeric password.
     */
    private function generatePassword(int $length = 8): string
    {
        $chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
        $password = '';
        for ($i = 0; $i < $length; $i++) {
            $password .= $chars[random_int(0, strlen($chars) - 1)];
        }
        return $password;
    }

    /**
     * Find a student by ID, strictly isolated to the current tenant.
     */
    public function findById(int $id): ?array
    {
        $tenantId = Auth::user()->etablissement_id ?? null;
        if (!$tenantId) {
            return null;
        }

        // Global TenantScope automatically handles isolation, 
        // but we explicitly check here for a second security layer.
        $eleve = Eleve::with('user')->where('id', $id)
            ->where('etablissement_id', $tenantId)
            ->first();

        return $eleve ? $eleve->toArray() : null;
    }

    /**
     * Get all students in a specific class for the current tenant.
     */
    public function findAllByClasse(int $classeId): array
    {
        $tenantId = Auth::user()->etablissement_id ?? null;
        if (!$tenantId) {
            return [];
        }

        return Eleve::with('user')->where('classe_id', $classeId)
            ->where('etablissement_id', $tenantId)
            ->get()
            ->toArray();
    }

    /**
     * Create a new student and its login credentials in an atomic transaction.
     * A User account is ALWAYS created so the student can log into their portal.
     */
    public function create(array $data): array
    {
        $tenantId = Auth::user()->etablissement_id ?? $data['etablissement_id'] ?? null;
        if (!$tenantId) {
            throw new \InvalidArgumentException("Tenant context is required to create a student.");
        }

        return DB::transaction(function () use ($data, $tenantId) {
            // 1. Determine password — use provided value or auto-generate an 8-char one
            $rawPassword = !empty($data['password'])
                ? $data['password']
                : $this->generatePassword();

            // 2. Resolve or dynamically create class record inside classes table
            $classeId = $data['classe_id'] ?? null;
            $classeNom = $data['classe_nom'] ?? null;

            if (!empty($classeNom)) {
                $classe = \App\Models\Classe::where('etablissement_id', $tenantId)
                    ->where('nom', $classeNom)
                    ->first();
                if (!$classe) {
                    // Resolve or create a default Section for this tenant
                    $section = \App\Models\Section::where('etablissement_id', $tenantId)->first();
                    if (!$section) {
                        $section = \App\Models\Section::create([
                            'etablissement_id' => $tenantId,
                            'nom' => 'General',
                        ]);
                    }
                    // Resolve or create a default AnneeScolaire for this tenant
                    $annee = \App\Models\AnneeScolaire::where('etablissement_id', $tenantId)->first();
                    if (!$annee) {
                        $currentYear = (int) date('Y');
                        $annee = \App\Models\AnneeScolaire::create([
                            'etablissement_id' => $tenantId,
                            'libelle'          => $currentYear . '-' . ($currentYear + 1),
                            'date_debut'       => $currentYear . '-09-01',
                            'date_fin'         => ($currentYear + 1) . '-06-30',
                        ]);
                    }
                    $classe = \App\Models\Classe::create([
                        'etablissement_id'  => $tenantId,
                        'nom'               => $classeNom,
                        'section_id'        => $section->id,
                        'annee_scolaire_id' => $annee->id,
                    ]);
                }
                $classeId = $classe->id;
            }

            // 3. Generate unique matricule if not provided
            $matricule = $data['matricule'] ?? null;
            if (empty($matricule)) {
                $year = date('Y');
                $count = Eleve::where('etablissement_id', $tenantId)->count() + 1;
                do {
                    $matricule = 'MAT-' . $year . '-' . str_pad($count, 4, '0', STR_PAD_LEFT);
                    $exists = Eleve::where('etablissement_id', $tenantId)
                        ->where('matricule', $matricule)
                        ->exists();
                    if ($exists) {
                        $count++;
                    }
                } while ($exists);
            }

            // 4. Build login email: use provided email or generate a placeholder from matricule
            $loginEmail = !empty($data['email'])
                ? $data['email']
                : strtolower('stud-' . str_replace('-', '', $matricule) . '@neocampus.local');

            // 5. Create the User login account (always — every student can log in)
            $user = User::create([
                'etablissement_id' => $tenantId,
                'nom'              => $data['nom'],
                'prenom'           => $data['prenom'],
                'email'            => $loginEmail,
                'password'         => Hash::make($rawPassword),
                'temp_password'    => $rawPassword, // Stored in plaintext for admin reveal
                'role'             => 'eleve',
            ]);

            // 6. Create the unified student record
            $eleve = Eleve::create([
                'etablissement_id'   => $tenantId,
                'user_id'            => $user->id,
                'matricule'          => $matricule,
                'nom'                => $data['nom'],
                'prenom'             => $data['prenom'],
                'email'              => $data['email'] ?? null,
                'sexe'               => $data['sexe'] ?? null,
                'date_naissance'     => $data['date_naissance'] ?? null,
                'classe_id'          => $classeId,
                'classe_nom'         => $classeNom,
                'status'             => $data['status'] ?? 'Active',
                'parent_contact'     => $data['parent_contact'] ?? null,
                'documents'          => $data['documents'] ?? null,
                'scolarite_anterieure' => $data['scolarite_anterieure'] ?? null,
            ]);

            $eleve->load('user');
            return $eleve->toArray();
        });
    }

    /**
     * Update an existing student record, strictly matching the tenant.
     */
    public function update(int $id, array $data): array
    {
        $tenantId = Auth::user()->etablissement_id ?? null;
        if (!$tenantId) {
            throw new \InvalidArgumentException("Tenant context is required to update a student.");
        }

        $eleve = Eleve::where('id', $id)
            ->where('etablissement_id', $tenantId)
            ->firstOrFail();

        return DB::transaction(function () use ($eleve, $data, $tenantId) {
            // 1. Update the linked User credentials if they exist
            if ($eleve->user_id) {
                $user = User::find($eleve->user_id);
                if ($user) {
                    $userUpdate = [];
                    if (isset($data['nom']))    $userUpdate['nom']    = $data['nom'];
                    if (isset($data['prenom'])) $userUpdate['prenom'] = $data['prenom'];
                    if (isset($data['email']))  $userUpdate['email']  = $data['email'];

                    // Password update (admin-gated on frontend, raw value passed here)
                    if (!empty($data['password'])) {
                        $userUpdate['password']      = Hash::make($data['password']);
                        $userUpdate['temp_password'] = $data['password'];
                    }

                    if (!empty($userUpdate)) {
                        $user->update($userUpdate);
                    }
                }
            }

            // 2. Resolve or dynamically create class record inside classes table
            $classeId = $data['classe_id'] ?? null;
            $classeNom = $data['classe_nom'] ?? null;

            if (!empty($classeNom)) {
                $classe = \App\Models\Classe::where('etablissement_id', $tenantId)
                    ->where('nom', $classeNom)
                    ->first();
                if (!$classe) {
                    // Resolve or create a default Section for this tenant
                    $section = \App\Models\Section::where('etablissement_id', $tenantId)->first();
                    if (!$section) {
                        $section = \App\Models\Section::create([
                            'etablissement_id' => $tenantId,
                            'nom' => 'General',
                        ]);
                    }
                    // Resolve or create a default AnneeScolaire for this tenant
                    $annee = \App\Models\AnneeScolaire::where('etablissement_id', $tenantId)->first();
                    if (!$annee) {
                        $currentYear = (int) date('Y');
                        $annee = \App\Models\AnneeScolaire::create([
                            'etablissement_id' => $tenantId,
                            'libelle'          => $currentYear . '-' . ($currentYear + 1),
                            'date_debut'       => $currentYear . '-09-01',
                            'date_fin'         => ($currentYear + 1) . '-06-30',
                        ]);
                    }
                    $classe = \App\Models\Classe::create([
                        'etablissement_id'  => $tenantId,
                        'nom'               => $classeNom,
                        'section_id'        => $section->id,
                        'annee_scolaire_id' => $annee->id,
                    ]);
                }
                $classeId = $classe->id;
            }

            // 3. Update the student record (exclude password from eleve table)
            $eleve->update(array_filter([
                'matricule'          => $data['matricule'] ?? null,
                'nom'                => $data['nom'] ?? null,
                'prenom'             => $data['prenom'] ?? null,
                'email'              => $data['email'] ?? null,
                'sexe'               => $data['sexe'] ?? null,
                'date_naissance'     => $data['date_naissance'] ?? null,
                'classe_id'          => $classeId,
                'classe_nom'         => $classeNom,
                'status'             => $data['status'] ?? null,
                'parent_contact'     => $data['parent_contact'] ?? null,
                'documents'          => $data['documents'] ?? null,
                'scolarite_anterieure' => $data['scolarite_anterieure'] ?? null,
            ], function ($value) {
                return !is_null($value);
            }));

            $eleve->load('user');
            return $eleve->toArray();
        });
    }

    /**
     * Delete a student and their login credentials, isolated to tenant.
     */
    public function delete(int $id): bool
    {
        $tenantId = Auth::user()->etablissement_id ?? null;
        if (!$tenantId) {
            return false;
        }

        $eleve = Eleve::where('id', $id)
            ->where('etablissement_id', $tenantId)
            ->first();

        if (!$eleve) {
            return false;
        }

        return DB::transaction(function () use ($eleve) {
            // Delete user account and avatar if they exist
            if ($eleve->user_id) {
                $user = User::find($eleve->user_id);
                if ($user) {
                    if ($user->avatar && str_starts_with($user->avatar, 'avatars/')) {
                        Storage::disk('public')->delete($user->avatar);
                    }
                    $user->delete();
                }
            }
            
            return (bool) $eleve->delete();
        });
    }

    /**
     * Search and paginate students with filters.
     */
    public function search(array $filters): array
    {
        $tenantId = Auth::user()->etablissement_id ?? null;
        if (!$tenantId) {
            return [];
        }

        $query = Eleve::with('user')->where('etablissement_id', $tenantId);

        // Filter by text search (name or matricule)
        if (!empty($filters['search'])) {
            $searchTerm = '%' . $filters['search'] . '%';
            $query->where(function ($q) use ($searchTerm) {
                $q->where('nom', 'like', $searchTerm)
                  ->orWhere('prenom', 'like', $searchTerm)
                  ->orWhere('matricule', 'like', $searchTerm);
            });
        }

        // Filter by class
        if (!empty($filters['classe_id'])) {
            $query->where('classe_id', $filters['classe_id']);
        }

        // Filter by status
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        // Filter by section (mocked filter mapping primary/college/lycee levels)
        if (!empty($filters['section'])) {
            $section = strtolower($filters['section']);
            if ($section === 'collège') {
                $query->whereIn('classe_id', [1, 2, 3, 4]);
            } elseif ($section === 'primaire') {
                $query->whereIn('classe_id', [5]);
            }
        }

        return $query->get()->toArray();
    }
}

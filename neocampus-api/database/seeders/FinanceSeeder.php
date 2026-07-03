<?php

namespace Database\Seeders;

use App\Models\Eleve;
use App\Models\Etablissement;
use App\Models\Frais;
use App\Models\GroupeFrais;
use App\Models\Paiement;
use App\Models\RecetteDepense;
use App\Models\Solde;
use App\Models\TypeFrais;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FinanceSeeder extends Seeder
{
    public function run(): void
    {
        $etablissements = Etablissement::all();
        if ($etablissements->isEmpty()) {
            return;
        }

        foreach ($etablissements as $etab) {
            // Find a comptable user for this etablissement to associate payments
            $comptable = User::where('etablissement_id', $etab->id)
                ->where('role', 'comptable')
                ->first();

            $comptableId = $comptable ? $comptable->id : null;

            // 1. Seed 3 GroupeFrais per etablissement
            $g1 = GroupeFrais::create([
                'etablissement_id' => $etab->id,
                'nom' => 'Scolarité',
                'description' => 'Frais liés aux enseignements et à la scolarité annuelle.',
            ]);

            $g2 = GroupeFrais::create([
                'etablissement_id' => $etab->id,
                'nom' => 'Cantine',
                'description' => 'Abonnements à la restauration scolaire.',
            ]);

            $g3 = GroupeFrais::create([
                'etablissement_id' => $etab->id,
                'nom' => 'Activités Parascolaires',
                'description' => 'Sorties, clubs, et événements sportifs ou culturels.',
            ]);

            // 2. Seed 2-4 TypeFrais per group
            $tInscription = TypeFrais::create([
                'etablissement_id' => $etab->id,
                'groupe_frais_id' => $g1->id,
                'libelle' => 'Inscription',
                'montant_par_defaut' => 1500.00,
            ]);

            $tMensuel = TypeFrais::create([
                'etablissement_id' => $etab->id,
                'groupe_frais_id' => $g1->id,
                'libelle' => 'Mensualité Octobre',
                'montant_par_defaut' => 2500.00,
            ]);

            $tDejeuner = TypeFrais::create([
                'etablissement_id' => $etab->id,
                'groupe_frais_id' => $g2->id,
                'libelle' => 'Déjeuner Régulier',
                'montant_par_defaut' => 600.00,
            ]);

            $tSortie = TypeFrais::create([
                'etablissement_id' => $etab->id,
                'groupe_frais_id' => $g3->id,
                'libelle' => 'Sortie Nature',
                'montant_par_defaut' => 200.00,
            ]);

            // Get students for this etablissement
            $students = Eleve::where('etablissement_id', $etab->id)->get();
            $types = [$tInscription, $tMensuel, $tDejeuner, $tSortie];

            $index = 0;
            foreach ($students as $student) {
                foreach ($types as $type) {
                    $statusNum = $index % 5;
                    // Proportions: 60% (index 0, 1, 2) 'paye', 20% (index 3) 'en_retard', 20% (index 4) 'en_attente'
                    
                    if ($statusNum === 0 || $statusNum === 1 || $statusNum === 2) {
                        $statut = 'paye';
                        $dateEcheance = '2026-06-01';
                    } elseif ($statusNum === 3) {
                        $statut = 'en_retard';
                        // Due in past
                        $dateEcheance = '2026-05-15';
                    } else {
                        $statut = 'en_attente';
                        // Due in future
                        $dateEcheance = '2026-10-15';
                    }

                    $fee = Frais::create([
                        'etablissement_id' => $etab->id,
                        'type_frais_id' => $type->id,
                        'eleve_id' => $student->id,
                        'montant' => $type->montant_par_defaut,
                        'date_echeance' => $dateEcheance,
                        'statut' => $statut,
                        'annee_scolaire' => '2025-2026',
                    ]);

                    if ($statut === 'paye') {
                        // Create a payment record
                        Paiement::create([
                            'etablissement_id' => $etab->id,
                            'frais_id' => $fee->id,
                            'montant_paye' => $type->montant_par_defaut,
                            'date_paiement' => '2026-06-05',
                            'mode' => ['cash', 'virement', 'cheque'][rand(0, 2)],
                            'reference' => 'REFPAY-' . rand(1000, 9999),
                            'comptable_id' => $comptableId,
                        ]);
                    }

                    $index++;
                }

                // Initialize Solde record for each student
                $studentFees = Frais::with('paiements')->where('eleve_id', $student->id)->get();
                $totalDue = 0.0;
                $totalPaid = 0.0;
                foreach ($studentFees as $sf) {
                    $totalDue += (float) $sf->montant;
                    foreach ($sf->paiements as $p) {
                        $totalPaid += (float) $p->montant_paye;
                    }
                }

                Solde::create([
                    'etablissement_id' => $etab->id,
                    'eleve_id' => $student->id,
                    'montant_du' => $totalDue,
                    'montant_paye' => $totalPaid,
                ]);
            }

            // 3. Seed 5 recettes_depenses entries per etablissement
            RecetteDepense::create([
                'etablissement_id' => $etab->id,
                'libelle' => 'Achat de fournitures scolaires de rentrée',
                'montant' => 4500.00,
                'type' => 'depense',
                'categorie' => 'Matériel',
                'date' => '2026-06-10',
                'saisie_par' => $comptableId,
            ]);

            RecetteDepense::create([
                'etablissement_id' => $etab->id,
                'libelle' => 'Facture électricité du mois de Mai',
                'montant' => 1200.00,
                'type' => 'depense',
                'categorie' => 'Charges',
                'date' => '2026-06-12',
                'saisie_par' => $comptableId,
            ]);

            RecetteDepense::create([
                'etablissement_id' => $etab->id,
                'libelle' => 'Vente vieux ordinateurs de la bibliothèque',
                'montant' => 3000.00,
                'type' => 'recette',
                'categorie' => 'Vente',
                'date' => '2026-06-15',
                'saisie_par' => $comptableId,
            ]);

            RecetteDepense::create([
                'etablissement_id' => $etab->id,
                'libelle' => 'Recettes de la kermesse de fin d\'année',
                'montant' => 15000.00,
                'type' => 'recette',
                'categorie' => 'Événement',
                'date' => '2026-06-25',
                'saisie_par' => $comptableId,
            ]);

            RecetteDepense::create([
                'etablissement_id' => $etab->id,
                'libelle' => 'Frais de maintenance du serveur académique',
                'montant' => 2400.00,
                'type' => 'depense',
                'categorie' => 'Informatique',
                'date' => '2026-06-28',
                'saisie_par' => $comptableId,
            ]);
        }
    }
}

<?php

namespace App\Events;

use App\Models\Etablissement;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TenantOnboarded
{
    use Dispatchable, SerializesModels;

    public Etablissement $etablissement;

    /**
     * Create a new event instance.
     */
    public function __construct(Etablissement $etablissement)
    {
        $this->etablissement = $etablissement;
    }
}

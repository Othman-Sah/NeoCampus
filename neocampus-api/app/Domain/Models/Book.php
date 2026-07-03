<?php

namespace App\Domain\Models;

class Book
{
    public ?int $id;
    public string $titre;
    public string $auteur;
    public string $isbn;
    public ?string $genre;
    public int $quantite_stock;
    public int $etablissement_id;
    public ?string $created_at;
    public ?string $updated_at;

    public function __construct(array $data)
    {
        $this->id = $data['id'] ?? null;
        $this->titre = $data['titre'] ?? '';
        $this->auteur = $data['auteur'] ?? '';
        $this->isbn = $data['isbn'] ?? '';
        $this->genre = $data['genre'] ?? null;
        $this->quantite_stock = $data['quantite_stock'] ?? 1;
        $this->etablissement_id = $data['etablissement_id'] ?? 0;
        $this->created_at = $data['created_at'] ?? null;
        $this->updated_at = $data['updated_at'] ?? null;
    }

    public static function fromArray(array $data): self
    {
        return new self($data);
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'titre' => $this->titre,
            'auteur' => $this->auteur,
            'isbn' => $this->isbn,
            'genre' => $this->genre,
            'quantite_stock' => $this->quantite_stock,
            'etablissement_id' => $this->etablissement_id,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}

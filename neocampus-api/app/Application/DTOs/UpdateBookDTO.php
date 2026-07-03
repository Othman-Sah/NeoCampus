<?php

namespace App\Application\DTOs;

class UpdateBookDTO
{
    public ?string $titre;
    public ?string $auteur;
    public ?string $isbn;
    public ?string $genre;
    public ?int $quantite_stock;

    public function __construct(array $data)
    {
        $this->titre = $data['titre'] ?? null;
        $this->auteur = $data['auteur'] ?? null;
        $this->isbn = $data['isbn'] ?? null;
        $this->genre = $data['genre'] ?? null;
        $this->quantite_stock = $data['quantite_stock'] ?? null;
    }

    public static function fromArray(array $data): self
    {
        return new self($data);
    }

    public function toArray(): array
    {
        return array_filter([
            'titre' => $this->titre,
            'auteur' => $this->auteur,
            'isbn' => $this->isbn,
            'genre' => $this->genre,
            'quantite_stock' => $this->quantite_stock,
        ], function ($value) {
            return !is_null($value);
        });
    }
}

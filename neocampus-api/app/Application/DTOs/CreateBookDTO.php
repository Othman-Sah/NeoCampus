<?php

namespace App\Application\DTOs;

class CreateBookDTO
{
    public string $titre;
    public string $auteur;
    public string $isbn;
    public ?string $genre;
    public int $quantite_stock;

    public function __construct(array $data)
    {
        $this->titre = $data['titre'];
        $this->auteur = $data['auteur'];
        $this->isbn = $data['isbn'];
        $this->genre = $data['genre'] ?? null;
        $this->quantite_stock = $data['quantite_stock'] ?? 1;
    }

    public static function fromArray(array $data): self
    {
        return new self($data);
    }

    public function toArray(): array
    {
        return [
            'titre' => $this->titre,
            'auteur' => $this->auteur,
            'isbn' => $this->isbn,
            'genre' => $this->genre,
            'quantite_stock' => $this->quantite_stock,
        ];
    }
}

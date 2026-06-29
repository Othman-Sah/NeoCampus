<?php

namespace App\Http\Controllers;

use OpenApi\Attributes as OA;

#[OA\Info(
    title: "NeoCampus API Documentation",
    version: "1.0.0",
    description: "API documentation for the NeoCampus school management web platform",
    contact: new OA\Contact(email: "admin@neocampus.com")
)]
#[OA\Server(
    url: "/api",
    description: "NeoCampus API Server"
)]
#[OA\SecurityScheme(
    securityScheme: "sanctum",
    type: "apiKey",
    in: "header",
    name: "Authorization",
    description: "Enter token in format: Bearer <token>"
)]
abstract class Controller
{
    //
}

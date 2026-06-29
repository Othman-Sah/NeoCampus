<?php

namespace App\Providers;

use App\Domain\Ports\AuthPortInterface;
use App\Domain\Ports\StudentPortInterface;
use App\Infrastructure\Persistence\EloquentAuthRepository;
use App\Infrastructure\Persistence\EloquentStudentRepository;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(AuthPortInterface::class, EloquentAuthRepository::class);
        $this->app->bind(StudentPortInterface::class, EloquentStudentRepository::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}

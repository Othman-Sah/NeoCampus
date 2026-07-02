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
        $this->app->bind(\App\Domain\Ports\ClassPortInterface::class, \App\Infrastructure\Persistence\EloquentClassRepository::class);
        $this->app->bind(\App\Domain\Ports\TeacherPortInterface::class, \App\Infrastructure\Persistence\EloquentTeacherRepository::class);
        $this->app->bind(\App\Domain\Ports\SalaryPortInterface::class, \App\Infrastructure\Persistence\EloquentSalaryRepository::class);
        $this->app->bind(\App\Domain\Ports\SeancePortInterface::class, \App\Infrastructure\Persistence\EloquentSeanceRepository::class);
        $this->app->bind(\App\Domain\Ports\PresencePortInterface::class, \App\Infrastructure\Persistence\EloquentPresenceRepository::class);
        $this->app->bind(\App\Domain\Ports\ExamenPortInterface::class, \App\Infrastructure\Persistence\EloquentExamenRepository::class);
        $this->app->bind(\App\Domain\Ports\GradePortInterface::class, \App\Infrastructure\Persistence\EloquentGradeRepository::class);
        $this->app->bind(\App\Domain\Ports\BulletinPortInterface::class, \App\Infrastructure\Persistence\EloquentBulletinRepository::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}

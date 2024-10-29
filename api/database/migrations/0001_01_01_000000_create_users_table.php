<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateUsersTable extends Migration
{
    public function up()
    {
        Schema::create('users', function (Blueprint $table) {
            $table->bigIncrements('id'); // ID auto incremental
            $table->string('username', 255); // Nombre de usuario
            $table->string('password', 255); // Contraseña encriptada
            $table->string('email', 255)->unique(); // Correo electrónico único
            $table->timestamps(); // created_at y updated_at
        });
    }

    public function down()
    {
        Schema::dropIfExists('users'); // Elimina la tabla si es necesario revertir la migración
    }
}


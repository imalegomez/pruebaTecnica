<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateSudokuGamesTable extends Migration
{
    public function up()
    {
        Schema::create('sudoku_games', function (Blueprint $table) {
            $table->bigIncrements('id'); // ID auto incremental
            $table->unsignedBigInteger('user_id'); // Referencia al usuario
            $table->json('board'); // Tablero inicial en formato JSON o similar
            $table->json('solution'); // Solución completa del tablero
            $table->enum('status', ['in-progress', 'completed'])->default('in-progress'); // Estado del juego
            $table->timestamps(); // created_at y updated_at

            // Clave foránea que referencia a la tabla users
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('sudoku_games'); // Elimina la tabla si es necesario revertir la migración
    }
}


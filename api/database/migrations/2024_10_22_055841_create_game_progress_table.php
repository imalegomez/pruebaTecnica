<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateGameProgressTable extends Migration
{
    public function up()
    {
        Schema::create('game_progress', function (Blueprint $table) {
            $table->bigIncrements('id'); // ID auto incremental
            $table->unsignedBigInteger('game_id'); // Referencia al juego
            $table->string('cell_position', 5); // Posición de la celda (ej. A1, B2)
            $table->integer('value'); // Valor ingresado por el usuario
            $table->boolean('is_correct'); // Indica si el valor es correcto o no
            $table->timestamps(); // created_at y updated_at

            // Clave foránea que referencia a la tabla sudoku_games
            $table->foreign('game_id')->references('id')->on('sudoku_games')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('game_progress'); // Elimina la tabla si es necesario revertir la migración
    }
}


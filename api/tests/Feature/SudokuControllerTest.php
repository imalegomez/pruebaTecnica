<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\SudokuGame;

class SudokuControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_game_creation()
    {
        // Crea un juego de Sudoku
        $response = $this->postJson('/api/sudoku/games'); // Ruta corregida
    
        // Verifica que el juego se haya creado con éxito
        $response->assertStatus(201)
                 ->assertJsonStructure(['game' => ['id', 'board', 'solution', 'status']]);
    
        // Obtiene el juego creado
        $game = SudokuGame::find($response->json('game.id'));
        $this->assertNotNull($game); // Asegúrate de que el juego se creó en la base de datos
    }
    
    private function isSolutionValid($board, $solution)
    {
        // Verifica que cada celda del tablero sea igual a la solución
        foreach ($board as $row => $cells) {
            foreach ($cells as $col => $value) {
                if ($value !== 0 && $value !== $solution[$row][$col]) {
                    return false; // Si hay un número que no coincide, la solución no es válida
                }
            }
        }
        return true; // La solución es válida
    }
}


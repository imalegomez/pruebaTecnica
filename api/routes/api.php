<?php

use Illuminate\Http\Request; // Importar la clase Request para manejar solicitudes HTTP
use Illuminate\Support\Facades\Route; // Importar la clase Route para definir rutas
use App\Http\Controllers\SudokuController; // Importar el controlador de Sudoku
use App\Http\Controllers\UserController;

// Agrupar las rutas bajo el prefijo 'sudoku'
Route::prefix('sudoku')->group(function () {
    // Ruta para crear un nuevo juego de Sudoku
    Route::post('/games', [SudokuController::class, 'createGame']);

    // Ruta para obtener un juego específico por su ID
    Route::get('/games/{id}', [SudokuController::class, 'getGame']);

    // Ruta para realizar un movimiento en el juego especificado por su ID
    Route::post('/games/{id}/moves', [SudokuController::class, 'makeMove']);

    // Ruta para obtener la solución del juego especificado por su ID
    Route::get('/games/{id}/solution', [SudokuController::class, 'getSolution']);

    // Ruta para verificar el estado del juego especificado por su ID
    Route::get('/games/{id}/verify', [SudokuController::class, 'verifyGame']);

    Route::get('/user/{id}', [SudokuController::class, 'getUserGames']);
});

Route::post('/users', [UserController::class, 'createUser']); // Crear un nuevo usuario
Route::post('/users/login', [UserController::class, 'login']); 
Route::get('/users/{id}', [UserController::class, 'getUser']); // Obtener un usuario por ID
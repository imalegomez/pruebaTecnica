<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\SudokuGame;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class SudokuController extends Controller
{
    private const BOARD_SIZE = 9;
    private const SUB_GRID_SIZE = 3;
    private const CELLS_TO_REMOVE = 40;

    public function createGame(Request $request)
    {
        try {
            $validated = $request->validate([
                'user_id' => 'required|exists:users,id'
            ]);

            $board = $this->generateBoard();
            $solution = $this->generateSolution($board);
    
            $game = SudokuGame::create([
                'user_id' => $validated['user_id'],
                'board' => json_encode($board),
                'solution' => json_encode($solution),
                'status' => 'in-progress',
            ]);
    
            return response()->json(['game' => $game], 201);
        } catch (\Exception $e) {
            Log::error('Error creating game: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to create game'], 500);
        }
    }

    public function getGame($id)
    {
        try {
            $game = SudokuGame::findOrFail($id);
            $board = json_decode($game->board, true);
            
            // Load and apply progress
            $progress = DB::table('game_progress')
                         ->where('game_id', $id)
                         ->get();
    
            foreach ($progress as $move) {
                [$row, $col] = explode(',', $move->cell_position);
                $board[$row][$col] = $move->value;
            }
    
            return response()->json([
                'game' => $game,
                'board' => $board
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json(['error' => 'Game not found'], 404);
        } catch (\Exception $e) {
            Log::error('Error retrieving game: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to retrieve game'], 500);
        }
    }

    public function verifyGame($id)
    {
        try {
            $game = SudokuGame::findOrFail($id);
            Log::info("Verifying game status. Game ID: {$id}");
            
            $board = json_decode($game->board, true);
            
            if (!$this->isBoardComplete($board)) {
                return response()->json([
                    'status' => 'in-progress',
                    'game' => $game
                ]);
            }
            
            if ($this->verifySolution($board)) {
                $game->status = 'completed';
                $game->save();
                return response()->json([
                    'status' => 'completed',
                    'game' => $game,
                    'message' => 'Game completed successfully!'
                ]);
            }
            
            return response()->json([
                'status' => 'in-progress',
                'game' => $game,
                'error' => 'Solution is not valid'
            ]);
        } catch (\Exception $e) {
            Log::error('Error verifying game: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to verify game'], 500);
        }
    }
    
    private function generateBoard(): array
    {
        $board = array_fill(0, self::BOARD_SIZE, array_fill(0, self::BOARD_SIZE, 0));
        $this->fillBoard($board);
        $this->removeNumbers($board);
        return $board;
    }

    private function generateSolution($board): array
    {
        $solution = $board;
        $this->solveSudoku($solution);
        return $solution;
    }

    private function solveSudoku(&$board, $randomize = false): bool
    {
        for ($row = 0; $row < self::BOARD_SIZE; $row++) {
            for ($col = 0; $col < self::BOARD_SIZE; $col++) {
                if ($board[$row][$col] == 0) {
                    $numbers = range(1, self::BOARD_SIZE);
                    if ($randomize) {
                        shuffle($numbers);
                    }

                    foreach ($numbers as $num) {
                        if ($this->isSafe($board, $row, $col, $num)) {
                            $board[$row][$col] = $num;
                            if ($this->solveSudoku($board, $randomize)) {
                                return true;
                            }
                            $board[$row][$col] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }

    private function isSafe($board, $row, $col, $num): bool
    {
        for ($x = 0; $x < self::BOARD_SIZE; $x++) {
            if ($board[$row][$x] == $num || $board[$x][$col] == $num) {
                return false;
            }
        }

        $startRow = $row - $row % self::SUB_GRID_SIZE;
        $startCol = $col - $col % self::SUB_GRID_SIZE;
        
        for ($i = 0; $i < self::SUB_GRID_SIZE; $i++) {
            for ($j = 0; $j < self::SUB_GRID_SIZE; $j++) {
                if ($board[$i + $startRow][$j + $startCol] == $num) {
                    return false;
                }
            }
        }

        return true;
    }

    private function fillBoard(&$board): void
    {
        $this->solveSudoku($board, true);
    }

    private function removeNumbers(&$board): void
    {
        $cellsToRemove = self::CELLS_TO_REMOVE;
        while ($cellsToRemove > 0) {
            $row = rand(0, self::BOARD_SIZE - 1);
            $col = rand(0, self::BOARD_SIZE - 1);
            if ($board[$row][$col] != 0) {
                $board[$row][$col] = 0;
                $cellsToRemove--;
            }
        }
    }

    private function isValidMove($board, $row, $col, $value): bool
    {
        if ($value == 0) {
            return true;
        }

        if (in_array($value, $board[$row], true)) {
            return false;
        }

        for ($i = 0; $i < self::BOARD_SIZE; $i++) {
            if ($board[$i][$col] == $value) {
                return false;
            }
        }

        $boxRow = floor($row / self::SUB_GRID_SIZE) * self::SUB_GRID_SIZE;
        $boxCol = floor($col / self::SUB_GRID_SIZE) * self::SUB_GRID_SIZE;
        
        for ($i = $boxRow; $i < $boxRow + self::SUB_GRID_SIZE; $i++) {
            for ($j = $boxCol; $j < $boxCol + self::SUB_GRID_SIZE; $j++) {
                if ($board[$i][$j] == $value) {
                    return false;
                }
            }
        }

        return true;
    }

    private function verifySolution($board): bool
    {
        for ($i = 0; $i < self::BOARD_SIZE; $i++) {
            if (!$this->isValidSet(array_slice($board[$i], 0, self::BOARD_SIZE)) || 
                !$this->isValidSet(array_column($board, $i))) {
                return false;
            }
        }

        for ($boxRow = 0; $boxRow < self::SUB_GRID_SIZE; $boxRow++) {
            for ($boxCol = 0; $boxCol < self::SUB_GRID_SIZE; $boxCol++) {
                $box = [];
                for ($i = 0; $i < self::SUB_GRID_SIZE; $i++) {
                    for ($j = 0; $j < self::SUB_GRID_SIZE; $j++) {
                        $box[] = $board[$boxRow * self::SUB_GRID_SIZE + $i][$boxCol * self::SUB_GRID_SIZE + $j];
                    }
                }
                if (!$this->isValidSet($box)) {
                    return false;
                }
            }
        }

        return true;
    }

    private function isBoardComplete($board): bool
    {
        for ($row = 0; $row < self::BOARD_SIZE; $row++) {
            for ($col = 0; $col < self::BOARD_SIZE; $col++) {
                if ($board[$row][$col] === 0) {
                    return false;
                }
            }
        }
        return true;
    }

    private function isValidSet($set): bool
    {
        $uniqueSet = array_unique($set);
        return count($uniqueSet) == self::BOARD_SIZE && !in_array(0, $uniqueSet, true);
    }
}
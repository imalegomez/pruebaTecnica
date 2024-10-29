<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\SudokuGame;
use App\Models\GameProgress;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class SudokuController extends Controller
{
    private const BOARD_SIZE = 9;
    private const SUB_GRID_SIZE = 3;
    private const CELLS_TO_REMOVE = 40;
    
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
    
}
import React, { useCallback, useState, useMemo } from "react";
import axios from "axios";
import SudokuCell from "./sudokuCell";
import { API_URL } from '../config/api';

const SudokuBoard = React.memo(({ board, gameId, isGameCompleted, onMoveComplete }) => {
  const [originalBoard, setOriginalBoard] = useState(board);
  const [editableCells, setEditableCells] = useState(
    board.map(row => row.map(cell => typeof cell === "string" || cell === 0))
  );
  const [errorCells, setErrorCells] = useState(
    board.map(row => row.map(() => false))
  );
  const [lastErrorCell, setLastErrorCell] = useState(null);

  const validateAndSaveMove = useCallback(
    async (row, col, value) => {
      if (!gameId) {
        console.error("Game ID is not set");
        return false;
      }

      const valueToSave = value === 0 ? 0 : value.toString();

      try {
        const response = await axios.post(
          `${API_URL}/sudoku/games/${gameId}/moves`,
          { row, col, value: valueToSave }
        );
        return !response.data.valid;
      } catch (error) {
        console.error("Error validando movimiento:", error.response?.data || error.message);
        return false;
      }
    },
    [gameId]
  );

  const handleCellChange = useCallback(async (row, col, value) => {
    if (isGameCompleted) {
      console.log("No se pueden hacer más movimientos, el juego ya está completado.");
      return;
    }

    if (value === '') {
      value = 0;
    } else {
      value = parseInt(value, 10);
    }

    if (board[row][col] !== 0 && value !== 0 && originalBoard[row][col] !== 0) {
      console.error(`La celda [${row}, ${col}] ya tiene un valor.`);
      return;
    }

    if (value !== originalBoard[row][col]) {
      const updatedBoard = [...board];
      updatedBoard[row][col] = value;

      const newEditableCells = editableCells.map((r, rIndex) =>
        r.map((cell, cIndex) => (rIndex === row && cIndex === col) || cell)
      );

      setEditableCells(newEditableCells);

      const isValid = await validateAndSaveMove(row, col, value);
      const updatedErrorCells = [...errorCells];
      updatedErrorCells[row][col] = !isValid;
      setErrorCells(updatedErrorCells);

      if (!isValid) {
        setLastErrorCell({ row, col });
        // Reset lastErrorCell after animation
        setTimeout(() => setLastErrorCell(null), 820);
      }
  
      if (isValid) {
        onMoveComplete();
      }
    }
  }, [board, originalBoard, editableCells, errorCells, isGameCompleted, validateAndSaveMove, onMoveComplete]);

  const boardStyles = useMemo(() => ({
    container: "inline-block bg-white rounded-3xl shadow-xl p-8 transition-all duration-300 hover:shadow-2xl",
    innerContainer: "bg-gradient-to-br from-slate-50 to-indigo-50 rounded-2xl p-6 shadow-inner",
    grid: "grid grid-cols-9 bg-white rounded-xl overflow-hidden border-2 border-slate-300 shadow-sm"
  }), []);

  const getCellStyles = useCallback((rowIndex, colIndex, cellState) => {
    const borderClasses = [
      (colIndex + 1) % 3 === 0 && colIndex !== 8 ? "border-r-2 border-r-slate-300" : "border-r border-r-slate-200",
      (rowIndex + 1) % 3 === 0 && rowIndex !== 8 ? "border-b-2 border-b-slate-300" : "border-b border-b-slate-200",
    ].join(" ");

    return `relative ${borderClasses} ${cellState} transition-colors duration-200`;
  }, []);

  return (
    <div className={boardStyles.container}>
      <div className={boardStyles.innerContainer}>
        <div className={boardStyles.grid}>
          {board.map((row, rowIndex) => (
            <React.Fragment key={rowIndex}>
              {row.map((colValue, colIndex) => {
                const isLastError = lastErrorCell?.row === rowIndex && lastErrorCell?.col === colIndex;
                const cellState = 
                  errorCells[rowIndex][colIndex] ? "bg-red-50" :
                  isGameCompleted ? "bg-emerald-50/60" :
                  !editableCells[rowIndex][colIndex] ? "bg-slate-50/80" :
                  "bg-white hover:bg-indigo-50/60";

                return (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={`${getCellStyles(rowIndex, colIndex, cellState)} ${isLastError ? 'animate-wrong-number' : ''}`}
                  >
                    <SudokuCell
                      row={rowIndex}
                      col={colIndex}
                      value={colValue}
                      onChange={handleCellChange}
                      readOnly={isGameCompleted || !editableCells[rowIndex][colIndex]}
                      isError={errorCells[rowIndex][colIndex]}
                      isCompleted={isGameCompleted}
                      isOriginal={!editableCells[rowIndex][colIndex]}
                    />
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
});

// Añadimos los keyframes para las nuevas animaciones
const style = document.createElement('style');
style.textContent = `
  @keyframes wrong-shake {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-4px); }
    40% { transform: translateX(4px); }
    60% { transform: translateX(-4px); }
    80% { transform: translateX(4px); }
  }
  
  @keyframes wrong-number {
    0% { transform: scale(1); background-color: rgb(254 202 202); }
    50% { transform: scale(1.1); background-color: rgb(254 202 202); }
    100% { transform: scale(1); }
  }
  
  @keyframes success {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
  }
  
  .animate-wrong-shake {
    animation: wrong-shake 0.4s ease-in-out;
  }

  .animate-wrong-number {
    animation: wrong-number 0.8s ease-in-out;
  }
  
  .animate-success {
    animation: success 0.3s ease-in-out;
  }
`;
document.head.appendChild(style);

export default SudokuBoard;
import React, { useCallback, useMemo } from "react";

const SudokuCell = React.memo(({
  row,
  col,
  value,
  onChange,
  readOnly,
  isError,
  isCompleted,
  isOriginal
}) => {
  const handleChange = useCallback((e) => {
    const newValue = e.target.value;
    if (newValue === '') {
      onChange(row, col, 0);
      return;
    }
    if (/^[1-9]$/.test(newValue)) {
      onChange(row, col, parseInt(newValue, 10));
    }
  }, [onChange, row, col]);

  const handleKeyDown = useCallback((e) => {
    if (readOnly) return;
    if (e.key === 'Backspace' || e.key === 'Delete') {
      onChange(row, col, 0);
    }
  }, [readOnly, onChange, row, col]);

  const cellStyles = useMemo(() => [
    "w-12 h-12 sm:w-14 sm:h-14",
    "text-center text-lg sm:text-xl",
    "transition-all duration-200",
    "outline-none focus:outline-none",
    "relative",
    isOriginal ? [
      "font-bold",
      "text-slate-800",
      "select-none",
      "bg-opacity-40"
    ].join(" ") : [
      "font-medium",
      !isError && "text-indigo-600",
      !readOnly && !isError && "hover:text-indigo-800"
    ].join(" "),
    !readOnly && [
      "cursor-text",
      !isError && "focus:bg-indigo-50",
      "hover:bg-opacity-90",
      "active:scale-95",
      "transform transition-transform"
    ].join(" "),
    isError && [
      "text-red-600",
      "font-bold",
      "animate-wrong-shake",
      "bg-red-50",
      "ring-2 ring-red-500 ring-opacity-50"
    ].join(" "),
    isCompleted && !isOriginal && "text-emerald-600 animate-success",
    readOnly && "cursor-default"
  ].join(" "), [isOriginal, readOnly, isError, isCompleted]);

  return (
    <div className="relative w-full h-full flex items-center justify-center group">
      <input
        type="text"
        inputMode="numeric"
        pattern="[1-9]*"
        value={value !== 0 ? value : ''}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        maxLength={1}
        className={cellStyles}
        disabled={readOnly}
        aria-label={`Celda Sudoku fila ${row + 1}, columna ${col + 1}`}
      />
      {isError && value !== 0 && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
      )}
      {!readOnly && !value && (
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none flex items-center justify-center">
          <span className="text-slate-300 text-xs">1-9</span>
        </div>
      )}
    </div>
  );
});

export default SudokuCell;
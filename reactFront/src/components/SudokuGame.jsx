import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import SudokuBoard from "../components/board";
import { API_URL } from '../config/api';

const LoadingDots = React.memo(() => (
  <div className="flex items-center justify-center space-x-2">
    {[0, 1, 2].map((index) => (
      <div
        key={index}
        className="w-4 h-4 rounded-full bg-blue-500 animate-bounce"
        style={{
          animationDelay: `${index * 0.2}s`,
        }}
      />
    ))}
  </div>
));

const TrophyIcon = React.memo(() => (
  <div className="animate-scale-in">
    <svg 
      className="w-16 h-16 text-yellow-500 animate-spin-slow" 
      fill="currentColor" 
      viewBox="0 0 20 20"
    >
      <path d="M5 3a2 2 0 012-2h6a2 2 0 012 2v2.171c0 .702.403 1.341 1.034 1.64l.764.365a2 2 0 011.202 1.825V10a7.001 7.001 0 01-6 6.93V18a2 2 0 01-2 2h-2a2 2 0 01-2-2v-1.07A7.001 7.001 0 011 10V8.001a2 2 0 011.202-1.825l.764-.365A1.99 1.99 0 004 5.17V3z" />
    </svg>
  </div>
));

const VictoryModal = React.memo(({ isOpen, onClose, completionTime }) => {
  const formatTime = useMemo(() => {
    const minutes = Math.floor(completionTime / 60);
    const remainingSeconds = completionTime % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, [completionTime]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-black/50 backdrop-blur-sm flex items-center justify-center animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full m-4 p-8 animate-slide-up">
        <div className="flex flex-col items-center">
          <TrophyIcon />
          <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mt-6 mb-2 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            ¡Felicitaciones!
          </h3>
          <p className="text-gray-600 text-center animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            Has completado el Sudoku exitosamente
          </p>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 my-8 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <p className="text-sm text-gray-600 text-center mb-2">
            Tu tiempo
          </p>
          <p className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            {formatTime}
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl py-4 px-6 text-lg font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 animate-fade-in-up"
          style={{ animationDelay: '0.5s' }}
        >
          Ir al inicio
        </button>
      </div>
    </div>
  );
});

const SudokuGame = ({ isNewGame }) => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [board, setBoard] = useState([]);
  const [status, setStatus] = useState("in-progress");
  const [isLoading, setIsLoading] = useState(true);
  const [completionTime, setCompletionTime] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const effectExecuted = useRef(false);
  const startTime = useRef(Date.now());

  const createNewGame = useCallback(async () => {
    try {
      const response = await axios.post(`${API_URL}/sudoku/games`);
      const data = response.data;
      const initialBoard = JSON.parse(data.game.board).map(row =>
        row.map(cell => Number(cell))
      );
      setBoard(initialBoard);
      setStatus("in-progress");
      navigate(`/game/${data.game.id}`);
      startTime.current = Date.now();
    } catch (error) {
      console.error("Error creating the game:", error);
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const loadGame = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/sudoku/games/${gameId}`);
      const data = response.data;
      const loadedBoard = JSON.parse(data.game.board).map(row =>
        row.map(cell => (typeof cell === "string" ? cell : Number(cell)))
      );
      setBoard(loadedBoard);
      setStatus(data.game.status);
    } catch (error) {
      console.error("Error loading the game:", error);
    } finally {
      setIsLoading(false);
    }
  }, [gameId]);

  const verifyGame = useCallback(async () => {
    if (gameId) {
      try {
        const verifyResponse = await axios.get(`${API_URL}/sudoku/games/${gameId}/verify`);
        const verifyData = verifyResponse.data;
        if (verifyData.status === "completed") {
          setStatus("completed");
          setCompletionTime(Math.floor((Date.now() - startTime.current) / 1000));
          setShowModal(true);
        }
      } catch (error) {
        console.error("Error verifying game:", error);
      }
    }
  }, [gameId]);

  useEffect(() => {
    if (!effectExecuted.current) {
      if (isNewGame) {
        createNewGame();
      } else if (gameId) {
        loadGame();
      }
      effectExecuted.current = true;
    }
  }, [gameId, loadGame, createNewGame, isNewGame]);

  const handleHome = useCallback(() => {
    setShowModal(false);
    navigate("/menu");
  }, [navigate]);

  const memoizedBoard = useMemo(() => board, [board]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 animate-fade-in">
      <h1 className="text-5xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 animate-slide-down">
        Sudoku
      </h1>
      
      {isLoading ? (
        <LoadingDots />
      ) : (
        <>
          <div className="bg-white rounded-2xl shadow-xl p-6 animate-scale-in">
            <SudokuBoard
              board={memoizedBoard}
              gameId={gameId}
              isGameCompleted={status === "completed"}
              onMoveComplete={verifyGame}
            />
          </div>
          
          <VictoryModal
            isOpen={showModal}
            onClose={handleHome}
            completionTime={completionTime}
          />
        </>
      )}
    </div>
  );
};

// Añadir los estilos de animación
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes spinSlow {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  .animate-fade-in {
    animation: fadeIn 0.5s ease-out;
  }

  .animate-slide-up {
    animation: slideUp 0.5s ease-out;
  }

  .animate-slide-down {
    animation: slideDown 0.5s ease-out;
  }

  .animate-scale-in {
    animation: scaleIn 0.5s ease-out;
  }

  .animate-spin-slow {
    animation: spinSlow 2s linear;
  }

  .animate-fade-in-up {
    opacity: 0;
    animation: slideUp 0.5s ease-out forwards;
  }
`;
document.head.appendChild(style);

export default React.memo(SudokuGame);
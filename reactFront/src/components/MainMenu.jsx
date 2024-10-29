import React, { useState, useEffect, useMemo} from 'react';
import {useNavigate} from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config/api';

const TabButton = React.memo(({ isActive, onClick, children }) => (
  <button 
    onClick={onClick}
    className={`
      relative px-6 py-3 text-sm font-medium transition-all duration-300 transform hover:scale-105
      ${isActive 
        ? 'text-indigo-600' 
        : 'text-gray-600 hover:text-indigo-500'
      }
    `}
  >
    {children}
    {isActive && (
      <span className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></span>
    )}
  </button>
));

const GameCard = React.memo(({ date, buttonText, onClick, isCompleted }) => (
  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:border-indigo-100">
    <div className="space-y-3">
      <span className={`inline-block px-3 py-1.5 text-xs font-medium rounded-full ${
        isCompleted 
          ? 'bg-gradient-to-r from-emerald-400 to-teal-400 text-white'
          : 'bg-gradient-to-r from-indigo-400 to-purple-400 text-white'
      }`}>
        {isCompleted ? '¡Completado! 🎉' : 'En progreso 🎮'}
      </span>
      <div>
        <p className="text-sm text-gray-500">
          {isCompleted ? 'Terminado' : 'Iniciado'} el
        </p>
        <p className="text-base font-medium text-gray-900">
          {new Date(date).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </div>
    </div>
    <button 
      onClick={onClick}
      className="mt-4 w-full inline-flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-medium rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-[1.02] shadow-md hover:shadow-lg"
    >
      {buttonText}
      <svg className="ml-2 w-4 h-4 animate-bounce-x" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
      </svg>
    </button>
  </div>
));

const EmptyState = React.memo(({ message }) => (
  <div className="col-span-full text-center py-12">
    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-indigo-50 to-purple-50 mb-4 animate-pulse">
      <svg className="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
      </svg>
    </div>
    <p className="text-gray-500 animate-fade-in">{message}</p>
  </div>
));

const MainMenu = React.memo(() => {
  const { userId, userInfo, isLoadingUser, logout } = useAuth();
  const navigate = useNavigate();
  const [unfinishedGames, setUnfinishedGames] = useState([]);
  const [finishedGames, setFinishedGames] = useState([]);
  const [activeTab, setActiveTab] = useState('unfinished');
  const [isLoading, setIsLoading] = useState(true);
  const [isLogoutPanelVisible, setLogoutPanelVisible] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchUserGames();
    }
  }, [userId]);

  const fetchUserGames = async () => {
    try {
      const response = await axios.get(`${API_URL}/sudoku/user/${userId}`);
      setUnfinishedGames(response.data.unfinished_games || []);
      setFinishedGames(response.data.finished_games || []);
    } catch (error) {
      console.error('Error fetching user games:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLogoutPanel = () => {
    setLogoutPanelVisible(prev => !prev);
  };

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const handleNewGame = async () => {
    try {
      const response = await axios.post(`${API_URL}/sudoku/games`, {
        user_id: userId,
      });
      navigate(`/game/${response.data.game.id}`);
    } catch (error) {
      console.error('Error creating a new game:', error);
    }
  };

  const getUserDisplayName = () => {
    if (isLoadingUser) return '...';
    if (userInfo.user?.username) return userInfo.user.username;  // Changed from nickname to username
    if (userInfo.user?.email) return userInfo.user.email.split('@')[0];
    return 'Jugador Anónimo';  // Changed default fallback
  };

  const activeGames = useMemo(() => {
    return activeTab === 'unfinished' ? unfinishedGames : finishedGames;
  }, [activeTab, unfinishedGames, finishedGames]);

  return (
     <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-12 space-y-4">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent animate-fade-in">
            Sudoku Master
          </h1>
          <div className="relative">
            <button 
              onClick={toggleLogoutPanel} 
              className="text-lg font-medium inline-flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-white hover:shadow-md transition-all duration-300"
            >
              <span className="text-gray-700">{getUserDisplayName()}</span>
              <svg 
                className="w-5 h-5 text-gray-500" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isLogoutPanelVisible && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-10">
                <button 
                  onClick={handleLogout} 
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>

        {/* New Game Button */}
        <div className="mb-12">
          <button
            onClick={handleNewGame}
            className="w-full max-w-md mx-auto bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-8 py-4 rounded-xl font-medium hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-xl flex items-center justify-center space-x-3"
          >
            <svg className="w-6 h-6 animate-spin-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Nueva aventura Sudoku</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <div className="flex space-x-8 justify-center">
            <TabButton 
              isActive={activeTab === 'unfinished'}
              onClick={() => setActiveTab('unfinished')}
            >
              En progreso 🎮
            </TabButton>
            <TabButton 
              isActive={activeTab === 'completed'}
              onClick={() => setActiveTab('completed')}
            >
              Completados 🏆
            </TabButton>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <div className="space-x-2">
              <div className="w-4 h-4 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 inline-block animate-bounce"></div>
              <div className="w-4 h-4 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 inline-block animate-bounce" style={{animationDelay: '0.2s'}}></div>
              <div className="w-4 h-4 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 inline-block animate-bounce" style={{animationDelay: '0.4s'}}></div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {activeGames.length > 0 ? (
              activeGames.map((game) => (
                <GameCard
                  key={game.id}
                  date={game.created_at}
                  buttonText={activeTab === 'unfinished' ? "¡Continuar la aventura!" : "Revivir la victoria"}
                  onClick={() => navigate(`/game/${game.id}`)}
                  isCompleted={activeTab === 'completed'}
                />
              ))
            ) : (
              <EmptyState 
                message={activeTab === 'unfinished' 
                  ? "¡No hay partidas en progreso! ¿Por qué no empiezas una nueva aventura? 🎮" 
                  : "¡Aún no has completado ningún Sudoku! ¡Tú puedes hacerlo! 🎯"
                } 
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
});



// Añadimos keyframes para las nuevas animaciones
const style = document.createElement('style');
style.textContent = `
  @keyframes bounce-x {
    0%, 100% { transform: translateX(0); }
    50% { transform: translateX(3px); }
  }
  @keyframes fade-in {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes fade-in-delayed {
    0% { opacity: 0; transform: translateY(10px); }
    50% { opacity: 0; transform: translateY(10px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin-slow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);

export default MainMenu;
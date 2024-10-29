import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from "../context/AuthContext"; // Importa el contexto
import { API_URL } from '../config/api';

// Componente de input reutilizable
const FormInput = React.memo(({ 
  label, 
  type, 
  value, 
  onChange, 
  error, 
  name,
  placeholder,
  icon: Icon 
}) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={name}>
      {label}
    </label>
    <div className="relative">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-gray-400" />
        </div>
      )}
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`
          w-full px-4 py-2 ${Icon ? 'pl-10' : ''} 
          rounded-lg border transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-blue-500
          ${error ? 'border-red-500 bg-red-50' : 'border-gray-300'}
        `}
      />
    </div>
    {error && (
      <p className="mt-1 text-sm text-red-600 animate-shake">
        {error}
      </p>
    )}
  </div>
));

// Componente de botón reutilizable
const Button = React.memo(({ children, onClick, isLoading, type = 'button' }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={isLoading}
    className={`
      w-full px-4 py-2 rounded-lg font-medium
      transition-all duration-200
      bg-gradient-to-r from-blue-600 to-blue-500
      hover:from-blue-700 hover:to-blue-600
      text-white shadow-md hover:shadow-lg
      disabled:opacity-50 disabled:cursor-not-allowed
      transform hover:-translate-y-0.5
    `}
  >
    {isLoading ? (
      <div className="flex items-center justify-center">
        <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin mr-2" />
        Procesando...
      </div>
    ) : children}
  </button>
));

// Componente de mensaje de error/éxito
const Alert = React.memo(({ type, message }) => {
  if (!message) return null;

  const styles = {
    success: 'bg-green-100 border-green-500 text-green-700',
    error: 'bg-red-100 border-red-500 text-red-700'
  };

  return (
    <div className={`${styles[type]} px-4 py-3 rounded border-l-4 mb-4 animate-fade-in`}>
      {message}
    </div>
  );
});

// Íconos como componentes memorizados
const EmailIcon = React.memo(() => (
  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
  </svg>
));

const LockIcon = React.memo(() => (
  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
  </svg>
));

const UserIcon = React.memo(() => (
  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
  </svg>
));

// Validadores
const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return 'El email es requerido';
  if (!re.test(email)) return 'Email inválido';
  return '';
};

const validatePassword = (password) => {
  if (!password) return 'La contraseña es requerida';
  if (password.length < 8) return 'La contraseña debe tener al menos 8 caracteres';
  return '';
};

const validateName = (name) => {
  if (!name) return 'El nombre es requerido';
  if (name.length < 2) return 'El nombre debe tener al menos 2 caracteres';
  return '';
};

// Componente Login
const Login = () => {
  const { setUserId } = useAuth(); // Obtén setUserId desde el contexto
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState({ type: '', message: '' });

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  }, []);

  const validateForm = useCallback(() => {
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);
    
    setErrors({
      email: emailError,
      password: passwordError
    });

    return !emailError && !passwordError;
  }, [formData]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setAlert({ type: '', message: '' });

    try {
        const response = await axios.post(`${API_URL}/users/login`, formData);
        setAlert({
            type: 'success',
            message: '¡Inicio de sesión exitoso!'
        });

        const userId = response.data.user.id; // Asegúrate de que la respuesta contenga user.id
        localStorage.setItem('userId', userId); // Almacena el userId en el localStorage
        setUserId(userId); // También actualiza el estado de userId en el contexto

        // Redirige a la ruta base sin el userId en la URL
        setTimeout(() => navigate('/menu'), 1500);
    } catch (error) {
        setAlert({
            type: 'error',
            message: error.response?.data?.message || 'Error al iniciar sesión'
        });
    } finally {
        setIsLoading(false);
    }
}, [formData, navigate, validateForm]);

  
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 animate-fade-in">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            Iniciar Sesión
          </h2>
          <p className="mt-2 text-gray-600">
            Ingresa tus credenciales para continuar
          </p>
        </div>

        <Alert {...alert} />

        <form onSubmit={handleSubmit} className="space-y-6">
          <FormInput
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="tu@email.com"
            icon={EmailIcon}
          />

          <FormInput
            label="Contraseña"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            placeholder="••••••••"
            icon={LockIcon}
          />

          <Button type="submit" isLoading={isLoading}>
            Iniciar Sesión
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          ¿No tienes una cuenta?{' '}
          <button 
            onClick={() => navigate('/register')}
            className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
          >
            Regístrate aquí
          </button>
        </p>
      </div>
    </div>
  );
};

// Componente Register
const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '', // Cambiar de 'name' a 'username'
    email: '',
    password: '',
  });  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState({ type: '', message: '' });

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  }, []);

  const validateForm = useCallback(() => {
    const nameError = validateName(formData.username); // Cambiar 'formData.name' a 'formData.username'
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);
  
    setErrors({
      username: nameError, // Cambiar de 'name' a 'username'
      email: emailError,
      password: passwordError,
    });
  
    console.log({nameError, emailError, passwordError}); // Verifica los errores
  
    return !nameError && !emailError && !passwordError;
  }, [formData]);
  

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    console.log("Formulario enviado"); // Agrega este log
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setAlert({ type: '', message: '' });
  
    try {
      const response = await axios.post(`${API_URL}/users`, formData);
      setAlert({
        type: 'success',
        message: '¡Registro exitoso! Redirigiendo...'
      });
      setTimeout(() => navigate('/'), 1500);
    } catch (error) {
      setAlert({
        type: 'error',
        message: error.response?.data?.message || 'Error al registrar'
      });
    } finally {
      setIsLoading(false);
    }
  }, [formData, navigate, validateForm]);
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 animate-fade-in">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            Crear Cuenta
          </h2>
          <p className="mt-2 text-gray-600">
            Completa el formulario para registrarte
          </p>
        </div>

        <Alert {...alert} />

        <form onSubmit={handleSubmit} className="space-y-6">
        <FormInput
          label="Nombre"
          type="text"
          name="username" // Cambiar de 'name' a 'username'
          value={formData.username} // Cambiar de 'formData.name' a 'formData.username'
          onChange={handleChange}
          error={errors.username} // Cambiar de 'errors.name' a 'errors.username'
          placeholder="Tu nombre"
          icon={UserIcon}
        />

          <FormInput
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="tu@email.com"
            icon={EmailIcon}
          />

          <FormInput
            label="Contraseña"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            placeholder="••••••••"
            icon={LockIcon}
          />


          <Button type="submit" isLoading={isLoading}>
            Registrarse
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          ¿Ya tienes una cuenta?{' '}
          <button 
            onClick={() => navigate('/')}
            className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
          >
            Inicia sesión aquí
          </button>
        </p>
      </div>
    </div>
  );
};

// Añadir estilos de animación
const style = document.createElement('style');
style.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-4px); }
    75% { transform: translateX(4px); }
  }

  .animate-shake {
    animation: shake 0.5s ease-in-out;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .animate-fade-in {
    animation: fadeIn 0.3s ease-out;
  }
`;
document.head.appendChild(style);

export { Login, Register };
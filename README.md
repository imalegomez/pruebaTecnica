# Sudoku Master

## Descripción del Proyecto

**Sudoku Master** es un juego de Sudoku interactivo que permite a los usuarios jugar, guardar su progreso y verificar sus soluciones. El juego está desarrollado utilizando **Laravel** para el backend y **React** para el frontend, proporcionando una experiencia de usuario fluida y atractiva.

## Características

- Generación automática de tableros de Sudoku.
- Interfaz intuitiva para jugar y editar el tablero.
- Verificación automática de soluciones.
- Guardado y recuperación del progreso del juego.
- Registro y autenticación de usuarios.
- Visualización de la solución del tablero.
- Modal de finalización que muestra el tiempo de juego.

## Requisitos Previos

Asegúrate de tener instalados los siguientes componentes:

- [Docker](https://www.docker.com/get-started) 
- [Docker Compose](https://docs.docker.com/compose/install/) 

## Instalación

1. **Clonar el Repositorio**

   ```bash
   git clone https://github.com/imalegomez/pruebaTecnica.git
   cd pruebaTecnica

2. **Cambiar de rama a dev**

   ```bash
   git checkout dev

3. **Iniciar Docker-Compose**

    ```bash
    docker-compose up --build

4. **Acceder al juego**
  Abre tu navegador y ve a http://localhost:3000 para acceder a Sudoku Master.

## Uso

- **Registro de Usuarios:** Los nuevos usuarios pueden registrarse a través del formulario de registro.
- **Inicio de Sesión:** Los usuarios existentes pueden iniciar sesión utilizando sus credenciales.
- **Jugar:** Selecciona un juego de Sudoku, ingresa tus respuestas y verifica si son correctas.
- **Guardar Progreso:** Tu progreso se guarda automáticamente mientras juegas.
- **Ver Solución:** Al finalizar, puedes ver la solución del tablero.

## Guía de API

### Endpoints Disponibles

1. **POST `/sudoku/games`**
   - Crea un nuevo juego de Sudoku.
   - **Request Body:**
     ```json
     {
       "user_id": 1 // ID del usuario (opcional)
     }
     ```

2. **GET `/sudoku/games/{id}`**
   - Obtiene un juego específico por su ID.

3. **POST `/sudoku/games/{id}/moves`**
   - Este endpoint permite realizar un movimiento en el juego de Sudoku especificado por su ID.
   - **Request Body:**
     ```json
      {
        "row": 0,  // Fila de la celda (0-8)
        "col": 0,  // Columna de la celda (0-8)
        "value": 5 // Valor ingresado por el usuario (0-9, puede ser nulo)
      }
     ```

4. **GET `/sudoku/games/{id}/solution`**
   - Obtiene la solución del juego especificado por su ID.

5. **GET `/sudoku/games/{id}/verify`**
   - Verifica el estado del juego especificado por su ID.

6. **PUT `/sudoku/games/{id}/update`**
   - Actualiza el tablero del juego especificado por su ID.

7. **GET `/sudoku/user/{id}`**
   - Obtiene los juegos de un usuario por su ID.

8. **POST `/users`**
   - Crea un nuevo usuario.
   - **Request Body:**
     ```json
     {
       "username": "ejemplo",
       "password": "contraseña",
       "email": "correo@ejemplo.com"
     }
     ```

9. **GET `/users/{id}`**
   - Obtiene un usuario por su ID.
  
10. **POST `/users/login`**
   - **Descripción:** Inicia sesión para un usuario existente.
   - **Request Body:**
     ```json
     {
       "email": "correo@ejemplo.com",     // Nombre de usuario
       "password": "contraseña"    // Contraseña del usuario
     }
     ```
   - **Respuesta Exitosa:**
     - Código: `200 OK`
     - Cuerpo: JSON con la información del usuario y posiblemente un token de sesión.


<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class UserController extends Controller
{
    public function createUser(Request $request)
    {
        try {
            // Validación de los campos necesarios
            $validatedData = $request->validate([
                'username' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users',
                'password' => 'required|string|min:8',
            ]);

            // Creación del usuario
            $user = User::create([
                'username' => $validatedData['username'],
                'email' => $validatedData['email'],
                'password' => Hash::make($validatedData['password']),
            ]);

            // Esconder el password hash del objeto de usuario
            $user->makeHidden(['password']);

            // Retornar el usuario creado
            return response()->json(['user' => $user], 201);
        } catch (ValidationException $e) {
            // Si falla la validación, devolver errores
            return response()->json(['errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            // Manejo de errores generales
            return response()->json(['error' => 'Failed to create user: ' . $e->getMessage()], 500);
        }
    }
    
    public function getUser($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        // Esconder el password hash del objeto de usuario
        $user->makeHidden(['password']);

        return response()->json(['user' => $user], 200);
    }

    public function login(Request $request)
    {
        try {
            // Validar las credenciales recibidas
            $validatedData = $request->validate([
                'email' => 'required|string|email',
                'password' => 'required|string',
            ]);

            // Buscar el usuario por email
            $user = User::where('email', $validatedData['email'])->first();

            // Verificar si el usuario existe y si la contraseña es correcta
            if (!$user || !Hash::check($validatedData['password'], $user->password)) {
                // Lanzar una excepción si las credenciales no son válidas
                throw ValidationException::withMessages([
                    'email' => ['The provided credentials are incorrect.'],
                ]);
            }

            // Esconder el password hash del objeto de usuario
            $user->makeHidden(['password']);

            // Retornar la respuesta de éxito con los datos del usuario
            return response()->json(['message' => 'Login successful', 'user' => $user], 200);

        } catch (ValidationException $e) {
            // Si falla la validación, devolver errores
            return response()->json(['errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            // Manejo de errores generales
            return response()->json(['error' => 'Failed to login: ' . $e->getMessage()], 500);
        }
    }  
}
import React, { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import type { User } from "firebase/auth";

import { auth } from "../../config/firebase"; // Asegúrate de que esta ruta esté correcta

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

/**
 * Proveedor de contexto de autenticación para la aplicación.
 *
 * Este componente envuelve a sus hijos con un contexto que proporciona el usuario autenticado,
 * el estado de carga y las funciones de inicio y cierre de sesión.
 *
 * - `user`: El usuario autenticado actualmente, o `null` si no hay usuario autenticado.
 * - `loading`: Indica si la autenticación está en proceso de verificación.
 * - `login`: Función asíncrona para iniciar sesión con correo electrónico y contraseña.
 * - `logout`: Función asíncrona para cerrar la sesión del usuario actual.
 *    - Al cerrar sesión, se realiza un signOut con Firebase Auth.
 *    - Si la operación es exitosa, se muestra un mensaje en consola.
 *    - Si ocurre un error, se muestra el error en consola.
 *
 * @param children Los componentes hijos que tendrán acceso al contexto de autenticación.
 * @returns Un proveedor de contexto que expone el usuario, el estado de carga y las funciones de autenticación.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    setUser(userCredential.user); // <- Aquí actualizamos el contexto
    return userCredential.user;
  };

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
      console.log("Sesión cerrada correctamente");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

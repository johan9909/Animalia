import sqliteService from './sqlite.service';

class AuthService {
  async login(email: string, password: string) {
    try {
      // ⭐ Ahora getUserByEmail es async
      const user = await sqliteService.getUserByEmail(email);
      
      if (user && user.password === password) {
        sqliteService.setCurrentUser(user);
        return { success: true, user };
      }
      
      return { success: false, message: 'Email o contraseña incorrectos' };
    } catch (error) {
      console.error('Error en login:', error);
      return { success: false, message: 'Error al iniciar sesión' };
    }
  }

  async register(userData: any) {
    try {
      // ⭐ Verificar si el usuario ya existe (async)
      const existingUser = await sqliteService.getUserByEmail(userData.email);
      
      if (existingUser) {
        return { success: false, message: 'El email ya está registrado' };
      }

      // ⭐ Crear nuevo usuario en SQLite (async)
      const newUserId = await sqliteService.addUser(userData);
      
      // ⭐ Obtener el usuario completo (async)
      const newUser = await sqliteService.getUserByEmail(userData.email);
      
      if (newUser) {
        sqliteService.setCurrentUser(newUser);
        return { success: true, user: newUser };
      }

      return { success: false, message: 'Error al crear usuario' };
    } catch (error) {
      console.error('Error en register:', error);
      return { success: false, message: 'Error al registrar usuario' };
    }
  }

  logout() {
    sqliteService.clearCurrentUser();
  }

  getCurrentUser() {
    // Este método sigue siendo síncrono porque lee de localStorage
    return sqliteService.getCurrentUser();
  }

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  // ⭐ Actualizar para que también actualice en la BD
  async updateCurrentUser(userData: any) {
    try {
      const currentUser = this.getCurrentUser();
      
      if (!currentUser) {
        throw new Error('No hay usuario autenticado');
      }

      // Actualizar en la base de datos
      await sqliteService.updateUser(currentUser.id, userData);
      
      // Actualizar en localStorage
      const updatedUser = { ...currentUser, ...userData };
      sqliteService.setCurrentUser(updatedUser);
      
      return { success: true, user: updatedUser };
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      return { success: false, message: 'Error al actualizar usuario' };
    }
  }

  // ⭐ NUEVO: Método para refrescar el usuario desde la BD
  async refreshCurrentUser() {
    try {
      const currentUser = this.getCurrentUser();
      
      if (!currentUser) {
        return null;
      }

      // Obtener datos actualizados de la BD
      const refreshedUser = await sqliteService.getUserByEmail(currentUser.email);
      
      if (refreshedUser) {
        sqliteService.setCurrentUser(refreshedUser);
        return refreshedUser;
      }
      
      return null;
    } catch (error) {
      console.error('Error al refrescar usuario:', error);
      return null;
    }
  }
}

export default new AuthService();
import sqliteService from './sqlite.service';

class AuthService {
  async login(email: string, password: string) {
    const user = sqliteService.getUserByEmail(email);
    
    if (user && user.password === password) {
      sqliteService.setCurrentUser(user);
      return { success: true, user };
    }
    
    return { success: false, message: 'Email o contraseña incorrectos' };
  }

  async register(userData: any) {
    const existingUser = sqliteService.getUserByEmail(userData.email);
    
    if (existingUser) {
      return { success: false, message: 'El email ya está registrado' };
    }

    // Crear nuevo usuario en SQLite
    const newUserId = sqliteService.addUser(userData);
    
    // Obtener el usuario completo
    const newUser = sqliteService.getUserByEmail(userData.email);
    
    if (newUser) {
      sqliteService.setCurrentUser(newUser);
      return { success: true, user: newUser };
    }

    return { success: false, message: 'Error al crear usuario' };
  }

  logout() {
    sqliteService.clearCurrentUser();
  }

  getCurrentUser() {
    return sqliteService.getCurrentUser();
  }

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  updateCurrentUser(user: any) {
    sqliteService.setCurrentUser(user);
  }
}

export default new AuthService();
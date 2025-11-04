import databaseService from './database.service';

class AuthService {
  async login(email: string, password: string) {
    const users = databaseService.getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
      databaseService.setCurrentUser(user);
      return { success: true, user };
    }
    
    return { success: false, message: 'Email o contraseña incorrectos' };
  }

  async register(userData: any) {
    const users = databaseService.getUsers();
    
    // Verificar si el email ya existe
    if (users.find(u => u.email === userData.email)) {
      return { success: false, message: 'El email ya está registrado' };
    }

    // Crear nuevo usuario
    const newUser = {
      id: users.length + 1,
      ...userData
    };

    users.push(newUser);
    databaseService.saveUsers(users);
    databaseService.setCurrentUser(newUser);

    return { success: true, user: newUser };
  }

  logout() {
    databaseService.clearCurrentUser();
  }

  getCurrentUser() {
    return databaseService.getCurrentUser();
  }

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }
}

export default new AuthService();
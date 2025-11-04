class DatabaseService {
  private readonly USERS_KEY = 'animalia_users';
  private readonly PETS_KEY = 'animalia_pets';
  private readonly APPOINTMENTS_KEY = 'animalia_appointments';
  private readonly CURRENT_USER_KEY = 'animalia_current_user';

  // Inicializar base de datos con datos de prueba
  async initDatabase() {
    const users = this.getUsers();
    if (users.length === 0) {
      // Crear usuarios de prueba
      this.saveUsers([
        {
          id: 1,
          nombre: 'Juan Pérez',
          email: 'juan@cliente.com',
          password: '123456',
          telefono: '+57 300 123 4567',
          direccion: 'Calle 100 #15-20, Bogotá',
          tipo: 'cliente'
        },
        {
          id: 2,
          nombre: 'Dr. Ricardo López',
          email: 'ricardo@vet.com',
          password: '123456',
          telefono: '+57 301 234 5678',
          tipo: 'veterinario',
          especialidad: 'Medicina General Veterinaria',
          licencia: 'MV-12345',
          horario: 'Lun-Vie: 8AM-6PM',
          experiencia: 8
        }
      ]);

      // Crear mascotas de prueba
      this.savePets([
        {
          id: 1,
          nombre: 'Max',
          especie: 'Perro',
          raza: 'Labrador',
          edad: 3,
          peso: 28,
          color: 'Dorado',
          clienteId: 1,
          vacunas: [
            { nombre: 'Rabia', fecha: '2024-08-15' },
            { nombre: 'Parvovirus', fecha: '2024-07-20' }
          ]
        },
        {
          id: 2,
          nombre: 'Luna',
          especie: 'Gato',
          raza: 'Siamés',
          edad: 2,
          peso: 4,
          color: 'Blanco',
          clienteId: 1,
          vacunas: [
            { nombre: 'Triple Felina', fecha: '2024-06-10' }
          ]
        }
      ]);

      // Crear citas de prueba
      this.saveAppointments([
        {
          id: 1,
          fecha: '2024-11-02',
          horaInicio: '10:00',
          horaFin: '10:45',
          mascotaId: 1,
          clienteId: 1,
          veterinarioId: 2,
          servicio: 'Control Veterinario',
          precio: 50000,
          estado: 'confirmada'
        }
      ]);
    }
  }

  // Métodos para Users
  getUsers(): any[] {
    const data = localStorage.getItem(this.USERS_KEY);
    return data ? JSON.parse(data) : [];
  }

  saveUsers(users: any[]) {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  }

  // Métodos para Pets
  getPets(): any[] {
    const data = localStorage.getItem(this.PETS_KEY);
    return data ? JSON.parse(data) : [];
  }

  savePets(pets: any[]) {
    localStorage.setItem(this.PETS_KEY, JSON.stringify(pets));
  }

  // Métodos para Appointments
  getAppointments(): any[] {
    const data = localStorage.getItem(this.APPOINTMENTS_KEY);
    return data ? JSON.parse(data) : [];
  }

  saveAppointments(appointments: any[]) {
    localStorage.setItem(this.APPOINTMENTS_KEY, JSON.stringify(appointments));
  }

  // Usuario actual
  getCurrentUser(): any | null {
    const data = localStorage.getItem(this.CURRENT_USER_KEY);
    return data ? JSON.parse(data) : null;
  }

  setCurrentUser(user: any) {
    localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
  }

  clearCurrentUser() {
    localStorage.removeItem(this.CURRENT_USER_KEY);
  }
}

export default new DatabaseService();
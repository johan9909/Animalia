import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { Capacitor } from '@capacitor/core';
import { INITIAL_DATA } from './db-schema';

class SQLiteService {
  private sqlite: SQLiteConnection;
  private db: SQLiteDBConnection | null = null;
  private dbName = 'animalia.db';
  private isWeb = Capacitor.getPlatform() === 'web';

  constructor() {
    this.sqlite = new SQLiteConnection(CapacitorSQLite);
  }

  async initDB() {
    try {
      if (this.isWeb) {
        // Para web, necesitas inicializar jeep-sqlite
        await this.initWebStore();
      }

      // Crear o abrir la base de datos
      this.db = await this.sqlite.createConnection(
        this.dbName,
        false, // encrypted
        'no-encryption',
        1, // version
        false // readonly
      );

      await this.db.open();

      // Verificar si ya hay datos
      const tablesExist = await this.checkIfTablesExist();
      
      if (!tablesExist) {
        await this.createTables();
        await this.insertInitialData();
        console.log('✅ Nueva base de datos creada con datos iniciales');
      } else {
        console.log('✅ Base de datos existente cargada');
      }

      return true;
    } catch (error) {
      console.error('❌ Error al inicializar SQLite:', error);
      return false;
    }
  }

  private async initWebStore() {
    // Solo para web - inicializar jeep-sqlite
    const jeepSqlite = document.createElement('jeep-sqlite');
    document.body.appendChild(jeepSqlite);
    await customElements.whenDefined('jeep-sqlite');
    await this.sqlite.initWebStore();
  }

  private async checkIfTablesExist(): Promise<boolean> {
  try {
    if (!this.db) return false;
    
    const query = `SELECT name FROM sqlite_master WHERE type='table' AND name='users'`;
    const result = await this.db.query(query);
    
    // ⭐ Corrección del error de TypeScript
    return !!(result.values && result.values.length > 0);
  } catch (error) {
    console.error('Error checking tables:', error);
    return false;
  }
}
  private async createTables() {
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        telefono TEXT,
        direccion TEXT,
        tipo TEXT NOT NULL,
        especialidad TEXT,
        licencia TEXT,
        horario TEXT,
        experiencia INTEGER
      )
    `;

    const createPetsTable = `
      CREATE TABLE IF NOT EXISTS pets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        especie TEXT NOT NULL,
        raza TEXT NOT NULL,
        edad INTEGER NOT NULL,
        peso REAL NOT NULL,
        color TEXT,
        clienteId INTEGER NOT NULL
      )
    `;

    const createVaccinesTable = `
      CREATE TABLE IF NOT EXISTS vaccines (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        petId INTEGER NOT NULL,
        nombre TEXT NOT NULL,
        fecha TEXT NOT NULL
      )
    `;

    const createAppointmentsTable = `
      CREATE TABLE IF NOT EXISTS appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fecha TEXT NOT NULL,
        horaInicio TEXT NOT NULL,
        horaFin TEXT NOT NULL,
        mascotaId INTEGER NOT NULL,
        clienteId INTEGER NOT NULL,
        veterinarioId INTEGER NOT NULL,
        servicio TEXT NOT NULL,
        precio REAL,
        estado TEXT NOT NULL,
        diagnostico TEXT,
        tratamiento TEXT,
        sintomas TEXT,
        temperatura REAL,
        pesoActual REAL
      )
    `;

    await this.db!.execute(createUsersTable);
    await this.db!.execute(createPetsTable);
    await this.db!.execute(createVaccinesTable);
    await this.db!.execute(createAppointmentsTable);
  }

  private async insertInitialData() {
    // Insertar usuarios
    for (const user of INITIAL_DATA.users) {
      await this.db!.run(
        `INSERT INTO users (nombre, email, password, telefono, direccion, tipo, especialidad, licencia, horario, experiencia) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          user.nombre,
          user.email,
          user.password,
          user.telefono,
          user.direccion || null,
          user.tipo,
          user.especialidad || null,
          user.licencia || null,
          user.horario || null,
          user.experiencia || null
        ]
      );
    }

    // Insertar mascotas
    for (const pet of INITIAL_DATA.pets) {
      await this.db!.run(
        `INSERT INTO pets (nombre, especie, raza, edad, peso, color, clienteId) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [pet.nombre, pet.especie, pet.raza, pet.edad, pet.peso, pet.color, pet.clienteId]
      );
    }

    // Insertar vacunas
    for (const vaccine of INITIAL_DATA.vaccines) {
      await this.db!.run(
        `INSERT INTO vaccines (petId, nombre, fecha) VALUES (?, ?, ?)`,
        [vaccine.petId, vaccine.nombre, vaccine.fecha]
      );
    }

    // Insertar citas
    for (const appt of INITIAL_DATA.appointments) {
      await this.db!.run(
        `INSERT INTO appointments (fecha, horaInicio, horaFin, mascotaId, clienteId, veterinarioId, servicio, precio, estado) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          appt.fecha,
          appt.horaInicio,
          appt.horaFin,
          appt.mascotaId,
          appt.clienteId,
          appt.veterinarioId,
          appt.servicio,
          appt.precio,
          appt.estado
        ]
      );
    }
  }

  // ==================== MÉTODOS CRUD ====================

  // USERS
  async getUsers() {
    const result = await this.db!.query('SELECT * FROM users');
    return result.values || [];
  }

  async getUserByEmail(email: string) {
    const result = await this.db!.query('SELECT * FROM users WHERE email = ?', [email]);
    return result.values && result.values.length > 0 ? result.values[0] : null;
  }

  async addUser(user: any) {
    const result = await this.db!.run(
      `INSERT INTO users (nombre, email, password, telefono, direccion, tipo, especialidad, licencia, horario, experiencia) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user.nombre,
        user.email,
        user.password,
        user.telefono || null,
        user.direccion || null,
        user.tipo,
        user.especialidad || null,
        user.licencia || null,
        user.horario || null,
        user.experiencia || null
      ]
    );
    
    return result.changes?.lastId;
  }

  async updateUser(id: number, user: any) {
    await this.db!.run(
      `UPDATE users 
       SET nombre = ?, 
           email = ?, 
           telefono = ?, 
           direccion = ?, 
           especialidad = ?, 
           licencia = ?, 
           experiencia = ?, 
           horario = ?
       WHERE id = ?`,
      [
        user.nombre,
        user.email,
        user.telefono || null,
        user.direccion || null,
        user.especialidad || null,
        user.licencia || null,
        user.experiencia || null,
        user.horario || null,
        id
      ]
    );
  }

  // PETS
  async getPets() {
    const result = await this.db!.query('SELECT * FROM pets');
    const pets = result.values || [];
    
    // Agregar vacunas a cada mascota
    const petsWithVaccines = [];
    for (const pet of pets) {
      const vaccinesResult = await this.db!.query('SELECT * FROM vaccines WHERE petId = ?', [pet.id]);
      const vacunas = vaccinesResult.values || [];
      petsWithVaccines.push({ ...pet, vacunas });
    }
    
    return petsWithVaccines;
  }

  async addPet(pet: any) {
    const result = await this.db!.run(
      `INSERT INTO pets (nombre, especie, raza, edad, peso, color, clienteId) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [pet.nombre, pet.especie, pet.raza, pet.edad, pet.peso, pet.color || null, pet.clienteId]
    );
    
    return result.changes?.lastId;
  }

  async updatePet(id: number, pet: any) {
    await this.db!.run(
      `UPDATE pets 
       SET nombre = ?, especie = ?, raza = ?, edad = ?, peso = ?, color = ?
       WHERE id = ?`,
      [
        pet.nombre,
        pet.especie,
        pet.raza,
        pet.edad,
        pet.peso,
        pet.color || null,
        id
      ]
    );
  }

  // VACCINES
  async addVaccine(vaccine: any) {
    const result = await this.db!.run(
      `INSERT INTO vaccines (petId, nombre, fecha) VALUES (?, ?, ?)`,
      [vaccine.petId, vaccine.nombre, vaccine.fecha]
    );
    
    return result.changes?.lastId;
  }

  async deleteVaccine(id: number) {
    await this.db!.run(`DELETE FROM vaccines WHERE id = ?`, [id]);
  }

  // APPOINTMENTS
  async getAppointments() {
    const result = await this.db!.query('SELECT * FROM appointments');
    return result.values || [];
  }

  async addAppointment(appointment: any) {
    const result = await this.db!.run(
      `INSERT INTO appointments 
        (fecha, horaInicio, horaFin, mascotaId, clienteId, veterinarioId, servicio, precio, estado, sintomas) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        appointment.fecha,
        appointment.horaInicio,
        appointment.horaFin,
        appointment.mascotaId,
        appointment.clienteId,
        appointment.veterinarioId,
        appointment.servicio,
        appointment.precio || null,
        appointment.estado || 'pendiente',
        appointment.sintomas || null
      ]
    );
    
    return result.changes?.lastId;
  }

  async updateAppointment(id: number, appointment: any) {
    await this.db!.run(
      `UPDATE appointments 
       SET diagnostico = ?, tratamiento = ?, sintomas = ?, temperatura = ?, pesoActual = ?, estado = ?  
       WHERE id = ?`,
      [
        appointment.diagnostico || null,
        appointment.tratamiento || null,
        appointment.sintomas || null,
        appointment.temperatura || null,
        appointment.pesoActual || null,
        appointment.estado,
        id
      ]
    );
  }

  async updateAppointmenClient(id: number, appointment: any) {
    await this.db!.run(
      `UPDATE appointments 
       SET fecha = ?, horaInicio = ?, horaFin = ?, mascotaId = ?, veterinarioId = ?, servicio = ?, sintomas = ?, estado = ?
       WHERE id = ?`,
      [
        appointment.fecha,
        appointment.horaInicio,
        appointment.horaFin,
        appointment.mascotaId,
        appointment.veterinarioId,
        appointment.servicio,
        appointment.sintomas || null,
        appointment.estado || null,
        id
      ]
    );
  }

  async cancelAppointment(id: number, appointment: any) {
    await this.db!.run(
      `UPDATE appointments 
       SET estado = ?
       WHERE id = ?`,
      [
        appointment.estado || null,
        id
      ]
    );
  }

  // Usuario actual (mantenemos en localStorage por compatibilidad)
  getCurrentUser() {
    const data = localStorage.getItem('animalia_current_user');
    return data ? JSON.parse(data) : null;
  }

  setCurrentUser(user: any) {
    localStorage.setItem('animalia_current_user', JSON.stringify(user));
  }

  clearCurrentUser() {
    localStorage.removeItem('animalia_current_user');
  }

  // Método para cerrar la conexión
  async closeConnection() {
    if (this.db) {
      await this.sqlite.closeConnection(this.dbName, false);
      this.db = null;
    }
  }
}

export default new SQLiteService();
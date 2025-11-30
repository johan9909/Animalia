import { INITIAL_DATA } from './db-schema';

class SQLiteService {
  private db: any = null;
  private SQL: any = null;

  async initDB() {
    try {
      // Cargar sql.js
      const initSqlJs = (window as any).initSqlJs;
      this.SQL = await initSqlJs({
        locateFile: (file: string) => `https://sql.js.org/dist/${file}`
      });

      // Intentar cargar base de datos existente
      const savedDb = localStorage.getItem('animalia_sqlite_db');
      
      if (savedDb) {
        // Cargar base de datos existente
        const arr = this.str2ab(atob(savedDb));
        this.db = new this.SQL.Database(new Uint8Array(arr));
        console.log('✅ Base de datos cargada desde localStorage');
      } else {
        // Crear nueva base de datos
        this.db = new this.SQL.Database();
        await this.createTables();
        await this.insertInitialData();
        this.saveDB();
        console.log('✅ Nueva base de datos creada con datos iniciales');
      }

      return true;
    } catch (error) {
      console.error('❌ Error al inicializar SQLite:', error);
      return false;
    }
  }

  private async createTables() {
    // Tabla users
    this.db.run(`
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
    `);

    // Tabla pets
    this.db.run(`
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
    `);

    // Tabla vaccines
    this.db.run(`
      CREATE TABLE IF NOT EXISTS vaccines (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        petId INTEGER NOT NULL,
        nombre TEXT NOT NULL,
        fecha TEXT NOT NULL
      )
    `);

    // Tabla appointments
    this.db.run(`
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
    `);
  }

  private async insertInitialData() {
    // Insertar usuarios
    INITIAL_DATA.users.forEach(user => {
      this.db.run(
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
    });

    // Insertar mascotas
    INITIAL_DATA.pets.forEach(pet => {
      this.db.run(
        `INSERT INTO pets (nombre, especie, raza, edad, peso, color, clienteId) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [pet.nombre, pet.especie, pet.raza, pet.edad, pet.peso, pet.color, pet.clienteId]
      );
    });

    // Insertar vacunas
    INITIAL_DATA.vaccines.forEach(vaccine => {
      this.db.run(
        `INSERT INTO vaccines (petId, nombre, fecha) VALUES (?, ?, ?)`,
        [vaccine.petId, vaccine.nombre, vaccine.fecha]
      );
    });

    // Insertar citas
    INITIAL_DATA.appointments.forEach(appt => {
      this.db.run(
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
    });
  }

  // Guardar base de datos en localStorage
  private saveDB() {
    const data = this.db.export();
    const base64 = btoa(this.ab2str(data));
    localStorage.setItem('animalia_sqlite_db', base64);
  }

  // Utilidades para conversión
  private str2ab(str: string) {
    const buf = new ArrayBuffer(str.length);
    const bufView = new Uint8Array(buf);
    for (let i = 0; i < str.length; i++) {
      bufView[i] = str.charCodeAt(i);
    }
    return buf;
  }

  private ab2str(buf: Uint8Array) {
    return String.fromCharCode.apply(null, Array.from(buf));
  }

  // ==================== MÉTODOS CRUD ====================

  // USERS
  getUsers() {
    const result = this.db.exec('SELECT * FROM users');
    if (result.length === 0) return [];
    return this.rowsToObjects(result[0]);
  }

  getUserByEmail(email: string) {
    const result = this.db.exec('SELECT * FROM users WHERE email = ?', [email]);
    if (result.length === 0) return null;
    const users = this.rowsToObjects(result[0]);
    return users[0] || null;
  }

  addUser(user: any) {
    this.db.run(
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
    this.saveDB();
    
    // Obtener el ID del usuario recién creado
    const result = this.db.exec('SELECT last_insert_rowid() as id');
    return result[0].values[0][0];
  }

  // PETS
  getPets() {
    const result = this.db.exec('SELECT * FROM pets');
    if (result.length === 0) return [];
    
    const pets = this.rowsToObjects(result[0]);
    
    // Agregar vacunas a cada mascota
    return pets.map((pet : any) => {
      const vaccinesResult = this.db.exec('SELECT * FROM vaccines WHERE petId = ?', [pet.id]);
      const vacunas = vaccinesResult.length > 0 ? this.rowsToObjects(vaccinesResult[0]) : [];
      return { ...pet, vacunas };
    });
  }

  addPet(pet: any) {
    this.db.run(
      `INSERT INTO pets (nombre, especie, raza, edad, peso, color, clienteId) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [pet.nombre, pet.especie, pet.raza, pet.edad, pet.peso, pet.color || null, pet.clienteId]
    );
    this.saveDB();
    
    const result = this.db.exec('SELECT last_insert_rowid() as id');
    return result[0].values[0][0];
  }

  addAppointment(appointment: any) {
    
    this.db.run(
      `INSERT INTO appointments 
        (fecha, horaInicio, horaFin, mascotaId, clienteId, veterinarioId, servicio, precio, estado,sintomas) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?,?)`,
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
        appointment.sintomas 
      ]
    );

    this.saveDB();


    const result = this.db.exec('SELECT last_insert_rowid() as id');
    return result[0].values[0][0];
  }


  

  addVaccine(vaccine: any) {
    this.db.run(
      `INSERT INTO vaccines (petId, nombre, fecha) VALUES (?, ?, ?)`,
      [vaccine.petId, vaccine.nombre, vaccine.fecha]
    );
    this.saveDB();
    
    const result = this.db.exec('SELECT last_insert_rowid() as id');
    return result[0].values[0][0];
  }

  deleteVaccine(id: number) {
    this.db.run(
      `DELETE FROM vaccines WHERE id = ?`,
      [id]
    );
    this.saveDB();
  }

  updateUser(id: number, user: any) {
  this.db.run(
    `UPDATE users 
     SET nombre = ?, email = ?, telefono = ?, direccion = ?
     WHERE id = ?`,
    [
      user.nombre,
      user.email,
      user.telefono || null,
      user.direccion || null,
      id
    ]
  );
  this.saveDB();
  }

  /*updatePet(id: number, pet: any) {
    this.db.run(
      `UPDATE pets SET peso = ? WHERE id = ?`,
      [pet.peso, id]
    );
    this.saveDB();
  }*/

  updatePet(id: number, pet: any) {

    this.db.run(
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
    this.saveDB();

  }

  // APPOINTMENTS
  getAppointments() {
    const result = this.db.exec('SELECT * FROM appointments');
    if (result.length === 0) return [];
    return this.rowsToObjects(result[0]);
  }

  updateAppointment(id: number, appointment: any) {
    this.db.run(
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
    this.saveDB();
  }

   updateAppointmenClient(id: number, appointment: any) {
    this.db.run(
      `UPDATE appointments 
       SET fecha = ?, horaInicio = ?, horaFin = ?, mascotaId = ?, veterinarioId = ?, servicio =?,  sintomas = ?,  estado = ?
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
    this.saveDB();
  }


   cancelAppointment(id: number, appointment: any) {
    this.db.run(
      `UPDATE appointments 
       SET  estado = ?
       WHERE id = ?`,
      [ 
        appointment.estado || null,
        id
      ]
    );
    this.saveDB();
  }
    

  // Convertir filas SQL a objetos JavaScript
  private rowsToObjects(result: any) {
    const columns = result.columns;
    const values = result.values;
    
    return values.map((row: any[]) => {
      const obj: any = {};
      columns.forEach((col: string, index: number) => {
        obj[col] = row[index];
      });
      return obj;
    });
  }

  // Usuario actual (mantenemos en localStorage por simplicidad)
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
}

export default new SQLiteService();
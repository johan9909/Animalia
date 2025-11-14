export const DB_SCHEMA = {
  name: 'animalia.db',
  version: 1,
  tables: `
    -- Tabla de usuarios
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      telefono TEXT,
      direccion TEXT,
      tipo TEXT NOT NULL CHECK(tipo IN ('cliente', 'veterinario')),
      especialidad TEXT,
      licencia TEXT,
      horario TEXT,
      experiencia INTEGER
    );

    -- Tabla de mascotas
    CREATE TABLE IF NOT EXISTS pets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      especie TEXT NOT NULL,
      raza TEXT NOT NULL,
      edad INTEGER NOT NULL,
      peso REAL NOT NULL,
      color TEXT,
      foto TEXT,
      clienteId INTEGER NOT NULL,
      FOREIGN KEY (clienteId) REFERENCES users(id)
    );

    -- Tabla de vacunas
    CREATE TABLE IF NOT EXISTS vaccines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      petId INTEGER NOT NULL,
      nombre TEXT NOT NULL,
      fecha TEXT NOT NULL,
      FOREIGN KEY (petId) REFERENCES pets(id)
    );

    -- Tabla de citas
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
      estado TEXT NOT NULL CHECK(estado IN ('pendiente', 'confirmada', 'completada', 'cancelada')),
      diagnostico TEXT,
      tratamiento TEXT,
      sintomas TEXT,
      temperatura REAL,
      pesoActual REAL,
      FOREIGN KEY (mascotaId) REFERENCES pets(id),
      FOREIGN KEY (clienteId) REFERENCES users(id),
      FOREIGN KEY (veterinarioId) REFERENCES users(id)
    );
  `
};

export const INITIAL_DATA = {
  users: [
    {
      nombre: 'Juan Pérez',
      email: 'juan@cliente.com',
      password: '123456',
      telefono: '+57 300 123 4567',
      direccion: 'Calle 100 #15-20, Bogotá',
      tipo: 'cliente'
    },
    {
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
  ],
  pets: [
    {
      nombre: 'Max',
      especie: 'Perro',
      raza: 'Labrador',
      edad: 3,
      peso: 28,
      color: 'Dorado',
      clienteId: 1
    },
    {
      nombre: 'Luna',
      especie: 'Gato',
      raza: 'Siamés',
      edad: 2,
      peso: 4,
      color: 'Blanco',
      clienteId: 1
    }
  ],
  vaccines: [
    { petId: 1, nombre: 'Rabia', fecha: '2024-08-15' },
    { petId: 1, nombre: 'Parvovirus', fecha: '2024-07-20' },
    { petId: 2, nombre: 'Triple Felina', fecha: '2024-06-10' }
  ],
  appointments: [
    {
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
  ]
};
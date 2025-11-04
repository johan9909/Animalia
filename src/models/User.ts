export interface User {
  id: number;
  nombre: string;
  email: string;
  password: string;
  telefono: string;
  direccion?: string;
  tipo: 'cliente' | 'veterinario';
  especialidad?: string; // Solo para veterinarios
  licencia?: string; // Solo para veterinarios
  horario?: string; // Solo para veterinarios
  experiencia?: number; // Solo para veterinarios
}
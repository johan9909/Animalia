export interface Appointment {
  id: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  mascotaId: number;
  clienteId: number;
  veterinarioId: number;
  servicio: string;
  precio: number;
  estado: 'pendiente' | 'confirmada' | 'completada' | 'cancelada';
  diagnostico?: string;
  tratamiento?: string;
  sintomas?: string;
  temperatura?: number;
  pesoActual?: number;
}
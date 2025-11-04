export interface Pet {
  id: number;
  nombre: string;
  especie: string;
  raza: string;
  edad: number;
  peso: number;
  color?: string;
  foto?: string;
  clienteId: number;
  vacunas: Vacuna[];
}

export interface Vacuna {
  nombre: string;
  fecha: string;
}
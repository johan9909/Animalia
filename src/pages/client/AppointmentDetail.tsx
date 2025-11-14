import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonCard,
  IonCardContent,
  IonButton
} from '@ionic/react';
import { useParams } from 'react-router-dom';
import sqliteService from '../../services/sqlite.service';
import './AppointmentDetail.css';

interface AppointmentDetailParams {
  id: string;
}

const AppointmentDetail: React.FC = () => {
  const { id } = useParams<AppointmentDetailParams>();
  const [appointment, setAppointment] = useState<any>(null);
  const [pet, setPet] = useState<any>(null);
  const [vet, setVet] = useState<any>(null);

  useEffect(() => {
    // Cargar cita
    const allAppointments = sqliteService.getAppointments();
    const foundAppointment = allAppointments.find((a : any) => a.id === parseInt(id));
    setAppointment(foundAppointment);

    if (foundAppointment) {
      // Cargar mascota
      const allPets = sqliteService.getPets();
      const foundPet = allPets.find((p : any)=> p.id === foundAppointment.mascotaId);
      setPet(foundPet);

      // Cargar veterinario
      const allUsers = sqliteService.getUsers();
      const foundVet = allUsers.find((u : any) => u.id === foundAppointment.veterinarioId);
      setVet(foundVet);
    }
  }, [id]);

  if (!appointment) {
    return <div>Cargando...</div>;
  }

  const getBadgeClass = (estado: string) => {
    switch (estado) {
      case 'confirmada':
        return 'badge-info';
      case 'pendiente':
        return 'badge-warning';
      case 'completada':
        return 'badge-success';
      case 'cancelada':
        return 'badge-danger';
      default:
        return 'badge-info';
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar style={{ '--background': 'var(--gradient-primary)' }}>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/client/appointments" color="light" />
          </IonButtons>
          <IonTitle color="light">Detalle de Cita 📋</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <div className="appointment-detail-content">
          <IonCard>
            <IonCardContent>
              <span className={`badge ${getBadgeClass(appointment.estado)}`}>
                {appointment.estado}
              </span>
              <h3>{appointment.servicio}</h3>
              <div className="detail-time">
                📅 {appointment.fecha}<br />
                🕐 {appointment.horaInicio} - {appointment.horaFin}
              </div>

              <div className="detail-section">
                <h4>Mascota</h4>
                {pet && (
                  <div className="detail-row">
                    <div className="pet-avatar-small">
                      {pet.especie.toLowerCase() === 'perro' ? '🐕' : '🐈'}
                    </div>
                    <div>
                      <strong>{pet.nombre}</strong>
                      <p>{pet.raza} • {pet.edad} años</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="detail-section">
                <h4>Veterinario</h4>
                {vet && (
                  <div className="detail-row">
                    <div className="vet-avatar-small">
                      {vet.nombre.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <strong>{vet.nombre}</strong>
                      <p>{vet.especialidad || 'Medicina General'}</p>
                      <p>📞 {vet.telefono || '+57 300 123 4567'}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="detail-section">
                <h4>Ubicación</h4>
                <p>📍 Calle 123 #45-67, Bogotá</p>
              </div>

              <div className="detail-section">
                <h4>Precio</h4>
                <p className="price">${appointment.precio?.toLocaleString() || '50.000'}</p>
              </div>
            </IonCardContent>
          </IonCard>

          {appointment.estado !== 'cancelada' && appointment.estado !== 'completada' && (
            <>
              <IonButton 
                expand="block" 
                fill="outline"
                color="danger"
                onClick={() => alert('Función de cancelar en desarrollo')}
              >
                Cancelar Cita
              </IonButton>
              <IonButton 
                expand="block"
                onClick={() => alert('Función de editar en desarrollo')}
              >
                Editar Cita
              </IonButton>
            </>
          )}

          {appointment.estado === 'completada' && (
            <IonButton 
              expand="block"
              onClick={() => alert('Función de calificar en desarrollo')}
            >
              Calificar Servicio ⭐
            </IonButton>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default AppointmentDetail;
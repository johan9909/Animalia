import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonCard,
  IonCardContent,
  IonButton,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonFab,
  IonFabButton,
  IonText
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { 
  home, 
  pawOutline, 
  calendarOutline, 
  personOutline,
  addOutline
} from 'ionicons/icons';
import authService from '../../services/auth.service';
import databaseService from '../../services/database.service';
import './Appointments.css';

const Appointments: React.FC = () => {
  const history = useHistory();
  const [user, setUser] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [pets, setPets] = useState<any[]>([]);
  const [vets, setVets] = useState<any[]>([]);
  const [filter, setFilter] = useState<'proximas' | 'historial'>('proximas');

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      history.push('/login');
      return;
    }
    setUser(currentUser);

    // Cargar datos
    const allPets = databaseService.getPets();
    const userPets = allPets.filter(p => p.clienteId === currentUser.id);
    setPets(userPets);

    const allAppointments = databaseService.getAppointments();
    const userAppointments = allAppointments.filter(a => a.clienteId === currentUser.id);
    setAppointments(userAppointments);

    const allUsers = databaseService.getUsers();
    const veterinarians = allUsers.filter(u => u.tipo === 'veterinario');
    setVets(veterinarians);
  }, [history]);

  const getFilteredAppointments = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (filter === 'proximas') {
      return appointments.filter(a => {
        const appointmentDate = new Date(a.fecha);
        return appointmentDate >= today && a.estado !== 'cancelada' && a.estado !== 'completada';
      });
    } else {
      return appointments.filter(a => {
        const appointmentDate = new Date(a.fecha);
        return appointmentDate < today || a.estado === 'completada' || a.estado === 'cancelada';
      });
    }
  };

  const getPetName = (petId: number) => {
    const pet = pets.find(p => p.id === petId);
    return pet ? `${pet.nombre} - ${pet.raza}` : 'Mascota desconocida';
  };

  const getVetName = (vetId: number) => {
    const vet = vets.find(v => v.id === vetId);
    return vet ? vet.nombre : 'Veterinario';
  };

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

  const filteredAppointments = getFilteredAppointments();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar style={{ '--background': 'var(--gradient-primary)' }}>
          <IonTitle color="light">Mis Citas 📅</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <div className="appointments-content">
          {/* Filtros */}
          <IonSegment value={filter} onIonChange={e => setFilter(e.detail.value as any)}>
            <IonSegmentButton value="proximas">
              <IonLabel>Próximas</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="historial">
              <IonLabel>Historial</IonLabel>
            </IonSegmentButton>
          </IonSegment>

          {/* Lista de citas */}
          {filteredAppointments.length > 0 ? (
            filteredAppointments.map(appointment => (
              <IonCard 
                key={appointment.id} 
                className="appointment-card"
                onClick={() => history.push(`/client/appointment-detail/${appointment.id}`)}
              >
                <IonCardContent>
                  <span className={`badge ${getBadgeClass(appointment.estado)}`}>
                    {appointment.estado}
                  </span>
                  <div className="appointment-time">
                    🕐 {appointment.fecha} - {appointment.horaInicio}
                  </div>
                  <h4>{appointment.servicio}</h4>
                  <p className="pet-name">{getPetName(appointment.mascotaId)}</p>
                  
                  <div className="appointment-vet">
                    <div className="vet-avatar">
                      {getVetName(appointment.veterinarioId).substring(0, 2).toUpperCase()}
                    </div>
                    <div className="vet-info">
                      <strong>{getVetName(appointment.veterinarioId)}</strong>
                      <p>Medicina General</p>
                    </div>
                  </div>

                  <div className="appointment-actions">
                    <IonButton 
                      fill="outline" 
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        alert('Función de cancelar en desarrollo');
                      }}
                    >
                      Cancelar
                    </IonButton>
                    <IonButton 
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        history.push(`/client/appointment-detail/${appointment.id}`);
                      }}
                    >
                      Ver Detalles
                    </IonButton>
                  </div>
                </IonCardContent>
              </IonCard>
            ))
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📅</div>
              <h3>No hay citas</h3>
              <p>
                {filter === 'proximas' 
                  ? 'No tienes citas programadas' 
                  : 'No hay citas en el historial'}
              </p>
            </div>
          )}
        </div>

        {/* Botón flotante para agendar cita */}
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={() => alert('Función de agendar cita en desarrollo')}>
            <IonIcon icon={addOutline} />
          </IonFabButton>
        </IonFab>

        {/* Navegación inferior */}
        <IonTabBar slot="bottom" className="custom-tab-bar">
          <IonTabButton tab="home" onClick={() => history.push('/client/dashboard')}>
            <IonIcon icon={home} />
            <IonLabel>Inicio</IonLabel>
          </IonTabButton>

          <IonTabButton tab="pets" onClick={() => history.push('/client/pets')}>
            <IonIcon icon={pawOutline} />
            <IonLabel>Mascotas</IonLabel>
          </IonTabButton>

          <IonTabButton tab="appointments" className="active">
            <IonIcon icon={calendarOutline} />
            <IonLabel>Citas</IonLabel>
          </IonTabButton>

          <IonTabButton tab="profile" onClick={() => history.push('/client/profile')}>
            <IonIcon icon={personOutline} />
            <IonLabel>Perfil</IonLabel>
          </IonTabButton>
        </IonTabBar>
      </IonContent>
    </IonPage>
  );
};

export default Appointments;
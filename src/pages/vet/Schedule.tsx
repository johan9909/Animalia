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
  IonIcon
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { 
  home, 
  calendarOutline, 
  pawOutline, 
  personOutline
} from 'ionicons/icons';
import authService from '../../services/auth.service';
import sqliteService from '../../services/sqlite.service';
import './Schedule.css';

const Schedule: React.FC = () => {
  const history = useHistory();
  const [user, setUser] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [pets, setPets] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [selectedDay, setSelectedDay] = useState<string>('hoy');

  useEffect(() => {
      
     const loadData = async () => {

      await sqliteService.initDB();

      const currentUser = authService.getCurrentUser();
      if (!currentUser || currentUser.tipo !== 'veterinario') {
        history.push('/login');
        return;
      }
      setUser(currentUser);

        // Cargar citas del veterinario
        const allAppointments = await sqliteService.getAppointments();
        const vetAppointments = allAppointments.filter((a : any) => a.veterinarioId === currentUser.id);
        setAppointments(vetAppointments);

        // Cargar mascotas
        const allPets = await sqliteService.getPets();
        setPets(allPets);

        // Cargar clientes
        const allUsers = await sqliteService.getUsers();
        const clientUsers = allUsers.filter((u : any) => u.tipo === 'cliente');
        setClients(clientUsers);
      
     };
     
     loadData();
    
  }, [history]);

  const getFilteredAppointments = () => {
    const today = new Date().toISOString().split('T')[0];
    
    switch (selectedDay) {
      case 'hoy':
        return appointments.filter(a => a.fecha === today || a.fecha === '2024-11-02');
      case 'manana':
        return appointments.filter(a => a.fecha === '2024-11-03');
      case 'lunes':
        return appointments.filter(a => a.fecha === '2024-11-04');
      case 'martes':
        return appointments.filter(a => a.fecha === '2024-11-05');
      default:
        return appointments;
    }
  };

  const getPetInfo = (petId: number) => {
    const pet = pets.find(p => p.id === petId);
    return pet || { nombre: 'Desconocido', especie: 'Perro', raza: 'Desconocida' };
  };

  const getClientInfo = (clientId: number) => {
    const client = clients.find(c => c.id === clientId);
    return client || { nombre: 'Cliente' };
  };

  const getBadgeClass = (estado: string) => {
    switch (estado) {
      case 'completada':
        return 'badge-success';
      case 'confirmada':
        return 'badge-warning';
      case 'pendiente':
        return 'badge-info';
      default:
        return 'badge-info';
    }
  };

  const getStatusText = (estado: string) => {
    switch (estado) {
      case 'completada':
        return 'Completada';
      case 'confirmada':
        return 'En curso';
      case 'pendiente':
        return 'Próxima';
      default:
        return estado;
    }
  };

  const getPetEmoji = (especie: string) => {
    return especie.toLowerCase() === 'perro' ? '🐕' : '🐈';
  };

  const getCardStyle = (estado: string) => {
    switch (estado) {
      case 'completada':
        return 'schedule-card-completed';
      case 'confirmada':
        return 'schedule-card-progress';
      default:
        return 'schedule-card-pending';
    }
  };

  const filteredAppointments = getFilteredAppointments();
  const sortedAppointments = [...filteredAppointments].sort((a, b) => 
    a.horaInicio.localeCompare(b.horaInicio)
  );

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="vet-toolbar">
          <IonTitle color="light">Mi Agenda 📅</IonTitle>
        </IonToolbar>
        <IonToolbar className="vet-toolbar-sub">
          <IonTitle color="light" size="small">
            {selectedDay === 'hoy' ? 'Viernes, 1 Nov 2024' : 
             selectedDay === 'manana' ? 'Sábado, 2 Nov 2024' :
             selectedDay === 'lunes' ? 'Lunes, 4 Nov 2024' : 'Martes, 5 Nov 2024'}
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <div className="schedule-content">
          {/* Filtros de día */}
          <div className="day-filters">
            <IonButton 
              className={selectedDay === 'hoy' ? 'day-btn-active' : 'day-btn'}
              onClick={() => setSelectedDay('hoy')}
            >
              Hoy
            </IonButton>
            <IonButton 
              className={selectedDay === 'manana' ? 'day-btn-active' : 'day-btn'}
              onClick={() => setSelectedDay('manana')}
            >
              Mañana
            </IonButton>
            <IonButton 
              className={selectedDay === 'lunes' ? 'day-btn-active' : 'day-btn'}
              onClick={() => setSelectedDay('lunes')}
            >
              Lunes
            </IonButton>
            <IonButton 
              className={selectedDay === 'martes' ? 'day-btn-active' : 'day-btn'}
              onClick={() => setSelectedDay('martes')}
            >
              Martes
            </IonButton>
          </div>

          {/* Lista de citas */}
          {sortedAppointments.length > 0 ? (
            <>
              {sortedAppointments.map(appointment => {
                const pet = getPetInfo(appointment.mascotaId);
                const client = getClientInfo(appointment.clienteId);
                
                return (
                  <IonCard 
                    key={appointment.id} 
                    className={`schedule-card ${getCardStyle(appointment.estado)}`}
                    onClick={() => history.push(`/vet/consultation/${appointment.id}`)}
                  >
                    <IonCardContent>
                      <div className="schedule-header">
                        <div className="schedule-time">
                          {appointment.horaInicio} - {appointment.horaFin}
                        </div>
                        <span className={`badge ${getBadgeClass(appointment.estado)}`}>
                          {getStatusText(appointment.estado)}
                        </span>
                      </div>

                      <h4 className="schedule-service">{appointment.servicio}</h4>
                      
                      <div className="schedule-patient">
                        <span className="patient-emoji">{getPetEmoji(pet.especie)}</span>
                        <div>
                          <strong>{pet.nombre} - {pet.raza}</strong>
                          <p>{client.nombre}</p>
                        </div>
                      </div>
                    </IonCardContent>
                  </IonCard>
                );
              })}

              {/* Hora de almuerzo */}
              {selectedDay === 'hoy' && (
                <div className="lunch-break">
                  <div className="lunch-icon">☕</div>
                  <p><strong>12:00 - 2:00 PM</strong></p>
                  <p>Almuerzo</p>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📅</div>
              <h3>No hay citas programadas</h3>
              <p>No tienes citas para este día</p>
            </div>
          )}
        </div>

        {/* Navegación inferior */}
                <div className="custom-bottom-nav">
                  <div 
                    className="nav-item"
                    onClick={() => history.push('/vet/dashboard')}
                  >
                    <IonIcon icon={home} className="nav-icon" />
                    <span>Inicio</span>
                  </div>
        
                  <div 
                    className="nav-item active"
                    onClick={() => history.push('/vet/schedule')}
                  >
                    <IonIcon icon={calendarOutline} className="nav-icon" />
                    <span>Agenda</span>
                  </div>
        
                  <div 
                    className="nav-item"
                    onClick={() => history.push('/vet/patients')}
                  >
                    <IonIcon icon={pawOutline} className="nav-icon" />
                    <span>Pacientes</span>
                  </div>
        
                  <div 
                    className="nav-item"
                    onClick={() => history.push('/vet/profile')}
                  >
                    <IonIcon icon={personOutline} className="nav-icon" />
                    <span>Perfil</span>
                  </div>
                </div>
      </IonContent>
    </IonPage>
  );
};

export default Schedule;
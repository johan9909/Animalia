import React, { useState } from 'react';
import {
  IonContent,
  IonPage,
  IonCard,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonButton,
  IonIcon,
  useIonViewWillEnter
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
import './Dashboard.css';

const VetDashboard: React.FC = () => {
  const history = useHistory();
  const [user, setUser] = useState<any>(null);
  const [todayAppointments, setTodayAppointments] = useState<any[]>([]);
  const [allPatients, setAllPatients] = useState<any[]>([]);
  const [pets, setPets] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);

  useIonViewWillEnter(() => {
    const loadDashboard = async () => {
      const currentUser = authService.getCurrentUser();
      if (!currentUser || currentUser.tipo !== 'veterinario') {
        history.push('/login');
        return;
      }

      setUser(currentUser);

      const allAppointments = await sqliteService.getAppointments();
      const vetAppointments = allAppointments.filter(
        (a: any) => a.veterinarioId === currentUser.id
      );

      // Calcular la fecha de hoy en formato YYYY-MM-DD
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const todayDate = `${year}-${month}-${day}`;

      const todayAppts = vetAppointments.filter(
        (a: any) => a.fecha === todayDate && a.estado === 'pendiente'
      );

      setTodayAppointments(todayAppts);

      const allPets = await sqliteService.getPets();
      setPets(allPets);

      const uniquePetIds = [...new Set(
        vetAppointments.map((a: any) => a.mascotaId)
      )];

      setAllPatients(uniquePetIds);

      const allUsers = await sqliteService.getUsers();
      const clientUsers = allUsers.filter((u: any) => u.tipo === "cliente");
      setClients(clientUsers);
    };

    loadDashboard();
  });

  const getPetInfo = (petId: number) => {
    const pet = pets.find(p => p.id === petId);
    return pet || { nombre: 'Desconocido', especie: 'Perro', raza: 'Desconocida' };
  };

  const getClientInfo = (clientId: number) => {
    const client = clients.find(c => c.id === clientId);
    return client || { nombre: 'Cliente', telefono: '' };
  };

  const getBadgeClass = (estado: string) => {
    switch (estado) {
      case 'confirmada':
        return 'badge-info';
      case 'pendiente':
        return 'badge-warning';
      case 'completada':
        return 'badge-success';
      default:
        return 'badge-info';
    }
  };

  const getPetEmoji = (especie: string) => {
    return especie.toLowerCase() === 'perro' ? '🐕' : '🐈';
  };

  // Función para obtener el primer nombre del veterinario
  const getFirstName = () => {
    if (!user?.nombre) return 'Doctor';
    const names = user.nombre.split(' ');
    return names[0];
  };

  return (
    <IonPage>
      <IonContent>
        {/* Header con color verde */}
        <div className="vet-header">
          <h1>Hola, Dr. {getFirstName()} 👨‍⚕️</h1>
          <p>Panel de control veterinario</p>
        </div>

        <div className="dashboard-content">
          {/* Estadísticas */}
          <IonGrid className="stats-grid">
            <IonRow>
              <IonCol size="6">
                <div className="stat-card vet-stat">
                  <div className="stat-number">{todayAppointments.length}</div>
                  <div className="stat-label">Citas pendientes</div>
                </div>
              </IonCol>
              <IonCol size="6">
                <div className="stat-card vet-stat">
                  <div className="stat-number">{allPatients.length}</div>
                  <div className="stat-label">Pacientes</div>
                </div>
              </IonCol>
            </IonRow>
          </IonGrid>

          {/* Citas de Hoy */}
          <h3 className="section-title">Citas de Hoy</h3>
          
          {todayAppointments.length > 0 ? (
            todayAppointments.map(appointment => {
              const pet = getPetInfo(appointment.mascotaId);
              const client = getClientInfo(appointment.clienteId);
              
              return (
                <IonCard key={appointment.id} className="appointment-card vet-appointment">
                  <IonCardContent>
                    <span className={`badge ${getBadgeClass(appointment.estado)}`}>
                      {appointment.estado === 'confirmada' ? 'En Progreso' : appointment.estado}
                    </span>
                    <div className="appointment-time vet-time">
                      🕐 {appointment.horaInicio} - {appointment.horaFin}
                    </div>
                    <h4>{appointment.servicio}</h4>
                    
                    <div className="patient-info">
                      <div className="pet-avatar-small">
                        {getPetEmoji(pet.especie)}
                      </div>
                      <div className="patient-details">
                        <strong>{pet.nombre} - {pet.raza}</strong>
                        <p>{client.nombre} • {client.telefono}</p>
                      </div>
                    </div>

                    <IonButton 
                      expand="block" 
                      className="vet-button"
                      onClick={() => history.push(`/vet/consultation/${appointment.id}`)}
                    >
                      Iniciar Consulta
                    </IonButton>
                  </IonCardContent>
                </IonCard>
              );
            })
          ) : (
            <IonCard>
              <IonCardContent>
                <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                  <div style={{ fontSize: '50px', marginBottom: '10px' }}>📅</div>
                  <p>No hay citas programadas para hoy</p>
                </div>
              </IonCardContent>
            </IonCard>
          )}
        </div>

        {/* Navegación inferior personalizada */}
        <div className="custom-bottom-nav">
          <div 
            className="nav-item active"
            onClick={() => history.push('/vet/dashboard')}
          >
            <IonIcon icon={home} className="nav-icon" />
            <span>Inicio</span>
          </div>

          <div 
            className="nav-item"
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

export default VetDashboard;
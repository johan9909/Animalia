import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonPage,
  IonCard,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonText,
  IonIcon,
  useIonViewWillEnter
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { 
  home, 
  pawOutline, 
  calendarOutline, 
  personOutline,
  addOutline,
  medkitOutline,
  documentTextOutline,
  alarmOutline
} from 'ionicons/icons';
import authService from '../../services/auth.service';
import sqliteService from '../../services/sqlite.service';
import './Dashboard.css';

const ClientDashboard: React.FC = () => {
  const history = useHistory();
  const [user, setUser] = useState<any>(null);
  const [pets, setPets] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);

    // Función para cargar datos
  const loadData = async () => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || currentUser.tipo !== 'cliente') {
      history.push('/login');
      return;
    }

    setUser(currentUser);

    // Cargar mascotas del usuario
    const allPets = await sqliteService.getPets();
    const userPets = allPets.filter((p: any) => p.clienteId === currentUser.id);
    setPets(userPets);

    // Cargar citas del usuario
    const allAppointments = await sqliteService.getAppointments();
    const userAppointments = allAppointments.filter((a: any) => a.clienteId === currentUser.id);
    setAppointments(userAppointments);
  };

  // useEffect para carga inicial
  useEffect(() => {
    loadData();
  }, [history]);

  // useIonViewWillEnter se ejecuta cada vez que la vista está por entrar
  // Esto recarga los datos cuando vuelves desde otra página
  useIonViewWillEnter(() => {
    loadData();
  });

  return (
    <IonPage>
      <IonContent>
        {/* Header con degradado */}
        <div className="dashboard-header">
          <h1>Hola, {user?.nombre?.split(' ')[0]} 👋</h1>
          <p>Bienvenido a Animalia</p>
        </div>

        <div className="dashboard-content">
          {/* Estadísticas */}
          <IonGrid className="stats-grid">
            <IonRow>
              <IonCol size="6">
                <div className="stat-card">
                  <div className="stat-number">{pets.length}</div>
                  <div className="stat-label">Mascotas</div>
                </div>
              </IonCol>
              <IonCol size="6">
                <div className="stat-card">
                  <div className="stat-number">{appointments.length}</div>
                  <div className="stat-label">Citas</div>
                </div>
              </IonCol>
            </IonRow>
          </IonGrid>

          {/* Acciones rápidas */}
          <h3 className="section-title">Acciones Rápidas</h3>
          <IonGrid className="actions-grid">
            <IonRow>
              <IonCol size="6">
                <div className="action-card" onClick={() => history.push('/client/appointments')}>
                  <div className="action-icon">📅</div>
                  <div className="action-label">Agendar Cita</div>
                </div>
              </IonCol>
              <IonCol size="6">
                <div className="action-card" onClick={() => history.push('/client/pets')}>
                  <div className="action-icon">🐕</div>
                  <div className="action-label">Mis Mascotas</div>
                </div>
              </IonCol>
              <IonCol size="6">
                <div className="action-card" onClick={() => history.push('/client/vaccine-selector')}>
                  <div className="action-icon">💉</div>
                  <div className="action-label">Vacunas</div>
                </div>
              </IonCol>
              <IonCol size="6">
                <div className="action-card" onClick={() => history.push('/client/appointment-history')}>
                  <div className="action-icon">📋</div>
                  <div className="action-label">Historial</div>
                </div>
              </IonCol>
            </IonRow>
          </IonGrid>

          {/* Próximas citas */}
          <h3 className="section-title">Próximas Citas</h3>
          {appointments.length > 0 ? (
            appointments.slice(0, 2).map(appointment => {
              const pet = pets.find(p => p.id === appointment.mascotaId);
              return (
                <IonCard key={appointment.id} className="appointment-card">
                  <IonCardContent>
                    <div className="appointment-time">
                      🕐 {appointment.fecha} - {appointment.horaInicio}
                    </div>
                    <h4>{appointment.servicio}</h4>
                    <p>{pet?.nombre} - {pet?.raza}</p>
                    <div className={`badge badge-${appointment.estado}`}>
                      {appointment.estado}
                    </div>
                  </IonCardContent>
                </IonCard>
              );
            })
          ) : (
            <IonCard>
              <IonCardContent>
                <IonText color="medium">
                  <p style={{ textAlign: 'center' }}>No tienes citas programadas</p>
                </IonText>
              </IonCardContent>
            </IonCard>
          )}
        </div>

        
        {/* Navegación inferior personalizada */}
        <div className="custom-bottom-nav">
          <div 
            className="nav-item active"
            onClick={() => history.push('/client/dashboard')}
          >
            <IonIcon icon={home} className="nav-icon" />
            <span>Inicio</span>
          </div>

          <div 
            className="nav-item"
            onClick={() => history.push('/client/pets')}
          >
            <IonIcon icon={pawOutline} className="nav-icon" />
            <span>Mascotas</span>
          </div>

          <div 
            className="nav-item"
            onClick={() => history.push('/client/appointments')}
          >
            <IonIcon icon={calendarOutline} className="nav-icon" />
            <span>Citas</span>
          </div>

          <div 
            className="nav-item"
            onClick={() => history.push('/client/profile')}
          >
            <IonIcon icon={personOutline} className="nav-icon" />
            <span>Perfil</span>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ClientDashboard;
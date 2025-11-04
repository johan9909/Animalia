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
  IonFab,
  IonFabButton,
  IonIcon,
  IonTabBar,
  IonTabButton,
  IonLabel
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
import databaseService from '../../services/database.service';
import './Dashboard.css';

const ClientDashboard: React.FC = () => {
  const history = useHistory();
  const [user, setUser] = useState<any>(null);
  const [pets, setPets] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || currentUser.tipo !== 'cliente') {
      history.push('/login');
      return;
    }

    setUser(currentUser);

    // Cargar mascotas del usuario
    const allPets = databaseService.getPets();
    const userPets = allPets.filter(p => p.clienteId === currentUser.id);
    setPets(userPets);

    // Cargar citas del usuario
    const allAppointments = databaseService.getAppointments();
    const userAppointments = allAppointments.filter(a => a.clienteId === currentUser.id);
    setAppointments(userAppointments);
  }, [history]);

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
                <div className="action-card" onClick={() => alert('Función en desarrollo')}>
                  <div className="action-icon">💉</div>
                  <div className="action-label">Vacunas</div>
                </div>
              </IonCol>
              <IonCol size="6">
                <div className="action-card" onClick={() => alert('Función en desarrollo')}>
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

        {/* Navegación inferior */}
        <IonTabBar slot="bottom" className="custom-tab-bar">
          <IonTabButton tab="home" className="active">
            <IonIcon icon={home} />
            <IonLabel>Inicio</IonLabel>
          </IonTabButton>

          <IonTabButton tab="pets" onClick={() => history.push('/client/pets')}>
            <IonIcon icon={pawOutline} />
            <IonLabel>Mascotas</IonLabel>
          </IonTabButton>

          <IonTabButton tab="appointments" onClick={() => history.push('/client/appointments')}>
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

export default ClientDashboard;
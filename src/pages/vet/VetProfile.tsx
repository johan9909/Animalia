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
  IonIcon,
  IonAlert
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { 
  home, 
  calendarOutline, 
  pawOutline, 
  personOutline,
  logOutOutline,
  createOutline
} from 'ionicons/icons';
import authService from '../../services/auth.service';
import sqliteService from '../../services/sqlite.service';
import './VetProfile.css';

const VetProfile: React.FC = () => {
  const history = useHistory();
  const [user, setUser] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [patients, setPatients] = useState<number>(0);
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);

  useEffect(() => {

    const loadData = async () => {

      await sqliteService.initDB();

      const currentUser = authService.getCurrentUser();
      if (!currentUser || currentUser.tipo !== 'veterinario') {
        history.push('/login');
        return;
      }
      setUser(currentUser);

      // Cargar estadísticas
      const allAppointments = await sqliteService.getAppointments();
      const vetAppointments = allAppointments.filter((a : any) => a.veterinarioId === currentUser.id);
      setAppointments(vetAppointments);

      // Contar pacientes únicos
      const uniquePetIds = [...new Set(vetAppointments.map((a : any) => a.mascotaId))];
      setPatients(uniquePetIds.length);
    };
    
    loadData();
    
  }, [history]);

  const handleLogout = () => {
    authService.logout();
    history.push('/login');
  };

  const getThisMonthAppointments = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return appointments.filter(a => {
      const apptDate = new Date(a.fecha);
      return apptDate.getMonth() === currentMonth && apptDate.getFullYear() === currentYear;
    }).length;
  };

  const getAverageRating = () => {
    // Simulado - podrías implementar un sistema de calificaciones real
    return 4.9;
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="vet-toolbar">
          <IonTitle color="light">Mi Perfil 👨‍⚕️</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <div className="vet-profile-content">
          {/* Header del perfil */}
          <div className="vet-profile-header">
            <div className="vet-profile-avatar">
              {user?.nombre?.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
            </div>
            <h2>{user?.nombre}</h2>
            <p>{user?.email}</p>
            <div className="rating-display">
              <span style={{ color: '#ffa500', fontSize: '20px' }}>⭐⭐⭐⭐⭐</span>
              <span style={{ color: '#999', marginLeft: '8px' }}>(127 reseñas)</span>
            </div>
          </div>

          {/* Información Profesional */}
          <IonCard>
            <IonCardContent>
              <h4>Información Profesional</h4>
              <div className="info-row">
                <span className="label">Especialidad</span>
                <span className="value">{user?.especialidad || 'Medicina General Veterinaria'}</span>
              </div>
              <div className="info-row">
                <span className="label">Licencia Profesional</span>
                <span className="value">{user?.licencia || 'MV-12345'}</span>
              </div>
              <div className="info-row">
                <span className="label">Años de Experiencia</span>
                <span className="value">{user?.experiencia || 8} años</span>
              </div>
              <div className="info-row">
                <span className="label">Horario de Atención</span>
                <span className="value">{user?.horario || 'Lun-Vie: 8:00 AM - 6:00 PM'}</span>
              </div>
            </IonCardContent>
          </IonCard>

          {/* Estadísticas del Mes */}
          <IonCard>
            <IonCardContent>
              <h4>Estadísticas del Mes</h4>
              <div className="stats-row">
                <div className="stat-item-vet">
                  <div className="stat-value-vet">{getThisMonthAppointments()}</div>
                  <div className="stat-label-vet">Consultas</div>
                </div>
                <div className="stat-item-vet">
                  <div className="stat-value-vet">{patients}</div>
                  <div className="stat-label-vet">Pacientes</div>
                </div>
                <div className="stat-item-vet">
                  <div className="stat-value-vet">{getAverageRating()}</div>
                  <div className="stat-label-vet">Rating</div>
                </div>
              </div>
            </IonCardContent>
          </IonCard>

          {/* Acciones */}
          <IonButton 
            expand="block" 
            className="edit-button-vet"
            onClick={() => alert('Función de editar perfil en desarrollo')}
          >
            <IonIcon icon={createOutline} slot="start" />
            Editar Perfil
          </IonButton>

          <IonButton 
            expand="block" 
            fill="outline"
            className="config-button-vet"
            onClick={() => alert('Función de configuración en desarrollo')}
          >
            Configuración
          </IonButton>

          <IonButton 
            expand="block" 
            fill="outline"
            className="logout-button-vet"
            onClick={() => setShowLogoutAlert(true)}
          >
            <IonIcon icon={logOutOutline} slot="start" />
            Cerrar Sesión
          </IonButton>
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
            className="nav-item active"
            onClick={() => history.push('/vet/profile')}
          >
            <IonIcon icon={personOutline} className="nav-icon" />
            <span>Perfil</span>
          </div>
        </div>

        {/* Alert de confirmación de logout */}
        <IonAlert
          isOpen={showLogoutAlert}
          onDidDismiss={() => setShowLogoutAlert(false)}
          header="Cerrar Sesión"
          message="¿Estás seguro de que deseas salir?"
          buttons={[
            {
              text: 'Cancelar',
              role: 'cancel'
            },
            {
              text: 'Salir',
              handler: handleLogout
            }
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default VetProfile;
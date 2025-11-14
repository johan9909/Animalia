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
  IonTabBar,
  IonTabButton,
  IonLabel,
  IonIcon,
  IonAlert
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { 
  home, 
  pawOutline, 
  calendarOutline, 
  personOutline,
  logOutOutline,
  createOutline
} from 'ionicons/icons';
import authService from '../../services/auth.service';
import sqliteService from '../../services/sqlite.service';
import './Profile.css';

const Profile: React.FC = () => {
  const history = useHistory();
  const [user, setUser] = useState<any>(null);
  const [pets, setPets] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      history.push('/login');
      return;
    }
    setUser(currentUser);

    // Cargar estadísticas
    const allPets = sqliteService.getPets();
    const userPets = allPets.filter((p : any) => p.clienteId === currentUser.id);
    setPets(userPets);

    const allAppointments = sqliteService.getAppointments();
    const userAppointments = allAppointments.filter((a : any) => a.clienteId === currentUser.id);
    setAppointments(userAppointments);
  }, [history]);

  const handleLogout = () => {
    authService.logout();
    history.push('/login');
  };

  const calculateYears = () => {
    // Simular años de uso (puedes mejorar esto con fecha de registro real)
    return 2;
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar style={{ '--background': 'var(--gradient-primary)' }}>
          <IonTitle color="light">Mi Perfil 👤</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <div className="profile-content">
          {/* Header del perfil */}
          <div className="profile-header">
            <div className="profile-avatar">
              {user?.nombre?.substring(0, 2).toUpperCase()}
            </div>
            <h2>{user?.nombre}</h2>
            <p>{user?.email}</p>
          </div>

          {/* Información Personal */}
          <IonCard>
            <IonCardContent>
              <h4>Información Personal</h4>
              <div className="info-row">
                <span className="label">Teléfono</span>
                <span className="value">{user?.telefono || '+57 300 123 4567'}</span>
              </div>
              <div className="info-row">
                <span className="label">Dirección</span>
                <span className="value">{user?.direccion || 'Calle 100 #15-20, Bogotá'}</span>
              </div>
              <div className="info-row">
                <span className="label">Correo</span>
                <span className="value">{user?.email}</span>
              </div>
            </IonCardContent>
          </IonCard>

          {/* Estadísticas */}
          <IonCard>
            <IonCardContent>
              <h4>Estadísticas</h4>
              <div className="stats-row">
                <div className="stat-item">
                  <div className="stat-value">{pets.length}</div>
                  <div className="stat-label">Mascotas</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{appointments.length}</div>
                  <div className="stat-label">Citas</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{calculateYears()}</div>
                  <div className="stat-label">Años</div>
                </div>
              </div>
            </IonCardContent>
          </IonCard>

          {/* Acciones */}
          <IonButton 
            expand="block" 
            className="edit-button"
            onClick={() => alert('Función de editar perfil en desarrollo')}
          >
            <IonIcon icon={createOutline} slot="start" />
            Editar Perfil
          </IonButton>

          <IonButton 
            expand="block" 
            fill="outline"
            className="logout-button"
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
            className="nav-item active"
            onClick={() => history.push('/client/profile')}
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

export default Profile;
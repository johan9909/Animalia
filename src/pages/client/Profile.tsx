import React, { useState } from 'react';
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
  IonAlert,
  IonModal,
  IonInput,
  IonToast,
  useIonViewWillEnter
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
  
  // Obtener usuario actual al inicio
  const current = authService.getCurrentUser();
  const [user, setUser] = useState<any>(current ? { ...current } : null);
  
  const [pets, setPets] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);

  // Estados del modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Estados del formulario de edición
  const [nombre, setNombre] = useState(user?.nombre || '');
  const [email, setEmail] = useState(user?.email || '');
  const [telefono, setTelefono] = useState(user?.telefono || '');
  const [direccion, setDireccion] = useState(user?.direccion || '');

  // Cargar datos al entrar a la vista
  useIonViewWillEnter(() => {
    const loadData = async () => {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        history.push('/login');
        return;
      }

      // Actualizar estado con usuario actual
      setUser({ ...currentUser });

      // Cargar estadísticas
      const allPets = await sqliteService.getPets();
      const userPets = allPets.filter((p: any) => p.clienteId === currentUser.id);
      setPets(userPets);

      const allAppointments = await sqliteService.getAppointments();
      const userAppointments = allAppointments.filter((a: any) => a.clienteId === currentUser.id);
      setAppointments(userAppointments);
    };

    loadData();
  });

  const handleEditClick = () => {
    // Cargar datos actuales en el formulario
    setNombre(user.nombre);
    setEmail(user.email);
    setTelefono(user.telefono || '');
    setDireccion(user.direccion || '');
    setShowEditModal(true);
  };

  const handleUpdateProfile = async () => {
    if (!nombre || !email) {
      setToastMessage('Nombre y correo son obligatorios');
      setShowToast(true);
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setToastMessage('Por favor ingresa un correo válido');
      setShowToast(true);
      return;
    }

    const updatedUser = {
      ...user,
      nombre,
      email,
      telefono: telefono || null,
      direccion: direccion || null
    };

    try {
      console.log('📝 Actualizando perfil...', updatedUser);
      
      // 1. Actualizar en SQLite
      await sqliteService.updateUser(user.id, updatedUser);
      //console.log('✅ SQLite actualizado');
      
      // 2. Actualizar en localStorage
      authService.updateCurrentUser(updatedUser);
      //console.log('✅ localStorage actualizado');
      
      // 3. CRÍTICO: Forzar actualización del estado → refresca en Android
      setUser((prev: any) => ({ ...prev, ...updatedUser }));

      //console.log('✅ Estado React actualizado');
      
      setToastMessage('¡Perfil actualizado exitosamente!');
      setShowToast(true);
      setShowEditModal(false);
    } catch (error) {
      console.error('❌ Error updating profile:', error);
      setToastMessage('Error al actualizar el perfil');
      setShowToast(true);
    }
  };

  const handleLogout = () => {
    authService.logout();
    history.push('/login');
  };

  if (!user) {
    return null;
  }

  return (
    <IonPage id="profile-page" key={user.id}>
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
                <span className="value">{user?.telefono || 'Agregue su número de teléfono'}</span>
              </div>
              <div className="info-row">
                <span className="label">Dirección</span>
                <span className="value">{user?.direccion || 'Agregue su dirección'}</span>
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
              </div>
            </IonCardContent>
          </IonCard>

          {/* Acciones */}
          <IonButton 
            expand="block" 
            className="edit-button"
            onClick={handleEditClick}
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

        {/* Modal para editar perfil */}
        <IonModal isOpen={showEditModal} onDidDismiss={() => setShowEditModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Editar Perfil</IonTitle>
              <IonButton slot="end" fill="clear" onClick={() => setShowEditModal(false)}>
                Cerrar
              </IonButton>
            </IonToolbar>
          </IonHeader>
          <IonContent className="modal-content">
            <div style={{ padding: '20px' }}>
              
              <div className="input-group">
                <label>Nombre *</label>
                <IonInput
                  value={nombre}
                  //placeholder="Juan Pérez"
                  onIonInput={e => setNombre(e.detail.value || '')}
                />
              </div>

              <div className="input-group">
                <label>Correo Electrónico *</label>
                <IonInput
                  type="email"
                  value={email}
                  //placeholder="correo@ejemplo.com"
                  onIonInput={e => setEmail(e.detail.value || '')}
                />
              </div>

              <div className="input-group">
                <label>Teléfono</label>
                <IonInput
                  type="tel"
                  value={telefono}
                  //placeholder="+57 300 123 4567"
                  onIonInput={e => setTelefono(e.detail.value || '')}
                />
              </div>

              <div className="input-group">
                <label>Dirección</label>
                <IonInput
                  value={direccion}
                  //placeholder="Calle 100 #15-20, Bogotá"
                  onIonInput={e => setDireccion(e.detail.value || '')}
                />
              </div>

              <IonButton 
                expand="block" 
                onClick={handleUpdateProfile}
                style={{ marginTop: '20px' }}
              >
                Guardar Cambios
              </IonButton>
            </div>
          </IonContent>
        </IonModal>

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

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2000}
          color={toastMessage.includes('éxito') ? 'success' : 'warning'}
        />
      </IonContent>
    </IonPage>
  );
};

export default Profile;
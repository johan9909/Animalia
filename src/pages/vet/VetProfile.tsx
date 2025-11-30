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
  
  // ⭐ CAMBIO 1: Obtener usuario al inicio como en Profile
  const current = authService.getCurrentUser();
  const [user, setUser] = useState<any>(current ? { ...current } : null);
  
  const [appointments, setAppointments] = useState<any[]>([]);
  const [patients, setPatients] = useState<number>(0);
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);

  // Estados del modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // ⭐ CAMBIO 2: Inicializar estados del formulario con valores del usuario
  const [nombre, setNombre] = useState(current?.nombre || '');
  const [email, setEmail] = useState(current?.email || '');
  const [especialidad, setEspecialidad] = useState(current?.especialidad || '');
  const [licencia, setLicencia] = useState(current?.licencia || '');
  const [experiencia, setExperiencia] = useState(current?.experiencia?.toString() || '');
  const [horario, setHorario] = useState(current?.horario || '');

  useIonViewWillEnter(() => {
    const loadData = async () => {
      const currentUser = authService.getCurrentUser();
      if (!currentUser || currentUser.tipo !== 'veterinario') {
        history.push('/login');
        return;
      }
      
      // ⭐ CAMBIO 3: Actualizar estado con spread como en Profile
      setUser({ ...currentUser });

      // Cargar estadísticas
      const allAppointments = await sqliteService.getAppointments();
      const vetAppointments = allAppointments.filter((a: any) => a.veterinarioId === currentUser.id);
      setAppointments(vetAppointments);

      // Contar pacientes únicos
      const uniquePetIds = [...new Set(vetAppointments.map((a: any) => a.mascotaId))];
      setPatients(uniquePetIds.length);
    };
    
    loadData();
  });

  const handleEditClick = () => {
    // Cargar datos actuales en el formulario
    setNombre(user.nombre);
    setEmail(user.email);
    setEspecialidad(user.especialidad || '');
    setLicencia(user.licencia || '');
    setExperiencia(user.experiencia?.toString() || '');
    setHorario(user.horario || '');
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
      especialidad: especialidad || null,
      licencia: licencia || null,
      experiencia: experiencia ? parseInt(experiencia) : null,
      horario: horario || null
    };

    try {
      console.log('📝 Actualizando perfil veterinario...', updatedUser);
      
      // 1. Actualizar en SQLite
      await sqliteService.updateUser(user.id, updatedUser);
      
      // 2. Actualizar en localStorage
      authService.updateCurrentUser(updatedUser);
      
      // ⭐ CAMBIO 4: Usar spread operator como en Profile del cliente
      setUser((prev: any) => ({ ...prev, ...updatedUser }));
      
      setToastMessage('¡Perfil actualizado exitosamente!');
      setShowToast(true);
      setShowEditModal(false);
      
      console.log('✅ Perfil veterinario actualizado');
    } catch (error) {
      console.error('Error updating profile:', error);
      setToastMessage('Error al actualizar el perfil');
      setShowToast(true);
    }
    
    // ⭐ CAMBIO 5: REMOVIDO history.replace - no es necesario
  };

  const handleLogout = () => {
    authService.logout();
    history.push('/login');
  };

  const getThisMonthAppointments = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return appointments.filter(a => {
      const [year, month] = a.fecha.split('-').map(Number);
      return month - 1 === currentMonth && year === currentYear;
    }).length;
  };

  if (!user) {
    return null;
  }

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
          </div>

          {/* Información Profesional */}
          <IonCard>
            <IonCardContent>
              <h4>Información Profesional</h4>
              <div className="info-row">
                <span className="label">Especialidad</span>
                <span className="value">{user?.especialidad || 'Agregue una especialidad'}</span>
              </div>
              <div className="info-row">
                <span className="label">Licencia Profesional</span>
                <span className="value">{user?.licencia || 'Agregue su licencia'}</span>
              </div>
              <div className="info-row">
                <span className="label">Años de Experiencia</span>
                <span className="value">{user?.experiencia || 0} años</span>
              </div>
              <div className="info-row">
                <span className="label">Horario de Atención</span>
                <span className="value">{user?.horario || 'Agregue su horario laboral'}</span>
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
              </div>
            </IonCardContent>
          </IonCard>

          {/* Acciones */}
          <IonButton 
            expand="block" 
            className="edit-button-vet"
            onClick={handleEditClick}
          >
            <IonIcon icon={createOutline} slot="start" />
            Editar Perfil
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

        {/* Modal para editar perfil */}
        <IonModal isOpen={showEditModal} onDidDismiss={() => setShowEditModal(false)}>
          <IonHeader>
            <IonToolbar className="vet-toolbar">
              <IonTitle color="light">Editar Perfil</IonTitle>
              <IonButton slot="end" fill="clear" onClick={() => setShowEditModal(false)} color="light">
                Cerrar
              </IonButton>
            </IonToolbar>
          </IonHeader>
          <IonContent className="modal-content">
            <div style={{ padding: '20px' }}>
              
              <div className="input-group">
                <label>Nombre Completo *</label>
                <IonInput
                  value={nombre}
                  onIonInput={e => setNombre(e.detail.value || '')}
                />
              </div>

              <div className="input-group">
                <label>Correo Electrónico *</label>
                <IonInput
                  type="email"
                  value={email}
                  onIonInput={e => setEmail(e.detail.value || '')}
                />
              </div>

              <div className="input-group">
                <label>Especialidad</label>
                <IonInput
                  value={especialidad}
                  onIonInput={e => setEspecialidad(e.detail.value || '')}
                />
              </div>

              <div className="input-group">
                <label>Licencia Profesional</label>
                <IonInput
                  value={licencia}
                  onIonInput={e => setLicencia(e.detail.value || '')}
                />
              </div>

              <div className="input-group">
                <label>Años de Experiencia</label>
                <IonInput
                  type="number"
                  value={experiencia}
                  onIonInput={e => setExperiencia(e.detail.value || '')}
                />
              </div>

              <div className="input-group">
                <label>Horario de Atención</label>
                <IonInput
                  value={horario}
                  onIonInput={e => setHorario(e.detail.value || '')}
                />
              </div>

              <IonButton 
                expand="block" 
                onClick={handleUpdateProfile}
                style={{ marginTop: '20px' }}
                className="save-button-vet"
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

export default VetProfile;
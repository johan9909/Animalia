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
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonFab,
  IonFabButton,
  IonIcon,
  IonModal,
  IonSelect,
  IonSelectOption,
  IonToast,
  IonDatetime,
  IonTextarea,
  useIonViewWillEnter
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
import sqliteService from '../../services/sqlite.service';
import './Appointments.css';

const Appointments: React.FC = () => {
  const history = useHistory();
  const [user, setUser] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [pets, setPets] = useState<any[]>([]);
  const [vets, setVets] = useState<any[]>([]);
  const [filter, setFilter] = useState<'proximas' | 'historial'>('proximas');

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Formulario
  const [fecha, setFecha] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFin, setHoraFin] = useState('');
  const [mascotaId, setMascotaId] = useState('');
  const [veterinarioId, setVeterinarioId] = useState('');
  const [servicio, setServicio] = useState('');
  const [precio, setPrecio] = useState('');
  const [sintomas, setSintomas] = useState('');

  useIonViewWillEnter(() => {
    const loadData = async () => {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        history.push('/login');
        return;
      }
      setUser(currentUser);

      const allPets = await sqliteService.getPets();
      setPets(allPets.filter((p: any) => p.clienteId === currentUser.id));

      const allAppointments = await sqliteService.getAppointments();
      setAppointments(allAppointments.filter((a: any) => a.clienteId === currentUser.id));

      const allUsers = await sqliteService.getUsers();
      setVets(allUsers.filter((u: any) => u.tipo === 'veterinario'));
    };

    loadData();
  });

  const loadAppointments = async (userId: number) => {
    const allAppointments = await sqliteService.getAppointments();
    setAppointments(allAppointments.filter((a: any) => a.clienteId === userId));
  };

  const handleCancelAppointment = async (appointmentId: number) => {
    const confirmCancel = window.confirm('¿Estás seguro de que deseas cancelar esta cita?');

    if (confirmCancel) {
      try {
        await sqliteService.cancelAppointment(appointmentId, { estado: 'cancelada' });

        setToastMessage('Cita cancelada exitosamente');
        setShowToast(true);

        await loadAppointments(user.id);
      } catch (error) {
        setToastMessage('Error al cancelar la cita');
        setShowToast(true);
      }
    }
  };

  const handleAddAppointment = async () => {
    if (pets.length === 0) {
      setToastMessage('Primero debes registrar una mascota');
      setShowToast(true);
      return;
    }

    if (!mascotaId || !veterinarioId || !servicio || !fecha || !horaInicio || !horaFin) {
      setToastMessage('Por favor completa todos los campos obligatorios');
      setShowToast(true);
      return;
    }

    const fechaFormateada = fecha.split('T')[0];

    const newAppointment = {
      fecha: fechaFormateada,
      horaInicio,
      horaFin,
      mascotaId: parseInt(mascotaId),
      clienteId: user.id,
      veterinarioId: parseInt(veterinarioId),
      servicio,
      precio: precio ? parseFloat(precio) : null,
      estado: 'pendiente',
      diagnostico: null,
      tratamiento: null,
      sintomas: sintomas || null,
      temperatura: null,
      pesoActual: null
    };

    try {
      await sqliteService.addAppointment(newAppointment);

      setToastMessage('¡Cita agendada exitosamente!');
      setShowToast(true);
      setShowModal(false);

      // Limpiar formulario
      setFecha('');
      setHoraInicio('');
      setHoraFin('');
      setMascotaId('');
      setVeterinarioId('');
      setServicio('');
      setPrecio('');
      setSintomas('');

      await loadAppointments(user.id);
    } catch (error) {
      console.error('Error adding appointment:', error);
      setToastMessage('Error al agendar la cita');
      setShowToast(true);
    }
  };

  const getFilteredAppointments = () => {
    // Obtener la fecha de hoy en formato YYYY-MM-DD
    const today = new Date();
    const todayYear = today.getFullYear();
    const todayMonth = String(today.getMonth() + 1).padStart(2, '0');
    const todayDay = String(today.getDate()).padStart(2, '0');
    const todayDate = `${todayYear}-${todayMonth}-${todayDay}`;

    if (filter === 'proximas') {
      // Mostrar citas de hoy en adelante que NO estén completadas ni canceladas
      return appointments.filter(a => 
        a.fecha >= todayDate && 
        a.estado !== 'cancelada' && 
        a.estado !== 'completada'
      );
    } else {
      // Mostrar citas pasadas O completadas O canceladas
      return appointments.filter(a => 
        a.fecha < todayDate || 
        a.estado === 'completada' || 
        a.estado === 'cancelada'
      );
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

  const formatDate = (dateStr: string): string => {
    const [year, month, day] = dateStr.split('-');
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${day} ${months[parseInt(month) - 1]} ${year}`;
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
          
          <IonSegment value={filter} onIonChange={e => setFilter(e.detail.value as any)}>
            <IonSegmentButton value="proximas">
              <IonLabel>Próximas</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="historial">
              <IonLabel>Historial</IonLabel>
            </IonSegmentButton>
          </IonSegment>

          {filteredAppointments.length > 0 ? (
            filteredAppointments.map(appointment => (
              <IonCard 
                key={appointment.id} 
                className="appointment-card"
                onClick={() => {
                  if (filter === 'proximas') {
                    history.push(`/client/appointment-detail/${appointment.id}`);
                  }
                }}
              >
                <IonCardContent>
                  <span className={`badge ${getBadgeClass(appointment.estado)}`}>
                    {appointment.estado}
                  </span>

                  <div className="appointment-time">
                    🕐 {formatDate(appointment.fecha)} - {appointment.horaInicio}
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

                  {filter === 'proximas' && (
                    <div className="appointment-actions">
                      <IonButton 
                        fill="outline" 
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancelAppointment(appointment.id);
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
                  )}
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

        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={() => setShowModal(true)}>
            <IonIcon icon={addOutline} />
          </IonFabButton>
        </IonFab>

        {/* MODAL */}
        <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Agendar Cita</IonTitle>
              <IonButton slot="end" fill="clear" onClick={() => setShowModal(false)}>
                Cerrar
              </IonButton>
            </IonToolbar>
          </IonHeader>

          <IonContent className="modal-content">
            <div style={{ padding: '20px' }}>

              <div className="input-group">
                <label>Mascota *</label>
                <IonSelect
                  value={mascotaId}
                  placeholder="Selecciona una mascota"
                  onIonChange={e => setMascotaId(e.detail.value)}
                >
                  {pets.length > 0 ? (
                    pets.map(pet => (
                      <IonSelectOption key={pet.id} value={pet.id.toString()}>
                        {pet.nombre} - {pet.raza}
                      </IonSelectOption>
                    ))
                  ) : (
                    <IonSelectOption value="">No tienes mascotas registradas</IonSelectOption>
                  )}
                </IonSelect>
              </div>

              <div className="input-group">
                <label>Veterinario *</label>
                <IonSelect
                  value={veterinarioId}
                  placeholder="Selecciona un veterinario"
                  onIonChange={e => setVeterinarioId(e.detail.value)}
                >
                  {vets.map(vet => (
                    <IonSelectOption key={vet.id} value={vet.id.toString()}>
                      {vet.nombre}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </div>

              <div className="input-group">
                <label>Servicio *</label>
                <IonSelect
                  value={servicio}
                  placeholder="Selecciona un servicio"
                  onIonChange={e => setServicio(e.detail.value)}
                >
                  <IonSelectOption value="Consulta General">Consulta General</IonSelectOption>
                  <IonSelectOption value="Vacunación">Vacunación</IonSelectOption>
                  <IonSelectOption value="Desparasitación">Desparasitación</IonSelectOption>
                  <IonSelectOption value="Cirugía">Cirugía</IonSelectOption>
                  <IonSelectOption value="Control">Control</IonSelectOption>
                  <IonSelectOption value="Emergencia">Emergencia</IonSelectOption>
                  <IonSelectOption value="Baño y Peluquería">Baño y Peluquería</IonSelectOption>
                </IonSelect>
              </div>

              <div className="input-group">
                <label>Fecha *</label>
                <IonDatetime
                  value={fecha}
                  onIonChange={e => setFecha(e.detail.value as string)}
                  presentation="date"
                  min={new Date().toISOString()}
                />
              </div>

              <div className="input-group">
                <label>Hora de Inicio *</label>
                <IonDatetime
                  value={horaInicio}
                  presentation="time"
                  onIonChange={e => {
                    const raw = e.target.value as string; 
                    if (!raw) return;
                    const time = raw.length > 5 ? raw.split("T")[1].substring(0, 5) : raw;
                    setHoraInicio(time);
                  }}
                />
              </div>

              <div className="input-group">
                <label>Hora de Fin *</label>
                <IonDatetime
                  value={horaFin}
                  presentation="time"
                  onIonChange={e => {
                    const raw = e.target.value as string;
                    if (!raw) return;
                    const time = raw.length > 5 ? raw.split("T")[1].substring(0, 5) : raw;
                    setHoraFin(time);
                  }}
                />
              </div>

              <div className="input-group">
                <label>Síntomas (opcional)</label>
                <IonTextarea
                  value={sintomas}
                  placeholder="Describe los síntomas de tu mascota..."
                  rows={3}
                  onIonInput={(e) => setSintomas(e.target.value || '')}
                />
              </div>

              <IonButton 
                expand="block" 
                onClick={handleAddAppointment}
                style={{ marginTop: '20px' }}
              >
                Agendar Cita
              </IonButton>
            </div>
          </IonContent>
        </IonModal>

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
            className="nav-item active"
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

export default Appointments;
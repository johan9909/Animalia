import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonCard,
  IonCardContent,
  IonButton,
  IonModal,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonToast,
  IonDatetime,
  IonTextarea
} from '@ionic/react';
import { useParams, useHistory } from 'react-router-dom';
import sqliteService from '../../services/sqlite.service';
import './AppointmentDetail.css';

interface AppointmentDetailParams {
  id: string;
}

const AppointmentDetail: React.FC = () => {
  const { id } = useParams<AppointmentDetailParams>();
  const history = useHistory();
  const [appointment, setAppointment] = useState<any>(null);
  const [pet, setPet] = useState<any>(null);
  const [vet, setVet] = useState<any>(null);
  const [pets, setPets] = useState<any[]>([]);
  const [vets, setVets] = useState<any[]>([]);

  // Estados del modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Estados del formulario de edición
  const [fecha, setFecha] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFin, setHoraFin] = useState('');
  const [mascotaId, setMascotaId] = useState('');
  const [veterinarioId, setVeterinarioId] = useState('');
  const [servicio, setServicio] = useState('');
  const [precio, setPrecio] = useState('');
  const [sintomas, setSintomas] = useState('');

  useEffect(() => {

    const loadData = async () => {

      // Cargar cita
      const allAppointments = await sqliteService.getAppointments();
      const foundAppointment = allAppointments.find((a : any) => a.id === parseInt(id));
      setAppointment(foundAppointment);

      // Cargar todas las mascotas del cliente
      if (foundAppointment) {
        const allPets = await sqliteService.getPets();
        const userPets = allPets.filter((p : any) => p.clienteId === foundAppointment.clienteId);
        setPets(userPets);

        // Cargar mascota actual
        const foundPet = allPets.find((p : any)=> p.id === foundAppointment.mascotaId);
        setPet(foundPet);

        // Cargar todos los veterinarios
        const allUsers = await sqliteService.getUsers();
        const veterinarians = allUsers.filter((u : any) => u.tipo === 'veterinario');
        setVets(veterinarians);

        // Cargar veterinario actual
        const foundVet = allUsers.find((u : any) => u.id === foundAppointment.veterinarioId);
        setVet(foundVet);
      }

    };

    loadData();

  
  }, [id]);

  const handleEditClick = () => {
    // Cargar datos actuales en el formulario
    setFecha(appointment.fecha);
    setHoraInicio(appointment.horaInicio);
    setHoraFin(appointment.horaFin);
    setMascotaId(appointment.mascotaId.toString());
    setVeterinarioId(appointment.veterinarioId.toString());
    setServicio(appointment.servicio);
    setPrecio(appointment.precio?.toString() || '');
    setSintomas(appointment.sintomas || '');
    setShowEditModal(true);
  };

  const handleUpdateAppointment = async () => {
  /*if (!fecha || !horaInicio || !horaFin || !mascotaId || !veterinarioId || !servicio) {
    setToastMessage('Por favor completa todos los campos obligatorios');
    setShowToast(true);
    return;
  }*/

  const fechaFormateada = fecha.includes('T') ? fecha.split('T')[0] : fecha;

  const updatedAppointment = {
    fecha: fechaFormateada,
    horaInicio,
    horaFin,
    mascotaId: parseInt(mascotaId),
    veterinarioId: parseInt(veterinarioId),
    servicio,
    estado: appointment.estado,  
    sintomas: sintomas || null,
   
  };

  try {
    await sqliteService.updateAppointmenClient(parseInt(id), updatedAppointment);
    
    setToastMessage('¡Cita actualizada exitosamente!');
    setShowToast(true);
    setShowEditModal(false);
    
    // Recargar datos
    const allAppointments = await sqliteService.getAppointments();
    const foundAppointment = allAppointments.find((a : any) => a.id === parseInt(id));
    setAppointment(foundAppointment);

    if (foundAppointment) {
      const allPets = await sqliteService.getPets();
      const foundPet = allPets.find((p : any)=> p.id === foundAppointment.mascotaId);
      setPet(foundPet);

      const allUsers = await sqliteService.getUsers();
      const foundVet = allUsers.find((u : any) => u.id === foundAppointment.veterinarioId);
      setVet(foundVet);
    }
  } catch (error) {
    setToastMessage('Error al actualizar la cita');
    setShowToast(true);
  }
};

  const handleCancelAppointment = async () => {
  const confirmCancel = window.confirm('¿Estás seguro de que deseas cancelar esta cita?');
  
  if (confirmCancel) {
    try {
      await sqliteService.updateAppointmenClient(parseInt(id), {
        ...appointment,
        estado: 'cancelada'
      });
      
      setToastMessage('Cita cancelada exitosamente');
      setShowToast(true);
      
      setTimeout(() => {
        history.push('/client/appointments');
      }, 500);
      
      // Recargar datos
      const allAppointments = await sqliteService.getAppointments();
      const foundAppointment = allAppointments.find((a : any) => a.id === parseInt(id));
      setAppointment(foundAppointment);
    } catch (error) {
      setToastMessage('Error al cancelar la cita');
      setShowToast(true);
    }
  }
};

  if (!appointment) {
    return <div>Cargando...</div>;
  }

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

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar style={{ '--background': 'var(--gradient-primary)' }}>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/client/appointments" color="light" />
          </IonButtons>
          <IonTitle color="light">Detalle de Cita 📋</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <div className="appointment-detail-content">
          <IonCard>
            <IonCardContent>
              <span className={`badge ${getBadgeClass(appointment.estado)}`}>
                {appointment.estado}
              </span>
              <h3>{appointment.servicio}</h3>
              <div className="detail-time">
                📅 {appointment.fecha}<br />
                🕐 {appointment.horaInicio} - {appointment.horaFin}
              </div>

              <div className="detail-section">
                <h4>Mascota</h4>
                {pet && (
                  <div className="detail-row">
                    <div className="pet-avatar-small">
                      {pet.especie.toLowerCase() === 'perro' ? '🐕' : '🐈'}
                    </div>
                    <div>
                      <strong>{pet.nombre}</strong>
                      <p>{pet.raza} • {pet.edad} años</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="detail-section">
                <h4>Veterinario</h4>
                {vet && (
                  <div className="detail-row">
                    <div className="vet-avatar-small">
                      {vet.nombre.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <strong>{vet.nombre}</strong>
                      <p>{vet.especialidad || 'Medicina General'}</p>
                      <p>📞 {vet.telefono || '+57 300 123 4567'}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="detail-section">
                <h4>Ubicación</h4>
                <p>📍 Calle 123 #45-67, Bogotá</p>
              </div>

             

              {appointment.sintomas && (
                <div className="detail-section">
                  <h4>Síntomas</h4>
                  <p>{appointment.sintomas}</p>
                </div>
              )}
            </IonCardContent>
          </IonCard>

          {appointment.estado !== 'cancelada' && appointment.estado !== 'completada' && (
            <>
              <IonButton 
                expand="block" 
                fill="outline"
                color="danger"
                onClick={handleCancelAppointment}
              >
                Cancelar Cita
              </IonButton>
              <IonButton 
                expand="block"
                onClick={handleEditClick}
              >
                Editar Cita
              </IonButton>
            </>
          )}

          {appointment.estado === 'completada' && (
            <IonButton 
              expand="block"
              onClick={() => alert('Función de calificar en desarrollo')}
            >
              Calificar Servicio ⭐
            </IonButton>
          )}
        </div>

        {/* Modal para editar cita */}
        <IonModal isOpen={showEditModal} onDidDismiss={() => setShowEditModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Editar Cita</IonTitle>
              <IonButton slot="end" fill="clear" onClick={() => setShowEditModal(false)}>
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
                  {pets.map(pet => (
                    <IonSelectOption key={pet.id} value={pet.id.toString()}>
                      {pet.nombre} - {pet.raza}
                    </IonSelectOption>
                  ))}
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
                  //placeholder="Selecciona una fecha"
                />
              </div>

              <div className="input-group">
                <label>Hora de Inicio *</label>
                <IonDatetime
                  value={horaInicio}
                  presentation="time"
                  onIonChange={e => {
                    const raw = e.target.value as string; // Más confiable que e.detail.value
                    if (!raw) return;

                    // IonDatetime puede devolver "HH:mm" o "YYYY-MM-DDTHH:mm:ss"
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
                  const raw = e.target.value as string; // Siempre funciona
                  if (!raw) return;

                  // IonDatetime devuelve "HH:mm" en presentation="time"
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
                  //onIonChange={e => setSintomas(e.detail.value!)}
                  onIonChange={(e) => setSintomas(e.target.value as string)}
                />
              </div>

              <IonButton 
                expand="block" 
                onClick={handleUpdateAppointment}
                style={{ marginTop: '20px' }}
              >
                Guardar Cambios
              </IonButton>
            </div>
          </IonContent>
        </IonModal>

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2000}
        />
      </IonContent>
    </IonPage>
  );
};

export default AppointmentDetail;
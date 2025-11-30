import React, { useState } from 'react';
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
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonToast,
  IonLoading,
  useIonViewWillEnter
} from '@ionic/react';
import { useParams, useHistory } from 'react-router-dom';
import sqliteService from '../../services/sqlite.service';
import './Consultation.css';

interface ConsultationParams {
  id: string;
}

const Consultation: React.FC = () => {
  const { id } = useParams<ConsultationParams>();
  const history = useHistory();
  
  const [appointment, setAppointment] = useState<any>(null);
  const [pet, setPet] = useState<any>(null);
  const [client, setClient] = useState<any>(null);
  
  // Campos del formulario
  const [sintomas, setSintomas] = useState('');
  const [temperatura, setTemperatura] = useState('');
  const [pesoActual, setPesoActual] = useState('');
  const [diagnostico, setDiagnostico] = useState('');
  const [tratamiento, setTratamiento] = useState('');
  const [proximaCita, setProximaCita] = useState('1 mes');
  
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      setIsLoading(true);
      await sqliteService.initDB();

      const allAppointments = await sqliteService.getAppointments();
      const foundAppointment = allAppointments.find((a: any) => a.id === parseInt(id));
      
      if (foundAppointment) {
        setAppointment(foundAppointment);
        
        // Cargar datos existentes si ya se guardó la consulta
        if (foundAppointment.sintomas) setSintomas(foundAppointment.sintomas);
        if (foundAppointment.temperatura) setTemperatura(foundAppointment.temperatura.toString());
        if (foundAppointment.pesoActual) setPesoActual(foundAppointment.pesoActual.toString());
        if (foundAppointment.diagnostico) setDiagnostico(foundAppointment.diagnostico);
        if (foundAppointment.tratamiento) setTratamiento(foundAppointment.tratamiento);

        // Cargar mascota
        const allPets = await sqliteService.getPets();
        const foundPet = allPets.find((p: any) => p.id === foundAppointment.mascotaId);
        setPet(foundPet);
        
        if (foundPet && !foundAppointment.pesoActual) {
          setPesoActual(foundPet.peso.toString());
        }

        // Cargar cliente
        const allUsers = await sqliteService.getUsers();
        const foundClient = allUsers.find((u: any) => u.id === foundAppointment.clienteId);
        setClient(foundClient);
      }
    } catch (error) {
      console.error('Error loading consultation data:', error);
      setToastMessage('Error al cargar los datos de la consulta');
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  useIonViewWillEnter(() => {
    loadData();
  });

  const handleSaveConsultation = async () => {
    if (!diagnostico || !tratamiento) {
      setToastMessage('Por favor completa al menos el diagnóstico y tratamiento');
      setShowToast(true);
      return;
    }

    try {
      setLoading(true);

      // Actualizar la cita con los datos de la consulta
      await sqliteService.updateAppointment(parseInt(id), {
        sintomas,
        temperatura: temperatura ? parseFloat(temperatura) : undefined,
        pesoActual: pesoActual ? parseFloat(pesoActual) : undefined,
        diagnostico,
        tratamiento,
        estado: 'completada'
      });

      // Actualizar el peso de la mascota si cambió
      if (pet && pesoActual && parseFloat(pesoActual) !== pet.peso) {
        await sqliteService.updatePet(pet.id, {
          peso: parseFloat(pesoActual)
        });
      }

      setToastMessage('¡Consulta guardada exitosamente!');
      setShowToast(true);

      setTimeout(() => {
        history.push('/vet/dashboard');
      }, 1500);
    } catch (error) {
      console.error('Error saving consultation:', error);
      setToastMessage('Error al guardar la consulta');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const getPetEmoji = (especie: string) => {
    return especie?.toLowerCase() === 'perro' ? '🐕' : '🐈';
  };

  // Loading state
  if (isLoading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar className="vet-toolbar">
            <IonButtons slot="start">
              <IonBackButton defaultHref="/vet/dashboard" color="light" />
            </IonButtons>
            <IonTitle color="light">Consulta 🩺</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <IonLoading isOpen={true} message="Cargando consulta..." />
          </div>
        </IonContent>
      </IonPage>
    );
  }

  // No data found
  if (!appointment || !pet) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar className="vet-toolbar">
            <IonButtons slot="start">
              <IonBackButton defaultHref="/vet/dashboard" color="light" />
            </IonButtons>
            <IonTitle color="light">Consulta 🩺</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            <div style={{ fontSize: '60px', marginBottom: '20px' }}>⚠️</div>
            <h2>No se encontró la consulta</h2>
            <p>La consulta solicitada no existe o no está disponible.</p>
            <IonButton onClick={() => history.push('/vet/dashboard')}>
              Volver al Dashboard
            </IonButton>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="vet-toolbar">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/vet/dashboard" color="light" />
          </IonButtons>
          <IonTitle color="light">Consulta 🩺</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <div className="consultation-content">
          {/* Información del Paciente */}
          <IonCard>
            <IonCardContent>
              <h4>Información del Paciente</h4>
              <div className="patient-header">
                <div className="patient-avatar-large">
                  {getPetEmoji(pet.especie)}
                </div>
                <div className="patient-details-large">
                  <h3>{pet.nombre}</h3>
                  <p>{pet.raza} • {pet.especie} • {pet.edad} años</p>
                  <p>Peso: {pet.peso} kg</p>
                </div>
              </div>
              <div className="client-info">
                <p><strong>Dueño:</strong> {client?.nombre || 'No disponible'}</p>
                <p><strong>Teléfono:</strong> {client?.telefono || 'No disponible'}</p>
              </div>
            </IonCardContent>
          </IonCard>

          {/* Motivo de Consulta */}
          <IonCard>
            <IonCardContent>
              <h4>Motivo de Consulta</h4>
              <p className="service-text">{appointment.servicio}</p>
            </IonCardContent>
          </IonCard>

          {/* Formulario de Consulta */}
          <IonCard>
            <IonCardContent>
              <h4>Datos de la Consulta</h4>
              
              <div className="input-group">
                <label>Síntomas Observados</label>
                <IonTextarea
                  rows={3}
                  value={sintomas}
                  placeholder="Describe los síntomas observados..."
                  onIonChange={e => setSintomas(e.detail.value!)}
                />
              </div>

              <div className="input-row">
                <div className="input-group" style={{ flex: 1 }}>
                  <label>Temperatura (°C)</label>
                  <IonInput
                    type="number"
                    value={temperatura}
                    placeholder="38.5"
                    step="0.1"
                    onIonChange={e => setTemperatura(e.detail.value!)}
                  />
                </div>

                <div className="input-group" style={{ flex: 1 }}>
                  <label>Peso Actual (kg)</label>
                  <IonInput
                    type="number"
                    value={pesoActual}
                    placeholder="28.0"
                    step="0.1"
                    onIonChange={e => setPesoActual(e.detail.value!)}
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Diagnóstico *</label>
                <IonTextarea
                  rows={4}
                  value={diagnostico}
                  placeholder="Escribe el diagnóstico..."
                  onIonChange={e => setDiagnostico(e.detail.value!)}
                />
              </div>

              <div className="input-group">
                <label>Tratamiento *</label>
                <IonTextarea
                  rows={4}
                  value={tratamiento}
                  placeholder="Indica el tratamiento a seguir..."
                  onIonChange={e => setTratamiento(e.detail.value!)}
                />
              </div>

              <div className="input-group">
                <label>Próxima Cita</label>
                <IonSelect
                  value={proximaCita}
                  onIonChange={e => setProximaCita(e.detail.value)}
                >
                  <IonSelectOption value="1 semana">1 semana</IonSelectOption>
                  <IonSelectOption value="2 semanas">2 semanas</IonSelectOption>
                  <IonSelectOption value="1 mes">1 mes</IonSelectOption>
                  <IonSelectOption value="3 meses">3 meses</IonSelectOption>
                  <IonSelectOption value="6 meses">6 meses</IonSelectOption>
                  <IonSelectOption value="no requiere">No requiere</IonSelectOption>
                </IonSelect>
              </div>
            </IonCardContent>
          </IonCard>

          <IonButton 
            expand="block" 
            className="save-button"
            onClick={handleSaveConsultation}
          >
            Guardar Consulta
          </IonButton>
        </div>

        <IonLoading isOpen={loading} message="Guardando consulta..." />
        
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

export default Consultation;
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
  IonIcon,
  IonModal,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonToast,
  IonDatetime,
  IonFab,
  IonFabButton
} from '@ionic/react';
import { useParams } from 'react-router-dom';
import { addOutline, trashOutline, medkitOutline } from 'ionicons/icons';
import sqliteService from '../../services/sqlite.service';
import './VaccineHistory.css';

interface VaccineHistoryParams {
  petId: string;
}

const VaccineHistory: React.FC = () => {
  const { petId } = useParams<VaccineHistoryParams>();
  const [pet, setPet] = useState<any>(null);
  const [vaccines, setVaccines] = useState<any[]>([]);

  // Estados del modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Estados del formulario
  const [vaccineNombre, setVaccineNombre] = useState('');
  const [vaccineFecha, setVaccineFecha] = useState('');

  useEffect(() => {
    loadData();
  }, [petId]);

  const loadData = async () => {

    const allPets = await sqliteService.getPets();
    const foundPet = allPets.find((p: any) => p.id === parseInt(petId));
    
    if (foundPet) {
      setPet(foundPet);
      setVaccines(foundPet.vacunas || []);
    }
  };

  const handleAddVaccine = async () => {
    if (!vaccineNombre || !vaccineFecha) {
      setToastMessage('Por favor completa todos los campos');
      setShowToast(true);
      return;
    }

    const fechaFormateada = vaccineFecha.includes('T') ? vaccineFecha.split('T')[0] : vaccineFecha;

    const newVaccine = {
      petId: parseInt(petId),
      nombre: vaccineNombre,
      fecha: fechaFormateada
    };

    try {
      await sqliteService.addVaccine(newVaccine);
      
      setToastMessage('¡Vacuna agregada exitosamente!');
      setShowToast(true);
      setShowAddModal(false);
      
      // Limpiar formulario
      setVaccineNombre('');
      setVaccineFecha('');
      
      // Recargar datos
      await loadData();
    } catch (error) {
      setToastMessage('Error al agregar la vacuna');
      setShowToast(true);
    }
  };

  const handleDeleteVaccine = async (vaccineId: number, vaccineName: string) => {
    const confirmDelete = window.confirm(`¿Estás seguro de que deseas eliminar la vacuna "${vaccineName}"?`);
    
    if (confirmDelete) {
      try {
        await sqliteService.deleteVaccine(vaccineId);
        
        setToastMessage('Vacuna eliminada exitosamente');
        setShowToast(true);
        
        // Recargar datos
        await loadData();
      } catch (error) {
        setToastMessage('Error al eliminar la vacuna');
        setShowToast(true);
      }
    }
  };

  const getPetEmoji = (especie: string) => {
    return especie?.toLowerCase() === 'perro' ? '🐕' : '🐈';
  };

  const getVaccineIcon = (nombre: string) => {
    const icons: any = {
      'Rabia': '🦠',
      'Parvovirus': '🧬',
      'Moquillo': '💉',
      'Hepatitis': '🔬',
      'Leptospirosis': '💊',
      'Triple Felina': '🐱',
      'Leucemia Felina': '🧪'
    };
    return icons[nombre] || '💉';
  };

  if (!pet) {
    return (
      <IonPage>
        <IonContent>
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <p>Cargando...</p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar style={{ '--background': 'var(--gradient-primary)' }}>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/client/pets" color="light" />
          </IonButtons>
          <IonTitle color="light">Vacunas de {pet.nombre}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <div className="vaccine-content">
          {/* Header con información de la mascota */}
          <IonCard className="pet-info-card">
            <IonCardContent>
              <div className="pet-header">
                <div className="pet-avatar-large">
                  {getPetEmoji(pet.especie)}
                </div>
                <div>
                  <h2>{pet.nombre}</h2>
                  <p>{pet.raza} • {pet.edad} años • {pet.peso} kg</p>
                </div>
              </div>
            </IonCardContent>
          </IonCard>

          {/* Resumen de vacunas */}
          <div className="vaccine-summary">
            <IonCard>
              <IonCardContent>
                <div className="summary-stats">
                  <div className="stat-item">
                    <div className="stat-icon">💉</div>
                    <div className="stat-value">{vaccines.length}</div>
                    <div className="stat-label">Total Vacunas</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-icon">
                      {vaccines.length > 0 ? '✅' : '⚠️'}
                    </div>
                    <div className="stat-value">
                      {vaccines.length > 0 ? 'Al día' : 'Pendiente'}
                    </div>
                    <div className="stat-label">Estado</div>
                  </div>
                </div>
              </IonCardContent>
            </IonCard>
          </div>

          {/* Historial de vacunas */}
          <h3 className="section-title">Historial de Vacunación</h3>

          {vaccines.length > 0 ? (
            vaccines
              .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
              .map((vaccine: any) => (
                <IonCard key={vaccine.id} className="vaccine-card">
                  <IonCardContent>
                    <div className="vaccine-info">
                      <div className="vaccine-icon">
                        {getVaccineIcon(vaccine.nombre)}
                      </div>
                      <div className="vaccine-details">
                        <h4>{vaccine.nombre}</h4>
                        <p className="vaccine-date">📅 {vaccine.fecha}</p>
                      </div>
                      <IonButton 
                        fill="clear" 
                        color="danger"
                        onClick={() => handleDeleteVaccine(vaccine.id, vaccine.nombre)}
                      >
                        <IonIcon icon={trashOutline} />
                      </IonButton>
                    </div>
                  </IonCardContent>
                </IonCard>
              ))
          ) : (
            <div className="empty-state">
              <div className="empty-icon">💉</div>
              <h3>No hay vacunas registradas</h3>
              <p>Agrega la primera vacuna de {pet.nombre}</p>
              <IonButton onClick={() => setShowAddModal(true)}>
                Agregar Vacuna
              </IonButton>
            </div>
          )}
        </div>

        {/* Botón flotante para agregar vacuna */}
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={() => setShowAddModal(true)}>
            <IonIcon icon={addOutline} />
          </IonFabButton>
        </IonFab>

        {/* Modal para agregar vacuna */}
        <IonModal isOpen={showAddModal} onDidDismiss={() => setShowAddModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Agregar Vacuna 💉</IonTitle>
              <IonButton slot="end" fill="clear" onClick={() => setShowAddModal(false)}>
                Cerrar
              </IonButton>
            </IonToolbar>
          </IonHeader>
          <IonContent className="modal-content">
            <div style={{ padding: '20px' }}>
              
              <div className="input-group">
                <label>Nombre de la Vacuna *</label>
                <IonSelect
                  value={vaccineNombre}
                  placeholder="Selecciona una vacuna"
                  onIonChange={e => setVaccineNombre(e.detail.value)}
                >
                  <IonSelectOption value="Rabia">Rabia</IonSelectOption>
                  <IonSelectOption value="Parvovirus">Parvovirus</IonSelectOption>
                  <IonSelectOption value="Moquillo">Moquillo</IonSelectOption>
                  <IonSelectOption value="Hepatitis">Hepatitis</IonSelectOption>
                  <IonSelectOption value="Leptospirosis">Leptospirosis</IonSelectOption>
                  <IonSelectOption value="Triple Felina">Triple Felina</IonSelectOption>
                  <IonSelectOption value="Leucemia Felina">Leucemia Felina</IonSelectOption>
                  <IonSelectOption value="Bordetella">Bordetella</IonSelectOption>
                  <IonSelectOption value="Coronavirus">Coronavirus</IonSelectOption>
                </IonSelect>
              </div>

              <div className="input-group">
                <label>Fecha de Aplicación *</label>
                <IonDatetime
                  value={vaccineFecha}
                  onIonChange={e => setVaccineFecha(e.detail.value as string)}
                  presentation="date"
                  max={new Date().toISOString()}
                 // placeholder="Selecciona la fecha"
                />
              </div>

              <IonButton 
                expand="block" 
                onClick={handleAddVaccine}
                style={{ marginTop: '20px' }}
              >
                <IonIcon icon={medkitOutline} slot="start" />
                Registrar Vacuna
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

export default VaccineHistory;
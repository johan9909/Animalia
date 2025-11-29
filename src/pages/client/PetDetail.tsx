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
  IonToast
} from '@ionic/react';
import { useParams, useHistory } from 'react-router-dom';
import { createOutline } from 'ionicons/icons';
import sqliteService from '../../services/sqlite.service';
import './PetDetail.css';

interface PetDetailParams {
  id: string;
}

const PetDetail: React.FC = () => {
  const { id } = useParams<PetDetailParams>();
  const history = useHistory();
  const [pet, setPet] = useState<any>(null);

  // Estados del modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Estados del formulario de edición
  const [nombre, setNombre] = useState('');
  const [especie, setEspecie] = useState('Perro');
  const [raza, setRaza] = useState('');
  const [edad, setEdad] = useState('');
  const [peso, setPeso] = useState('');
  const [color, setColor] = useState('');

  useEffect(() => {

    const loadData = async () => {
      
      await sqliteService.initDB();
      const allPets = await sqliteService.getPets();
      const foundPet = allPets.find(( p : any) => p.id === parseInt(id));
      setPet(foundPet);

    };

    loadData();
    
  }, [id]);

  const handleEditClick = () => {
    // Cargar datos actuales en el formulario
    setNombre(pet.nombre);
    setEspecie(pet.especie);
    setRaza(pet.raza);
    setEdad(pet.edad.toString());
    setPeso(pet.peso.toString());
    setColor(pet.color || '');
    setShowEditModal(true);
  };

  const handleUpdatePet = async () => {
  if (!nombre || !raza || !edad || !peso) {
    setToastMessage('Por favor completa todos los campos obligatorios');
    setShowToast(true);
    return;
  }

  const updatedPet = {
    nombre,
    especie,
    raza,
    edad: parseInt(edad),
    peso: parseFloat(peso),
    color,
    clienteId: pet.clienteId,
    vacunas: pet.vacunas
  };

  try {
    await sqliteService.updatePet(parseInt(id), updatedPet);
    
    // Actualizar el estado local con los nuevos datos
    setPet({
      ...pet,
      ...updatedPet
    });
    
    setToastMessage('¡Mascota actualizada exitosamente!');
    setShowToast(true);
    setShowEditModal(false);
  } catch (error) {
    setToastMessage('Error al actualizar la mascota');
    setShowToast(true);
  }
};

  if (!pet) {
    return <div>Cargando...</div>;
  }

  const getPetEmoji = (especie: string) => {
    return especie.toLowerCase() === 'perro' ? '🐕' : '🐈';
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar style={{ '--background': 'var(--gradient-primary)' }}>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/client/pets" color="light" />
          </IonButtons>
          <IonTitle color="light">{pet.nombre} {getPetEmoji(pet.especie)}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <div className="pet-detail-content">
          {/* Información General */}
          <IonCard>
            <IonCardContent>
              <h4>Información General</h4>
              <div className="info-row">
                <span className="label">Especie:</span>
                <span className="value">{pet.especie}</span>
              </div>
              <div className="info-row">
                <span className="label">Raza:</span>
                <span className="value">{pet.raza}</span>
              </div>
              <div className="info-row">
                <span className="label">Edad:</span>
                <span className="value">{pet.edad} años</span>
              </div>
              <div className="info-row">
                <span className="label">Peso:</span>
                <span className="value">{pet.peso} kg</span>
              </div>
              {pet.color && (
                <div className="info-row">
                  <span className="label">Color:</span>
                  <span className="value">{pet.color}</span>
                </div>
              )}
            </IonCardContent>
          </IonCard>

          {/* Vacunas */}
          <IonCard>
            <IonCardContent>
              <h4>Vacunas</h4>
              {pet.vacunas && pet.vacunas.length > 0 ? (
                pet.vacunas.map((vacuna: any, index: number) => (
                  <div key={index} className="vaccine-row">
                    <span>{vacuna.nombre}</span>
                    <span className="badge badge-success">{vacuna.fecha}</span>
                  </div>
                ))
              ) : (
                <p style={{ color: '#999', textAlign: 'center' }}>
                  No hay vacunas registradas
                </p>
              )}
            </IonCardContent>
          </IonCard>

          <IonButton 
            expand="block" 
            className="edit-button"
            onClick={handleEditClick}
          >
            <IonIcon icon={createOutline} slot="start" />
            Editar Información
          </IonButton>
        </div>

        {/* Modal para editar mascota */}
        <IonModal isOpen={showEditModal} onDidDismiss={() => setShowEditModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Editar Mascota</IonTitle>
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
                  placeholder="Max"
                  onIonChange={e => setNombre(e.detail.value!)}
                />
              </div>

              <div className="input-group">
                <label>Especie *</label>
                <IonSelect
                  value={especie}
                  onIonChange={e => setEspecie(e.detail.value)}
                >
                  <IonSelectOption value="Perro">Perro</IonSelectOption>
                  <IonSelectOption value="Gato">Gato</IonSelectOption>
                </IonSelect>
              </div>

              <div className="input-group">
                <label>Raza *</label>
                <IonInput
                  value={raza}
                  placeholder="Labrador"
                  onIonChange={e => setRaza(e.detail.value!)}
                />
              </div>

              <div className="input-group">
                <label>Edad (años) *</label>
                <IonInput
                  type="number"
                  value={edad}
                  placeholder="3"
                  onIonChange={e => setEdad(e.detail.value!)}
                />
              </div>

              <div className="input-group">
                <label>Peso (kg) *</label>
                <IonInput
                  type="number"
                  value={peso}
                  placeholder="28"
                  onIonChange={e => setPeso(e.detail.value!)}
                />
              </div>

              <div className="input-group">
                <label>Color (opcional)</label>
                <IonInput
                  value={color}
                  placeholder="Dorado"
                  onIonChange={e => setColor(e.detail.value!)}
                />
              </div>

              <IonButton 
                expand="block" 
                onClick={handleUpdatePet}
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

export default PetDetail;
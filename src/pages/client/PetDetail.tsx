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
  IonIcon
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

  useEffect(() => {

    const loadData = async () => {
      
      await sqliteService.initDB();
      const allPets = await sqliteService.getPets();
      const foundPet = allPets.find(( p : any) => p.id === parseInt(id));
      setPet(foundPet);

    };

    loadData();
    
  }, [id]);

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

          {/* Últimas Consultas */}
          <IonCard>
            <IonCardContent>
              <h4>Últimas Consultas</h4>
              <div className="consultation-row">
                <strong>Control General</strong>
                <p>Dr. Ricardo López • 15/09/2024</p>
              </div>
              <div className="consultation-row">
                <strong>Vacunación</strong>
                <p>Dra. Ana Martínez • 15/08/2024</p>
              </div>
            </IonCardContent>
          </IonCard>

          <IonButton 
            expand="block" 
            className="edit-button"
            onClick={() => alert('Función en desarrollo')}
          >
            <IonIcon icon={createOutline} slot="start" />
            Editar Información
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default PetDetail;
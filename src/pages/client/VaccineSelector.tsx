import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonCard,
  IonCardContent,
  IonIcon,
  IonButtons,
  IonBackButton
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { pawOutline, arrowForwardOutline } from 'ionicons/icons';
import { useIonViewWillEnter } from '@ionic/react';
import authService from '../../services/auth.service';
import sqliteService from '../../services/sqlite.service';
import './VaccineSelector.css';

const VaccineSelector: React.FC = () => {
  const history = useHistory();
  const [pets, setPets] = useState<any[]>([]);

  useIonViewWillEnter(() => {
    const loadPets = async () => {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        history.push('/login');
        return;
      }

      const allPets = await sqliteService.getPets();
      const userPets = allPets.filter((p: any) => p.clienteId === currentUser.id);
      setPets(userPets);
    };

    loadPets();
  });

  const getPetEmoji = (especie: string) => {
    return especie?.toLowerCase() === 'perro' ? '🐕' : '🐈';
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar style={{ '--background': 'var(--gradient-primary)' }}>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/client/dashboard" color="light" />
          </IonButtons>
          <IonTitle color="light">Selecciona una Mascota</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <div style={{ padding: '15px' }}>
          <h3 style={{ marginBottom: '15px' }}>¿De cuál mascota quieres ver las vacunas?</h3>

          {pets.length > 0 ? (
            pets.map(pet => (
              <IonCard 
                key={pet.id}
                onClick={() => history.push(`/client/VaccineHistory/${pet.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <IonCardContent>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <div style={{ fontSize: '40px' }}>
                        {getPetEmoji(pet.especie)}
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '18px' }}>{pet.nombre}</h3>
                        <p style={{ margin: '5px 0 0 0', color: '#666' }}>
                          {pet.raza} • {pet.edad} años
                        </p>
                        <p style={{ margin: '5px 0 0 0', color: '#999', fontSize: '14px' }}>
                          {pet.vacunas?.length || 0} vacunas registradas
                        </p>
                      </div>
                    </div>
                    <IonIcon 
                      icon={arrowForwardOutline} 
                      style={{ fontSize: '24px', color: '#667eea' }}
                    />
                  </div>
                </IonCardContent>
              </IonCard>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '50px 20px' }}>
              <div style={{ fontSize: '60px', marginBottom: '20px' }}>🐾</div>
              <h3>No tienes mascotas registradas</h3>
              <p style={{ color: '#999' }}>Primero debes agregar una mascota</p>
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default VaccineSelector;
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
  IonFab,
  IonFabButton,
  IonIcon,
  IonTabBar,
  IonTabButton,
  IonLabel,
  IonModal,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonToast
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
import databaseService from '../../services/database.service';
import './Pets.css';

const Pets: React.FC = () => {
  const history = useHistory();
  const [user, setUser] = useState<any>(null);
  const [pets, setPets] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Formulario nueva mascota
  const [nombre, setNombre] = useState('');
  const [especie, setEspecie] = useState('Perro');
  const [raza, setRaza] = useState('');
  const [edad, setEdad] = useState('');
  const [peso, setPeso] = useState('');
  const [color, setColor] = useState('');

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      history.push('/login');
      return;
    }
    setUser(currentUser);
    loadPets(currentUser.id);
  }, [history]);

  const loadPets = (userId: number) => {
    const allPets = databaseService.getPets();
    const userPets = allPets.filter(p => p.clienteId === userId);
    setPets(userPets);
  };

  const handleAddPet = () => {
    if (!nombre || !raza || !edad || !peso) {
      setToastMessage('Por favor completa todos los campos');
      setShowToast(true);
      return;
    }

    const allPets = databaseService.getPets();
    const newPet = {
      id: allPets.length + 1,
      nombre,
      especie,
      raza,
      edad: parseInt(edad),
      peso: parseFloat(peso),
      color,
      clienteId: user.id,
      vacunas: []
    };

    allPets.push(newPet);
    databaseService.savePets(allPets);
    
    setToastMessage('¡Mascota agregada exitosamente!');
    setShowToast(true);
    setShowModal(false);
    
    // Limpiar formulario
    setNombre('');
    setRaza('');
    setEdad('');
    setPeso('');
    setColor('');
    
    loadPets(user.id);
  };

  const getPetEmoji = (especie: string) => {
    return especie.toLowerCase() === 'perro' ? '🐕' : '🐈';
  };

  const getVaccineStatus = (pet: any) => {
    // Lógica simple: si tiene vacunas recientes está al día
    if (pet.vacunas && pet.vacunas.length > 0) {
      return { text: 'Al día con vacunas', class: 'badge-success' };
    }
    return { text: 'Vacuna pendiente', class: 'badge-warning' };
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar style={{ '--background': 'var(--gradient-primary)' }}>
          <IonTitle color="light">Mis Mascotas 🐾</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <div className="pets-content">
          {pets.length > 0 ? (
            pets.map(pet => {
              const status = getVaccineStatus(pet);
              return (
                <IonCard 
                  key={pet.id} 
                  className="pet-card"
                  onClick={() => history.push(`/client/pet-detail/${pet.id}`)}
                >
                  <IonCardContent>
                    <div className="pet-card-content">
                      <div className="pet-avatar">{getPetEmoji(pet.especie)}</div>
                      <div className="pet-info">
                        <h3>{pet.nombre}</h3>
                        <p>{pet.raza} • {pet.edad} años • {pet.peso} kg</p>
                        <span className={`badge ${status.class}`}>
                          {status.text}
                        </span>
                      </div>
                    </div>
                  </IonCardContent>
                </IonCard>
              );
            })
          ) : (
            <div className="empty-state">
              <div className="empty-icon">🐾</div>
              <h3>No tienes mascotas registradas</h3>
              <p>Agrega tu primera mascota para empezar</p>
            </div>
          )}
        </div>

        {/* Botón flotante para agregar mascota */}
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={() => setShowModal(true)}>
            <IonIcon icon={addOutline} />
          </IonFabButton>
        </IonFab>

        {/* Modal para agregar mascota */}
        <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Agregar Mascota</IonTitle>
              <IonButton slot="end" fill="clear" onClick={() => setShowModal(false)}>
                Cerrar
              </IonButton>
            </IonToolbar>
          </IonHeader>
          <IonContent className="modal-content">
            <div style={{ padding: '20px' }}>
              <div className="input-group">
                <label>Nombre</label>
                <IonInput
                  value={nombre}
                  placeholder="Max"
                  onIonChange={e => setNombre(e.detail.value!)}
                />
              </div>

              <div className="input-group">
                <label>Especie</label>
                <IonSelect
                  value={especie}
                  onIonChange={e => setEspecie(e.detail.value)}
                >
                  <IonSelectOption value="Perro">Perro</IonSelectOption>
                  <IonSelectOption value="Gato">Gato</IonSelectOption>
                </IonSelect>
              </div>

              <div className="input-group">
                <label>Raza</label>
                <IonInput
                  value={raza}
                  placeholder="Labrador"
                  onIonChange={e => setRaza(e.detail.value!)}
                />
              </div>

              <div className="input-group">
                <label>Edad (años)</label>
                <IonInput
                  type="number"
                  value={edad}
                  placeholder="3"
                  onIonChange={e => setEdad(e.detail.value!)}
                />
              </div>

              <div className="input-group">
                <label>Peso (kg)</label>
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
                onClick={handleAddPet}
                style={{ marginTop: '20px' }}
              >
                Agregar Mascota
              </IonButton>
            </div>
          </IonContent>
        </IonModal>

        {/* Navegación inferior */}
        <IonTabBar slot="bottom" className="custom-tab-bar">
          <IonTabButton tab="home" onClick={() => history.push('/client/dashboard')}>
            <IonIcon icon={home} />
            <IonLabel>Inicio</IonLabel>
          </IonTabButton>

          <IonTabButton tab="pets" className="active">
            <IonIcon icon={pawOutline} />
            <IonLabel>Mascotas</IonLabel>
          </IonTabButton>

          <IonTabButton tab="appointments" onClick={() => history.push('/client/appointments')}>
            <IonIcon icon={calendarOutline} />
            <IonLabel>Citas</IonLabel>
          </IonTabButton>

          <IonTabButton tab="profile" onClick={() => history.push('/client/profile')}>
            <IonIcon icon={personOutline} />
            <IonLabel>Perfil</IonLabel>
          </IonTabButton>
        </IonTabBar>

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

export default Pets;
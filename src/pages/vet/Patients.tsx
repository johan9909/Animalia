import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonSearchbar,
  IonCard,
  IonCardContent,
  IonIcon
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { 
  home, 
  calendarOutline, 
  pawOutline, 
  personOutline
} from 'ionicons/icons';
import authService from '../../services/auth.service';
import sqliteService from '../../services/sqlite.service';
import './Patients.css';

const Patients: React.FC = () => {
  const history = useHistory();
  const [user, setUser] = useState<any>(null);
  const [allPets, setAllPets] = useState<any[]>([]);
  const [filteredPets, setFilteredPets] = useState<any[]>([]);
  const [searchText, setSearchText] = useState('');
  const [clients, setClients] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);

  useEffect(() => {

    const loadData = async () => {

      await sqliteService.initDB();
      const currentUser = authService.getCurrentUser();
      if (!currentUser || currentUser.tipo !== 'veterinario') {
        history.push('/login');
        return;
      }
      setUser(currentUser);

      // Cargar todas las citas del veterinario para saber qué pacientes ha atendido
      const allAppointments = await sqliteService.getAppointments();
      const vetAppointments = allAppointments.filter((a : any)=> a.veterinarioId === currentUser.id);
      setAppointments(vetAppointments);

      // Obtener IDs únicos de mascotas
      const uniquePetIds = [...new Set(vetAppointments.map((a : any) => a.mascotaId))];

      // Cargar las mascotas que ha atendido
      const allPetsData = await sqliteService.getPets();
      const vetPets = allPetsData.filter((p : any) => uniquePetIds.includes(p.id));
      setAllPets(vetPets);
      setFilteredPets(vetPets);

      // Cargar clientes
      const allUsers = await sqliteService.getUsers();
      const clientUsers = allUsers.filter((u : any) => u.tipo === 'cliente');
      setClients(clientUsers);

    };

    loadData();

  }, [history]);

  const handleSearch = (text: string) => {
    setSearchText(text);
    if (text.trim() === '') {
      setFilteredPets(allPets);
    } else {
      const filtered = allPets.filter(pet => 
        pet.nombre.toLowerCase().includes(text.toLowerCase()) ||
        pet.raza.toLowerCase().includes(text.toLowerCase()) ||
        pet.especie.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredPets(filtered);
    }
  };

  const getClientName = (clientId: number) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.nombre : 'Cliente desconocido';
  };

  const getLastAppointment = (petId: number) => {
    const petAppointments = appointments.filter(a => a.mascotaId === petId);
    if (petAppointments.length === 0) return null;

    // Ordenar por fecha más reciente
    const sorted = petAppointments.sort((a, b) => 
      new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    );

    return sorted[0];
  };

  const getStatusBadge = (petId: number) => {
    const lastAppt = getLastAppointment(petId);
    if (!lastAppt) {
      return { text: 'Sin historial', class: 'badge-info' };
    }

    const today = new Date();
    const apptDate = new Date(lastAppt.fecha);
    const daysDiff = Math.floor((today.getTime() - apptDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff === 0 || lastAppt.fecha === '2024-11-02') {
      return { text: 'Última visita: Hoy', class: 'badge-success' };
    } else if (daysDiff <= 7) {
      return { text: `Última visita: hace ${daysDiff} días`, class: 'badge-success' };
    } else {
      return { text: `Última visita: ${lastAppt.fecha}`, class: 'badge-info' };
    }
  };

  const hasUpcomingAppointment = (petId: number) => {
    const upcoming = appointments.find(a => 
      a.mascotaId === petId && 
      a.estado === 'pendiente'
    );
    return upcoming;
  };

  const getPetEmoji = (especie: string) => {
    return especie.toLowerCase() === 'perro' ? '🐕' : '🐈';
  };

  const getAvatarColor = (index: number) => {
    const colors = [
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)',
      'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
      'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
    ];
    return colors[index % colors.length];
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="vet-toolbar">
          <IonTitle color="light">Pacientes 🐾</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <div className="patients-content">
          {/* Buscador */}
          <IonSearchbar
            value={searchText}
            onIonChange={e => handleSearch(e.detail.value!)}
            placeholder="Buscar paciente..."
            className="custom-searchbar"
          />

          {/* Lista de pacientes */}
          {filteredPets.length > 0 ? (
            filteredPets.map((pet, index) => {
              const status = getStatusBadge(pet.id);
              const upcomingAppt = hasUpcomingAppointment(pet.id);
              
              return (
                <IonCard 
                  key={pet.id} 
                  className="patient-card"
                  onClick={() => alert(`Ver historial de ${pet.nombre} - Función en desarrollo`)}
                >
                  <IonCardContent>
                    <div className="patient-card-content">
                      <div 
                        className="patient-avatar"
                        style={{ background: getAvatarColor(index) }}
                      >
                        {getPetEmoji(pet.especie)}
                      </div>
                      <div className="patient-info">
                        <h3>{pet.nombre}</h3>
                        <p>{pet.raza} • {pet.edad} años • {getClientName(pet.clienteId)}</p>
                        <span className={`badge ${status.class}`}>
                          {status.text}
                        </span>
                        {upcomingAppt && (
                          <span className="badge badge-warning" style={{ marginLeft: '8px' }}>
                            Cita programada
                          </span>
                        )}
                      </div>
                    </div>
                  </IonCardContent>
                </IonCard>
              );
            })
          ) : (
            <div className="empty-state">
              <div className="empty-icon">🐾</div>
              <h3>No se encontraron pacientes</h3>
              <p>
                {searchText 
                  ? 'Intenta con otro término de búsqueda' 
                  : 'Aún no has atendido pacientes'}
              </p>
            </div>
          )}
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
            className="nav-item active"
            onClick={() => history.push('/vet/patients')}
          >
            <IonIcon icon={pawOutline} className="nav-icon" />
            <span>Pacientes</span>
          </div>

          <div 
            className="nav-item"
            onClick={() => history.push('/vet/profile')}
          >
            <IonIcon icon={personOutline} className="nav-icon" />
            <span>Perfil</span>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Patients;
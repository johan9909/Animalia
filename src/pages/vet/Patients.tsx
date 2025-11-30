import React, { useState } from 'react';
import {
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonSearchbar,
  IonCard,
  IonCardContent,
  IonIcon,
  useIonViewWillEnter
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

  useIonViewWillEnter(() => {
    const loadData = async () => {
      // Limpiar estados primero
      setUser(null);
      setAllPets([]);
      setFilteredPets([]);
      setSearchText('');
      setClients([]);
      setAppointments([]);

      const currentUser = authService.getCurrentUser();
      if (!currentUser || currentUser.tipo !== 'veterinario') {
        history.push('/login');
        return;
      }
      setUser(currentUser);

      // Cargar todas las citas del veterinario para saber qué pacientes ha atendido
      const allAppointments = await sqliteService.getAppointments();
      const vetAppointments = allAppointments.filter((a: any) => a.veterinarioId === currentUser.id);
      setAppointments(vetAppointments);

      // Obtener IDs únicos de mascotas
      const uniquePetIds = [...new Set(vetAppointments.map((a: any) => a.mascotaId))];

      // Cargar las mascotas que ha atendido
      const allPetsData = await sqliteService.getPets();
      const vetPets = allPetsData.filter((p: any) => uniquePetIds.includes(p.id));
      setAllPets(vetPets);
      setFilteredPets(vetPets);

      // Cargar clientes
      const allUsers = await sqliteService.getUsers();
      const clientUsers = allUsers.filter((u: any) => u.tipo === 'cliente');
      setClients(clientUsers);
    };

    loadData();
  });

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
    const sorted = petAppointments.sort((a, b) => {
      // Comparar directamente las fechas en formato YYYY-MM-DD
      if (a.fecha > b.fecha) return -1;
      if (a.fecha < b.fecha) return 1;
      return 0;
    });

    return sorted[0];
  };

  const getStatusBadge = (petId: number) => {
    const lastAppt = getLastAppointment(petId);
    if (!lastAppt) {
      return { text: 'Sin historial', class: 'badge-info' };
    }

    // Obtener la fecha de hoy en formato YYYY-MM-DD
    const today = new Date();
    const todayYear = today.getFullYear();
    const todayMonth = String(today.getMonth() + 1).padStart(2, '0');
    const todayDay = String(today.getDate()).padStart(2, '0');
    const todayDate = `${todayYear}-${todayMonth}-${todayDay}`;

    // Calcular diferencia de días comparando strings de fecha
    const daysDiff = calculateDaysDifference(lastAppt.fecha, todayDate);

    if (lastAppt.fecha === todayDate) {
      return { text: 'Última visita: Hoy', class: 'badge-success' };
    } else if (daysDiff <= 7) {
      return { text: `Última visita: hace ${daysDiff} día${daysDiff === 1 ? '' : 's'}`, class: 'badge-success' };
    } else if (daysDiff <= 30) {
      return { text: `Última visita: hace ${daysDiff} días`, class: 'badge-warning' };
    } else {
      // Formatear la fecha para mostrar
      const formattedDate = formatDate(lastAppt.fecha);
      return { text: `Última visita: ${formattedDate}`, class: 'badge-info' };
    }
  };

  // Función auxiliar para calcular diferencia de días entre dos fechas en formato YYYY-MM-DD
  const calculateDaysDifference = (dateStr1: string, dateStr2: string): number => {
    const [year1, month1, day1] = dateStr1.split('-').map(Number);
    const [year2, month2, day2] = dateStr2.split('-').map(Number);
    
    const date1 = new Date(year1, month1 - 1, day1);
    const date2 = new Date(year2, month2 - 1, day2);
    
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  // Función auxiliar para formatear fecha YYYY-MM-DD a formato legible
  const formatDate = (dateStr: string): string => {
    const [year, month, day] = dateStr.split('-');
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${day} ${months[parseInt(month) - 1]} ${year}`;
  };

  const hasUpcomingAppointment = (petId: number) => {
    // Obtener la fecha de hoy
    const today = new Date();
    const todayYear = today.getFullYear();
    const todayMonth = String(today.getMonth() + 1).padStart(2, '0');
    const todayDay = String(today.getDate()).padStart(2, '0');
    const todayDate = `${todayYear}-${todayMonth}-${todayDay}`;

    const upcoming = appointments.find(a => 
      a.mascotaId === petId && 
      a.estado === 'pendiente' &&
      a.fecha >= todayDate  // Cita futura o de hoy
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
                  onClick={() => history.push(`/vet/pet-history/${pet.id}`)}
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
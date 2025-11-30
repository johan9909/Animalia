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
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonTabBar,
  IonTabButton,
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
import './Schedule.css';

const Schedule: React.FC = () => {
  const history = useHistory();
  const [user, setUser] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [pets, setPets] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [selectedDay, setSelectedDay] = useState<string>('hoy');

  useEffect(() => {
      
     const loadData = async () => {

      await sqliteService.initDB();

      const currentUser = authService.getCurrentUser();
      if (!currentUser || currentUser.tipo !== 'veterinario') {
        history.push('/login');
        return;
      }
      setUser(currentUser);

        // Cargar citas del veterinario
        const allAppointments = await sqliteService.getAppointments();
        const vetAppointments = allAppointments.filter((a : any) => a.veterinarioId === currentUser.id);
        setAppointments(vetAppointments);

        // Cargar mascotas
        const allPets = await sqliteService.getPets();
        setPets(allPets);

        // Cargar clientes
        const allUsers = await sqliteService.getUsers();
        const clientUsers = allUsers.filter((u : any) => u.tipo === 'cliente');
        setClients(clientUsers);
      
     };
     
     loadData();
    
  }, [history]);

  // Función para obtener la fecha según el día seleccionado
  const getDateForDay = (day: string): string => {
    const today = new Date();
    // Usar hora local para evitar problemas de timezone
    const year = today.getFullYear();
    const month = today.getMonth();
    const dayOfMonth = today.getDate();
    
    let targetDate = new Date(year, month, dayOfMonth);

    switch (day) {
      case 'hoy':
        // Hoy - no cambiar nada
        break;
      case 'manana':
        // Mañana
        targetDate = new Date(year, month, dayOfMonth + 1);
        break;
      case 'lunes':
        // Próximo lunes
        const daysUntilMonday = (1 - today.getDay() + 7) % 7 || 7;
        targetDate = new Date(year, month, dayOfMonth + daysUntilMonday);
        break;
      case 'martes':
        // Próximo martes
        const daysUntilTuesday = (2 - today.getDay() + 7) % 7 || 7;
        targetDate = new Date(year, month, dayOfMonth + daysUntilTuesday);
        break;
      case 'miercoles':
        // Próximo miércoles
        const daysUntilWednesday = (3 - today.getDay() + 7) % 7 || 7;
        targetDate = new Date(year, month, dayOfMonth + daysUntilWednesday);
        break;
      case 'jueves':
        // Próximo jueves
        const daysUntilThursday = (4 - today.getDay() + 7) % 7 || 7;
        targetDate = new Date(year, month, dayOfMonth + daysUntilThursday);
        break;
      case 'viernes':
        // Próximo viernes
        const daysUntilFriday = (5 - today.getDay() + 7) % 7 || 7;
        targetDate = new Date(year, month, dayOfMonth + daysUntilFriday);
        break;
      case 'sabado':
        // Próximo sábado
        const daysUntilSaturday = (6 - today.getDay() + 7) % 7 || 7;
        targetDate = new Date(year, month, dayOfMonth + daysUntilSaturday);
        break;
      case 'domingo':
        // Próximo domingo
        const daysUntilSunday = (7 - today.getDay()) % 7 || 7;
        targetDate = new Date(year, month, dayOfMonth + daysUntilSunday);
        break;
    }

    // Formatear como YYYY-MM-DD
    const targetYear = targetDate.getFullYear();
    const targetMonth = String(targetDate.getMonth() + 1).padStart(2, '0');
    const targetDay = String(targetDate.getDate()).padStart(2, '0');
    
    return `${targetYear}-${targetMonth}-${targetDay}`;
  };

  // Función para formatear la fecha para mostrar
  const getFormattedDate = (day: string): string => {
    const dateStr = getDateForDay(day);
    const date = new Date(dateStr + 'T00:00:00');
    
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    
    const dayName = days[date.getDay()];
    const dayNum = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    return `${dayName}, ${dayNum} ${month} ${year}`;
  };

  // Función para obtener los días de la semana disponibles
  const getAvailableDays = () => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
    
    const days = [
      { key: 'hoy', label: 'Hoy' },
      { key: 'manana', label: 'Mañana' }
    ];

    // Agregar los próximos 5 días laborables (puedes ajustar esto según necesites)
    const weekDays = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
    const weekDayLabels = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    
    for (let i = 2; i <= 6; i++) {
      const futureDate = new Date(today);
      futureDate.setDate(today.getDate() + i);
      const futureDayIndex = futureDate.getDay();
      
      days.push({
        key: weekDays[futureDayIndex],
        label: weekDayLabels[futureDayIndex]
      });
    }

    return days;
  };

  const getFilteredAppointments = () => {
    const targetDate = getDateForDay(selectedDay);
    return appointments.filter(a => a.fecha === targetDate);
  };

  const getPetInfo = (petId: number) => {
    const pet = pets.find(p => p.id === petId);
    return pet || { nombre: 'Desconocido', especie: 'Perro', raza: 'Desconocida' };
  };

  const getClientInfo = (clientId: number) => {
    const client = clients.find(c => c.id === clientId);
    return client || { nombre: 'Cliente' };
  };

  const getBadgeClass = (estado: string) => {
    switch (estado) {
      case 'completada':
        return 'badge-success';
      case 'confirmada':
        return 'badge-warning';
      case 'pendiente':
        return 'badge-info';
      default:
        return 'badge-info';
    }
  };

  const getStatusText = (estado: string) => {
    switch (estado) {
      case 'completada':
        return 'Completada';
      case 'confirmada':
        return 'En curso';
      case 'pendiente':
        return 'Próxima';
      default:
        return estado;
    }
  };

  const getPetEmoji = (especie: string) => {
    return especie.toLowerCase() === 'perro' ? '🐕' : '🐈';
  };

  const getCardStyle = (estado: string) => {
    switch (estado) {
      case 'completada':
        return 'schedule-card-completed';
      case 'confirmada':
        return 'schedule-card-progress';
      default:
        return 'schedule-card-pending';
    }
  };

  const filteredAppointments = getFilteredAppointments();
  const sortedAppointments = [...filteredAppointments].sort((a, b) => 
    a.horaInicio.localeCompare(b.horaInicio)
  );

  const availableDays = getAvailableDays();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="vet-toolbar">
          <IonTitle color="light">Mi Agenda 📅</IonTitle>
        </IonToolbar>
        <IonToolbar className="vet-toolbar-sub">
          <IonTitle color="light" size="small">
            {getFormattedDate(selectedDay)}
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <div className="schedule-content">
          {/* Filtros de día - Dinámicos */}
          <div className="day-filters">
            {availableDays.map((day) => (
              <IonButton 
                key={day.key}
                className={selectedDay === day.key ? 'day-btn-active' : 'day-btn'}
                onClick={() => setSelectedDay(day.key)}
              >
                {day.label}
              </IonButton>
            ))}
          </div>

          {/* Lista de citas */}
          {sortedAppointments.length > 0 ? (
            <>
              {sortedAppointments.map(appointment => {
                const pet = getPetInfo(appointment.mascotaId);
                const client = getClientInfo(appointment.clienteId);
                
                return (
                  <IonCard 
                    /*key={appointment.id} 
                    className={`schedule-card ${getCardStyle(appointment.estado)}`}
                    onClick={() => history.push(`/vet/consultation/${appointment.id}`)}*/
                  >
                    <IonCardContent>
                      <div className="schedule-header">
                        <div className="schedule-time">
                          {appointment.fecha}
                        </div>
                        <span className={`badge ${getBadgeClass(appointment.estado)}`}>
                          {getStatusText(appointment.estado)}
                        </span>
                      </div>

                      <h4 className="schedule-service">{appointment.servicio}</h4>
                      
                      <div className="schedule-patient">
                        <span className="patient-emoji">{getPetEmoji(pet.especie)}</span>
                        <div>
                          <strong>{pet.nombre} - {pet.raza}</strong>
                          <p>{client.nombre}</p>
                        </div>
                      </div>
                    </IonCardContent>
                  </IonCard>
                );
              })}

              {/* Hora de almuerzo - Solo mostrar en días laborables */}
              {selectedDay === 'hoy' && new Date().getDay() >= 1 && new Date().getDay() <= 5 && (
                <div className="lunch-break">
                  <div className="lunch-icon">☕</div>
                  <p><strong>12:00 - 2:00 PM</strong></p>
                  <p>Almuerzo</p>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📅</div>
              <h3>No hay citas programadas</h3>
              <p>No tienes citas para este día</p>
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
            className="nav-item active"
            onClick={() => history.push('/vet/schedule')}
          >
            <IonIcon icon={calendarOutline} className="nav-icon" />
            <span>Agenda</span>
          </div>

          <div 
            className="nav-item"
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

export default Schedule;

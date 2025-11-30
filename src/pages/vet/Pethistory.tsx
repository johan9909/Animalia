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
  IonIcon,
  IonLoading,
  useIonViewWillEnter
} from '@ionic/react';
import { useParams, useHistory } from 'react-router-dom';
import { calendarOutline, medkitOutline, statsChartOutline } from 'ionicons/icons';
import authService from '../../services/auth.service';
import sqliteService from '../../services/sqlite.service';
import './Pethistory.css';

interface PetHistoryParams {
  petId: string;
}

const PetHistory: React.FC = () => {
  const { petId } = useParams<PetHistoryParams>();
  const history = useHistory();
  
  const [pet, setPet] = useState<any>(null);
  const [client, setClient] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useIonViewWillEnter(() => {
    loadPetHistory();
  });

  const loadPetHistory = async () => {
    try {
      setIsLoading(true);

      const currentUser = authService.getCurrentUser();
      if (!currentUser || currentUser.tipo !== 'veterinario') {
        history.push('/login');
        return;
      }

      // Hacer todas las llamadas a la BD en paralelo para mayor velocidad
      const [allPets, allUsers, allAppointmentsData] = await Promise.all([
        sqliteService.getPets(),
        sqliteService.getUsers(),
        sqliteService.getAppointments()
      ]);

      // Buscar la mascota
      const foundPet = allPets.find((p: any) => p.id === parseInt(petId));
      
      if (!foundPet) {
        history.push('/vet/patients');
        return;
      }
      setPet(foundPet);

      // Buscar el cliente
      const foundClient = allUsers.find((u: any) => u.id === foundPet.clienteId);
      setClient(foundClient);

      // Filtrar y ordenar las citas de esta mascota
      const petAppointments = allAppointmentsData
        .filter((a: any) => a.mascotaId === parseInt(petId))
        .sort((a: any, b: any) => {
          // Ordenar por fecha y hora descendente (más reciente primero)
          const dateCompare = b.fecha.localeCompare(a.fecha);
          if (dateCompare !== 0) return dateCompare;
          return b.horaInicio.localeCompare(a.horaInicio);
        });

      setAppointments(petAppointments);
    } catch (error) {
      console.error('Error loading pet history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr: string): string => {
    const [year, month, day] = dateStr.split('-');
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${day} ${months[parseInt(month) - 1]} ${year}`;
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
        return 'Confirmada';
      case 'pendiente':
        return 'Pendiente';
      default:
        return estado;
    }
  };

  const getPetEmoji = (especie: string) => {
    return especie?.toLowerCase() === 'perro' ? '🐕' : '🐈';
  };

  // Calcular estadísticas
  const stats = {
    completedCount: appointments.filter(a => a.estado === 'completada').length,
    lastWeight: (() => {
      const completed = appointments.filter(a => a.estado === 'completada' && a.pesoActual);
      return completed.length > 0 ? completed[0].pesoActual : (pet?.peso || 'N/A');
    })()
  };

  if (isLoading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar className="vet-toolbar">
            <IonButtons slot="start">
              <IonBackButton defaultHref="/vet/patients" color="light" />
            </IonButtons>
            <IonTitle color="light">Historial 📋</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonLoading isOpen={true} message="Cargando historial..." />
        </IonContent>
      </IonPage>
    );
  }

  if (!pet) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar className="vet-toolbar">
            <IonButtons slot="start">
              <IonBackButton defaultHref="/vet/patients" color="light" />
            </IonButtons>
            <IonTitle color="light">Historial 📋</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            <div style={{ fontSize: '60px', marginBottom: '20px' }}>⚠️</div>
            <h2>Mascota no encontrada</h2>
            <p>No se pudo cargar la información de la mascota.</p>
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
            <IonBackButton defaultHref="/vet/patients" color="light" />
          </IonButtons>
          <IonTitle color="light">Historial 📋</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <div className="pet-history-content">
          {/* Información de la Mascota */}
          <IonCard className="pet-info-card">
            <IonCardContent>
              <div className="pet-header">
                <div className="pet-avatar-large">
                  {getPetEmoji(pet.especie)}
                </div>
                <div className="pet-details">
                  <h2>{pet.nombre}</h2>
                  <p className="pet-breed">{pet.raza} • {pet.especie}</p>
                  <p className="pet-owner">👤 {client?.nombre || 'N/A'}</p>
                  <p className="pet-contact">📞 {client?.telefono || 'N/A'}</p>
                </div>
              </div>

              {/* Estadísticas rápidas */}
              <div className="pet-stats">
                <div className="stat-item">
                  <IonIcon icon={calendarOutline} className="stat-icon" />
                  <div>
                    <div className="stat-value">{pet.edad}</div>
                    <div className="stat-label">Años</div>
                  </div>
                </div>
                <div className="stat-item">
                  <IonIcon icon={statsChartOutline} className="stat-icon" />
                  <div>
                    <div className="stat-value">{stats.lastWeight} kg</div>
                    <div className="stat-label">Peso</div>
                  </div>
                </div>
                <div className="stat-item">
                  <IonIcon icon={medkitOutline} className="stat-icon" />
                  <div>
                    <div className="stat-value">{stats.completedCount}</div>
                    <div className="stat-label">Consultas</div>
                  </div>
                </div>
              </div>
            </IonCardContent>
          </IonCard>

          {/* Lista de Citas */}
          <div className="appointments-list">
            <h3 className="section-title">Historial de Citas</h3>
            
            {appointments.length > 0 ? (
              appointments.map((appointment) => (
                <IonCard 
                  key={appointment.id} 
                  className="history-card"
                  onClick={() => {
                    if (appointment.estado === 'completada') {
                      history.push(`/vet/consultation/${appointment.id}`);
                    }
                  }}
                  button={appointment.estado === 'completada'}
                >
                  <IonCardContent>
                    <div className="history-header">
                      <div className="history-date">
                        📅 {formatDate(appointment.fecha)}
                        <span className="history-time"> • {appointment.horaInicio}</span>
                      </div>
                      <span className={`badge ${getBadgeClass(appointment.estado)}`}>
                        {getStatusText(appointment.estado)}
                      </span>
                    </div>

                    <h4 className="history-service">{appointment.servicio}</h4>

                    {appointment.estado === 'completada' && (
                      <div className="history-details">
                        {appointment.diagnostico && (
                          <div className="detail-item">
                            <strong>Diagnóstico:</strong>
                            <p>{appointment.diagnostico}</p>
                          </div>
                        )}
                        
                        {appointment.tratamiento && (
                          <div className="detail-item">
                            <strong>Tratamiento:</strong>
                            <p>{appointment.tratamiento}</p>
                          </div>
                        )}

                        <div className="history-metrics">
                          {appointment.temperatura && (
                            <span className="metric">
                              🌡️ {appointment.temperatura}°C
                            </span>
                          )}
                          {appointment.pesoActual && (
                            <span className="metric">
                              ⚖️ {appointment.pesoActual} kg
                            </span>
                          )}
                          {appointment.precio && (
                            <span className="metric">
                              💰 ${appointment.precio.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {appointment.estado === 'pendiente' && (
                      <p className="pending-note">
                        ℹ️ Cita programada para {formatDate(appointment.fecha)} a las {appointment.horaInicio}
                      </p>
                    )}
                  </IonCardContent>
                </IonCard>
              ))
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <h3>No hay historial</h3>
                <p>Esta mascota aún no tiene citas registradas</p>
              </div>
            )}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default PetHistory;

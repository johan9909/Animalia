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
  IonSelect,
  IonSelectOption,
  IonDatetime,
  IonModal
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useIonViewWillEnter } from '@ionic/react';
import { filterOutline, calendarOutline } from 'ionicons/icons';
import authService from '../../services/auth.service';
import sqliteService from '../../services/sqlite.service';
import './AppointmentHistory.css';

const AppointmentHistory: React.FC = () => {
  const history = useHistory();
  const [user, setUser] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<any[]>([]);
  const [pets, setPets] = useState<any[]>([]);
  const [vets, setVets] = useState<any[]>([]);

  // Filtros
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterEstado, setFilterEstado] = useState<string>('todos');
  const [filterFechaInicio, setFilterFechaInicio] = useState<string>('');
  const [filterFechaFin, setFilterFechaFin] = useState<string>('');

  useIonViewWillEnter(() => {
    loadData();
  });

  const loadData = async () => {
    

    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      history.push('/login');
      return;
    }
    setUser(currentUser);

    const allPets = await sqliteService.getPets();
    setPets(allPets.filter((p: any) => p.clienteId === currentUser.id));

    const allAppointments = await sqliteService.getAppointments();
    const userAppointments = allAppointments.filter((a: any) => a.clienteId === currentUser.id);
    
    // Ordenar por fecha descendente (más recientes primero)
    const sortedAppointments = userAppointments.sort((a: any, b: any) => {
      return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
    });
    
    setAppointments(sortedAppointments);
    setFilteredAppointments(sortedAppointments);

    const allUsers = await sqliteService.getUsers();
    setVets(allUsers.filter((u: any) => u.tipo === 'veterinario'));
  };

  const applyFilters = () => {
    let filtered = [...appointments];

    // Filtro por estado
    if (filterEstado !== 'todos') {
      filtered = filtered.filter(a => a.estado === filterEstado);
    }

    // Filtro por rango de fechas
    if (filterFechaInicio) {
      const fechaInicio = new Date(filterFechaInicio.split('T')[0]);
      filtered = filtered.filter(a => new Date(a.fecha) >= fechaInicio);
    }

    if (filterFechaFin) {
      const fechaFin = new Date(filterFechaFin.split('T')[0]);
      filtered = filtered.filter(a => new Date(a.fecha) <= fechaFin);
    }

    setFilteredAppointments(filtered);
    setShowFilterModal(false);
  };

  const clearFilters = () => {
    setFilterEstado('todos');
    setFilterFechaInicio('');
    setFilterFechaFin('');
    setFilteredAppointments(appointments);
    setShowFilterModal(false);
  };

  const getPetName = (petId: number) => {
    const pet = pets.find(p => p.id === petId);
    return pet ? `${pet.nombre} - ${pet.raza}` : 'Mascota desconocida';
  };

  const getVetName = (vetId: number) => {
    const vet = vets.find(v => v.id === vetId);
    return vet ? vet.nombre : 'Veterinario';
  };

  const getBadgeClass = (estado: string) => {
    switch (estado) {
      case 'confirmada':
        return 'badge-info';
      case 'pendiente':
        return 'badge-warning';
      case 'completada':
        return 'badge-success';
      case 'cancelada':
        return 'badge-danger';
      default:
        return 'badge-info';
    }
  };

  const hasActiveFilters = () => {
    return filterEstado !== 'todos' || filterFechaInicio !== '' || filterFechaFin !== '';
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar style={{ '--background': 'var(--gradient-primary)' }}>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/client/dashboard" color="light" />
          </IonButtons>
          <IonTitle color="light">Historial de Citas</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => setShowFilterModal(true)} color="light">
              <IonIcon icon={filterOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <div className="history-content">
          {/* Indicador de filtros activos */}
          {hasActiveFilters() && (
            <div className="active-filters">
              <span>Filtros activos</span>
              <IonButton size="small" fill="clear" onClick={clearFilters}>
                Limpiar
              </IonButton>
            </div>
          )}

          {/* Estadísticas rápidas */}
          <div className="history-stats">
            <div className="stat-box">
              <div className="stat-number">{filteredAppointments.length}</div>
              <div className="stat-label">Total</div>
            </div>
            <div className="stat-box">
              <div className="stat-number">
                {filteredAppointments.filter(a => a.estado === 'completada').length}
              </div>
              <div className="stat-label">Completadas</div>
            </div>
            <div className="stat-box">
              <div className="stat-number">
                {filteredAppointments.filter(a => a.estado === 'cancelada').length}
              </div>
              <div className="stat-label">Canceladas</div>
            </div>
          </div>

          {/* Lista de citas */}
          {filteredAppointments.length > 0 ? (
            filteredAppointments.map(appointment => (
              <IonCard 
                key={appointment.id} 
                className="history-card"
                onClick={() => history.push(`/client/appointment-detail/${appointment.id}`)}
              >
                <IonCardContent>
                  <div className="history-header">
                    <span className={`badge ${getBadgeClass(appointment.estado)}`}>
                      {appointment.estado}
                    </span>
                    <span className="history-date">
                      <IonIcon icon={calendarOutline} style={{ marginRight: '5px' }} />
                      {appointment.fecha}
                    </span>
                  </div>

                  <div className="history-time">
                    🕐 {appointment.horaInicio} - {appointment.horaFin}
                  </div>

                  <h4>{appointment.servicio}</h4>
                  <p className="history-pet">{getPetName(appointment.mascotaId)}</p>
                  
                  <div className="history-vet">
                    <div className="vet-avatar">
                      {getVetName(appointment.veterinarioId).substring(0, 2).toUpperCase()}
                    </div>
                    <div className="vet-info">
                      <strong>{getVetName(appointment.veterinarioId)}</strong>
                      <p>Medicina General</p>
                    </div>
                  </div>

                  {appointment.precio && (
                    <div className="history-price">
                      <strong>Precio:</strong> ${appointment.precio.toLocaleString()}
                    </div>
                  )}

                  {appointment.diagnostico && (
                    <div className="history-diagnosis">
                      <strong>Diagnóstico:</strong> {appointment.diagnostico}
                    </div>
                  )}
                </IonCardContent>
              </IonCard>
            ))
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <h3>No hay citas</h3>
              <p>
                {hasActiveFilters() 
                  ? 'No se encontraron citas con los filtros aplicados' 
                  : 'Aún no tienes citas en tu historial'}
              </p>
              {hasActiveFilters() && (
                <IonButton onClick={clearFilters}>
                  Limpiar Filtros
                </IonButton>
              )}
            </div>
          )}
        </div>

        {/* Modal de Filtros */}
        <IonModal isOpen={showFilterModal} onDidDismiss={() => setShowFilterModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Filtrar Citas</IonTitle>
              <IonButton slot="end" fill="clear" onClick={() => setShowFilterModal(false)}>
                Cerrar
              </IonButton>
            </IonToolbar>
          </IonHeader>

          <IonContent className="modal-content">
            <div style={{ padding: '20px' }}>
              
              <div className="input-group">
                <label>Estado</label>
                <IonSelect
                  value={filterEstado}
                  onIonChange={e => setFilterEstado(e.detail.value)}
                >
                  <IonSelectOption value="todos">Todos</IonSelectOption>
                  <IonSelectOption value="pendiente">Pendiente</IonSelectOption>
                  <IonSelectOption value="confirmada">Confirmada</IonSelectOption>
                  <IonSelectOption value="completada">Completada</IonSelectOption>
                  <IonSelectOption value="cancelada">Cancelada</IonSelectOption>
                </IonSelect>
              </div>

              <div className="input-group">
                <label>Fecha Desde</label>
                <IonDatetime
                  value={filterFechaInicio}
                  onIonChange={e => setFilterFechaInicio(e.detail.value as string)}
                  presentation="date"
                  max={new Date().toISOString()}
                />
              </div>

              <div className="input-group">
                <label>Fecha Hasta</label>
                <IonDatetime
                  value={filterFechaFin}
                  onIonChange={e => setFilterFechaFin(e.detail.value as string)}
                  presentation="date"
                  max={new Date().toISOString()}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
                <IonButton 
                  expand="block" 
                  fill="outline"
                  onClick={clearFilters}
                  style={{ flex: 1 }}
                >
                  Limpiar
                </IonButton>
                <IonButton 
                  expand="block" 
                  onClick={applyFilters}
                  style={{ flex: 1 }}
                >
                  Aplicar Filtros
                </IonButton>
              </div>
            </div>
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default AppointmentHistory;
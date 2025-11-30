import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { useEffect, useState } from 'react';

/* Path de las rutas para el cliente */
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ClientDashboard from './pages/client/Dashboard';
import Pets from './pages/client/Pets';
import PetDetail from './pages/client/PetDetail';
import Appointments from './pages/client/Appointments';
import AppointmentDetail from './pages/client/AppointmentDetail';
import Profile from './pages/client/Profile';
import VaccineHistory from './pages/client/VaccineHistory';
import VaccineSelector from './pages/client/VaccineSelector';
import AppointmentHistory from './pages/client/AppointmentHistory';

/* Path de las rutas para el veterinario */
import VetDashboard from './pages/vet/Dashboard';
import Schedule from './pages/vet/Schedule';
import Patients from './pages/vet/Patients';
import consultation from './pages/vet/Consultation';  
import VetProfile from './pages/vet/VetProfile';
import PetHistory from './pages/vet/Pethistory';

/* css requerido */
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* variables de tema */
import './theme/variables.css';

/* ⭐ Actualizar import para usar el nuevo servicio */
import sqliteService from './services/sqlite.service';

setupIonicReact();

const App: React.FC = () => {
  // ⭐ Estado para rastrear si la BD está inicializada
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    const initDB = async () => {
      try {
        console.log('🔄 Iniciando SQLite...');
        const initialized = await sqliteService.initDB();
        
        if (initialized) {
          console.log('✅ SQLite inicializado correctamente');
          setDbReady(true);
        } else {
          console.error('❌ Error al inicializar SQLite');
        }
      } catch (error) {
        console.error('❌ Error fatal al inicializar SQLite:', error);
      }
    };

    initDB();

    // ⭐ Cleanup: cerrar conexión al desmontar
    return () => {
      sqliteService.closeConnection().catch(err => 
        console.error('Error cerrando conexión:', err)
      );
    };
  }, []);

  // ⭐ Opcional: Mostrar pantalla de carga mientras se inicializa la BD
  if (!dbReady) {
    return (
      <IonApp>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <div className="spinner" style={{
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #3880ff',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p>Inicializando base de datos...</p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </IonApp>
    );
  }

  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          
          {/*componentes de autenticación*/}
          <Route exact path="/login" component={Login} />
          <Route exact path="/register" component={Register} />

          {/*componentes del cliente*/}
          <Route exact path="/client/dashboard" component={ClientDashboard} />
          <Route exact path="/client/pets" component={Pets} />
          <Route exact path="/client/pet-detail/:id" component={PetDetail} />
          <Route exact path="/client/appointments" component={Appointments} />
          <Route exact path="/client/appointment-detail/:id" component={AppointmentDetail} />
          <Route exact path="/client/profile" component={Profile} />
          <Route exact path="/client/VaccineHistory/:petId" component={VaccineHistory} />
          <Route exact path="/client/vaccine-selector" component={VaccineSelector} />
          <Route exact path="/client/appointment-history" component={AppointmentHistory} />
         
          {/*componentes del veterinario*/}
          <Route exact path="/vet/dashboard" component={VetDashboard} />
          <Route exact path="/vet/schedule" component={Schedule} />
          <Route exact path="/vet/patients" component={Patients} />
          <Route exact path="/vet/consultation/:id" component={consultation} />
          <Route exact path="/vet/profile" component={VetProfile} />
          <Route path="/vet/pet-history/:petId" component={PetHistory} exact />

          <Route exact path="/">
            <Redirect to="/login" />
          </Route>
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
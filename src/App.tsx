import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { useEffect } from 'react';

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
import Consultation from './pages/vet/Consultation';
import VetProfile from './pages/vet/VetProfile';



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

/* servicio de base de datos con sql Lite */
import sqliteService from './services/sqlite.service';

setupIonicReact();

const App: React.FC = () => {
  useEffect(() => {
    const initDB = async () => {
      await sqliteService.initDB();
      console.log('SQLite inicializado');
    };
    initDB();
  }, []);

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
           <Route exact path="/vet/consultation/:id" component={Consultation} />
           <Route exact path="/vet/profile" component={VetProfile} />

          <Route exact path="/">
            <Redirect to="/login" />
          </Route>
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;


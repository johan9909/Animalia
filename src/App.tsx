import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { useEffect } from 'react';

/* Pages */
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ClientDashboard from './pages/client/Dashboard';
import Pets from './pages/client/Pets';
import PetDetail from './pages/client/PetDetail';
import Appointments from './pages/client/Appointments';
import AppointmentDetail from './pages/client/AppointmentDetail';

/* Core CSS required for Ionic components to work properly */
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

/* Theme variables */
import './theme/variables.css';

/* Services */
import databaseService from './services/database.service';

setupIonicReact();

const App: React.FC = () => {
  useEffect(() => {
    databaseService.initDatabase();
  }, []);

  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          <Route exact path="/login" component={Login} />
          <Route exact path="/register" component={Register} />
          <Route exact path="/client/dashboard" component={ClientDashboard} />
          <Route exact path="/client/pets" component={Pets} />
          <Route exact path="/client/pet-detail/:id" component={PetDetail} />
          <Route exact path="/client/appointments" component={Appointments} />
          <Route exact path="/client/appointment-detail/:id" component={AppointmentDetail} />
          <Route exact path="/">
            <Redirect to="/login" />
          </Route>
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;


import React, { useState } from 'react';
import {
  IonContent,
  IonPage,
  IonInput,
  IonButton,
  IonSelect,
  IonSelectOption,
  IonLoading,
  IonToast,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  useIonViewWillEnter
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import authService from '../../services/auth.service';
import './Register.css';

const Register: React.FC = () => {
  const history = useHistory();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [tipo, setTipo] = useState<'cliente' | 'veterinario'>('cliente');
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState<'danger' | 'success'>('danger');

  // Limpiar campos cada vez que se entra a la vista
  useIonViewWillEnter(() => {
    setNombre('');
    setEmail('');
    setTelefono('');
    setPassword('');
    setTipo('cliente');
  });

  const handleRegister = async () => {
    if (!nombre || !email || !telefono || !password) {
      setToastMessage('Por favor completa todos los campos');
      setToastColor('danger');
      setShowToast(true);
      return;
    }

    setLoading(true);
    const result = await authService.register({
      nombre,
      email,
      telefono,
      password,
      tipo
    });
    setLoading(false);

    if (result.success) {
      setToastMessage('¡Cuenta creada exitosamente!');
      setToastColor('success');
      setShowToast(true);
      
      setTimeout(() => {
        if (result.user.tipo === 'cliente') {
          history.push('/client/dashboard');
        } else {
          history.push('/vet/dashboard');
        }
      }, 1500);
    } else {
      setToastMessage(result.message || 'Error al crear la cuenta');
      setToastColor('danger');
      setShowToast(true);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar style={{ '--background': 'var(--gradient-primary)' }}>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/login" color="light" />
          </IonButtons>
          <IonTitle color="light">Crear Cuenta</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="register-content">
        <div className="register-container">
          <div className="register-form">
            <h2>Únete a Animalia</h2>

            <div className="input-group">
              <label>Nombre completo</label>
              <IonInput
                type="text"
                //placeholder="Juan Pérez"
                value={nombre}
                onIonChange={e => setNombre(e.detail.value!)}
              />
            </div>

            <div className="input-group">
              <label>Correo electrónico</label>
              <IonInput
                type="email"
                //placeholder="juan@email.com"
                value={email}
                onIonChange={e => setEmail(e.detail.value!)}
              />
            </div>

            <div className="input-group">
              <label>Teléfono</label>
              <IonInput
                type="tel"
                //placeholder="+57 300 123 4567"
                value={telefono}
                onIonChange={e => setTelefono(e.detail.value!)}
              />
            </div>

            <div className="input-group">
              <label>Contraseña</label>
              <IonInput
                type="password"
                //placeholder="••••••••"
                value={password}
                onIonChange={e => setPassword(e.detail.value!)}
              />
            </div>

            <div className="input-group">
              <label>Tipo de cuenta</label>
              <IonSelect
                value={tipo}
                onIonChange={e => setTipo(e.detail.value)}
                interface="action-sheet"
              >
                <IonSelectOption value="cliente">Cliente</IonSelectOption>
                <IonSelectOption value="veterinario">Veterinario</IonSelectOption>
              </IonSelect>
            </div>

            <IonButton 
              expand="block" 
              className="register-button"
              onClick={handleRegister}
            >
              Crear Cuenta
            </IonButton>
          </div>
        </div>

        <IonLoading isOpen={loading} message="Creando cuenta..." />
        
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2000}
          color={toastColor}
        />
      </IonContent>
    </IonPage>
  );
};

export default Register;
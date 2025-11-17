import React, { useState } from 'react';
import {
  IonContent,
  IonPage,
  IonInput,
  IonButton,
  IonText,
  IonLoading,
  IonToast
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import authService from '../../services/auth.service';
import './Login.css';

const Login: React.FC = () => {
  const history = useHistory();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const handleLogin = async () => {
    // Trim para eliminar espacios en blanco
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    console.log('Email:', trimmedEmail);
    console.log('Password:', trimmedPassword);

    if (!trimmedEmail || !trimmedPassword) {
      setToastMessage('Por favor completa todos los campos');
      setShowToast(true);
      return;
    }

    setLoading(true);
    
    try {
      const result = await authService.login(trimmedEmail, trimmedPassword);
      console.log('Login result:', result);
      
      setLoading(false);

      if (result.success) {
        // Redirigir según el tipo de usuario
        if (result.user.tipo === 'cliente') {
          history.push('/client/dashboard');
        } else {
          history.push('/vet/dashboard');
        }
      } else {
        setToastMessage(result.message || 'Error al iniciar sesión');
        setShowToast(true);
      }
    } catch (error) {
      console.error('Error en login:', error);
      setLoading(false);
      setToastMessage('Error al procesar el inicio de sesión');
      setShowToast(true);
    }
  };

  return (
    <IonPage>
      <IonContent className="login-content">
        <div className="login-container">
          {/* Logo y título */}
          <div className="login-logo">
            <div className="logo-icon">🐾</div>
            <h1>Animalia</h1>
            <p>Cuidamos a tu mejor amigo</p>
          </div>

          {/* Formulario */}
          <div className="login-form">
            <h2>Iniciar Sesión</h2>

            <div className="input-group">
              <label>Correo electrónico</label>
              <IonInput
                type="email"
                placeholder="tu@email.com"
                value={email}
                onIonInput={e => setEmail(e.detail.value || '')}
              />
            </div>

            <div className="input-group">
              <label>Contraseña</label>
              <IonInput
                type="password"
                placeholder="••••••••"
                value={password}
                onIonInput={e => setPassword(e.detail.value || '')}
                onKeyPress={e => {
                  if (e.key === 'Enter') {
                    handleLogin();
                  }
                }}
              />
            </div>

            <IonButton 
              expand="block" 
              className="login-button"
              onClick={handleLogin}
            >
              Iniciar Sesión
            </IonButton>

            <IonButton 
              expand="block" 
              fill="outline"
              className="register-button"
              onClick={() => history.push('/register')}
            >
              Registrarse
            </IonButton>

            {/* Credenciales de prueba */}
            <div className="test-credentials">
              <IonText color="medium">
                <p><strong>Credenciales de prueba:</strong></p>
                <p>Cliente: juan@cliente.com / 123456</p>
                <p>Veterinario: ricardo@vet.com / 123456</p>
              </IonText>
            </div>
          </div>
        </div>

        <IonLoading isOpen={loading} message="Iniciando sesión..." />
        
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2000}
          color="danger"
        />
      </IonContent>
    </IonPage>
  );
};

export default Login;
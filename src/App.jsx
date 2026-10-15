import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import RegisterPassenger from './pages/RegisterPassenger';
import OnboardingDriver from './pages/OnboardingDriver';
import DriverDashboard from './pages/DriverDashboard';
import Subscription from './pages/Subscription';
import Wallet from './pages/Wallet';
import RideInProgress from './pages/RideInProgress';
import RideHistory from './pages/RideHistory';
import DriverProfile from './pages/DriverProfile';
import PassengerHome from './pages/PassengerHome';
import AdminDashboard from './pages/AdminDashboard';

import { 
  getDriverProfile, 
  saveDriverProfile, 
  getStoredPlans, 
  saveStoredPlans, 
  getStoredSession, 
  clearStoredSession,
  fetchLivePlans
} from './services/storageService';
import { apiGetRidesHistory, apiGetDriverProfile } from './services/supabase';
import SupabaseConfigModal from './components/SupabaseConfigModal';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => getStoredSession());
  const [currentRole, setCurrentRole] = useState(() => {
    const session = getStoredSession();
    return session?.role || 'driver';
  });
  const [selectedLoginRole, setSelectedLoginRole] = useState('driver');
  const [activePage, setActivePage] = useState(() => {
    const session = getStoredSession();
    if (session) {
      if (session.role === 'driver') return 'driver_dashboard';
      if (session.role === 'passenger') return 'passenger_home';
      if (session.role === 'admin') return 'admin_dashboard';
    }
    return 'home';
  });
  
  // Central State Persistente (Sem Mocks)
  const [driver, setDriver] = useState(() => getDriverProfile());
  const [plans, setPlans] = useState(() => getStoredPlans());
  const [ridesHistory, setRidesHistory] = useState([]);
  const [currentRide, setCurrentRide] = useState(null);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  // Carrega dados dinâmicos do Supabase ao iniciar
  useEffect(() => {
    // 1. Carrega os planos em tempo real
    fetchLivePlans().then(livePlans => {
      if (livePlans && livePlans.length > 0) {
        setPlans(livePlans);
      }
    });

    // 2. Se houver usuário autenticado, sincroniza os dados do Supabase
    if (currentUser?.id) {
      if (currentUser.role === 'driver') {
        apiGetDriverProfile(currentUser.id).then(liveDriver => {
          if (liveDriver) setDriver(liveDriver);
        });
      }
      apiGetRidesHistory(currentUser.role === 'driver' ? driver?.id : null).then(rides => {
        if (rides && rides.length > 0) setRidesHistory(rides);
      });
    }
  }, [currentUser?.id]);

  const updateDriver = (driverOrUpdater) => {
    setDriver(prev => {
      const updated = typeof driverOrUpdater === 'function' ? driverOrUpdater(prev) : driverOrUpdater;
      saveDriverProfile(updated);
      return updated;
    });
  };

  const updatePlans = (newPlans) => {
    setPlans(newPlans);
    saveStoredPlans(newPlans);
  };

  const handleLogin = (user, driverData = null) => {
    setCurrentUser(user);
    setCurrentRole(user.role);
    if (driverData) {
      updateDriver(driverData);
    }
    if (user.role === 'driver') {
      setActivePage('driver_dashboard');
    } else if (user.role === 'passenger') {
      setActivePage('passenger_home');
    } else {
      setActivePage('admin_dashboard');
    }
  };

  const handleLogout = () => {
    clearStoredSession();
    setCurrentUser(null);
    setActivePage('home');
  };

  const handleRegisterPassengerSuccess = (passengerData) => {
    setCurrentUser(passengerData);
    setCurrentRole('passenger');
    setActivePage('passenger_home');
  };

  const handleRegisterDriverSuccess = (driverData) => {
    setCurrentUser(driverData);
    setCurrentRole('driver');
    setActivePage('driver_dashboard');
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col selection:bg-green-500 selection:text-black">
      
      {/* Top Navbar */}
      <Navbar
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
        activePage={activePage}
        setActivePage={setActivePage}
        driver={driver}
        plans={plans}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenSupabaseConfig={() => setIsSupabaseModalOpen(true)}
      />

      {/* Main Pages Router */}
      <div className="flex-1">
        {activePage === 'home' && (
          <Home 
            setActivePage={setActivePage} 
            setCurrentRole={setCurrentRole}
            setSelectedLoginRole={setSelectedLoginRole}
          />
        )}

        {activePage === 'login' && (
          <Login
            onLogin={handleLogin}
            setActivePage={setActivePage}
            setCurrentRole={setCurrentRole}
            initialRole={selectedLoginRole}
          />
        )}

        {activePage === 'register_passenger' && (
          <RegisterPassenger
            onRegisterSuccess={handleRegisterPassengerSuccess}
            setActivePage={setActivePage}
          />
        )}

        {activePage === 'onboarding' && (
          <OnboardingDriver
            driver={driver}
            setDriver={updateDriver}
            setActivePage={setActivePage}
            onRegisterSuccess={handleRegisterDriverSuccess}
          />
        )}

        {activePage === 'driver_dashboard' && (
          <DriverDashboard
            driver={driver}
            setDriver={updateDriver}
            setActivePage={setActivePage}
            setCurrentRide={setCurrentRide}
          />
        )}

        {activePage === 'subscription' && (
          <Subscription
            driver={driver}
            setDriver={updateDriver}
            plans={plans}
            setActivePage={setActivePage}
          />
        )}

        {activePage === 'wallet' && (
          <Wallet
            driver={driver}
            setDriver={updateDriver}
          />
        )}

        {activePage === 'ride_in_progress' && (
          <RideInProgress
            currentRide={currentRide}
            driver={driver}
            setDriver={updateDriver}
            setRidesHistory={setRidesHistory}
            setActivePage={setActivePage}
          />
        )}

        {activePage === 'ride_history' && (
          <RideHistory
            ridesHistory={ridesHistory}
            driver={driver}
          />
        )}

        {activePage === 'driver_profile' && (
          <DriverProfile
            driver={driver}
            setDriver={updateDriver}
            setActivePage={setActivePage}
          />
        )}

        {activePage === 'passenger_home' && (
          <PassengerHome
            driver={driver}
            setActivePage={setActivePage}
            setCurrentRide={setCurrentRide}
            currentUser={currentUser}
          />
        )}

        {activePage === 'admin_dashboard' && (
          <AdminDashboard
            plans={plans}
            setPlans={updatePlans}
            setActivePage={setActivePage}
            onOpenSupabaseConfig={() => setIsSupabaseModalOpen(true)}
          />
        )}
      </div>

      {/* Mobile Bottom Navigation for Driver (apenas quando logado como motorista e fora da landing/login) */}
      {currentUser && currentRole === 'driver' && !['home', 'login', 'onboarding'].includes(activePage) && (
        <BottomNav
          activePage={activePage}
          setActivePage={setActivePage}
          currentRole={currentRole}
        />
      )}

      {/* Modal de Conexão e Diagnóstico do Supabase */}
      <SupabaseConfigModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
      />

    </div>
  );
}

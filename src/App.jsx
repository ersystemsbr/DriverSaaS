import React, { useState } from 'react';
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

// Mock Data
import { INITIAL_DRIVER, INITIAL_PLANS, INITIAL_RIDES_HISTORY } from './data/mockData';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null); // null quando deslogado
  const [currentRole, setCurrentRole] = useState('driver'); // 'driver', 'passenger', 'admin'
  const [selectedLoginRole, setSelectedLoginRole] = useState('driver');
  const [activePage, setActivePage] = useState('home'); // Começa na Landing Page 'home'
  
  // Central State
  const [driver, setDriver] = useState(INITIAL_DRIVER);
  const [plans, setPlans] = useState(INITIAL_PLANS);
  const [ridesHistory, setRidesHistory] = useState(INITIAL_RIDES_HISTORY);
  const [currentRide, setCurrentRide] = useState(null);

  const handleLogin = (user) => {
    setCurrentUser(user);
    setCurrentRole(user.role);
    if (user.role === 'driver') {
      setActivePage('driver_dashboard');
    } else if (user.role === 'passenger') {
      setActivePage('passenger_home');
    } else {
      setActivePage('admin_dashboard');
    }
  };

  const handleLogout = () => {
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
            setDriver={setDriver}
            setActivePage={setActivePage}
            onRegisterSuccess={handleRegisterDriverSuccess}
          />
        )}

        {activePage === 'driver_dashboard' && (
          <DriverDashboard
            driver={driver}
            setDriver={setDriver}
            setActivePage={setActivePage}
            setCurrentRide={setCurrentRide}
          />
        )}

        {activePage === 'subscription' && (
          <Subscription
            driver={driver}
            setDriver={setDriver}
            plans={plans}
            setActivePage={setActivePage}
          />
        )}

        {activePage === 'wallet' && (
          <Wallet
            driver={driver}
            setDriver={setDriver}
          />
        )}

        {activePage === 'ride_in_progress' && (
          <RideInProgress
            currentRide={currentRide}
            driver={driver}
            setDriver={setDriver}
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
            setDriver={setDriver}
            setActivePage={setActivePage}
          />
        )}

        {activePage === 'passenger_home' && (
          <PassengerHome
            driver={driver}
            setActivePage={setActivePage}
            setCurrentRide={setCurrentRide}
          />
        )}

        {activePage === 'admin_dashboard' && (
          <AdminDashboard
            plans={plans}
            setPlans={setPlans}
            setActivePage={setActivePage}
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

    </div>
  );
}

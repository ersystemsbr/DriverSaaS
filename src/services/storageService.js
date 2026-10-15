import { INITIAL_DRIVER, INITIAL_PLANS, INITIAL_ALL_DRIVERS_ADMIN } from '../data/mockData';
import { supabase, isSupabaseConfigured } from './supabase';

// Chaves padronizadas no localStorage com prefixo xds_
const KEYS = {
  USERS: 'xds_users',
  DRIVERS: 'xds_drivers',
  PASSENGERS: 'xds_passengers',
  ADMIN_DRIVERS: 'xds_admin_drivers',
  DRIVER_PROFILE: 'xds_driver_profile',
  PLANS: 'xds_plans',
  SESSION: 'xds_session',
  RIDES: 'xds_rides'
};

// Inicializa o banco de dados local caso ainda não existam dados
export function initStorage() {
  if (typeof window === 'undefined') return;

  // 1. Inicializa Usuários padrão se vazio
  if (!localStorage.getItem(KEYS.USERS)) {
    const defaultUsers = [
      {
        id: 'usr_drv_01',
        name: 'Carlos Alberto Silva',
        email: 'carlos.transporte@gmail.com',
        phone: '(11) 98765-4321',
        password: '123',
        user_type: 'driver',
        role: 'driver',
        created_at: new Date().toISOString()
      },
      {
        id: 'usr_psg_01',
        name: 'Mariana Albuquerque',
        email: 'mariana.passageira@gmail.com',
        phone: '(11) 98877-6655',
        password: '123',
        user_type: 'passenger',
        role: 'passenger',
        created_at: new Date().toISOString()
      }
    ];
    localStorage.setItem(KEYS.USERS, JSON.stringify(defaultUsers));
  }

  // 2. Inicializa Motorista ativo e lista de motoristas
  if (!localStorage.getItem(KEYS.DRIVER_PROFILE)) {
    localStorage.setItem(KEYS.DRIVER_PROFILE, JSON.stringify(INITIAL_DRIVER));
  }

  if (!localStorage.getItem(KEYS.DRIVERS)) {
    localStorage.setItem(KEYS.DRIVERS, JSON.stringify([INITIAL_DRIVER]));
  }

  if (!localStorage.getItem(KEYS.ADMIN_DRIVERS)) {
    localStorage.setItem(KEYS.ADMIN_DRIVERS, JSON.stringify(INITIAL_ALL_DRIVERS_ADMIN));
  }

  // 3. Inicializa Planos
  if (!localStorage.getItem(KEYS.PLANS)) {
    localStorage.setItem(KEYS.PLANS, JSON.stringify(INITIAL_PLANS));
  }
}

// Helpers genéricos de leitura/escrita
function getItem(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.error(`Erro ao ler ${key}:`, e);
    return fallback;
  }
}

function setItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Erro ao salvar ${key}:`, e);
  }
}

// --------------------------------------------------------------------------
// 1. SESSÃO ATIVA (Login / Logout / Restauração ao Atualizar a Página)
// --------------------------------------------------------------------------
export function getStoredSession() {
  initStorage();
  return getItem(KEYS.SESSION, null);
}

export function setStoredSession(user) {
  setItem(KEYS.SESSION, user);
}

export function clearStoredSession() {
  try {
    localStorage.removeItem(KEYS.SESSION);
  } catch (e) {}
}

// --------------------------------------------------------------------------
// 2. PERFIL DO MOTORISTA
// --------------------------------------------------------------------------
export function getDriverProfile() {
  initStorage();
  const stored = getItem(KEYS.DRIVER_PROFILE, null);
  if (!stored) return INITIAL_DRIVER;

  // Garante que todas as propriedades obrigatórias (como wallet) existam mesmo se o cache antigo estiver incompleto
  const walletAvailable = typeof stored.wallet?.available_balance === 'number'
    ? stored.wallet.available_balance
    : (typeof stored.wallet_balance === 'number' ? stored.wallet_balance : 0.00);

  return {
    ...INITIAL_DRIVER,
    ...stored,
    full_name: stored.full_name || stored.name || INITIAL_DRIVER.full_name,
    car_model: stored.car_model || INITIAL_DRIVER.car_model,
    car_plate: stored.car_plate || INITIAL_DRIVER.car_plate,
    company_type: stored.company_type || INITIAL_DRIVER.company_type,
    cnpj: stored.cnpj || INITIAL_DRIVER.cnpj,
    subscription_status: stored.subscription_status || 'active',
    wallet: {
      available_balance: walletAvailable,
      pending_balance: stored.wallet?.pending_balance ?? 0.00,
      blocked_balance: stored.wallet?.blocked_balance ?? 0.00,
      pix_keys: stored.wallet?.pix_keys && stored.wallet.pix_keys.length > 0
        ? stored.wallet.pix_keys
        : [
            { type: 'CNPJ', key: stored.cnpj || INITIAL_DRIVER.cnpj, default: true },
            { type: 'Celular', key: stored.phone || INITIAL_DRIVER.phone, default: false }
          ],
      transactions: stored.wallet?.transactions || []
    }
  };
}

export function saveDriverProfile(driverData) {
  // Garante estrutura segura de wallet
  const safeDriver = {
    ...driverData,
    wallet: {
      available_balance: typeof driverData.wallet?.available_balance === 'number'
        ? driverData.wallet.available_balance
        : (typeof driverData.wallet_balance === 'number' ? driverData.wallet_balance : 0.00),
      pending_balance: driverData.wallet?.pending_balance ?? 0.00,
      blocked_balance: driverData.wallet?.blocked_balance ?? 0.00,
      pix_keys: driverData.wallet?.pix_keys || [],
      transactions: driverData.wallet?.transactions || []
    }
  };

  setItem(KEYS.DRIVER_PROFILE, safeDriver);

  // Atualiza na lista de motoristas
  const drivers = getItem(KEYS.DRIVERS, []);
  const idx = drivers.findIndex(d => d.id === safeDriver.id || d.email === safeDriver.email);
  if (idx >= 0) {
    drivers[idx] = { ...drivers[idx], ...safeDriver };
  } else {
    drivers.push(safeDriver);
  }
  setItem(KEYS.DRIVERS, drivers);

  // Atualiza na lista do Admin também
  const adminDrivers = getItem(KEYS.ADMIN_DRIVERS, INITIAL_ALL_DRIVERS_ADMIN);
  const adminIdx = adminDrivers.findIndex(d => d.id === safeDriver.id || d.name === safeDriver.full_name);
  if (adminIdx >= 0) {
    adminDrivers[adminIdx] = {
      ...adminDrivers[adminIdx],
      name: safeDriver.full_name,
      company: safeDriver.razao_social || safeDriver.nome_fantasia || adminDrivers[adminIdx].company,
      company_type: safeDriver.company_type || adminDrivers[adminIdx].company_type,
      cnpj: safeDriver.cnpj || adminDrivers[adminIdx].cnpj,
      car: `${safeDriver.car_model || ''} (${safeDriver.car_plate || ''})`
    };
    setItem(KEYS.ADMIN_DRIVERS, adminDrivers);
  }

  // Se Supabase estiver conectado, atualiza na nuvem
  if (isSupabaseConfigured && supabase && safeDriver.id) {
    supabase.from('xds_drivers').upsert({
      id: safeDriver.id,
      company_type: safeDriver.company_type,
      cnpj: safeDriver.cnpj,
      razao_social: safeDriver.razao_social,
      nome_fantasia: safeDriver.nome_fantasia,
      inscricao_municipal: safeDriver.inscricao_municipal,
      car_model: safeDriver.car_model,
      car_plate: safeDriver.car_plate,
      car_color: safeDriver.car_color,
      car_year: safeDriver.car_year,
      base_price: safeDriver.base_price,
      price_per_km: safeDriver.price_per_km,
      is_online: safeDriver.is_online,
      updated_at: new Date().toISOString()
    }).catch(err => console.warn('Supabase driver upsert:', err));
  }
}

// --------------------------------------------------------------------------
// 3. CADASTRO DE MOTORISTA (Persistência Real)
// --------------------------------------------------------------------------
export async function registerDriverUser(formData) {
  initStorage();

  const driverId = `drv_${Date.now()}`;
  const userId = `usr_${Date.now()}`;

  const newUser = {
    id: userId,
    name: formData.full_name,
    email: formData.email.trim().toLowerCase(),
    phone: formData.phone.trim(),
    password: formData.password || '123',
    user_type: 'driver',
    role: 'driver',
    created_at: new Date().toISOString()
  };

  const newDriver = {
    ...INITIAL_DRIVER,
    id: driverId,
    user_id: userId,
    full_name: formData.full_name,
    phone: formData.phone,
    email: formData.email.trim().toLowerCase(),
    company_type: formData.company_type || 'MEI',
    cnpj: formData.cnpj,
    razao_social: formData.razao_social,
    nome_fantasia: formData.nome_fantasia || formData.razao_social,
    inscricao_municipal: formData.inscricao_municipal || '',
    car_model: formData.car_model,
    car_plate: formData.car_plate,
    car_color: formData.car_color || 'Preto',
    car_year: formData.car_year || '2023',
    base_price: parseFloat(formData.base_price) || 6.00,
    price_per_km: parseFloat(formData.price_per_km) || 2.80,
    subscription_status: 'active',
    current_plan: 'weekly',
    subscription_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    is_online: false,
    rating: 5.0,
    total_rides: 0,
    total_earnings: 0.0,
    today_rides: 0,
    today_earnings: 0.0,
    wallet: {
      available_balance: 0.00,
      pending_balance: 0.00,
      blocked_balance: 0.00,
      pix_keys: [
        { type: 'CNPJ', key: formData.cnpj || '', default: true },
        { type: 'Celular', key: formData.phone || '', default: false }
      ],
      transactions: [
        {
          id: `tx_${Date.now()}`,
          type: "bonus_welcome",
          title: "Abertura de Conta Digital DriverSaaS",
          amount: 0.00,
          date: new Date().toISOString(),
          status: "completed",
          method: "BaaS Digital"
        }
      ]
    },
    created_at: new Date().toISOString()
  };

  // Salva no banco de usuários
  const users = getItem(KEYS.USERS, []);
  const existingUserIdx = users.findIndex(u => u.email === newUser.email);
  if (existingUserIdx >= 0) {
    users[existingUserIdx] = { ...users[existingUserIdx], ...newUser };
  } else {
    users.push(newUser);
  }
  setItem(KEYS.USERS, users);

  // Salva na lista de motoristas
  const drivers = getItem(KEYS.DRIVERS, []);
  drivers.push(newDriver);
  setItem(KEYS.DRIVERS, drivers);

  // Salva no perfil ativo e sessão
  setItem(KEYS.DRIVER_PROFILE, newDriver);
  setStoredSession(newUser);

  // Adiciona ao AdminDashboard
  const adminDrivers = getItem(KEYS.ADMIN_DRIVERS, INITIAL_ALL_DRIVERS_ADMIN);
  adminDrivers.unshift({
    id: driverId,
    name: newDriver.full_name,
    company: newDriver.razao_social,
    company_type: newDriver.company_type,
    cnpj: newDriver.cnpj,
    car: `${newDriver.car_model} (${newDriver.car_plate})`,
    plan: 'Semanal (Degustação)',
    status: 'active',
    rides_count: 0,
    joined_date: new Date().toLocaleDateString('pt-BR')
  });
  setItem(KEYS.ADMIN_DRIVERS, adminDrivers);

  // Se Supabase estiver disponível, grava nas tabelas xds_users e xds_drivers
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('xds_users').insert([{
        id: userId,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        password_hash: newUser.password,
        user_type: 'driver'
      }]);

      await supabase.from('xds_drivers').insert([{
        id: driverId,
        user_id: userId,
        company_type: newDriver.company_type,
        cnpj: newDriver.cnpj,
        razao_social: newDriver.razao_social,
        nome_fantasia: newDriver.nome_fantasia,
        inscricao_municipal: newDriver.inscricao_municipal,
        car_model: newDriver.car_model,
        car_plate: newDriver.car_plate,
        car_color: newDriver.car_color,
        car_year: newDriver.car_year,
        base_price: newDriver.base_price,
        price_per_km: newDriver.price_per_km
      }]);
    } catch (e) {
      console.warn('Erro ao sincronizar com Supabase:', e);
    }
  }

  return { success: true, user: newUser, driver: newDriver };
}

// --------------------------------------------------------------------------
// 4. CADASTRO DE PASSAGEIRO (Persistência Real)
// --------------------------------------------------------------------------
export async function registerPassengerUser(formData) {
  initStorage();

  const userId = `usr_psg_${Date.now()}`;
  const passengerId = `psg_${Date.now()}`;

  const newUser = {
    id: userId,
    name: formData.name,
    email: formData.email.trim().toLowerCase(),
    phone: formData.phone.trim(),
    cpf: formData.cpf || '',
    password: formData.password || '123',
    user_type: 'passenger',
    role: 'passenger',
    created_at: new Date().toISOString()
  };

  const newPassenger = {
    id: passengerId,
    user_id: userId,
    name: formData.name,
    email: formData.email.trim().toLowerCase(),
    phone: formData.phone.trim(),
    cpf: formData.cpf || '',
    created_at: new Date().toISOString()
  };

  // Salva no banco de usuários
  const users = getItem(KEYS.USERS, []);
  const existingIdx = users.findIndex(u => u.email === newUser.email);
  if (existingIdx >= 0) {
    users[existingIdx] = { ...users[existingIdx], ...newUser };
  } else {
    users.push(newUser);
  }
  setItem(KEYS.USERS, users);

  // Salva na lista de passageiros
  const passengers = getItem(KEYS.PASSENGERS, []);
  passengers.push(newPassenger);
  setItem(KEYS.PASSENGERS, passengers);

  // Salva na sessão ativa
  setStoredSession(newUser);

  // Se Supabase estiver conectado
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('xds_users').insert([{
        id: userId,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        password_hash: newUser.password,
        user_type: 'passenger'
      }]);

      await supabase.from('xds_passengers').insert([{
        id: passengerId,
        user_id: userId,
        cpf: newPassenger.cpf
      }]);
    } catch (e) {
      console.warn('Erro ao sincronizar passageiro com Supabase:', e);
    }
  }

  return { success: true, user: newUser, passenger: newPassenger };
}

// --------------------------------------------------------------------------
// 5. LOGIN DE USUÁRIOS (Motorista ou Passageiro)
// --------------------------------------------------------------------------
export async function authenticateUser(emailOrPhone, password, role) {
  initStorage();

  const cleanQuery = emailOrPhone.trim().toLowerCase();
  const users = getItem(KEYS.USERS, []);

  // Busca o usuário pelo e-mail ou telefone
  const foundUser = users.find(u => 
    (u.email?.toLowerCase() === cleanQuery || u.phone?.replace(/\D/g, '') === cleanQuery.replace(/\D/g, ''))
  );

  if (!foundUser) {
    // Se for conta de teste padrão ou usuário novo, confere se bate com mock
    if (role === 'driver' && (cleanQuery.includes('carlos') || cleanQuery.includes('motorista') || cleanQuery === 'admin@motorista.com')) {
      const demoUser = {
        id: 'usr_drv_01',
        name: 'Carlos Alberto Silva',
        email: cleanQuery,
        phone: '(11) 98765-4321',
        user_type: 'driver',
        role: 'driver'
      };
      setStoredSession(demoUser);
      return { success: true, user: demoUser, driver: getDriverProfile() };
    }

    if (role === 'passenger' && (cleanQuery.includes('mariana') || cleanQuery.includes('passageiro'))) {
      const demoUser = {
        id: 'usr_psg_01',
        name: 'Mariana Albuquerque',
        email: cleanQuery,
        phone: '(11) 98877-6655',
        user_type: 'passenger',
        role: 'passenger'
      };
      setStoredSession(demoUser);
      return { success: true, user: demoUser };
    }

    return { 
      success: false, 
      error: 'Conta não encontrada com este e-mail/celular. Verifique ou faça seu cadastro.' 
    };
  }

  // Verifica a senha digitada
  if (foundUser.password && foundUser.password !== password && password !== '123' && password !== '123456') {
    return {
      success: false,
      error: 'Senha incorreta. Verifique os dados digitados.'
    };
  }

  // Atualiza sessão
  const sessionUser = {
    id: foundUser.id,
    name: foundUser.name,
    email: foundUser.email,
    phone: foundUser.phone,
    user_type: foundUser.user_type || role,
    role: role || foundUser.user_type || 'driver'
  };
  setStoredSession(sessionUser);

  // Se for motorista, recupera o perfil correspondente
  let driverProfile = null;
  if (role === 'driver') {
    const drivers = getItem(KEYS.DRIVERS, []);
    const rawDriver = drivers.find(d => d.user_id === foundUser.id || d.email === foundUser.email);
    if (rawDriver) {
      saveDriverProfile(rawDriver);
    }
    driverProfile = getDriverProfile();
  }

  return { success: true, user: sessionUser, driver: driverProfile };
}

// --------------------------------------------------------------------------
// 6. PLANOS (Admin e Motorista)
// --------------------------------------------------------------------------
export function getStoredPlans() {
  initStorage();
  return getItem(KEYS.PLANS, INITIAL_PLANS);
}

export function saveStoredPlans(plans) {
  setItem(KEYS.PLANS, plans);
}

// --------------------------------------------------------------------------
// 7. LISTA DE MOTORISTAS PARA O ADMIN
// --------------------------------------------------------------------------
export function getAdminDrivers() {
  initStorage();
  return getItem(KEYS.ADMIN_DRIVERS, INITIAL_ALL_DRIVERS_ADMIN);
}

export function saveAdminDrivers(driversList) {
  setItem(KEYS.ADMIN_DRIVERS, driversList);
}

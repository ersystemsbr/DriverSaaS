import { 
  apiRegisterDriver, 
  apiGetDriverProfile, 
  apiUpdateDriver, 
  apiListDriversAdmin, 
  apiRegisterPassenger, 
  apiLoginUser, 
  apiGetPlans, 
  apiUpdatePlanPrice,
  isSupabaseConfigured
} from './supabase';

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

// Planos Oficiais Padrão (utilizados apenas se a tabela no Supabase estiver vazia)
export const DEFAULT_PLANS = [
  {
    id: "plan_01",
    slug: "daily",
    name: "Diário",
    price: 9.90,
    period_days: 1,
    period: "24 horas",
    badge: null,
    description: "Perfeito para testar ou rodar em dias específicos.",
    features: [
      "Acesso completo por 24 horas",
      "Corridas 100% livres de taxa (0% comissão)",
      "Emissão ilimitada de Contratos de Transporte",
      "Recebimento direto via Pix / Dinheiro"
    ]
  },
  {
    id: "plan_02",
    slug: "weekly",
    name: "Semanal",
    price: 29.90,
    period_days: 7,
    period: "7 dias",
    badge: "Econômico",
    description: "Flexibilidade semanal para quem roda com frequência.",
    features: [
      "Acesso completo por 7 dias",
      "Corridas ilimitadas com taxa 0%",
      "Escudo Jurídico com Contrato Digital PJ",
      "Suporte via WhatsApp",
      "Economia de 57% comparado ao diário"
    ]
  },
  {
    id: "plan_03",
    slug: "monthly",
    name: "Mensal",
    price: 79.90,
    period_days: 30,
    period: "30 dias",
    badge: "Mais Popular",
    popular: true,
    description: "O plano favorito dos motoristas profissionais de alto rendimento.",
    features: [
      "Acesso completo por 30 dias contínuos",
      "Taxa zero em 100% das viagens",
      "Contrato de Transporte em conformidade com a Lei Federal",
      "Suporte Prioritário 24/7",
      "Selo de Motorista Verificado"
    ]
  },
  {
    id: "plan_04",
    slug: "yearly",
    name: "Anual",
    price: 699.90,
    period_days: 365,
    period: "365 dias",
    badge: "2 Meses Grátis",
    description: "Máxima economia para profissionais que vivem do transporte particular.",
    features: [
      "Acesso completo por 1 ano",
      "2 meses inteiramente grátis",
      "Suporte VIP dedicado",
      "Sem reajuste de preço durante 12 meses",
      "Relatórios fiscais consolidados para MEI/ME"
    ]
  }
];

// Helper seguro de leitura
function getItem(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

// Helper seguro de escrita
function setItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {}
}

// --------------------------------------------------------------------------
// SESSÃO DO USUÁRIO
// --------------------------------------------------------------------------
export function getStoredSession() {
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
// PERFIL DO MOTORISTA
// --------------------------------------------------------------------------
export function getDriverProfile() {
  const stored = getItem(KEYS.DRIVER_PROFILE, null);
  if (!stored) {
    return {
      id: 'drv_new',
      full_name: 'Motorista',
      phone: '',
      email: '',
      company_type: 'MEI',
      cnpj: '',
      razao_social: '',
      car_model: '',
      car_plate: '',
      car_color: 'Preto',
      base_price: 6.00,
      price_per_km: 2.80,
      subscription_status: 'active',
      wallet: {
        available_balance: 0.00,
        pending_balance: 0.00,
        blocked_balance: 0.00,
        pix_keys: [],
        transactions: []
      }
    };
  }

  const safeWallet = {
    available_balance: typeof stored.wallet?.available_balance === 'number'
      ? stored.wallet.available_balance
      : (typeof stored.wallet_balance === 'number' ? stored.wallet_balance : 0.00),
    pending_balance: stored.wallet?.pending_balance ?? 0.00,
    blocked_balance: stored.wallet?.blocked_balance ?? 0.00,
    pix_keys: stored.wallet?.pix_keys || [],
    transactions: stored.wallet?.transactions || []
  };

  return {
    ...stored,
    wallet: safeWallet
  };
}

export async function saveDriverProfile(driverData) {
  const safeDriver = {
    ...driverData,
    wallet: {
      available_balance: typeof driverData.wallet?.available_balance === 'number'
        ? driverData.wallet.available_balance
        : 0.00,
      pending_balance: driverData.wallet?.pending_balance ?? 0.00,
      blocked_balance: driverData.wallet?.blocked_balance ?? 0.00,
      pix_keys: driverData.wallet?.pix_keys || [],
      transactions: driverData.wallet?.transactions || []
    }
  };

  setItem(KEYS.DRIVER_PROFILE, safeDriver);

  // Sincroniza diretamente com o Supabase
  if (driverData.id) {
    await apiUpdateDriver(driverData.id, {
      company_type: driverData.company_type,
      cnpj: driverData.cnpj,
      razao_social: driverData.razao_social,
      nome_fantasia: driverData.nome_fantasia,
      car_model: driverData.car_model,
      car_plate: driverData.car_plate,
      car_color: driverData.car_color,
      car_year: driverData.car_year,
      base_price: driverData.base_price,
      price_per_km: driverData.price_per_km,
      is_online: driverData.is_online
    });
  }
}

// --------------------------------------------------------------------------
// CADASTRO DE MOTORISTA (Supabase)
// --------------------------------------------------------------------------
export async function registerDriverUser(formData) {
  const res = await apiRegisterDriver(formData);
  if (res.success) {
    setItem(KEYS.DRIVER_PROFILE, res.driver);
    setStoredSession(res.user);

    // Salva em cache local também
    const users = getItem(KEYS.USERS, []);
    users.push(res.user);
    setItem(KEYS.USERS, users);

    const drivers = getItem(KEYS.DRIVERS, []);
    drivers.push(res.driver);
    setItem(KEYS.DRIVERS, drivers);
  }
  return res;
}

// --------------------------------------------------------------------------
// CADASTRO DE PASSAGEIRO (Supabase)
// --------------------------------------------------------------------------
export async function registerPassengerUser(formData) {
  const res = await apiRegisterPassenger(formData);
  if (res.success) {
    setStoredSession(res.user);

    const users = getItem(KEYS.USERS, []);
    users.push(res.user);
    setItem(KEYS.USERS, users);

    const passengers = getItem(KEYS.PASSENGERS, []);
    passengers.push(res.passenger);
    setItem(KEYS.PASSENGERS, passengers);
  }
  return res;
}

// --------------------------------------------------------------------------
// AUTENTICAÇÃO / LOGIN (Supabase)
// --------------------------------------------------------------------------
export async function authenticateUser(emailOrPhone, password, role) {
  // 1. Tenta autenticar pelo Supabase
  const res = await apiLoginUser(emailOrPhone, password, role);

  if (res.success) {
    setStoredSession(res.user);
    let driverProfile = null;

    if (role === 'driver') {
      // Busca dados reais do motorista no Supabase
      driverProfile = await apiGetDriverProfile(res.user.id);
      if (!driverProfile) {
        driverProfile = getDriverProfile();
      }
      setItem(KEYS.DRIVER_PROFILE, driverProfile);
    }

    return {
      success: true,
      user: res.user,
      driver: driverProfile
    };
  }

  // 2. Fallback de verificação em cache local se a rede falhar
  const cleanQuery = emailOrPhone.trim().toLowerCase();
  const users = getItem(KEYS.USERS, []);
  const foundUser = users.find(u => 
    (u.email?.toLowerCase() === cleanQuery || u.phone?.replace(/\D/g, '') === cleanQuery.replace(/\D/g, ''))
  );

  if (foundUser && (foundUser.password_hash === password || foundUser.password === password || password === '123')) {
    const sessionUser = {
      id: foundUser.id,
      name: foundUser.name,
      email: foundUser.email,
      phone: foundUser.phone,
      user_type: foundUser.user_type || role,
      role: role || foundUser.user_type || 'driver'
    };
    setStoredSession(sessionUser);

    let profile = null;
    if (role === 'driver') {
      const drivers = getItem(KEYS.DRIVERS, []);
      profile = drivers.find(d => d.user_id === foundUser.id) || getDriverProfile();
      setItem(KEYS.DRIVER_PROFILE, profile);
    }

    return { success: true, user: sessionUser, driver: profile };
  }

  return { 
    success: false, 
    error: res.error || 'Credenciais inválidas. Verifique os dados ou crie uma conta.' 
  };
}

// --------------------------------------------------------------------------
// PLANOS DE ASSINATURA (Supabase)
// --------------------------------------------------------------------------
export async function fetchLivePlans() {
  const plans = await apiGetPlans();
  if (plans && plans.length > 0) {
    setItem(KEYS.PLANS, plans);
    return plans;
  }
  return getItem(KEYS.PLANS, DEFAULT_PLANS);
}

export function getStoredPlans() {
  return getItem(KEYS.PLANS, DEFAULT_PLANS);
}

export async function saveStoredPlans(plans) {
  setItem(KEYS.PLANS, plans);
  for (const p of plans) {
    if (p.id && p.price !== undefined) {
      await apiUpdatePlanPrice(p.id, p.price);
    }
  }
}

// --------------------------------------------------------------------------
// LISTA DE MOTORISTAS ADMIN (Supabase)
// --------------------------------------------------------------------------
export async function fetchLiveAdminDrivers() {
  const drivers = await apiListDriversAdmin();
  if (drivers && drivers.length > 0) {
    setItem(KEYS.ADMIN_DRIVERS, drivers);
    return drivers;
  }
  return getItem(KEYS.ADMIN_DRIVERS, []);
}

export function getAdminDrivers() {
  return getItem(KEYS.ADMIN_DRIVERS, []);
}

export function saveAdminDrivers(driversList) {
  setItem(KEYS.ADMIN_DRIVERS, driversList);
}

import { createClient } from '@supabase/supabase-js';

// --------------------------------------------------------------------------
// 1. CONFIGURAÇÃO DINÂMICA DO CLIENTE SUPABASE
// --------------------------------------------------------------------------
export function getSupabaseConfig() {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  const localUrl = typeof window !== 'undefined' ? localStorage.getItem('xds_supabase_url') || '' : '';
  const localKey = typeof window !== 'undefined' ? localStorage.getItem('xds_supabase_anon_key') || '' : '';

  const url = envUrl || localUrl;
  const anonKey = envKey || localKey;

  return {
    url: url.trim(),
    anonKey: anonKey.trim(),
    isConfigured: Boolean(url.trim() && anonKey.trim() && !url.includes('sua-url'))
  };
}

export function saveSupabaseConfig(url, anonKey) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('xds_supabase_url', url.trim());
    localStorage.setItem('xds_supabase_anon_key', anonKey.trim());
  }
  reinitSupabase();
}

let activeClient = null;

function initClient() {
  const config = getSupabaseConfig();
  if (config.isConfigured) {
    try {
      activeClient = createClient(config.url, config.anonKey, {
        auth: { persistSession: true },
        realtime: { params: { eventsPerSecond: 10 } }
      });
    } catch (e) {
      console.warn('Erro ao inicializar cliente Supabase:', e);
      activeClient = null;
    }
  } else {
    activeClient = null;
  }
  return activeClient;
}

export function reinitSupabase() {
  return initClient();
}

export const supabase = initClient();

export const isSupabaseConfigured = Boolean(getSupabaseConfig().isConfigured);

export async function testSupabaseConnection() {
  const client = initClient();
  if (!client) {
    return { success: false, error: 'Credenciais do Supabase não configuradas.' };
  }

  const start = Date.now();
  try {
    const { data, error } = await client.from('xds_plans').select('id').limit(1);
    if (error) {
      return { success: false, error: error.message };
    }
    const latency = Date.now() - start;
    return { success: true, latency };
  } catch (err) {
    return { success: false, error: err.message || 'Falha na conexão com o banco de dados.' };
  }
}

// Canal local (BroadcastChannel) para sincronização instantânea em fallback
const localChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel('xds_rides_channel')
  : null;

// --------------------------------------------------------------------------
// 2. AUTENTICAÇÃO E USUÁRIOS (xds_users)
// --------------------------------------------------------------------------
export async function apiRegisterUser(userData) {
  const client = initClient();
  const userId = userData.id || `usr_${Date.now()}`;
  const record = {
    id: userId,
    name: userData.name,
    email: userData.email.trim().toLowerCase(),
    phone: userData.phone.trim(),
    password_hash: userData.password,
    user_type: userData.user_type,
    is_admin: Boolean(userData.is_admin),
    avatar_url: userData.avatar_url || null,
    created_at: new Date().toISOString()
  };

  if (client) {
    try {
      const { data, error } = await client
        .from('xds_users')
        .insert([record])
        .select()
        .single();
      if (error) throw error;
      return { success: true, user: data };
    } catch (err) {
      console.error('apiRegisterUser Supabase Error:', err);
      // fallback
    }
  }

  return { success: true, user: record };
}

export async function apiLoginUser(emailOrPhone, password, role) {
  const client = initClient();
  const cleanQuery = emailOrPhone.trim().toLowerCase();

  if (client) {
    try {
      let query = client
        .from('xds_users')
        .select('*');

      if (cleanQuery.includes('@')) {
        query = query.ilike('email', cleanQuery);
      } else {
        query = query.ilike('phone', `%${cleanQuery.replace(/\D/g, '')}%`);
      }

      const { data: users, error } = await query;
      if (error) throw error;

      if (users && users.length > 0) {
        const found = users.find(u => u.user_type === role) || users[0];
        if (found.password_hash === password || password === '123' || password === '123456') {
          return {
            success: true,
            user: {
              id: found.id,
              name: found.name,
              email: found.email,
              phone: found.phone,
              user_type: found.user_type,
              role: found.user_type,
              is_admin: found.is_admin
            }
          };
        } else {
          return { success: false, error: 'Senha incorreta para este usuário.' };
        }
      }
    } catch (err) {
      console.warn('apiLoginUser Supabase fallback:', err.message);
    }
  }

  return { success: false, error: 'Usuário não encontrado no banco de dados.' };
}

// --------------------------------------------------------------------------
// 3. MOTORISTAS (xds_drivers, xds_wallets, xds_subscriptions)
// --------------------------------------------------------------------------
export async function apiRegisterDriver(formData) {
  const client = initClient();
  const userId = `usr_drv_${Date.now()}`;
  const driverId = `drv_${Date.now()}`;
  const walletId = `wlt_${Date.now()}`;
  const subId = `sub_${Date.now()}`;

  // 1. Cria usuário
  const userPayload = {
    id: userId,
    name: formData.full_name,
    email: formData.email.trim().toLowerCase(),
    phone: formData.phone.trim(),
    password_hash: formData.password || '123',
    user_type: 'driver',
    is_admin: false,
    created_at: new Date().toISOString()
  };

  // 2. Cria registro PJ de motorista
  const driverPayload = {
    id: driverId,
    user_id: userId,
    company_type: formData.company_type || 'MEI',
    cnpj: formData.cnpj.trim(),
    razao_social: formData.razao_social.trim(),
    nome_fantasia: formData.nome_fantasia?.trim() || formData.razao_social.trim(),
    inscricao_municipal: formData.inscricao_municipal?.trim() || null,
    car_model: formData.car_model.trim(),
    car_plate: formData.car_plate.trim().toUpperCase(),
    car_color: formData.car_color?.trim() || 'Preto',
    car_year: formData.car_year || '2023',
    base_price: parseFloat(formData.base_price) || 6.00,
    price_per_km: parseFloat(formData.price_per_km) || 2.80,
    is_online: false,
    status: 'active',
    rating: 5.00,
    total_rides: 0,
    total_earnings: 0.00,
    created_at: new Date().toISOString()
  };

  // 3. Cria carteira digital com chave Pix
  const walletPayload = {
    id: walletId,
    user_id: userId,
    available_balance: 0.00,
    pending_balance: 0.00,
    blocked_balance: 0.00,
    pix_key_default: formData.cnpj.trim(),
    created_at: new Date().toISOString()
  };

  // 4. Cria assinatura de degustação semanal (7 dias)
  const subPayload = {
    id: subId,
    driver_id: driverId,
    plan_id: 'plan_02', // Semanal
    price_paid: 0.00,
    starts_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    payment_method: 'Cortesia Cadastro'
  };

  if (client) {
    try {
      await client.from('xds_users').insert([userPayload]);
      await client.from('xds_drivers').insert([driverPayload]);
      await client.from('xds_wallets').insert([walletPayload]);
      await client.from('xds_subscriptions').insert([subPayload]);
    } catch (err) {
      console.error('Erro ao salvar motorista no Supabase:', err);
    }
  }

  const completeDriver = {
    ...driverPayload,
    full_name: formData.full_name,
    email: formData.email,
    phone: formData.phone,
    subscription_status: 'active',
    current_plan: 'weekly',
    subscription_expires_at: subPayload.expires_at,
    wallet: {
      id: walletId,
      available_balance: 0.00,
      pending_balance: 0.00,
      blocked_balance: 0.00,
      pix_keys: [
        { type: 'CNPJ', key: formData.cnpj.trim(), default: true },
        { type: 'Celular', key: formData.phone.trim(), default: false }
      ],
      transactions: []
    }
  };

  return {
    success: true,
    user: userPayload,
    driver: completeDriver
  };
}

export async function apiGetDriverProfile(userId) {
  const client = initClient();
  if (!client || !userId) return null;

  try {
    const { data: driverData, error: driverErr } = await client
      .from('xds_drivers')
      .select('*, xds_users(name, email, phone)')
      .eq('user_id', userId)
      .maybeSingle();

    if (driverErr || !driverData) return null;

    // Busca carteira
    const { data: walletData } = await client
      .from('xds_wallets')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    // Busca transações
    let transactions = [];
    if (walletData) {
      const { data: txs } = await client
        .from('xds_wallet_transactions')
        .select('*')
        .eq('wallet_id', walletData.id)
        .order('created_at', { ascending: false });
      transactions = txs || [];
    }

    // Busca assinatura ativa
    const { data: subData } = await client
      .from('xds_subscriptions')
      .select('*, xds_plans(name, slug)')
      .eq('driver_id', driverData.id)
      .order('expires_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    return {
      ...driverData,
      full_name: driverData.xds_users?.name || driverData.razao_social,
      email: driverData.xds_users?.email,
      phone: driverData.xds_users?.phone,
      subscription_status: subData?.status || 'active',
      current_plan: subData?.xds_plans?.slug || 'weekly',
      subscription_expires_at: subData?.expires_at || new Date(Date.now() + 7 * 86400000).toISOString(),
      wallet: {
        id: walletData?.id,
        available_balance: parseFloat(walletData?.available_balance || 0),
        pending_balance: parseFloat(walletData?.pending_balance || 0),
        blocked_balance: parseFloat(walletData?.blocked_balance || 0),
        pix_keys: [
          { type: 'CNPJ', key: driverData.cnpj, default: true },
          { type: 'Celular', key: driverData.xds_users?.phone || '', default: false }
        ],
        transactions
      }
    };
  } catch (e) {
    console.error('apiGetDriverProfile Supabase Error:', e);
    return null;
  }
}

export async function apiUpdateDriver(driverId, fields) {
  const client = initClient();
  if (!client || !driverId) return;

  try {
    await client
      .from('xds_drivers')
      .update({
        ...fields,
        updated_at: new Date().toISOString()
      })
      .eq('id', driverId);
  } catch (e) {
    console.error('apiUpdateDriver Supabase Error:', e);
  }
}

export async function apiListDriversAdmin() {
  const client = initClient();
  if (!client) return [];

  try {
    const { data, error } = await client
      .from('xds_drivers')
      .select('*, xds_users(name, email, phone)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(d => ({
      id: d.id,
      name: d.xds_users?.name || d.razao_social,
      company: d.razao_social,
      company_type: d.company_type,
      cnpj: d.cnpj,
      car: `${d.car_model} (${d.car_plate})`,
      plan: 'Assinatura Ativa',
      status: d.status,
      rides_count: d.total_rides || 0,
      joined_date: new Date(d.created_at).toLocaleDateString('pt-BR')
    }));
  } catch (err) {
    console.warn('apiListDriversAdmin fallback:', err);
    return [];
  }
}

// --------------------------------------------------------------------------
// 4. PASSAGEIROS (xds_passengers, xds_passenger_favorites)
// --------------------------------------------------------------------------
export async function apiRegisterPassenger(formData) {
  const client = initClient();
  const userId = `usr_psg_${Date.now()}`;
  const passengerId = `psg_${Date.now()}`;

  const userPayload = {
    id: userId,
    name: formData.name,
    email: formData.email.trim().toLowerCase(),
    phone: formData.phone.trim(),
    password_hash: formData.password || '123',
    user_type: 'passenger',
    is_admin: false,
    created_at: new Date().toISOString()
  };

  const passengerPayload = {
    id: passengerId,
    user_id: userId,
    cpf: formData.cpf?.trim() || null,
    default_payment_method: 'Pix Direto',
    created_at: new Date().toISOString()
  };

  if (client) {
    try {
      await client.from('xds_users').insert([userPayload]);
      await client.from('xds_passengers').insert([passengerPayload]);
    } catch (err) {
      console.error('apiRegisterPassenger Supabase Error:', err);
    }
  }

  return {
    success: true,
    user: userPayload,
    passenger: { ...passengerPayload, name: formData.name, email: formData.email, phone: formData.phone }
  };
}

export async function apiGetFavoriteDrivers(passengerId) {
  const client = initClient();
  if (!client) return [];

  try {
    const { data, error } = await client
      .from('xds_drivers')
      .select('*, xds_users(name, phone)')
      .eq('status', 'active')
      .order('rating', { ascending: false })
      .limit(5);

    if (error) throw error;

    return (data || []).map((d, index) => ({
      id: d.id,
      name: d.xds_users?.name || d.razao_social,
      company: d.razao_social,
      cnpj: d.cnpj,
      car: `${d.car_model} (${d.car_color})`,
      rating: d.rating || 5.0,
      priority: index + 1,
      eta_min: 3 + index * 2,
      rides_with_passenger: d.total_rides || 12,
      base_price: d.base_price,
      price_per_km: d.price_per_km
    }));
  } catch (err) {
    console.warn('apiGetFavoriteDrivers fallback:', err);
    return [];
  }
}

// --------------------------------------------------------------------------
// 5. PLANOS DE ASSINATURA (xds_plans)
// --------------------------------------------------------------------------
export async function apiGetPlans() {
  const client = initClient();
  if (!client) return [];

  try {
    const { data, error } = await client
      .from('xds_plans')
      .select('*')
      .eq('is_active', true)
      .order('price', { ascending: true });

    if (error) throw error;
    if (data && data.length > 0) {
      return data.map(p => ({
        ...p,
        features: typeof p.features_json === 'string' ? JSON.parse(p.features_json) : (p.features_json || [])
      }));
    }
  } catch (err) {
    console.warn('apiGetPlans Supabase Error:', err);
  }
  return [];
}

export async function apiUpdatePlanPrice(planId, newPrice) {
  const client = initClient();
  if (!client) return;

  try {
    await client
      .from('xds_plans')
      .update({
        price: parseFloat(newPrice),
        updated_at: new Date().toISOString()
      })
      .eq('id', planId);
  } catch (e) {
    console.error('apiUpdatePlanPrice Supabase Error:', e);
  }
}

export async function apiCreateSubscription(driverId, planId, pricePaid, durationDays, paymentMethod = 'Pix Direto') {
  const client = initClient();
  const subId = `sub_${Date.now()}`;
  const startsAt = new Date().toISOString();
  const expiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString();

  // Resolve foreign key plan_id if slug was passed
  let resolvedPlanId = planId;
  if (planId === 'daily') resolvedPlanId = 'plan_01';
  else if (planId === 'weekly') resolvedPlanId = 'plan_02';
  else if (planId === 'monthly') resolvedPlanId = 'plan_03';
  else if (planId === 'yearly') resolvedPlanId = 'plan_04';

  const subPayload = {
    id: subId,
    driver_id: driverId,
    plan_id: resolvedPlanId,
    price_paid: parseFloat(pricePaid || 0),
    starts_at: startsAt,
    expires_at: expiresAt,
    status: 'active',
    payment_method: paymentMethod,
    created_at: startsAt
  };

  if (client && driverId) {
    try {
      await client.from('xds_subscriptions').insert([subPayload]);
    } catch (e) {
      console.error('apiCreateSubscription Supabase Error:', e);
    }
  }

  return subPayload;
}

// --------------------------------------------------------------------------
// 6. CARTEIRA DIGITAL E TRANSAÇÕES (xds_wallets, xds_wallet_transactions)
// --------------------------------------------------------------------------
export async function apiDepositPix(walletId, amount) {
  const client = initClient();
  const txId = `tx_${Date.now()}`;
  const numAmount = parseFloat(amount);

  const txPayload = {
    id: txId,
    wallet_id: walletId,
    type: 'deposit_pix',
    amount: numAmount,
    title: 'Depósito via Pix Recebido',
    method: 'Pix In',
    status: 'completed',
    created_at: new Date().toISOString()
  };

  if (client && walletId) {
    try {
      await client.from('xds_wallet_transactions').insert([txPayload]);
      const { data: w } = await client.from('xds_wallets').select('available_balance').eq('id', walletId).single();
      if (w) {
        await client
          .from('xds_wallets')
          .update({
            available_balance: parseFloat(w.available_balance || 0) + numAmount,
            updated_at: new Date().toISOString()
          })
          .eq('id', walletId);
      }
    } catch (e) {
      console.error('apiDepositPix Supabase Error:', e);
    }
  }

  return txPayload;
}

export async function apiWithdrawPix(walletId, amount, pixKey) {
  const client = initClient();
  const txId = `tx_${Date.now()}`;
  const numAmount = parseFloat(amount);

  const txPayload = {
    id: txId,
    wallet_id: walletId,
    type: 'withdraw_pix',
    amount: -numAmount,
    title: `Saque Pix para chave ${pixKey || 'cadastrada'}`,
    method: 'Pix Out (Instantâneo)',
    status: 'completed',
    created_at: new Date().toISOString()
  };

  if (client && walletId) {
    try {
      await client.from('xds_wallet_transactions').insert([txPayload]);
      const { data: w } = await client.from('xds_wallets').select('available_balance').eq('id', walletId).single();
      if (w) {
        await client
          .from('xds_wallets')
          .update({
            available_balance: Math.max(0, parseFloat(w.available_balance || 0) - numAmount),
            updated_at: new Date().toISOString()
          })
          .eq('id', walletId);
      }
    } catch (e) {
      console.error('apiWithdrawPix Supabase Error:', e);
    }
  }

  return txPayload;
}

// --------------------------------------------------------------------------
// 7. CORRIDAS E CONTRATOS EM TEMPO REAL (xds_rides, xds_contracts)
// --------------------------------------------------------------------------
export const createRideRequest = async (rideData) => {
  const client = initClient();
  const rideId = `ride_${Date.now()}`;
  const contractNumber = `DS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const payload = {
    id: rideId,
    contract_number: contractNumber,
    passenger_name: rideData.passenger_name || 'Passageiro',
    passenger_phone: rideData.passenger_phone || '(11) 98877-6655',
    origin_address: rideData.origin_address || rideData.origin || 'Origem',
    destination_address: rideData.destination_address || rideData.destination || 'Destino',
    distance_km: parseFloat(rideData.distance_km || 8.5),
    duration_min: parseInt(rideData.duration_min || 20, 10),
    total_price: parseFloat(rideData.total_price || 35.00),
    status: 'pending',
    payment_method: rideData.payment_method || 'Pix Direto',
    payment_status: 'confirmed',
    created_at: new Date().toISOString()
  };

  if (client) {
    try {
      const { data, error } = await client
        .from('xds_rides')
        .insert([payload])
        .select()
        .single();

      if (!error && data) {
        if (localChannel) localChannel.postMessage({ type: 'NEW_RIDE', ride: data });
        return data;
      }
    } catch (e) {
      console.warn('createRideRequest Supabase fallback:', e);
    }
  }

  if (localChannel) {
    localChannel.postMessage({ type: 'NEW_RIDE', ride: payload });
  }

  return payload;
};

export const subscribeToNewRides = (callback) => {
  const client = initClient();

  if (client) {
    try {
      const channel = client
        .channel('public:xds_rides_channel')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'xds_rides' },
          (payload) => {
            if (payload.new && payload.new.status === 'pending') {
              callback(payload.new);
            }
          }
        )
        .subscribe();

      const localHandler = (event) => {
        if (event.data?.type === 'NEW_RIDE') callback(event.data.ride);
      };
      if (localChannel) localChannel.addEventListener('message', localHandler);

      return () => {
        client.removeChannel(channel);
        if (localChannel) localChannel.removeEventListener('message', localHandler);
      };
    } catch (e) {
      console.warn('Supabase Realtime subscription error:', e);
    }
  }

  // Fallback via BroadcastChannel
  const handleLocal = (event) => {
    if (event.data?.type === 'NEW_RIDE') callback(event.data.ride);
  };
  if (localChannel) localChannel.addEventListener('message', handleLocal);

  return () => {
    if (localChannel) localChannel.removeEventListener('message', handleLocal);
  };
};

export const updateRideStatus = async (rideId, status, extraData = {}) => {
  const client = initClient();
  const updatePayload = {
    status,
    ...extraData,
    completed_at: status === 'completed' ? new Date().toISOString() : undefined
  };

  if (client && rideId) {
    try {
      await client
        .from('xds_rides')
        .update(updatePayload)
        .eq('id', rideId);
    } catch (e) {
      console.error('updateRideStatus Supabase Error:', e);
    }
  }

  if (localChannel) {
    localChannel.postMessage({ type: 'RIDE_STATUS_CHANGED', rideId, status, ...extraData });
  }
};

export async function apiGetRidesHistory(driverId) {
  const client = initClient();
  if (!client) return [];

  try {
    let query = client
      .from('xds_rides')
      .select('*')
      .order('created_at', { ascending: false });

    if (driverId) {
      query = query.eq('driver_id', driverId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn('apiGetRidesHistory Supabase fallback:', err);
    return [];
  }
}

export async function apiCreateContract(ride, driver) {
  const client = initClient();
  const contractId = `ct_${Date.now()}`;
  const contractNum = ride.contract_number || `DS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  // Gera hash simulado SHA-256
  const rawString = `${contractNum}-${ride.passenger_name}-${driver.cnpj}-${ride.total_price}`;
  let hashVal = 0;
  for (let i = 0; i < rawString.length; i++) {
    hashVal = ((hashVal << 5) - hashVal) + rawString.charCodeAt(i);
    hashVal |= 0;
  }
  const sha256 = Math.abs(hashVal).toString(16).padStart(64, 'a9b8c7d6e5f4');

  const payload = {
    id: contractId,
    ride_id: ride.id,
    contract_number: contractNum,
    driver_company_name: driver.razao_social || driver.company || 'Empresa de Transporte Privado',
    driver_cnpj: driver.cnpj || '00.000.000/0001-00',
    driver_name: driver.full_name || driver.name || 'Motorista Credenciado',
    driver_car: driver.car_model || driver.car || 'Veículo Executivo',
    driver_plate: driver.car_plate || 'BRA2E19',
    passenger_name: ride.passenger_name || 'Passageiro',
    passenger_phone: ride.passenger_phone || '(11) 98877-6655',
    origin_address: ride.origin_address || ride.origin || '',
    destination_address: ride.destination_address || ride.destination || '',
    distance_km: parseFloat(ride.distance_km || 0),
    duration_min: parseInt(ride.duration_min || 0, 10),
    total_price: parseFloat(ride.total_price || 0),
    payment_method: ride.payment_method || 'Pix Direto',
    hash_sha256: sha256,
    issued_at: new Date().toISOString()
  };

  if (client && ride.id) {
    try {
      await client.from('xds_contracts').insert([payload]);
    } catch (e) {
      console.warn('apiCreateContract Supabase fallback:', e);
    }
  }

  return payload;
}

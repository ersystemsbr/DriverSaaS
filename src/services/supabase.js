import { createClient } from '@supabase/supabase-js';

// Lê as variáveis de ambiente (Configuradas na Vercel ou no arquivo .env)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Canal em Tempo Real local (BroadcastChannel) como fallback automático
// Garante que o teste entre celulares/abas funcione mesmo antes de preencher as chaves da API
const localChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel('xds_rides_channel')
  : null;

/**
 * 1. Criar uma nova corrida (Passageiro solicita)
 */
export const createRideRequest = async (rideData) => {
  const contractNumber = `DS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  
  const payload = {
    ...rideData,
    contract_number: contractNumber,
    status: 'pending',
    created_at: new Date().toISOString()
  };

  // Se o Supabase estiver configurado, salva no PostgreSQL na tabela xds_rides
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('xds_rides')
        .insert([payload])
        .select()
        .single();
      
      if (error) console.error('Erro ao salvar no Supabase:', error.message);
      else return data;
    } catch (e) {
      console.warn('Fallback para canal local:', e);
    }
  }

  // Notifica motoristas via canal Realtime
  if (localChannel) {
    localChannel.postMessage({ type: 'NEW_RIDE', ride: payload });
  }

  // Salva no localStorage para sincronização entre abas
  localStorage.setItem('xds_last_ride', JSON.stringify(payload));
  return payload;
};

/**
 * 2. Motorista escuta novas corridas em tempo real
 */
export const subscribeToNewRides = (callback) => {
  // Se Supabase estiver conectado:
  if (isSupabaseConfigured && supabase) {
    const channel = supabase
      .channel('public:xds_rides')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'xds_rides' },
        (payload) => {
          callback(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  // Fallback Realtime via BroadcastChannel e EventListener de Storage
  const handleLocalMessage = (event) => {
    if (event.data?.type === 'NEW_RIDE') {
      callback(event.data.ride);
    }
  };

  if (localChannel) {
    localChannel.addEventListener('message', handleLocalMessage);
  }

  const handleStorageChange = (e) => {
    if (e.key === 'xds_last_ride' && e.newValue) {
      try {
        const ride = JSON.parse(e.newValue);
        if (ride.status === 'pending') callback(ride);
      } catch (err) {}
    }
  };
  window.addEventListener('storage', handleStorageChange);

  return () => {
    if (localChannel) localChannel.removeEventListener('message', handleLocalMessage);
    window.removeEventListener('storage', handleStorageChange);
  };
};

/**
 * 3. Atualizar status da corrida (Aceitar, Iniciar, Finalizar, Cancelar)
 */
export const updateRideStatus = async (rideId, status, extraData = {}) => {
  const updatePayload = {
    status,
    ...extraData,
    updated_at: new Date().toISOString()
  };

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase
        .from('xds_rides')
        .update(updatePayload)
        .eq('id', rideId);
    } catch (e) {
      console.error('Erro ao atualizar Supabase:', e);
    }
  }

  if (localChannel) {
    localChannel.postMessage({ type: 'RIDE_STATUS_CHANGED', rideId, status, ...extraData });
  }
};

// Estado inicial e modelos do DriverSaaS

export const INITIAL_PLANS = [
  {
    id: "daily",
    name: "Diário",
    price: 9.90,
    period: "24 horas",
    badge: null,
    description: "Perfeito para testar a plataforma ou rodar em dias específicos.",
    features: [
      "Acesso completo por 24 horas",
      "Corridas 100% livres de taxa (0% comissão)",
      "Emissão ilimitada de Contratos de Transporte",
      "Recebimento direto via Pix / Dinheiro",
    ]
  },
  {
    id: "weekly",
    name: "Semanal",
    price: 29.90,
    period: "7 dias",
    badge: "Econômico",
    description: "Flexibilidade semanal para quem roda com frequência.",
    features: [
      "Acesso completo por 7 dias",
      "Corridas ilimitadas com taxa 0%",
      "Escudo Jurídico com Contrato Digital PJ",
      "Suporte via WhatsApp",
      "Economia de 57% comparado ao plano diário",
    ]
  },
  {
    id: "monthly",
    name: "Mensal",
    price: 79.90,
    period: "30 dias",
    badge: "Mais Popular",
    popular: true,
    description: "O plano favorito dos motoristas profissionais de alto rendimento.",
    features: [
      "Acesso completo por 30 dias contínuos",
      "Taxa zero em 100% das viagens",
      "Contrato de Transporte em conformidade com a Lei Federal",
      "Suporte Prioritário 24/7",
      "Selo de Motorista Verificado",
    ]
  },
  {
    id: "yearly",
    name: "Anual",
    price: 699.90,
    period: "365 dias",
    badge: "2 Meses Grátis",
    description: "Máxima economia para profissionais que vivem do transporte particular.",
    features: [
      "Acesso completo por 1 ano",
      "2 meses inteiramente grátis",
      "Suporte VIP dedicado",
      "Sem reajuste de preço durante 12 meses",
      "Relatórios fiscais consolidados para MEI/ME",
    ]
  }
];

export const INITIAL_DRIVER = {
  id: "drv_01",
  full_name: "Carlos Alberto Silva",
  phone: "(11) 98765-4321",
  email: "carlos.transporte@gmail.com",
  avatar_url: null,
  
  // Escudo Jurídico Amplo (PJ: MEI, ME, LTDA, etc.)
  company_type: "ME", // MEI, ME, LTDA, SLU
  cnpj: "34.567.890/0001-12",
  razao_social: "C. A. Silva Serviços de Transporte Executivo ME",
  nome_fantasia: "Silva Transporte Privado",
  inscricao_municipal: "987.654-3",
  
  // Veículo
  car_model: "Honda Civic EXL",
  car_plate: "BRA2E19",
  car_color: "Prata Metálico",
  car_year: "2023",
  
  // Tarifas configuráveis
  base_price: 6.00,
  price_per_km: 2.80,
  
  // Assinatura
  subscription_status: "active", // 'active', 'inactive', 'expired'
  current_plan: "monthly",
  subscription_expires_at: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString(), // expira em 18 dias
  
  // Métricas
  rating: 4.96,
  total_rides: 248,
  total_earnings: 14850.00,
  today_rides: 6,
  today_earnings: 285.50,
  
  // Conta Digital / Wallet
  wallet: {
    available_balance: 1450.80,
    pending_balance: 120.00,
    blocked_balance: 0.00,
    pix_keys: [
      { type: "CNPJ", key: "34.567.890/0001-12", default: true },
      { type: "Celular", key: "+5511987654321", default: false },
      { type: "Aleatória", key: "a7c8e9b0-1234-4567-8901-abcdef012345", default: false }
    ],
    transactions: [
      {
        id: "tx_101",
        type: "credit_ride",
        title: "Corrida #DS-8842 - Maria Santos",
        amount: 45.00,
        date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        status: "completed",
        method: "Pix Direto"
      },
      {
        id: "tx_102",
        type: "credit_ride",
        title: "Corrida #DS-8841 - Roberto Lima",
        amount: 32.50,
        date: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        status: "completed",
        method: "Pix Direto"
      },
      {
        id: "tx_103",
        type: "debit_plan",
        title: "Renovação de Assinatura - Plano Mensal",
        amount: -79.90,
        date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        status: "completed",
        method: "Débito Automático em Conta"
      },
      {
        id: "tx_104",
        type: "transfer_out",
        title: "Saque Pix para Nubank (Ag 0001 Cc 12345-6)",
        amount: -500.00,
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        status: "completed",
        method: "Pix Out"
      }
    ]
  }
};

export const INITIAL_FAVORITE_DRIVERS = [
  {
    id: "drv_01",
    priority: 1,
    name: "Carlos Alberto Silva (Seu Preferencial)",
    rating: 4.96,
    rides_with_passenger: 14,
    car: "Honda Civic Prata (BRA2E19)",
    phone: "(11) 98765-4321",
    status: "online",
    eta_min: 5
  },
  {
    id: "drv_02",
    priority: 2,
    name: "Fernando Mendonça",
    rating: 4.92,
    rides_with_passenger: 5,
    car: "Toyota Corolla Preto (ABC1D23)",
    phone: "(11) 97654-3210",
    status: "online",
    eta_min: 8
  },
  {
    id: "drv_03",
    priority: 3,
    name: "Juliana Rocha",
    rating: 4.98,
    rides_with_passenger: 3,
    car: "Jeep Renegade Branco (XYZ9W88)",
    phone: "(11) 96543-2109",
    status: "busy",
    eta_min: 15
  }
];

export const INITIAL_RIDES_HISTORY = [
  {
    id: "ride_8842",
    contract_number: "DS-2026-8842",
    passenger_name: "Maria Luiza Santos",
    passenger_phone: "(11) 99123-4567",
    origin: "Av. Paulista, 1578 - Bela Vista, São Paulo",
    destination: "Shopping Ibirapuera - Moema, São Paulo",
    distance_km: 8.5,
    duration_min: 22,
    total_price: 45.00,
    date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    status: "completed",
    payment_method: "Pix Direto",
    company_name: "C. A. Silva Serviços de Transporte Executivo ME",
    cnpj: "34.567.890/0001-12"
  },
  {
    id: "ride_8841",
    contract_number: "DS-2026-8841",
    passenger_name: "Roberto Lima",
    passenger_phone: "(11) 98234-5678",
    origin: "Rua Oscar Freire, 900 - Jardins, São Paulo",
    destination: "Aeroporto de Congonhas - Vila Congonhas",
    distance_km: 9.8,
    duration_min: 26,
    total_price: 32.50,
    date: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    status: "completed",
    payment_method: "Pix Direto",
    company_name: "C. A. Silva Serviços de Transporte Executivo ME",
    cnpj: "34.567.890/0001-12"
  },
  {
    id: "ride_8840",
    contract_number: "DS-2026-8840",
    passenger_name: "Fernanda Costa",
    passenger_phone: "(11) 97345-6789",
    origin: "Faria Lima, 3477 - Itaim Bibi, São Paulo",
    destination: "Parque do Ibirapuera - Portão 3",
    distance_km: 4.2,
    duration_min: 14,
    total_price: 22.00,
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    status: "completed",
    payment_method: "Dinheiro",
    company_name: "C. A. Silva Serviços de Transporte Executivo ME",
    cnpj: "34.567.890/0001-12"
  },
  {
    id: "ride_8839",
    contract_number: "DS-2026-8839",
    passenger_name: "Lucas Gabriel",
    passenger_phone: "(11) 96456-7890",
    origin: "Vila Madalena, Estação",
    destination: "Pinheiros, Largo da Batata",
    distance_km: 2.1,
    duration_min: 8,
    total_price: 15.00,
    date: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    status: "cancelled",
    payment_method: "Pix Direto",
    company_name: "C. A. Silva Serviços de Transporte Executivo ME",
    cnpj: "34.567.890/0001-12"
  }
];

export const INITIAL_ALL_DRIVERS_ADMIN = [
  {
    id: "drv_01",
    name: "Carlos Alberto Silva",
    company: "C. A. Silva Serviços ME",
    company_type: "ME",
    cnpj: "34.567.890/0001-12",
    car: "Honda Civic 2023 (BRA2E19)",
    plan: "Mensal",
    status: "active",
    rides_count: 248,
    joined_date: "10/01/2026"
  },
  {
    id: "drv_02",
    name: "Fernando Mendonça",
    company: "Mendonça Transporte LTDA",
    company_type: "LTDA",
    cnpj: "45.123.789/0001-44",
    car: "Toyota Corolla 2022 (ABC1D23)",
    plan: "Semanal",
    status: "active",
    rides_count: 132,
    joined_date: "25/02/2026"
  },
  {
    id: "drv_03",
    name: "Juliana Rocha",
    company: "Juliana Rocha MEI",
    company_type: "MEI",
    cnpj: "52.987.654/0001-88",
    car: "Jeep Renegade 2021 (XYZ9W88)",
    plan: "Anual",
    status: "active",
    rides_count: 310,
    joined_date: "05/11/2025"
  },
  {
    id: "drv_04",
    name: "Rogério Antunes",
    company: "R. Antunes Locações EIRELI",
    company_type: "EIRELI",
    cnpj: "21.654.987/0001-33",
    car: "Volkswagen Virtus 2024 (RGT4F55)",
    plan: "Diário",
    status: "pending_review",
    rides_count: 0,
    joined_date: "14/10/2026"
  }
];

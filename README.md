# DriverSaaS - Plataforma de Transporte Privado

Plataforma completa e independente de gestão de transporte privado para motoristas profissionais com foco em **Taxa Zero por Corrida**, **Escudo Jurídico com CNPJ (MEI, ME, LTDA, SLU)**, **Conta Digital Integrada** e **Despacho em Cascata por Motorista Preferencial**.

---

## 🚀 Funcionalidades Principais

- **🚗 Modo Motorista:**
  - Status Online/Offline com rastreador GPS e radar simulado.
  - Alerta de novas chamadas com botão de Aceitar/Recusar.
  - Painel de ganhos em tempo real com 100% de taxa zero (sem comissão abusiva).
  - Resumo de corridas e avaliação do motorista.

- **📜 Escudo Jurídico PJ:**
  - Amparo pelas Leis Federais nº 12.587/2012 e 13.640/2018 e arts. 730 do Código Civil.
  - Emissão automática de Contrato Eletrônico de Transporte Individual por viagem.
  - Autenticação com hash SHA-256 e opção de impressão/PDF.

- **🏦 Conta Digital Integrada (BaaS):**
  - Saldos: Disponível, a liberar e rendimento 100% CDI.
  - Pix In (Recarga via QR Code e Pix Copia e Cola Bacen).
  - Pix Out (Saque instantâneo para qualquer banco).
  - Gestão de chaves Pix e extrato categorizado.

- **💳 Gestão de Planos & Assinaturas:**
  - Plano Diário (R$ 9,90 / 24h)
  - Plano Semanal (R$ 29,90 / 7 dias)
  - Plano Mensal (R$ 79,90 / 30 dias - Mais Popular)
  * Plano Anual (R$ 699,90 / 365 dias)
  - Checkout Pix instantâneo.

- **👤 Modo Passageiro:**
  - Cálculo automático de distância, duração e valor estimado.
  - Lista de Motoristas Favoritos / de Confiança com ordem de prioridade.
  - Despacho em cascata com temporizador inteligente.

- **⚙️ Painel Gerencial (Admin):**
  - Métrica de faturamento de assinaturas e motoristas credenciados.
  - Editor de valores dos planos em tempo real.
  - Gestão e aprovação de CNPJs e documentos.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend:** React 18, Vite, Tailwind CSS, Lucide React
- **Arquitetura:** PWA Ready & compatível com Capacitor para compilação nativa Android/iOS
- **Estilo:** Dark Mode de alta fidelidade

---

## 💻 Como Rodar Localmente

```bash
# Clone o repositório
git clone <url-do-repositorio>

# Acesse a pasta do projeto
cd driversaas

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

Abra no navegador em `http://localhost:3000`.

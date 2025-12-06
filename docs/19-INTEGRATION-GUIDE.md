# 19: Guia de Integração com APIs

**Versão:** 2.0
**Data:** 06 de Dezembro de 2025

---

## 1. Visão Geral

Este documento descreve como o front-end do **Carla Channels Dashboard** se integra com os serviços backend e APIs externas. O objetivo é fornecer diretrizes claras para que os dados fluam de forma eficiente e segura entre o cliente e o servidor, mantendo a experiência do usuário responsiva e confiável.

## 2. Arquitetura de Comunicação

O dashboard se comunica com três camadas principais de serviços:

1.  **Backend da Carla (FastAPI):** Fornece os dados de operação, gerencia transações e processa requisições de negócio.
2.  **Meta Graph API (WhatsApp):** Fornece dados sobre mensagens, contatos e status de conversas.
3.  **Serviços Externos:** Possíveis integrações com serviços de terceiros para notificações, analytics, etc.

## 3. Integração com o Backend (FastAPI)

### 3.1. Endpoints Esperados

O backend deve expor os seguintes endpoints (exemplos de rotas):

| Método | Rota | Propósito |
| :--- | :--- | :--- |
| `GET` | `/api/v1/dashboard/kpis` | Retorna os dados dos 4 KPIs do Dashboard. |
| `GET` | `/api/v1/dashboard/weekly-activity` | Retorna dados para o gráfico de atividade semanal. |
| `GET` | `/api/v1/dashboard/process-distribution` | Retorna dados para o gráfico de distribuição de processos. |
| `GET` | `/api/v1/conversations` | Lista todas as conversas com filtros e paginação. |
| `GET` | `/api/v1/conversations/{id}` | Retorna os detalhes de uma conversa específica, incluindo histórico de mensagens. |
| `POST` | `/api/v1/conversations/{id}/messages` | Envia uma nova mensagem em uma conversa. |
| `GET` | `/api/v1/transactions` | Lista todas as transações com filtros, ordenação e paginação. |
| `GET` | `/api/v1/processes` | Lista todos os processos de automação. |
| `POST` | `/api/v1/processes` | Cria um novo processo de automação. |
| `PUT` | `/api/v1/processes/{id}` | Atualiza um processo existente. |

### 3.2. Formato de Resposta

Todas as respostas devem seguir um formato consistente:

```json
{
  "status": "success",
  "data": {
    // Dados da resposta
  },
  "error": null,
  "timestamp": "2025-12-06T10:30:00Z"
}
```

Em caso de erro:

```json
{
  "status": "error",
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "O campo 'email' é obrigatório.",
    "details": [
      {
        "field": "email",
        "message": "Campo obrigatório"
      }
    ]
  },
  "timestamp": "2025-12-06T10:30:00Z"
}
```

### 3.3. Autenticação

-   **Método:** JWT (JSON Web Tokens).
-   **Armazenamento:** O token deve ser armazenado no `localStorage` (ou `sessionStorage` para maior segurança) após o login.
-   **Envio:** O token deve ser enviado em cada requisição no cabeçalho `Authorization: Bearer {token}`.
-   **Renovação:** O backend deve fornecer um endpoint para renovar o token antes de sua expiração.

### 3.4. Implementação com TanStack Query

Usando `TanStack Query (React Query)`, a integração com o backend é simplificada:

```typescript
// Exemplo de hook customizado para buscar KPIs
import { useQuery } from '@tanstack/react-query';

export const useKpis = () => {
  return useQuery({
    queryKey: ['kpis'],
    queryFn: async () => {
      const response = await fetch('/api/v1/dashboard/kpis', {
        headers: {
          'Authorization': `Bearer ${getToken()}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch KPIs');
      return response.json();
    },
    staleTime: 1000 * 60 * 5, // Cache por 5 minutos
  });
};
```

## 4. Integração com Meta Graph API (WhatsApp)

### 4.1. Fluxo de Dados

O backend da Carla é responsável por se comunicar com a Meta Graph API. O front-end não se comunica diretamente com a Meta API, mas recebe os dados processados através dos endpoints do backend.

### 4.2. Dados Esperados do WhatsApp

Através dos endpoints do backend, o front-end recebe:

-   **Mensagens:** Histórico de mensagens em uma conversa, incluindo timestamp, remetente e conteúdo.
-   **Contatos:** Informações do cliente (nome, número de telefone, avatar).
-   **Status de Conversa:** Indicadores de se a conversa está ativa, pendente, etc.

### 4.3. Segurança e Privacidade

-   **Nunca armazene tokens da Meta API no front-end.** Todos os tokens devem ser gerenciados pelo backend.
-   **Valide e sanitize todos os dados de entrada** antes de renderizá-los na UI para evitar injeção de código.

## 5. Tratamento de Erros e Estados de Carregamento

### 5.1. Estados Comuns

Cada requisição pode estar em um dos seguintes estados:

-   **Carregando (`loading`):** A requisição está em andamento.
-   **Sucesso (`success`):** A requisição foi concluída com sucesso.
-   **Erro (`error`):** A requisição falhou.

### 5.2. Feedback Visual

-   **Carregando:** Exibir um spinner ou skeleton loader no lugar do conteúdo.
-   **Erro:** Exibir uma mensagem de erro clara e um botão de "Tentar Novamente".
-   **Sucesso:** Exibir os dados normalmente. Opcionalmente, mostrar um toast de sucesso para ações críticas.

## 6. Atualização em Tempo Real (WebSockets)

Para funcionalidades que requerem atualizações em tempo real (como novas mensagens chegando), o front-end deve estabelecer uma conexão WebSocket com o backend:

```typescript
// Exemplo conceitual de conexão WebSocket
const ws = new WebSocket('wss://api.carla.local/ws/conversations/{conversationId}');

ws.onmessage = (event) => {
  const newMessage = JSON.parse(event.data);
  // Atualizar o estado local com a nova mensagem
  setMessages(prev => [...prev, newMessage]);
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
  // Implementar reconexão automática
};
```

---

Esta arquitetura de integração garante que o front-end seja desacoplado do backend, permitindo que ambos evoluam independentemente, enquanto mantém a comunicação eficiente e segura entre os dois.

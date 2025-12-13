# Integração com APIs

## Arquitetura

O dashboard se comunica com:

1. **Backend Carla (FastAPI):** Dados de operação e transações.
2. **Meta Graph API:** Dados via backend (mensagens, contatos, status).

## Endpoints Principais

| Método | Rota | Propósito |
| :--- | :--- | :--- |
| `GET` | `/api/v1/dashboard/kpis` | KPIs do Dashboard |
| `GET` | `/api/v1/dashboard/weekly-activity` | Gráfico de atividade |
| `GET` | `/api/v1/dashboard/process-distribution` | Distribuição de processos |
| `GET` | `/api/v1/conversations` | Lista conversas |
| `GET` | `/api/v1/conversations/{id}` | Detalhes + mensagens |
| `POST` | `/api/v1/conversations/{phone}/messages` | Enviar mensagem via WhatsApp |
| `WS` | `/api/v1/conversations/ws/{id}` | WebSocket tempo real |
| `GET` | `/api/v1/transactions` | Lista transações |
| `GET` | `/api/v1/processes` | Lista processos |
| `POST` | `/api/v1/processes` | Criar processo |

## Formato de Resposta

```json
{
  "status": "success",
  "data": { ... },
  "error": null,
  "timestamp": "2025-12-06T10:30:00Z"
}
```

## Autenticação

- **Método:** JWT Bearer Token
- **Armazenamento:** localStorage
- **Header:** `Authorization: Bearer {token}`

## Implementação com TanStack Query

```typescript
import { useQuery } from '@tanstack/react-query';

export const useKpis = () => {
  return useQuery({
    queryKey: ['kpis'],
    queryFn: async () => {
      const response = await fetch('/api/v1/dashboard/kpis', {
        headers: { 'Authorization': `Bearer ${getToken()}` },
      });
      if (!response.ok) throw new Error('Failed to fetch KPIs');
      return response.json();
    },
    staleTime: 1000 * 60 * 5,
  });
};
```

## Estados de Requisição

| Estado | Feedback Visual |
| :--- | :--- |
| Loading | Skeleton loader |
| Error | Mensagem + botão "Tentar Novamente" |
| Success | Dados renderizados |

## WebSocket (Tempo Real)

```typescript
const ws = new WebSocket('wss://api.carla.money/ws/conversations/{id}');
ws.onmessage = (event) => {
  const newMessage = JSON.parse(event.data);
  setMessages(prev => [...prev, newMessage]);
};
```

## Envio de Mensagens via WhatsApp

O endpoint de envio de mensagens integra com a WhatsApp Cloud API (Meta Graph API v18.0).

### Endpoint

```
POST /api/v1/conversations/{phone}/messages
```

### Parâmetros

| Parâmetro | Tipo | Descrição |
| :--- | :--- | :--- |
| `phone` | string (path) | Número de telefone no formato E.164 (ex: `+50212345678`) |
| `text` | string (body) | Texto da mensagem (1-4096 caracteres) |

### Request

```typescript
const response = await fetch('/api/v1/conversations/+50212345678/messages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({ text: 'Olá, como posso ajudar?' })
});
```

### Response

```json
{
  "status": "success",
  "data": {
    "id": "msg_abc123",
    "from": "agent",
    "body": "Olá, como posso ajudar?",
    "at": "2025-12-13T10:30:00Z",
    "direction": "outbound",
    "wamid": "wamid.HBgNNTAy...",
    "status": "sent"
  }
}
```

### Status da Mensagem

| Status | Descrição |
| :--- | :--- |
| `pending` | Mensagem em fila para envio |
| `sent` | Mensagem enviada ao WhatsApp |
| `delivered` | Mensagem entregue ao dispositivo |
| `read` | Mensagem lida pelo destinatário |
| `failed` | Erro no envio |

### Erros

| Código | Descrição |
| :--- | :--- |
| 400 | Número de telefone inválido ou mensagem muito longa |
| 429 | Rate limit excedido |
| 500 | Erro interno do servidor |
| 502 | Erro na comunicação com WhatsApp Cloud API |

### Hook React

```typescript
import { useSendMessage } from '@/hooks/use-carla-data';

const MyComponent = ({ phone, conversationId }) => {
  const sendMessage = useSendMessage(phone, conversationId);
  
  const handleSend = async (text: string) => {
    try {
      const result = await sendMessage.mutateAsync({ text });
      console.log('wamid:', result.wamid);
      console.log('status:', result.status);
    } catch (error) {
      console.error('Erro ao enviar:', error.message);
    }
  };
  
  return (/* ... */);
};
```





















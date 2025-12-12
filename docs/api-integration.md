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
| `POST` | `/api/v1/conversations/{id}/messages` | Enviar mensagem |
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


















# Biblioteca de Componentes

A biblioteca de componentes é o coração da implementação do Design System "Aura". Nossa abordagem prioriza **customização, propriedade do código e integração perfeita** com o stack tecnológico.

## Ferramenta: shadcn/ui

`shadcn/ui` não é uma biblioteca de componentes tradicional. É uma **coleção de componentes reutilizáveis que você copia para seu projeto**.

| Vantagem | Descrição |
| :--- | :--- |
| **Propriedade Total do Código** | 100% de controle sobre código, estilo e comportamento. |
| **Customização Ilimitada** | Tailwind CSS diretamente no JSX sem lutar contra classes de terceiros. |
| **Primitivas Sólidas** | Construído sobre Radix UI para acessibilidade e comportamento. |
| **Manutenção Simplificada** | Sem breaking changes de bibliotecas externas. |

## Estrutura de Diretórios

```
/src
├── /components
│   ├── /ui           # Componentes base do shadcn/ui
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── ...
│   ├── /layout       # Componentes de layout (sidebar, header)
│   └── /data         # Componentes de domínio (kpi-card, data-table)
```

## Fluxo de Trabalho

1. **Necessidade:** Identificar componente necessário (ex: `DatePicker`).
2. **Instalação:** `pnpm dlx shadcn-ui@latest add date-picker`
3. **Customização:** Ajustar classes Tailwind para seguir nossa paleta.
4. **Uso:** Importar de `/components/ui/date-picker`.













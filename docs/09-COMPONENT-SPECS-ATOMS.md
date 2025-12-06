# 09: Especificações de Componentes - Átomos

**Versão:** 2.0
**Data:** 06 de Dezembro de 2025

---

## 1. Visão Geral

Os átomos são os blocos de construção fundamentais da nossa interface. Eles são os elementos mais básicos e não podem ser divididos em partes menores. A consistência no design e comportamento desses átomos é crucial, pois eles serão usados em toda a aplicação. Esta especificação detalha o design para cada átomo, alinhado com a estética de `carla.money` e para ser implementado via `shadcn/ui` e `Tailwind CSS`.

---

## 2. Botão (`Button`)

O componente `Button` é usado para acionar ações. Deve ter variantes claras para diferentes níveis de importância.

### Variantes e Estilos

| Variante | Estilo (Classes Tailwind) | Uso |
| :--- | :--- | :--- |
| **Primário** | `bg-neutral-900 text-neutral-100 hover:bg-neutral-700` | Ação principal em uma página ou modal (ex: "Exportar Relatório", "Salvar"). |
| **Secundário** | `bg-transparent border border-neutral-300 text-neutral-900 hover:bg-neutral-200` | Ação secundária (ex: "Cancelar", "Ver Detalhes"). |
| **Fantasma (Ghost)** | `bg-transparent text-neutral-900 hover:bg-neutral-200` | Ação de baixa proeminência, frequentemente usada em conjunto com ícones. |
| **Destrutivo** | `bg-feedback-error text-neutral-100 hover:bg-red-700` | Ações que causam perda de dados ou são irreversíveis (ex: "Deletar Usuário"). |

### Estados

| Estado | Estilo (Classes Tailwind) | Descrição |
| :--- | :--- | :--- |
| **Padrão** | (Conforme tabela acima) | O estado normal do botão. |
| **Hover** | (Conforme tabela acima) | O estado quando o cursor está sobre o botão. Deve ter uma transição suave (`transition-colors duration-150`). |
| **Foco (Focus-Visible)** | `ring-2 ring-primary ring-offset-2` | Indica que o botão está focado via teclado. Usa a cor primária para o anel. |
| **Desabilitado** | `opacity-50 cursor-not-allowed` | Indica que a ação não está disponível. O botão não deve ter efeito de hover. |

### Tamanhos

-   **Padrão:** `h-10 px-4 py-2` (Altura de 40px)
-   **Pequeno:** `h-9 px-3` (Altura de 36px)
-   **Ícone:** `h-10 w-10` (Botão quadrado para um único ícone)

---

## 3. Input de Texto (`Input`)

Usado para coletar dados do usuário em formulários.

### Estilos e Estados

| Estado | Estilo (Classes Tailwind) | Descrição |
| :--- | :--- | :--- |
| **Padrão** | `bg-transparent border border-neutral-300 rounded-md h-10 px-3 text-base` | Aparência padrão do campo de input. |
| **Foco** | `border-primary ring-2 ring-primary/20` | Quando o usuário clica ou navega para o input. A borda e um anel suave mudam para a cor primária. |
| **Desabilitado** | `bg-neutral-200 opacity-70 cursor-not-allowed` | O campo não pode ser editado. |
| **Erro** | `border-feedback-error ring-2 ring-feedback-error/20` | Indica um erro de validação. A borda e o anel mudam para a cor de erro. |

**Placeholder:** O texto do placeholder deve usar a cor `text-neutral-700`.

---

## 4. Badge / Tag

Usado para exibir status, categorias ou tags curtas.

### Estilos e Variantes

| Variante | Estilo (Classes Tailwind) | Uso |
| :--- | :--- | :--- |
| **Padrão (Azul)** | `bg-primary/10 text-primary border border-primary/20` | Para status informativos ou tags principais (ex: "Em Andamento"). |
| **Sucesso (Verde)** | `bg-feedback-success/10 text-green-700 border border-feedback-success/20` | Para status positivos (ex: "Completo", "Aprovado"). |
| **Alerta (Amarelo)** | `bg-feedback-warning/10 text-yellow-700 border border-feedback-warning/20` | Para status que requerem atenção (ex: "Pendente"). |
| **Erro (Vermelho)** | `bg-feedback-error/10 text-feedback-error border border-feedback-error/20` | Para status negativos (ex: "Rejeitado". Usar com moderação). |
| **Neutro (Cinza)** | `bg-neutral-200 text-neutral-700 border border-neutral-300` | Para tags genéricas sem carga semântica. |

**Estilo Base:** Todos os badges devem ter `px-2.5 py-0.5 text-xs font-semibold rounded-full`.

---

## 5. Avatar

Usado para representar usuários ou entidades.

### Estilos e Variantes

-   **Estrutura:** Consiste em uma imagem e um fallback (iniciais do nome).
-   **Formato:** Sempre circular (`rounded-full`).
-   **Imagem:** A imagem do usuário deve preencher o container (`object-cover`).

### Fallback (Iniciais)
-   **Implementação:** Se a imagem não estiver disponível, um fallback com as iniciais do usuário deve ser exibido.
-   **Estilo do Fallback:**
    -   Fundo: `bg-neutral-200`
    -   Texto: `text-neutral-700 font-semibold`

### Tamanhos

| Tamanho | Pixels | Tailwind Class | Uso Principal |
| :--- | :--- | :--- | :--- |
| **Pequeno (sm)** | 32x32px | `h-8 w-8` | Em listas, comentários ou tabelas. |
| **Padrão (md)** | 40x40px | `h-10 w-10` | No cabeçalho do usuário, perfil de chat. |
| **Grande (lg)** | 64x64px | `h-16 w-16` | Em páginas de perfil ou áreas de destaque. |

---

Estes átomos formam a base visual e interativa da nossa aplicação. A implementação consistente destes estilos é o primeiro passo para construir uma interface coesa e alinhada à marca.

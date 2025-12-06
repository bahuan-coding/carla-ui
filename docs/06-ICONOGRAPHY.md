# 06: Iconografia

**Versão:** 2.0
**Data:** 06 de Dezembro de 2025

---

## 1. Visão Geral

A iconografia no Design System "Aura" desempenha um papel crucial na comunicação visual rápida e na melhoria da usabilidade. Os ícones servem como auxílios visuais que transcendem a linguagem, ajudando os usuários a navegar, localizar funcionalidades e compreender informações de forma intuitiva. Nossa abordagem à iconografia é baseada na clareza, simplicidade e consistência com a estética moderna da marca Carla.

## 2. Estilo dos Ícones

O estilo visual dos nossos ícones é **Line Art (Contorno)**. Esta escolha se alinha com a estética minimalista e profissional de `carla.money`.

-   **Estilo:** Apenas contornos, sem preenchimento.
-   **Espessura do Traço (Stroke):** Consistente em toda a biblioteca. A espessura padrão deve ser de **1.5px** para garantir clareza sem parecer pesado.
-   **Cantos:** Levemente arredondados para uma aparência suave e moderna.
-   **Nível de Detalhe:** Minimalista. Os ícones devem ser facilmente reconhecíveis em tamanhos pequenos, evitando detalhes excessivos que possam poluir a interface.

## 3. Biblioteca de Ícones

-   **Biblioteca Recomendada:** **Lucide Icons** ([https://lucide.dev/](https://lucide.dev/))

**Justificativa:**
**Lucide Icons** é a escolha ideal para o nosso projeto pelos seguintes motivos:
1.  **Consistência Estética:** O estilo limpo e moderno da Lucide se alinha perfeitamente com a estética de `carla.money` e a fonte Poppins.
2.  **Extensa Biblioteca:** Oferece uma vasta gama de ícones que cobrem praticamente todas as nossas necessidades para um dashboard financeiro e de CRM (gráficos, usuários, transações, configurações, etc.).
3.  **Altamente Configurável:** Permite ajustar facilmente o tamanho, a cor e a espessura do traço, o que é essencial para manter a consistência do nosso Design System.
4.  **Integração com o Ecossistema:** É a biblioteca de ícones padrão usada e recomendada pelo `shadcn/ui`, o que garante uma integração perfeita e sem atritos com nossa biblioteca de componentes.
5.  **Tree-Shakable:** O pacote `lucide-react` é otimizado para que apenas os ícones que você realmente usa sejam incluídos no bundle final, contribuindo para a performance da aplicação.

## 4. Tamanho e Espaçamento

Para manter a consistência visual, os ícones devem aderir a uma escala de tamanhos baseada em nossa unidade de 4px.

| Tamanho | Pixels | Tailwind Class | Uso Principal |
| :--- | :--- | :--- | :--- |
| **Pequeno (sm)** | 16px | `h-4 w-4` | Ícones dentro de botões pequenos, itens de menu dropdown, ou ao lado de texto `caption`. |
| **Padrão (md)** | 20px | `h-5 w-5` | O tamanho mais comum. Usado ao lado de texto `label` ou `body`, em inputs e na navegação principal. |
| **Médio (lg)** | 24px | `h-6 w-6` | Ícones em títulos de cards ou em áreas onde um destaque maior é necessário. |
| **Grande (xl)** | 32px | `h-8 w-8` | Ícones de destaque em seções de onboarding, placeholders de estado vazio ou ilustrações simples. |

**Espaçamento:** Quando um ícone é usado ao lado de um texto, deve haver um espaçamento de **8px (`gap-2`)** entre eles para garantir uma boa respiração.

## 5. Cor

A cor dos ícones deve seguir a paleta de cores do sistema para comunicar estado e função.

-   **Padrão:** Os ícones devem usar a cor **Cinza Texto Sec. (`#6C757D`)** para uma aparência sutil que não sobrecarrega a UI.
-   **Hover / Foco:** Ao passar o mouse ou focar em um elemento interativo que contém um ícone (como um item de menu), o ícone deve mudar para **Preto (`#000000`)**.
-   **Ativo / Selecionado:** Quando um item de navegação está ativo, seu ícone deve mudar para **Azul Elétrico (`#0052FF`)** para indicar a seleção atual.
-   **Em Cores Semânticas:** Ícones podem assumir cores de feedback (sucesso, alerta, erro) quando usados para reforçar uma mensagem de status. Ex: um ícone de `check-circle` verde.

## 6. Implementação

1.  **Instalação:**
    ```bash
    pnpm install lucide-react
    ```

2.  **Uso em Componentes React:**

    ```jsx
    import { Home, Users, BarChart2 } from 'lucide-react';

    // Ícone de navegação padrão
    const NavItem = () => (
      <a href="/dashboard" className="flex items-center gap-2 text-neutral-700 hover:text-neutral-900">
        <Home className="h-5 w-5" />
        <span>Dashboard</span>
      </a>
    );

    // Ícone de navegação ativo
    const ActiveNavItem = () => (
      <a href="/dashboard" className="flex items-center gap-2 text-primary">
        <Home className="h-5 w-5" strokeWidth={2} /> {/* strokeWidth pode ser ajustado */}
        <span className="font-semibold">Dashboard</span>
      </a>
    );
    ```

---

A utilização correta e consistente da iconografia é essencial para criar uma interface intuitiva e visualmente polida. Evite usar múltiplos estilos ou bibliotecas de ícones para não fragmentar a experiência do usuário.

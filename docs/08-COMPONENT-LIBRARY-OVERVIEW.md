# 08: Visão Geral da Biblioteca de Componentes

**Versão:** 2.0
**Data:** 06 de Dezembro de 2025

---

## 1. Introdução

A biblioteca de componentes é o coração da implementação do nosso Design System "Aura". É a coleção de blocos de construção reutilizáveis em React que usaremos para construir a interface do **Carla Channels Dashboard**. Nossa abordagem para a biblioteca de componentes prioriza a **customização, a propriedade do código e a integração perfeita com nosso stack tecnológico**.

## 2. Ferramenta Escolhida: shadcn/ui

Para alcançar o nível de fidelidade estética exigido pela marca Carla, não podemos depender de bibliotecas de componentes tradicionais que vêm com estilos opinativos e difíceis de sobrescrever. Por isso, a escolha estratégica é **shadcn/ui**.

**O que é shadcn/ui?**
`shadcn/ui` não é uma biblioteca de componentes no sentido tradicional. É uma **coleção de componentes reutilizáveis que você pode copiar e colar em seu projeto**. 

**Por que esta abordagem é perfeita para nós?**

| Vantagem | Descrição Detalhada |
| :--- | :--- |
| **Propriedade Total do Código** | Ao usar o CLI do `shadcn/ui`, o código-fonte do componente (ex: `Button.tsx`) é adicionado diretamente à nossa base de código, dentro de uma pasta `components/ui`. Isso significa que temos **100% de controle sobre o código, o estilo e o comportamento** de cada componente. Podemos modificá-los como quisermos para que correspondam perfeitamente à estética de `carla.money`. |
| **Customização Ilimitada** | Como somos donos do código, não estamos lutando contra as classes CSS de um pacote de terceiros. Podemos usar as classes do **Tailwind CSS** diretamente no JSX do componente para aplicar nossos tokens de design (cores, fontes, espaçamentos) com precisão pixelar. |
| **Construído sobre Primitivas Sólidas** | Os componentes do `shadcn/ui` são construídos sobre as primitivas de UI headless da **Radix UI**. Isso nos dá uma base sólida de **acessibilidade (a11y) e comportamento** (gerenciamento de estado de dropdowns, modais, etc.) sem nenhum estilo visual. Nós fornecemos o estilo. |
| **Manutenção Simplificada** | Não precisamos nos preocupar com *breaking changes* em uma biblioteca de UI de terceiros. O código é nosso. As atualizações podem ser feitas de forma seletiva, componente por componente, se desejarmos. |

## 3. Estrutura de Diretórios

Nossos componentes serão organizados de forma lógica dentro da pasta `/src` do nosso projeto Vite + React.

```
/src
|-- /components
|   |-- /ui
|   |   |-- button.tsx       (Componentes base do shadcn/ui)
|   |   |-- card.tsx
|   |   |-- input.tsx
|   |   |-- ...
|   |
|   |-- /icons
|   |   |-- index.ts         (Exportações dos ícones da Lucide)
|   |
|   |-- /layout
|   |   |-- sidebar.tsx      (Componentes de layout da aplicação)
|   |   |-- header.tsx
|   |
|   |-- /data
|   |   |-- kpi-card.tsx     (Componentes de domínio específico - Moléculas/Organismos)
|   |   |-- data-table.tsx
|   |   |-- bar-chart.tsx

```

-   **/components/ui:** Destinado aos componentes base, agnósticos de domínio, instalados via `shadcn/ui`.
-   **/components/icons:** Para centralizar a exportação dos ícones da `lucide-react` que usamos no projeto.
-   **/components/layout:** Para os componentes estruturais da nossa aplicação, como o menu lateral e o cabeçalho.
-   **/components/data:** Para os componentes mais complexos e específicos do nosso domínio de negócio (ex: um card de KPI que já sabe como formatar um valor monetário).

## 4. Fluxo de Trabalho

1.  **Necessidade de um Componente:** Identificamos a necessidade de um novo componente, por exemplo, um `DatePicker`.
2.  **Instalação via CLI:** Executamos o comando `pnpm dlx shadcn-ui@latest add date-picker`.
3.  **Customização:** O código do `DatePicker` e suas dependências (como o `Calendar`) são adicionados à pasta `/components/ui`. Nós então abrimos esses arquivos e ajustamos as classes do Tailwind para que o componente siga perfeitamente a nossa paleta de cores, tipografia e espaçamento.
4.  **Uso:** Importamos o componente customizado de `/components/ui/date-picker` e o utilizamos em nossas telas.

---

Esta abordagem nos dá o melhor de dois mundos: a velocidade de ter componentes pré-construídos e a flexibilidade de customização total necessária para construir uma interface que atenda aos nossos rigorosos padrões estéticos. Os documentos seguintes detalharão as especificações de estilo para cada um desses componentes.

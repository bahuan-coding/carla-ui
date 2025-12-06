# 17: Stack de Tecnologia de Front-End

**Versão:** 2.0
**Data:** 06 de Dezembro de 2025

---

## 1. Visão Geral

Este documento detalha o stack de tecnologia escolhido para o desenvolvimento do front-end do **Carla Channels Dashboard**. As escolhas foram feitas com base em critérios de performance, escalabilidade, manutenibilidade e, crucialmente, a capacidade de construir uma interface de usuário altamente customizada que atenda aos rigorosos padrões estéticos da marca Carla. Todo o stack é baseado em tecnologias modernas, de código aberto e com comunidades ativas.

## 2. Stack Principal

| Categoria | Tecnologia | Versão Mínima | Justificativa |
| :--- | :--- | :--- | :--- |
| **Framework de UI** | **React** | `18.2+` | A escolha padrão da indústria para construir interfaces de usuário complexas e reativas. Seu ecossistema maduro e vasta comunidade garantem suporte e longevidade ao projeto. |
| **Build Tool** | **Vite** | `5.0+` | Oferece uma experiência de desenvolvimento extremamente rápida (Hot Module Replacement instantâneo) e um processo de build otimizado, superando ferramentas mais antigas como o Webpack em velocidade e simplicidade de configuração. |
| **Linguagem** | **TypeScript** | `5.2+` | Adiciona tipagem estática ao JavaScript, o que é fundamental para a robustez e a segurança de uma aplicação financeira. Reduz bugs, melhora a autocompletação e facilita a manutenção de uma grande base de código. |
| **Estilização** | **Tailwind CSS** | `3.4+` | Uma abordagem "utility-first" que nos dá controle total sobre o estilo, permitindo replicar a estética de `carla.money` com precisão pixelar sem lutar contra estilos opinativos de outras bibliotecas. |

## 3. Componentes e UI

| Categoria | Tecnologia | Justificativa |
| :--- | :--- | :--- |
| **Biblioteca de Componentes** | **shadcn/ui** | Permite a criação de uma biblioteca de componentes totalmente customizada. Copiamos o código dos componentes para nosso projeto, garantindo 100% de controle sobre o estilo e comportamento, o que é essencial para a fidelidade à marca. |
| **Primitivas de UI** | **Radix UI** | É a base sobre a qual os componentes `shadcn/ui` são construídos. Fornece a lógica de comportamento e acessibilidade para componentes complexos (dropdowns, modais, etc.) de forma "headless" (sem estilo). |
| **Iconografia** | **Lucide Icons** | Uma biblioteca de ícones SVG leve, consistente e altamente configurável, que se integra perfeitamente com o `shadcn/ui` e se alinha com nossa estética de "line art". |

## 4. Gerenciamento de Estado e Dados

| Categoria | Tecnologia | Justificativa |
| :--- | :--- | :--- |
| **Estado do Servidor** | **TanStack Query (React Query)** | `v5` | A melhor solução para gerenciar o ciclo de vida de dados do servidor (fetching, caching, sincronização, atualização). Simplifica o tratamento de estados de carregamento, erro e sucesso, e melhora a performance com caching inteligente. |
| **Estado Global do Cliente** | **Zustand** | `4.5+` | Uma solução de gerenciamento de estado global minimalista e poderosa. É muito mais simples que o Redux, mas oferece a reatividade necessária para estados que precisam ser compartilhados globalmente na UI (ex: estado do menu lateral, perfil do usuário). |
| **Gerenciamento de Formulários** | **React Hook Form** | `7.0+` | Otimiza a performance de formulários complexos, minimizando re-renderizações. Integra-se facilmente com bibliotecas de validação como Zod. |

## 5. Ferramentas de Desenvolvimento e Qualidade de Código

| Categoria | Tecnologia | Justificativa |
| :--- | :--- | :--- |
| **Gerenciador de Pacotes** | **pnpm** | Mais rápido e eficiente no uso de espaço em disco que o npm ou yarn, graças à sua estratégia de armazenamento de pacotes em um content-addressable store. |
| **Linter** | **ESLint** | Garante a consistência do estilo de código e ajuda a capturar erros comuns durante o desenvolvimento. |
| **Formatador de Código** | **Prettier** | Formata o código automaticamente ao salvar, garantindo um estilo visual uniforme em toda a base de código e eliminando debates sobre formatação. |
| **Validação de Schema** | **Zod** | Permite a criação de schemas para validar dados, desde respostas de API até inputs de formulário, com inferência de tipos em TypeScript, garantindo que os dados que fluem pela aplicação estão corretos. |

## 6. Setup Inicial do Projeto (Comando)

O projeto pode ser iniciado com o seguinte comando usando Vite:

```bash
# Usando pnpm
pnpm create vite carla-dashboard --template react-ts

# Navegar para o diretório
cd carla-dashboard

# Instalar dependências
pnpm install

# Adicionar Tailwind CSS (seguindo o guia oficial do Vite)
# ... 

# Inicializar shadcn/ui
pnpm dlx shadcn-ui@latest init
```

---

Este stack tecnológico representa uma base moderna, robusta e flexível, perfeitamente adequada para construir o **Carla Channels Dashboard** com os mais altos padrões de qualidade e fidelidade à marca.

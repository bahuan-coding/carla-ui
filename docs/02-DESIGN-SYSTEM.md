# 02: Design System "Aura"

**Versão:** 2.0
**Data:** 06 de Dezembro de 2025

---

## 1. Introdução

O Design System **"Aura"** é o ecossistema de design e desenvolvimento para o **Carla Channels Dashboard**. Ele existe para garantir consistência, acelerar o desenvolvimento e criar uma interface de usuário coesa, intuitiva e perfeitamente alinhada com a identidade da marca Carla.

Aura não é apenas uma coleção de componentes, mas um conjunto de princípios, diretrizes e ferramentas que governam a estética e a funcionalidade da nossa interface. O nome "Aura" foi escolhido para representar a atmosfera de **confiança, clareza e modernidade** que nosso produto deve irradiar.

## 2. Filosofia e Princípios

Nossa filosofia de design é centrada no **minimalismo funcional**. Acreditamos que um bom design é invisível, permitindo que o usuário se concentre em suas tarefas sem distrações. Cada elemento na tela deve ter um propósito claro e justificado.

| Princípio | Descrição Detalhada |
| :--- | :--- |
| **Clareza Radical** | A interface deve ser autoexplicativa. A complexidade inerente aos dados financeiros e processos de CRM será abstraída através de layouts limpos, hierarquia visual forte e comunicação direta. O usuário nunca deve se sentir perdido ou incerto sobre o próximo passo. |
| **Consistência Coesiva** | Um usuário deve ser capaz de prever como um elemento da interface se comportará, independentemente de onde ele apareça. A consistência em cores, tipografia, espaçamento e comportamento dos componentes é fundamental para criar uma experiência de aprendizado rápida e reduzir a carga cognitiva. |
| **Eficiência Orientada ao Fluxo** | O design deve ser um catalisador para a produtividade. Os fluxos de trabalho devem ser otimizados para o menor número de cliques e a menor quantidade de esforço mental. A informação certa deve ser apresentada no momento certo, de forma proativa. |
| **Estética da Confiança** | A aparência da interface deve inspirar confiança e profissionalismo. Isso é alcançado através de uma estética limpa, organizada e de alta qualidade, que reflete a seriedade com que tratamos os dados de nossos clientes. O design é a primeira camada de segurança que o usuário percebe. |
| **Escalabilidade Modular** | O sistema é construído com base em componentes modulares e reutilizáveis. Isso permite que a plataforma cresça e evolua de forma sustentável, garantindo que novas funcionalidades possam ser adicionadas sem comprometer a integridade do design ou a consistência da experiência. |

## 3. Estrutura do Sistema

O Design System Aura é estruturado usando a metodologia de **Design Atômico**, que nos permite compor interfaces complexas a partir de blocos de construção simples e reutilizáveis.

1.  **Tokens de Design (A base):**
    *   São os valores primitivos e agnósticos da nossa identidade visual. Incluem cores, fontes, tamanhos de tipografia, espaçamentos, sombras e raios de borda.
    *   Eles são a fonte única da verdade para todos os estilos e serão gerenciados centralmente no arquivo `tailwind.config.js`.

2.  **Átomos:**
    *   Os blocos de construção mais básicos da nossa interface. Não podem ser quebrados em partes menores.
    *   Exemplos: Botões, Inputs, Labels, Ícones, Avatares.

3.  **Moléculas:**
    *   Grupos de átomos unidos para formar unidades funcionais simples.
    *   Exemplos: Um campo de formulário (Label + Input + Mensagem de Erro), um card de KPI (Ícone + Título + Valor), um item de menu.

4.  **Organismos:**
    *   Combinações de moléculas e/ou átomos para formar seções distintas e mais complexas de uma interface.
    *   Exemplos: O cabeçalho da aplicação, uma tabela de dados completa (com busca, filtros e paginação), o painel de perfil do cliente.

5.  **Templates:**
    *   Estruturas de página que organizam os organismos em um layout coeso, definindo a arquitetura de informação de uma tela.

## 4. Ferramentas e Implementação

-   **Repositório de Design:** Figma (para prototipagem e como referência visual).
-   **Implementação em Código:**
    -   **Tailwind CSS:** Para aplicar os tokens de design através de classes utilitárias.
    -   **shadcn/ui:** Para a biblioteca de componentes, permitindo customização total e propriedade do código.
    -   **React:** Como a biblioteca de UI para construir a interface.
    -   **Storybook (Recomendado):** Para desenvolver, documentar e visualizar os componentes de forma isolada, criando um catálogo interativo do nosso Design System.

---

Este documento estabelece as bases conceituais do Design System Aura. Os documentos subsequentes detalharão cada um dos seus elementos, desde os tokens de design até os componentes complexos.

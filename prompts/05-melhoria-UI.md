# Redesign visual do Climora — UI/UX

## Objetivo

Minha tarefa nesta etapa é **exclusivamente melhorar a interface visual do projeto**.

O projeto é um dashboard de clima chamado **Climora**. Quero transformar a interface atual em algo mais moderno, profissional, agradável e apresentável, com uma hierarquia visual clara e uma experiência tranquila para visualizar informações meteorológicas.

O resultado deve parecer um **produto real desenvolvido por um bom designer de produto**, e não uma interface genérica gerada por IA.

---

## REGRA ABSOLUTA: NÃO ALTERAR FUNCIONALIDADE

Esta é a regra mais importante desta tarefa.

**NÃO altere nenhuma funcionalidade existente do sistema.**

A tarefa é exclusivamente visual.

Não faça:

* alteração de lógica de negócio;
* alteração de chamadas à API;
* alteração de endpoints;
* alteração de parâmetros ou payloads;
* alteração de hooks;
* alteração de estados;
* alteração de gerenciamento de estado;
* alteração de funções;
* alteração de regras de negócio;
* alteração de comportamento dos componentes;
* alteração de navegação;
* alteração de rotas;
* alteração de funcionalidades de busca;
* alteração de tratamento de erros;
* alteração de loading;
* alteração de tratamento dos dados;
* alteração dos contratos existentes;
* remoção de funcionalidades;
* criação de novas funcionalidades;
* alteração da estrutura dos dados;
* alteração de integrações existentes.

Se uma alteração visual exigir modificar lógica, **não faça essa alteração**.

Preserve integralmente o comportamento atual da aplicação.

---

# O que você DEVE fazer

Seu foco deve ser exclusivamente em:

* UI;
* UX visual;
* layout;
* espaçamento;
* tipografia;
* cores;
* hierarquia visual;
* composição dos elementos;
* responsividade visual;
* bordas;
* sombras;
* backgrounds;
* estados visuais;
* ícones;
* cards;
* organização das informações;
* densidade visual;
* consistência visual;
* configuração do Tailwind CSS;
* design tokens e variáveis visuais;
* classes utilitárias;
* aparência dos componentes existentes.

Você pode refatorar a estrutura JSX **somente quando isso for necessário para melhorar a apresentação visual**, desde que:

1. nenhuma funcionalidade seja alterada;
2. nenhuma lógica seja alterada;
3. nenhum comportamento seja alterado;
4. os mesmos dados continuem sendo exibidos;
5. os mesmos eventos continuem funcionando;
6. as mesmas props e estados continuem sendo respeitados.

---

# Direção de design

Quero uma interface com aparência de **dashboard meteorológico moderno e profissional**, mas sem cair nos padrões visuais genéricos de interfaces feitas por IA.

A prioridade é:

**clareza > estética > efeitos visuais.**

O usuário deve conseguir olhar para a tela e entender rapidamente:

1. onde está;
2. qual é a condição climática atual;
3. qual é a temperatura;
4. quais são as principais informações meteorológicas;
5. como o clima vai evoluir ao longo do período apresentado.

A interface deve ter uma **hierarquia de informação muito bem definida**.

---

# Evite completamente a estética "AI generated"

Não quero uma interface com aparência de template genérico de IA.

Evite especialmente:

* excesso de gradientes;
* gradientes roxo/azul típicos de SaaS;
* glassmorphism exagerado;
* excesso de blur;
* cards flutuando sem necessidade;
* bordas brilhantes;
* sombras exageradas;
* elementos neon;
* excesso de elementos decorativos;
* blobs;
* backgrounds abstratos;
* excesso de rounded corners;
* tudo dentro de cards;
* excesso de ícones;
* efeitos visuais que não possuem função;
* animações desnecessárias;
* aparência de landing page;
* visual futurista genérico;
* excesso de whitespace sem propósito;
* títulos enormes apenas para criar impacto visual.

**Não transforme o dashboard em uma peça de marketing.**

É um produto funcional de meteorologia.

---

# Direção visual

Prefira uma linguagem visual semelhante a produtos digitais reais e maduros.

Busque referências conceituais em:

* dashboards modernos;
* aplicativos de clima;
* interfaces editoriais;
* produtos SaaS premium;
* sistemas de informação bem projetados;
* design suíço/moderno;
* interfaces minimalistas.

A interface deve transmitir:

* precisão;
* confiança;
* calma;
* organização;
* modernidade;
* legibilidade;
* qualidade.

O design deve parecer **intencional**, não decorado.

---

# Tailwind CSS

Revise a configuração atual do Tailwind CSS e melhore-a para criar uma base visual mais consistente.

Crie/refine:

* escala de espaçamento;
* tipografia;
* pesos de fonte;
* tamanhos de texto;
* line-height;
* border radius;
* sombras;
* cores;
* backgrounds;
* cores de texto;
* cores secundárias;
* estados;
* breakpoints;
* tokens visuais reutilizáveis.

Evite valores arbitrários espalhados pelo projeto quando eles puderem ser representados por tokens ou pela própria escala do Tailwind.

Quero que o Tailwind deixe de ser apenas um conjunto de classes e passe a funcionar como uma **linguagem visual consistente para o projeto**.

---

# Hierarquia de informações

Dê prioridade visual aos dados mais importantes.

Em um dashboard de clima, informações como:

**temperatura atual, condição climática, localização e previsão**

devem possuir maior destaque.

Informações secundárias, como:

* umidade;
* vento;
* pressão;
* sensação térmica;
* visibilidade;
* outros indicadores;

devem ter uma hierarquia menor.

Não faça todos os elementos competirem pela atenção.

A interface deve possuir claramente:

**primário → secundário → terciário.**

---

# Cards e componentes

Não coloque tudo automaticamente dentro de cards.

Um elemento só deve possuir container, background, borda ou sombra quando isso ajudar na organização da informação.

Use cards quando eles ajudarem a:

* agrupar informações relacionadas;
* separar contextos;
* facilitar leitura;
* criar hierarquia.

Evite o padrão:

> card dentro de card dentro de card.

Prefira composição e agrupamento natural.

---

# Espaçamento

Trabalhe cuidadosamente:

* padding;
* margin;
* gap;
* alinhamento;
* largura máxima;
* altura;
* densidade.

Quero uma interface confortável para leitura, mas não desperdiçando espaço.

O dashboard deve funcionar bem tanto em telas grandes quanto em notebooks.

---

# Responsividade

Melhore a responsividade visual sem alterar funcionalidades.

Verifique principalmente:

* desktop;
* notebook;
* tablet;
* mobile.

Garanta que:

* textos não estourem;
* informações não fiquem comprimidas;
* grids se reorganizem adequadamente;
* cards mantenham proporções adequadas;
* elementos importantes permaneçam visíveis;
* espaçamentos sejam adaptados;
* a hierarquia continue clara em telas menores.

---

# Ícones

Use ícones de forma consistente.

Não adicione ícones simplesmente para preencher espaço.

Quando houver ícones existentes, preserve sua função e comportamento, mas você pode melhorar:

* tamanho;
* alinhamento;
* peso visual;
* espaçamento;
* container;
* aparência.

---

# Animações

Animações devem ser discretas e funcionais.

Não quero uma interface cheia de movimento.

Se utilizar animações, prefira:

* transitions sutis;
* hover states;
* pequenas mudanças de escala;
* mudanças de opacity;
* feedback visual de interação.

Evite animações constantes ou decorativas.

---

# Processo obrigatório

Antes de modificar o código:

1. Analise a estrutura atual do projeto.
2. Identifique os principais componentes da interface.
3. Identifique quais componentes possuem lógica e comportamento que devem ser preservados.
4. Analise a configuração atual do Tailwind.
5. Identifique inconsistências visuais.
6. Identifique problemas de hierarquia visual.
7. Identifique excesso de elementos, cards, cores ou efeitos.
8. Defina mentalmente uma linguagem visual consistente.
9. Só então comece a implementar.

Não faça uma mudança superficial apenas trocando algumas cores.

Quero uma **melhoria real da composição visual**.

---

# Critério de qualidade

Ao terminar, faça uma revisão visual completa.

Pergunte:

* A informação principal chama atenção primeiro?
* A temperatura atual é facilmente identificável?
* A previsão é fácil de escanear?
* Existe uma hierarquia clara?
* Existe algum elemento competindo desnecessariamente pela atenção?
* Há excesso de cards?
* Há excesso de bordas?
* Há excesso de sombras?
* Há excesso de cores?
* Há elementos decorativos sem função?
* O design parece profissional?
* Parece um produto real ou um template gerado por IA?
* O layout continua confortável em telas menores?
* A interface está visualmente consistente?

---

# Regra final

**Não confunda redesign visual com refatoração funcional.**

O objetivo desta tarefa é fazer o Climora **parecer significativamente melhor sem mudar aquilo que ele faz**.

Se você tiver que escolher entre:

**uma mudança visual mais bonita que exige alterar comportamento**

e

**uma mudança visual um pouco menos ambiciosa que preserva completamente o comportamento**,

escolha sempre a segunda.

A funcionalidade existente é intocável.

O resultado final deve ser um dashboard meteorológico **limpo, moderno, profissional, calmo, legível e visualmente sofisticado**, sem parecer uma interface genérica de IA.

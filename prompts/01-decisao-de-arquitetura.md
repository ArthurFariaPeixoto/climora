# Definição da Arquitetura — Dashboard de Monitoramento de Clima

Você é um arquiteto de software responsável por definir a arquitetura de um projeto frontend para um trabalho de pós-graduação.

Nesta etapa, **não queremos definir a stack tecnológica definitiva**. O objetivo é exclusivamente definir a **arquitetura da aplicação**, suas responsabilidades, seus módulos, seus fluxos de dados, suas fronteiras e suas relações.

A definição da stack será feita posteriormente em uma etapa separada.

---

# 1. Contexto do projeto

O projeto consiste em um:

> **Dashboard de monitoramento de clima**

Será uma aplicação web **exclusivamente frontend**, responsável por consumir dados de uma API externa de clima e apresentar essas informações de maneira clara, organizada e responsiva.

O usuário deverá conseguir consultar informações meteorológicas de diferentes cidades.

A aplicação terá como principais objetivos:

- consultar informações climáticas;
- permitir a busca por cidades;
- apresentar informações meteorológicas atuais;
- apresentar previsão do tempo;
- permitir visualizar diferentes métricas climáticas;
- organizar essas informações em um dashboard;
- possuir componentes reutilizáveis;
- possuir testes;
- possuir design responsivo.

---

# 2. Requisitos funcionais conhecidos

A aplicação deverá possuir, no mínimo, os seguintes recursos.

## 2.1 Busca de cidades

O usuário deverá possuir um campo de busca para pesquisar cidades.

Fluxo esperado:

```text
Usuário
  ↓
Pesquisa cidade
  ↓
Aplicação
  ↓
Consulta API
  ↓
Recebe dados
  ↓
Processa dados
  ↓
Atualiza Dashboard
```

Considere também os seguintes cenários:

- cidade encontrada;
- cidade não encontrada;
- múltiplos resultados para uma pesquisa;
- busca vazia;
- erro na API;
- indisponibilidade da API;
- carregamento;
- nova pesquisa enquanto uma requisição anterior está em andamento.

---

# 3. Dados meteorológicos

O dashboard deverá apresentar, conforme disponibilidade da API externa:

- temperatura;
- sensação térmica;
- temperatura mínima;
- temperatura máxima;
- umidade;
- velocidade do vento;
- direção do vento;
- condição climática;
- previsão;
- informações por horário;
- informações por dia;
- precipitação;
- outros dados relevantes que possam ser incorporados posteriormente.

A arquitetura deve permitir adicionar novas informações meteorológicas sem exigir alterações extensas em componentes não relacionados.

---

# 4. Dashboard

O dashboard deverá possuir uma estrutura composta por componentes de interface.

Considere componentes como:

- Header;
- campo de busca;
- seletor/localização;
- card de clima atual;
- cards de métricas;
- previsão por hora;
- previsão por dia;
- gráficos;
- estados de carregamento;
- estados de erro;
- estados vazios;
- componentes de navegação, caso necessários.

Não é necessário definir ainda o design visual detalhado.

O objetivo é definir **responsabilidades e relacionamentos arquiteturais**.

---

# 5. Responsabilidades arquiteturais

Defina claramente as responsabilidades de cada camada ou módulo.

Considere, quando apropriado, separações como:

```text
UI
↓
Feature / Presentation
↓
Application / Logic
↓
Data Access
↓
External API
```

Porém, **não considere essa arquitetura pré-definida**.

Avalie se essa separação realmente faz sentido para o tamanho e objetivo do projeto.

Evite criar camadas apenas por seguir padrões arquiteturais conhecidos.

A arquitetura deve ser proporcional ao projeto.

---

# 6. Integração com API externa

A aplicação consumirá diretamente uma API externa de clima.

Não haverá backend próprio.

Defina:

- onde ficará a responsabilidade pela comunicação HTTP;
- onde ficará o cliente da API;
- onde ficarão os endpoints;
- como os parâmetros serão construídos;
- como as respostas serão tratadas;
- onde ocorrerá a transformação dos dados;
- como os erros serão propagados;
- como o frontend consumirá os dados;
- como separar dados externos dos modelos utilizados pela interface.

Considere especialmente a necessidade de evitar que os componentes de UI conheçam detalhes específicos da API externa.

Por exemplo, um componente de clima não deveria depender diretamente da estrutura específica de resposta fornecida pela API.

Avalie a necessidade de uma camada de adaptação/normalização:

```text
API externa
    ↓
Response / DTO externo
    ↓
Adapter / Mapper
    ↓
Modelo utilizado pela aplicação
    ↓
Componentes
```

Decida se essa abordagem é adequada para o projeto e justifique.

---

# 7. Fluxo de dados

Defina como os dados deverão percorrer a aplicação.

Considere pelo menos o fluxo:

```text
Usuário
  ↓
Busca
  ↓
Feature de pesquisa
  ↓
Serviço meteorológico
  ↓
API externa
  ↓
Resposta
  ↓
Normalização
  ↓
Estado/cache
  ↓
Componentes
  ↓
Dashboard
```

Analise também:

- onde o estado da pesquisa será armazenado;
- onde os dados meteorológicos serão armazenados;
- se haverá cache;
- como uma nova cidade substituirá a anterior;
- como lidar com dados temporários;
- como evitar requisições desnecessárias;
- como tratar concorrência entre requisições.

---

# 8. Estado da aplicação

Defina quais tipos de estado existirão.

Diferencie, quando aplicável:

### Estado de UI

Exemplos:

- valor do campo de busca;
- modal aberto;
- seleção;
- filtros;
- estados visuais.

### Estado de dados

Exemplos:

- cidade pesquisada;
- clima atual;
- previsão;
- dados históricos, caso futuramente adicionados.

### Estado de requisição

Exemplos:

- idle;
- loading;
- success;
- error.

### Estado derivado

Exemplos:

- temperatura formatada;
- previsão agrupada por dia;
- métricas calculadas;
- condições meteorológicas convertidas para apresentação.

Determine onde cada tipo de estado deverá existir.

Não introduza uma solução global de gerenciamento de estado se a arquitetura não justificar sua necessidade.

---

# 9. Componentização

Defina uma estratégia de componentização.

Determine:

- quais componentes serão globais;
- quais componentes pertencem ao dashboard;
- quais componentes pertencem à funcionalidade de busca;
- quais componentes devem ser reutilizáveis;
- quais componentes devem permanecer específicos de uma feature.

Evite tanto:

- componentes monolíticos;
- quanto uma fragmentação excessiva em dezenas de componentes sem responsabilidade clara.

A arquitetura deve buscar **alta coesão e baixo acoplamento**.

---

# 10. Organização por domínio/feature

Avalie se o projeto deve ser organizado:

- por tipo técnico;
- por feature;
- por domínio;
- ou por uma abordagem híbrida.

Compare pelo menos conceitualmente abordagens como:

```text
components/
services/
hooks/
utils/
```

versus:

```text
features/
  weather/
  city-search/
```

ou uma combinação das duas.

Escolha a abordagem mais adequada ao tamanho e à evolução esperada do projeto.

---

# 11. Testabilidade

O projeto deverá possuir testes para:

- componentes;
- lógica de negócio;
- lógica de requisição;
- tratamento de erros;
- transformação/normalização de dados;
- busca por cidades;
- estados de loading;
- estados de erro;
- estados vazios;
- outros comportamentos relevantes.

A arquitetura deve facilitar testes isolados.

Defina quais partes deverão ser testáveis independentemente da API real.

Considere a necessidade de:

```text
UI
 ↓
Application Logic
 ↓
Mock
 ↓
API
```

em vez de fazer todos os testes dependerem de uma API externa real.

Defina também onde os mocks/stubs deverão existir conceitualmente.

**Não escolha ainda a biblioteca de testes.**

Essa decisão pertence à definição da stack.

---

# 12. Estados da interface

A arquitetura deve considerar explicitamente os principais estados da aplicação.

No mínimo:

```text
INITIAL
  ↓
LOADING
  ↓
SUCCESS
```

e:

```text
LOADING
  ↓
ERROR
```

Considere também:

- pesquisa sem resultado;
- pesquisa inválida;
- API indisponível;
- timeout;
- erro de rede;
- dados incompletos;
- ausência de previsão;
- ausência de localização.

Esses estados devem fazer parte da arquitetura e não serem tratados como exceções esquecidas durante a implementação.

---

# 13. Responsividade

A aplicação deverá ser responsiva.

A arquitetura de componentes deve permitir diferentes layouts para:

- desktop;
- tablet;
- mobile.

A responsividade deve ser responsabilidade da camada de apresentação/UI, sem contaminar a lógica de negócio ou integração com API.

---

# 14. Segurança

Considere que a API externa utilizará autenticação por API Key.

A aplicação será exclusivamente frontend.

Portanto, avalie e documente a seguinte limitação arquitetural:

> Uma API Key utilizada por uma aplicação frontend não pode ser considerada um segredo absoluto, pois o navegador precisa realizar as requisições.

O uso de variáveis de ambiente será definido posteriormente na etapa de stack.

Nesta etapa, apenas registre a implicação arquitetural dessa decisão.

Não crie um backend apenas para ocultar a API Key, pois isso está fora do escopo do projeto.

---

# 15. Escalabilidade

Não precisamos de uma arquitetura preparada para milhões de usuários.

Porém, a arquitetura deve permitir evolução razoável.

Considere possíveis funcionalidades futuras:

- múltiplas cidades favoritas;
- histórico de pesquisas;
- previsão estendida;
- gráficos;
- qualidade do ar;
- alertas climáticos;
- geolocalização;
- localização atual do usuário;
- comparação entre cidades;
- temas claro/escuro.

Não implemente essas funcionalidades.

Apenas avalie se a arquitetura escolhida permite adicioná-las posteriormente sem grandes refatorações.

---

# 16. Performance

Avalie arquiteturalmente:

- quantidade de requisições;
- cache;
- requisições duplicadas;
- carregamento de dados;
- atualização do dashboard;
- renderizações desnecessárias;
- tamanho e responsabilidade dos componentes;
- carregamento de gráficos;
- eventual code splitting.

Não faça otimizações prematuras.

Apenas identifique decisões arquiteturais que possam impactar performance.

---

# 17. Arquitetura esperada

A arquitetura final deverá responder claramente:

### Estrutura

Quais são os principais módulos/camadas?

### Responsabilidades

O que cada módulo faz?

### Comunicação

Como os módulos se comunicam?

### Dados

Como os dados entram na aplicação e chegam aos componentes?

### Estado

Onde os estados são armazenados?

### API

Como a API externa é isolada da UI?

### Erros

Onde os erros são tratados?

### Testes

Como cada camada poderá ser testada isoladamente?

### Evolução

Como novas funcionalidades poderão ser adicionadas?

---

# 18. Diagramas

A saída principal desta etapa deverá ser composta por **diagramas arquiteturais**.

Utilize preferencialmente **Mermaid**.

Use PlantUML somente se Mermaid não representar adequadamente determinado diagrama.

Produza, quando aplicável, pelo menos:

## 18.1 Diagrama de arquitetura

Mostre:

```text
Usuário
  ↓
UI
  ↓
Features
  ↓
Application / Logic
  ↓
Data Access
  ↓
API externa
```

Adapte os níveis conforme a arquitetura definida.

## 18.2 Diagrama de fluxo de dados

Mostre o fluxo completo:

```text
Busca da cidade
→ requisição
→ API
→ resposta
→ transformação
→ estado
→ dashboard
```

## 18.3 Diagrama de componentes

Mostre os principais componentes e suas relações.

## 18.4 Diagrama de sequência

Crie um diagrama de sequência para o fluxo principal de pesquisa de uma cidade.

Exemplo conceitual:

```text
Usuário
  ↓
Search
  ↓
Weather Service
  ↓
API
  ↓
Weather Service
  ↓
Dashboard
```

Adapte o fluxo à arquitetura realmente escolhida.

Não crie diagramas apenas por quantidade. Cada diagrama deve comunicar uma decisão arquitetural relevante.

---

# 19. Decisões arquiteturais

Ao finalizar a análise, documente as principais decisões.

Para cada decisão, registre:

```text
Decisão:
Contexto:
Alternativas consideradas:
Escolha:
Justificativa:
Consequências:
```

Inclua decisões como:

- organização do projeto;
- separação de responsabilidades;
- estratégia de componentes;
- estratégia de features;
- integração com API;
- transformação dos dados;
- gerenciamento de estado;
- tratamento de erros;
- testabilidade;
- cache;
- responsividade;
- possíveis extensões futuras.

---

# 20. O que NÃO deve ser decidido nesta etapa

Não defina ainda:

- Vite vs Next.js;
- JavaScript vs TypeScript;
- Axios vs Fetch;
- Tailwind vs MUI vs CSS;
- Vitest vs Jest;
- Recharts vs Chart.js;
- biblioteca de ícones;
- biblioteca de gerenciamento de estado específica.

Essas decisões serão feitas posteriormente na etapa de **definição da stack**.

Você pode mencionar essas tecnologias como alternativas ou exemplos quando necessário, mas não deve tratá-las como decisões finais.

A arquitetura deve ser suficientemente abstrata para que a stack possa ser escolhida posteriormente.

---

# 21. Critérios de qualidade

A arquitetura final deve priorizar:

1. simplicidade;
2. baixo acoplamento;
3. alta coesão;
4. separação clara de responsabilidades;
5. testabilidade;
6. facilidade de manutenção;
7. facilidade de evolução;
8. boa experiência de desenvolvimento;
9. performance adequada;
10. proporcionalidade ao tamanho do projeto.

Evite:

- overengineering;
- abstrações prematuras;
- excesso de camadas;
- padrões utilizados sem necessidade;
- dependências implícitas;
- componentes que concentrem responsabilidades demais.

A arquitetura deve ser **simples o suficiente para um projeto acadêmico, mas tecnicamente sólida o suficiente para demonstrar boas práticas de engenharia de software**.

---

# 22. Artefatos obrigatórios

Depois de concluir a análise, crie o seguinte arquivo:

```text
docs/decisoes_arquiteturais.md
```

Esse documento deverá conter:

1. contexto;
2. requisitos arquiteturais;
3. arquitetura escolhida;
4. descrição das camadas/módulos;
5. responsabilidades;
6. fluxo de dados;
7. estratégia de estado;
8. estratégia de integração com API;
9. estratégia de tratamento de erros;
10. estratégia de componentização;
11. estratégia de testes;
12. estratégia de responsividade;
13. considerações de performance;
14. considerações de segurança;
15. possibilidades de evolução;
16. decisões arquiteturais;
17. alternativas consideradas;
18. consequências das decisões;
19. diagramas Mermaid;
20. pontos que permaneceram como decisões pendentes para a definição da stack.

Os diagramas Mermaid devem estar incorporados no próprio arquivo Markdown.

---

# 23. Regra sobre a documentação

O arquivo `docs/decisoes_arquiteturais.md` deverá funcionar como a **fonte de verdade arquitetural do projeto**.

Não registre apenas o resultado.

Registre também o raciocínio que levou às decisões.

Outro desenvolvedor deve conseguir ler esse documento e compreender:

> "Por que essa arquitetura foi escolhida?"

e não apenas:

> "Qual arquitetura foi escolhida?"

---

# 24. Processo obrigatório

Execute o trabalho nesta ordem:

### Etapa 1 — Entendimento

Analise os requisitos fornecidos.

### Etapa 2 — Requisitos arquiteturais

Identifique as características arquiteturais necessárias.

### Etapa 3 — Alternativas

Considere diferentes formas de estruturar a aplicação.

### Etapa 4 — Avaliação

Compare as alternativas considerando o contexto real do projeto.

### Etapa 5 — Decisão

Escolha a arquitetura mais adequada.

### Etapa 6 — Modelagem

Crie os diagramas Mermaid.

### Etapa 7 — Documentação

Crie:

```text
docs/decisoes_arquiteturais.md
```

### Etapa 8 — Validação

Revise a arquitetura verificando:

- se todos os requisitos possuem um lugar na arquitetura;
- se as responsabilidades estão bem separadas;
- se a integração externa está isolada;
- se os componentes podem ser testados;
- se a arquitetura não está excessivamente complexa;
- se a arquitetura não depende de uma stack específica;
- se a solução permite evolução.

---

# 25. Restrições importantes

Não implemente a aplicação.

Não crie componentes.

Não instale dependências.

Não escolha a stack definitiva.

Não escreva código de produção.

O objetivo desta etapa é exclusivamente:

> **definir, justificar, representar e documentar a arquitetura do frontend.**

Ao terminar, apresente um resumo contendo:

1. arquitetura escolhida;
2. principais módulos;
3. fluxo de dados;
4. principais decisões;
5. principais trade-offs;
6. decisões que deverão ser tomadas posteriormente durante a definição da stack;
7. confirmação de que `docs/decisoes_arquiteturais.md` foi criado/atualizado.

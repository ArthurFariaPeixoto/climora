# Bootstrap Inicial do Projeto Climora

## Objetivo

A arquitetura e a stack tecnológica do projeto **Climora** já foram definidas.

Nesta etapa, você deve **iniciar tecnicamente o projeto**, criando a estrutura inicial de arquivos, diretórios, configurações e boilerplates necessários para que o desenvolvimento das funcionalidades possa começar posteriormente.

### Importante

**NÃO implemente as funcionalidades do sistema neste momento.**

O objetivo desta tarefa é criar o **boilerplate técnico e estrutural do projeto**, respeitando integralmente as decisões arquiteturais e tecnológicas já documentadas.

Não implemente:

- busca de cidades;
- chamadas reais para OpenWeather;
- dashboard funcional;
- componentes visuais completos;
- gráficos funcionais;
- regras de negócio;
- fluxos completos;
- telas finais;
- lógica de domínio;
- tratamento completo de todos os casos de uso.

Você deve apenas criar a **fundação necessária** para que essas funcionalidades sejam implementadas nas próximas etapas.

---

# 1. Documentos obrigatórios

Antes de criar qualquer arquivo, leia integralmente:

```text
docs/decisoes_arquiteturais.md
docs/stack_definida.md
```

Também leia os diagramas existentes:

```text
docs/diagrams/
```

Esses documentos são a **fonte de verdade do projeto**.

A implementação inicial deve respeitar:

1. requisitos;
2. decisões arquiteturais;
3. diagramas;
4. decisões tecnológicas.

Não invente uma arquitetura alternativa.

Não substitua tecnologias já decididas.

Não introduza padrões arquiteturais que não estejam alinhados aos documentos.

---

# 2. Stack obrigatória

A stack definida é:

| Área                  | Tecnologia                                                   |
| --------------------- | ------------------------------------------------------------ |
| Framework             | React 19                                                     |
| Build / Dev Server    | Vite 7                                                       |
| Linguagem             | TypeScript 5.9 strict                                        |
| Data fetching / cache | TanStack Query 5                                             |
| HTTP                  | Axios 1                                                      |
| Weather API           | OpenWeather                                                  |
| Estilização           | Tailwind CSS 4                                               |
| UI                    | Componentes próprios                                         |
| Ícones                | lucide-react                                                 |
| Gráficos              | Recharts, lazy-loaded                                        |
| Datas                 | dayjs + plugin `utc`                                         |
| Testes                | Vitest + React Testing Library + user-event + jest-dom + MSW |
| Lint                  | ESLint 9 flat config                                         |
| Formatação            | Prettier                                                     |
| Package manager       | npm                                                          |
| Deploy                | Build estático em `dist/`                                    |

Essas decisões já foram tomadas.

**Não reavalie a stack.**

---

# 3. Objetivo do bootstrap

Ao terminar esta etapa, o projeto deve possuir:

- projeto React + Vite funcional;
- TypeScript configurado em modo strict;
- Tailwind configurado;
- ESLint configurado;
- Prettier configurado;
- Vitest configurado;
- React Testing Library configurado;
- MSW preparado;
- Axios preparado;
- TanStack Query preparado;
- dayjs preparado;
- lucide-react instalado;
- Recharts instalado;
- estrutura de diretórios alinhada à arquitetura;
- arquivos de configuração;
- arquivos de ambiente;
- `.gitignore`;
- `.env.example`;
- entrypoints básicos;
- providers necessários;
- arquivos base das camadas/módulos definidos pela arquitetura;
- pelo menos um teste mínimo para validar que o ambiente de testes está funcionando;
- scripts npm necessários para desenvolvimento, build, lint, format e testes.

---

# 4. Inicialização do projeto

Inicialize o projeto utilizando:

```text
React 19
Vite 7
TypeScript 5.9
npm
```

O projeto deve utilizar TypeScript strict.

Garanta que:

```text
npm install
npm run dev
npm run build
```

funcionem corretamente.

Também deve existir um comando de preview adequado ao build estático.

---

# 5. Estrutura de diretórios

A estrutura de diretórios deve ser derivada diretamente da arquitetura documentada.

Não copie cegamente uma estrutura genérica.

Analise:

```text
docs/decisoes_arquiteturais.md
docs/diagrams/
```

e crie os diretórios necessários para representar as responsabilidades definidas.

Uma estrutura de referência pode ser semelhante a:

```text
src/
├── app/
├── components/
├── features/
├── services/
├── hooks/
├── lib/
├── types/
├── utils/
├── mocks/
└── ...
```

Porém, **a estrutura final deve ser determinada pela arquitetura existente**.

Se a arquitetura utilizar outra organização, siga a arquitetura.

---

# 6. Boilerplates das camadas

Para cada camada, módulo ou responsabilidade definida na arquitetura, crie os arquivos iniciais necessários.

Esses arquivos devem ser **boilerplates**, não implementações.

Por exemplo, se existir uma camada de serviços, pode existir algo como:

```text
src/services/weather/
├── weather.service.ts
├── weather.types.ts
└── weather.mapper.ts
```

Mas não implemente a lógica completa.

Utilize apenas:

- tipos;
- interfaces;
- assinaturas;
- placeholders;
- funções vazias quando apropriado;
- TODOs claros;
- comentários explicando o propósito do arquivo.

O código deve deixar claro **onde cada responsabilidade será implementada futuramente**.

---

# 7. Configuração do Axios

Crie a infraestrutura inicial para Axios.

A arquitetura deve possuir um ponto centralizado para configuração do cliente HTTP.

Por exemplo:

```text
src/lib/http/
└── api-client.ts
```

A implementação inicial deve preparar:

- criação do Axios instance;
- `baseURL`;
- configuração básica;
- possibilidade de headers;
- possibilidade de interceptors futuramente.

Não implemente ainda as chamadas específicas da OpenWeather.

---

# 8. Configuração do OpenWeather

Prepare a estrutura para integração com OpenWeather.

Crie os arquivos necessários para separar:

```text
API externa
      ↓
serviço
      ↓
mapper/adapter
      ↓
modelo utilizado pela aplicação
```

O objetivo é impedir que componentes React dependam diretamente do formato bruto retornado pela OpenWeather.

Não implemente as requisições reais nesta etapa.

Crie apenas os contratos, tipos e pontos de extensão necessários.

---

# 9. Variáveis de ambiente

Crie:

```text
.env.example
```

e garanta que `.env` esteja no `.gitignore`.

Utilize o padrão de variáveis de ambiente apropriado para Vite.

Defina os nomes das variáveis de acordo com a documentação da stack.

Exemplo conceitual:

```text
VITE_OPENWEATHER_API_KEY=
VITE_OPENWEATHER_BASE_URL=
```

Não coloque nenhuma API key real no repositório.

O `.env.example` deve conter apenas os nomes das variáveis e valores vazios ou exemplos seguros.

---

# 10. TanStack Query

Configure a infraestrutura inicial do TanStack Query.

Crie o `QueryClient` e o provider correspondente.

A aplicação deve possuir uma estrutura semelhante a:

```text
React
 └── QueryClientProvider
      └── App
```

Não implemente ainda queries reais.

Prepare apenas a infraestrutura necessária.

---

# 11. Tailwind CSS

Configure:

```text
Tailwind CSS 4
```

de acordo com a integração correta com Vite.

Crie a folha global de estilos.

Prepare a aplicação para receber posteriormente:

- tokens;
- tipografia;
- espaçamentos;
- componentes;
- responsividade;
- temas, caso definidos pela arquitetura.

Não implemente o design final nesta etapa.

---

# 12. Componentes próprios

Como a arquitetura define componentes próprios, prepare a estrutura para o catálogo de componentes.

Não crie todos os componentes finais.

Crie apenas a estrutura inicial necessária.

Por exemplo:

```text
src/components/
├── ui/
├── layout/
└── ...
```

A organização deve seguir o catálogo definido na arquitetura.

Caso existam componentes fundamentais para o bootstrap, crie apenas versões mínimas/placeholder.

---

# 13. Ícones

Configure:

```text
lucide-react
```

Não é necessário criar componentes de ícones neste momento, a menos que a arquitetura determine uma abstração específica.

---

# 14. Gráficos

Configure a dependência:

```text
Recharts
```

e prepare a arquitetura para carregamento lazy dos componentes de gráficos.

Não implemente nenhum gráfico real.

Caso seja necessário criar um ponto de entrada ou wrapper arquitetural para gráficos, deixe apenas o boilerplate.

---

# 15. Datas

Configure:

```text
dayjs
```

com:

```text
utc
```

Crie, se previsto pela arquitetura, um ponto centralizado para configuração da biblioteca.

Por exemplo:

```text
src/lib/date/
└── dayjs.ts
```

Não implemente regras de formatação específicas do dashboard ainda.

---

# 16. Testes

Configure:

```text
Vitest
React Testing Library
@testing-library/user-event
@testing-library/jest-dom
MSW
```

O ambiente deve permitir:

```text
npm run test
```

e, se apropriado:

```text
npm run test:watch
```

Configure:

- ambiente de testes;
- setup global;
- jest-dom;
- MSW;
- estrutura de mocks;
- handlers iniciais;
- configuração do Vitest.

Crie pelo menos **um teste mínimo de smoke test** para confirmar que o ambiente está funcionando.

Não implemente testes de funcionalidades que ainda não existem.

---

# 17. MSW

Prepare a infraestrutura do MSW para futuras requisições da OpenWeather.

Crie algo semelhante a:

```text
src/mocks/
├── handlers.ts
└── server.ts
```

A estrutura final deve seguir a arquitetura existente.

Não é necessário criar mocks completos da API neste momento.

Pode existir apenas um handler/placeholder inicial, desde que isso seja suficiente para validar a configuração.

---

# 18. ESLint

Configure:

```text
ESLint 9
```

utilizando:

```text
Flat Config
```

A configuração deve funcionar com:

- TypeScript;
- React;
- Vite;
- testes.

Evite regras excessivamente complexas.

O objetivo é criar uma base consistente.

---

# 19. Prettier

Configure o Prettier.

Crie os arquivos necessários, por exemplo:

```text
.prettierrc
.prettierignore
```

Os padrões devem ser coerentes com TypeScript/React.

---

# 20. TypeScript

Configure TypeScript em:

```text
strict: true
```

Evite:

```text
any
```

como solução para problemas de tipagem.

Prepare os aliases de importação, **caso a arquitetura definida utilize essa abordagem**.

Se aliases forem configurados, garanta que:

- TypeScript reconheça;
- Vite reconheça;
- Vitest reconheça;
- ESLint não apresente problemas.

---

# 21. Scripts npm

O `package.json` deve possuir scripts coerentes com o projeto.

No mínimo, avalie a necessidade de:

```text
dev
build
preview
lint
lint:fix
format
format:check
test
test:watch
```

Adicione outros apenas quando houver necessidade real.

---

# 22. README inicial

Crie ou atualize:

```text
README.md
```

O README deve explicar apenas o necessário para iniciar o projeto.

Inclua:

- descrição curta do Climora;
- stack;
- requisitos;
- instalação;
- configuração do `.env`;
- execução local;
- build;
- testes;
- lint;
- formatação.

Não escreva documentação extensa das funcionalidades ainda inexistentes.

---

# 23. Arquivos de controle do projeto

Garanta que existam e estejam corretamente configurados:

```text
.gitignore
.env.example
```

O `.gitignore` deve contemplar pelo menos:

```text
node_modules
dist
.env
arquivos temporários
arquivos gerados
```

Não ignore:

```text
.env.example
```

---

# 24. Primeiro App

Crie uma implementação mínima do `App`.

O objetivo é somente validar que:

```text
Vite
+
React
+
TypeScript
+
Tailwind
+
estrutura inicial
```

estão funcionando.

Pode existir uma tela extremamente simples contendo, por exemplo:

```text
Climora
Weather Dashboard
```

Essa tela é apenas um **placeholder técnico**.

Não implemente ainda o dashboard real.

---

# 25. O que NÃO fazer

Nesta etapa, NÃO:

- implementar o dashboard;
- criar o layout final;
- implementar busca de cidade;
- consumir OpenWeather;
- criar queries reais;
- criar gráficos;
- implementar regras de negócio;
- criar todas as telas;
- criar componentes completos;
- adicionar autenticação;
- criar backend;
- criar banco de dados;
- adicionar Redux;
- adicionar bibliotecas não previstas;
- trocar tecnologias;
- alterar a arquitetura;
- criar abstrações sem necessidade;
- antecipar otimizações;
- implementar funcionalidades "para adiantar".

O objetivo é somente **preparar o terreno para a implementação**.

---

# 26. Critério de qualidade

O projeto deve terminar esta etapa em um estado semelhante a:

```text
Projeto criado
       ↓
Dependências instaladas
       ↓
Configurações funcionando
       ↓
Arquitetura representada em diretórios
       ↓
Infraestrutura preparada
       ↓
Testes funcionando
       ↓
Lint funcionando
       ↓
Build funcionando
       ↓
Pronto para começar a implementação das features
```

O código deve ser pequeno e intencional.

Prefira:

```text
estrutura + contratos + configuração
```

em vez de:

```text
estrutura + implementação prematura
```

---

# 27. Validação obrigatória

Ao finalizar, execute e valide:

```bash
npm install
npm run lint
npm run test
npm run build
```

Corrija eventuais problemas de configuração.

O build deve gerar:

```text
dist/
```

sem erros.

O teste mínimo deve passar.

O lint deve passar.

---

# 28. Relatório final

Ao terminar, apresente um resumo contendo:

### Estrutura criada

Liste os principais diretórios e arquivos.

### Configurações criadas

Liste:

- Vite;
- TypeScript;
- Tailwind;
- ESLint;
- Prettier;
- Vitest;
- MSW;
- Axios;
- TanStack Query;
- dayjs;
- demais configurações relevantes.

### Boilerplates criados

Explique quais pontos da arquitetura foram preparados para implementação futura.

### Dependências instaladas

Separe:

```text
dependencies
devDependencies
```

### Scripts

Liste os scripts disponíveis no `package.json`.

### Validação

Informe o resultado de:

```text
npm run lint
npm run test
npm run build
```

### Pendências

Liste explicitamente as funcionalidades que ainda **não foram implementadas** e deverão ser desenvolvidas nas próximas etapas.

---

# Regra final

Este é o momento de **bootstrap**, não de desenvolvimento de features.

Use os documentos:

```text
docs/decisoes_arquiteturais.md
docs/stack_definida.md
docs/diagrams/
```

como referência.

A implementação deve terminar com um projeto:

> **instalável, executável, testável, lintável, buildável e estruturalmente preparado para receber as funcionalidades do Climora.**

Não implemente além disso.

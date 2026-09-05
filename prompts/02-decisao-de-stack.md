# Definição da Stack do Projeto Climora

## Contexto

Estamos desenvolvendo um projeto acadêmico de pós-graduação chamado **Climora**, um Dashboard de Monitoramento de Clima.

A etapa de arquitetura já foi realizada e documentada. Agora precisamos definir a **stack tecnológica** que será utilizada para implementar a arquitetura.

A definição da stack deve partir obrigatoriamente da arquitetura já definida, e não o contrário.

---

## Fonte de verdade

Antes de tomar qualquer decisão, leia integralmente:

```text
docs/decisoes_arquiteturais.md
```

Também consulte os diagramas existentes em:

```text
docs/diagrams/
```

Esses documentos representam a arquitetura previamente definida para o projeto e devem ser considerados a **fonte de verdade arquitetural** desta etapa.

Não redesenhe a arquitetura.

Não altere decisões arquiteturais já estabelecidas apenas para facilitar a escolha de uma tecnologia.

A pergunta desta etapa é:

> **"Quais tecnologias implementam melhor a arquitetura que já foi definida?"**

e não:

> **"Qual arquitetura seria melhor para determinada tecnologia?"**

---

# Objetivo

Definir uma stack tecnológica coerente com:

1. Os requisitos do projeto;
2. A arquitetura documentada;
3. Os fluxos definidos nos diagramas;
4. O escopo acadêmico do projeto;
5. A necessidade de testes;
6. A necessidade de responsividade;
7. A integração com uma API externa de clima;
8. A necessidade de utilização de `.env`, `.env.example` e `.gitignore`;
9. Simplicidade de desenvolvimento;
10. Manutenibilidade;
11. Baixo acoplamento;
12. Boa experiência de desenvolvimento;
13. Facilidade de execução e avaliação do projeto.

A stack deve ser **proporcional ao tamanho e objetivo do projeto**.

Evite adicionar tecnologias apenas porque são populares.

---

# Contexto funcional

O sistema é uma aplicação web frontend para monitoramento de clima.

A aplicação deverá consumir uma API externa de clima e apresentar informações como:

- temperatura atual;
- sensação térmica;
- temperatura mínima e máxima;
- umidade;
- pressão atmosférica;
- velocidade do vento;
- condição climática;
- previsão do tempo;
- informações por horário/dia quando disponíveis;
- possibilidade de consultar diferentes cidades;
- busca de cidade;
- estados de carregamento;
- estados de erro;
- estados vazios;
- interface responsiva;
- componentes reutilizáveis;
- gráficos quando fizerem sentido para a visualização das informações.

O projeto não possui backend próprio.

A aplicação consumirá diretamente uma API externa de clima.

---

# Regra principal: arquitetura antes da stack

A arquitetura já foi definida.

Portanto, utilize o documento arquitetural para identificar:

- camadas;
- módulos;
- responsabilidades;
- fluxo de dados;
- estratégia de integração com API;
- estratégia de gerenciamento de estado;
- estratégia de componentes;
- fronteiras entre domínio, dados e apresentação;
- estratégia de testes;
- tratamento de erros;
- requisitos de responsividade;
- requisitos de performance;
- possíveis pontos de evolução.

Para cada decisão tecnológica importante, explique **como ela se encaixa na arquitetura existente**.

Exemplo:

> "A arquitetura separa a integração com a API da camada de apresentação. Portanto, a biblioteca escolhida para HTTP será utilizada exclusivamente na camada de infraestrutura/serviço, evitando que componentes de UI conheçam detalhes da API."

Esse tipo de relação deve existir nas decisões.

---

# Tecnologias sugeridas inicialmente

As seguintes tecnologias foram consideradas durante a definição dos requisitos:

- React;
- Tailwind CSS;
- Axios.

Porém, elas **não estão previamente decididas**.

Avalie se realmente fazem sentido diante da arquitetura.

Não escolha uma tecnologia simplesmente porque ela foi mencionada nos requisitos.

---

# Decisões que precisam ser avaliadas

## 1. Framework / ambiente frontend

Avalie alternativas como:

- React + Vite;
- Next.js;
- outras alternativas somente se houver justificativa real.

Considere:

- arquitetura definida;
- aplicação frontend-only;
- necessidade de consumir API externa;
- simplicidade;
- build;
- desenvolvimento local;
- deploy;
- performance;
- complexidade desnecessária.

Explique claramente a escolha.

---

## 2. JavaScript ou TypeScript

Avalie:

- JavaScript;
- TypeScript.

Considere especialmente:

- tamanho do projeto;
- quantidade de modelos de dados;
- integração com API externa;
- necessidade de definir contratos;
- facilidade de manutenção;
- testes;
- complexidade adicional.

Não escolha TypeScript apenas por ser considerado "padrão de mercado".

Também não escolha JavaScript apenas para simplificar o início.

A decisão deve ser baseada no projeto.

---

## 3. Gerenciamento de estado

Analise a arquitetura e determine quais tipos de estado realmente existem.

Diferencie, quando aplicável:

- estado local de componentes;
- estado de UI;
- estado de busca;
- estado de dados provenientes da API;
- estado derivado;
- cache de dados.

Avalie se é necessário utilizar:

- apenas estado nativo do React;
- Context API;
- Zustand;
- TanStack Query;
- Redux Toolkit;
- outra solução.

Não introduza uma biblioteca de estado global se a arquitetura não precisar dela.

Se TanStack Query ou outra solução for considerada, explique se ela deve ser tratada como gerenciamento de **server state/cache** em vez de simplesmente "global state".

---

## 4. Comunicação HTTP

Avalie:

- `fetch`;
- Axios;
- outras alternativas apenas se justificadas.

A escolha deve considerar a arquitetura de integração com API.

Determine:

- onde as requisições serão realizadas;
- onde ficam as configurações da API;
- como os parâmetros são construídos;
- como erros são tratados;
- como respostas são normalizadas;
- como a aplicação evita espalhar detalhes da API pelos componentes.

---

## 5. API de clima

A aplicação precisa utilizar uma API externa que permita acesso por chave/API key.

O objetivo também é exercitar:

```text
.env
.env.example
.gitignore
```

A API inicialmente considerada é a **OpenWeather**, mas valide se ela continua sendo adequada para o escopo.

Avalie:

- existência de plano gratuito adequado;
- necessidade de API key;
- endpoints disponíveis;
- previsão;
- busca por cidade;
- limites de utilização;
- facilidade de integração;
- documentação;
- formato das respostas;
- facilidade de testes;
- adequação ao projeto acadêmico.

Se outra API for tecnicamente mais adequada, apresente a alternativa e justifique.

Importante:

A aplicação é frontend-only.

Não crie um backend, BFF ou proxy apenas para esconder uma API key, a menos que exista uma necessidade arquitetural realmente justificável.

Explique também a limitação de segurança de uma API key utilizada em uma aplicação frontend.

---

## 6. Estilização

Avalie:

- Tailwind CSS;
- CSS Modules;
- CSS tradicional;
- outra solução adequada.

A decisão deve considerar a arquitetura de componentes e o objetivo visual do projeto.

A interface deve ter aparência moderna e refinada, inspirada em dashboards de clima contemporâneos.

Considere:

- responsividade;
- reutilização;
- manutenção;
- tamanho do bundle;
- produtividade;
- consistência visual.

---

## 7. Componentes de UI

Avalie se o projeto deve:

- criar seus próprios componentes;
- utilizar uma biblioteca de componentes;
- utilizar uma abordagem híbrida.

Caso uma biblioteca seja escolhida, justifique considerando:

- tamanho;
- flexibilidade;
- integração com a arquitetura;
- personalização;
- acessibilidade;
- dependências adicionais.

Evite adicionar uma UI library pesada sem necessidade.

---

## 8. Ícones

Avalie uma solução adequada para ícones do dashboard.

Considere:

- consistência visual;
- bundle;
- facilidade de uso;
- variedade;
- integração com React.

---

## 9. Gráficos

O dashboard poderá utilizar gráficos para representar informações climáticas.

Avalie bibliotecas como:

- Recharts;
- Chart.js;
- outra alternativa adequada.

Considere:

- complexidade;
- tamanho;
- responsividade;
- facilidade de integração;
- acessibilidade;
- customização;
- necessidade real do projeto.

Não adicione uma biblioteca de gráficos caso os requisitos arquiteturais não justifiquem.

---

## 10. Datas e horários

Avalie a necessidade de uma biblioteca para:

- formatação de datas;
- horários;
- previsão;
- conversão de timestamps;
- localização.

Considere alternativas como:

- API nativa do JavaScript;
- date-fns;
- Day.js;
- outra solução.

Escolha a solução mais proporcional ao projeto.

---

## 11. Testes

A arquitetura prevê testes.

Defina a stack de testes para:

### Componentes

Testar:

- renderização;
- interação;
- estados;
- comportamento esperado;
- estados de loading;
- estados de erro;
- estados vazios.

### Integração/API

Testar:

- chamadas à camada de serviço;
- tratamento de respostas;
- tratamento de erros;
- transformação/normalização dos dados.

### Outros testes

Identifique outros pontos que devem ser testados com base na arquitetura.

Avalie soluções como:

- Vitest;
- Jest;
- React Testing Library;
- MSW;
- outras ferramentas quando justificadas.

Priorize testes de comportamento e integração em vez de testes puramente visuais.

---

# 12. Lint e formatação

O projeto deve usar eslint e prettier obrigatóriamente.

---

# 13. Variáveis de ambiente

Defina a estratégia para:

```text
.env
.env.example
.gitignore
```

Determine:

- nome das variáveis;
- URL da API;
- API key;
- configuração necessária para desenvolvimento;
- quais valores podem ou não ser versionados.

Deixe explícito que:

> Variáveis de ambiente em aplicações frontend não tornam uma API key secreta após o build.

O objetivo aqui é principalmente organização, configuração e evitar o versionamento acidental da chave.

---

# 14. Build e deploy

Defina:

- ferramenta de build;
- comando de desenvolvimento;
- comando de build;
- comando de preview/start, quando aplicável;
- estratégia de deploy;
- requisitos mínimos de hospedagem.

Considere que o projeto é frontend-only.

Priorize uma solução simples para publicação.

---

# 15. Estrutura de dependências

Ao final, liste:

### Dependências de produção

Exemplo:

```text
react
...
```

### Dependências de desenvolvimento

Exemplo:

```text
typescript
vitest
...
```

Para cada dependência, explique brevemente:

- para que serve;
- qual responsabilidade arquitetural atende;
- por que foi escolhida.

Não adicione dependências sem justificativa.

---

# Processo obrigatório

Siga esta ordem:

### Etapa 1 — Ler arquitetura

Leia:

```text
docs/decisoes_arquiteturais.md
```

### Etapa 2 — Ler diagramas

Leia:

```text
docs/diagrams/
```

### Etapa 3 — Extrair restrições

Liste as restrições arquiteturais que influenciam a stack.

### Etapa 4 — Identificar decisões

Liste as decisões tecnológicas necessárias.

### Etapa 5 — Avaliar alternativas

Para cada decisão relevante:

```text
Alternativa A
Alternativa B
Alternativa C
```

Compare:

- vantagens;
- desvantagens;
- complexidade;
- impacto na arquitetura;
- impacto no projeto;
- manutenção;
- performance;
- DX;
- tamanho do bundle;
- adequação acadêmica.

### Etapa 6 — Escolher

Selecione uma única alternativa para cada decisão.

### Etapa 7 — Validar contra a arquitetura

Verifique se a stack escolhida implementa corretamente a arquitetura existente.

Se encontrar algum conflito, **não altere automaticamente a arquitetura**.

Documente o conflito e explique a decisão.

### Etapa 8 — Documentar

Salve todas as decisões em:

```text
docs/stack_definida.md
```

---

# Estrutura obrigatória do documento

O arquivo:

```text
docs/stack_definida.md
```

deve conter pelo menos:

```markdown
# Stack Definida

## 1. Contexto

## 2. Referência arquitetural

## 3. Requisitos que influenciam a stack

## 4. Restrições arquiteturais

## 5. Stack final

## 6. Framework / Build

## 7. Linguagem

## 8. Gerenciamento de estado

## 9. Comunicação HTTP

## 10. API de clima

## 11. Estilização

## 12. Componentes de UI

## 13. Ícones

## 14. Gráficos

## 15. Datas e horários

## 16. Testes

## 17. Lint e formatação

## 18. Variáveis de ambiente

## 19. Build e deploy

## 20. Dependências

## 21. Estrutura inicial do projeto

## 22. Justificativas

## 23. Trade-offs

## 24. Riscos e limitações

## 25. Próximos passos
```

---

# Estrutura inicial do projeto

Com base na arquitetura e na stack escolhida, proponha a estrutura de diretórios inicial.

Por exemplo:

```text
src/
├── components/
├── features/
├── services/
├── hooks/
├── lib/
├── types/
├── utils/
└── ...
```

Porém, **não utilize essa estrutura obrigatoriamente**.

Ela é apenas um exemplo.

A estrutura final deve refletir a arquitetura documentada.

Explique brevemente a responsabilidade de cada diretório principal.

---

# Compatibilidade com os diagramas

A stack escolhida deve ser compatível com os diagramas existentes em:

```text
docs/diagrams/
```

Verifique especialmente:

- fluxo de dados;
- comunicação com API;
- separação de responsabilidades;
- componentes;
- estado;
- testes;
- sequência de busca de cidade.

Se a arquitetura disser que a UI não deve acessar diretamente a API, por exemplo, a implementação proposta deve respeitar essa regra.

---

# Princípios

Durante toda a definição, siga estes princípios:

1. Arquitetura primeiro, tecnologia depois.
2. Não redesenhar a arquitetura.
3. Não escolher tecnologia por popularidade.
4. Não adicionar dependências desnecessárias.
5. Priorizar simplicidade.
6. Priorizar baixo acoplamento.
7. Priorizar alta coesão.
8. Priorizar testabilidade.
9. Manter a solução proporcional ao escopo acadêmico.
10. Evitar overengineering.
11. Considerar performance, mas sem otimização prematura.
12. Manter a possibilidade de evolução futura.
13. Preferir ferramentas maduras e bem documentadas.
14. Toda dependência deve possuir uma responsabilidade clara.

---

# Resultado esperado

Ao terminar, devem existir:

```text
docs/
├── decisoes_arquiteturais.md
├── stack_definida.md
└── diagrams/
    ├── ...
```

Não altere:

```text
docs/decisoes_arquiteturais.md
```

nem os diagramas existentes, salvo se for estritamente necessário para corrigir uma inconsistência previamente identificada — nesse caso, não faça a alteração silenciosamente: documente o problema e explique a necessidade.

O resultado principal desta etapa deve ser:

```text
docs/stack_definida.md
```

Esse arquivo será a **fonte de verdade tecnológica do projeto** e será utilizado como referência nas próximas etapas de implementação.

Ao final, apresente um resumo contendo:

- stack escolhida;
- principais alternativas descartadas;
- justificativa das decisões;
- dependências principais;
- estrutura de projeto proposta;
- eventuais riscos;
- pontos que ainda precisam ser decididos.

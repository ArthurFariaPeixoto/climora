# Sequência — Busca de Cidade

Detalha a interação do fluxo principal: a pesquisa de uma cidade pelo usuário (com validação, consulta e adaptação) e a subsequente seleção da cidade, que dispara a consulta de clima até o dashboard atualizado.

```mermaid
sequenceDiagram
    autonumber
    actor Usuario as Usuário
    participant SB as SearchBar
    participant CS as use-city-search
    participant DB as use-weather
    participant Dash as WeatherDashboard
    participant DF as Data-fetching (consulta)
    participant Repo as Repositório (cidades/clima)
    participant HTTP as Cliente HTTP
    participant API as API externa
    participant Ad as Adaptadores

    Usuario->>SB: digita o nome da cidade
    SB->>CS: submete busca
    CS->>CS: valida termo (utils/validation)
    alt termo inválido ou vazio
        CS-->>SB: InvalidSearchError (sem requisição)
    else termo válido
        CS->>DF: consulta de cidades (chave = termo)
        DF-->>CS: estado da consulta (loading)
        DF->>Repo: fetcher buscarCidades(termo)
        Repo->>HTTP: GET /cities?q=termo
        HTTP->>API: requisição
        API-->>HTTP: resposta (DTO)
        HTTP-->>Repo: resposta / erro tipado
        Repo->>Ad: normaliza DTO → City[]
        Ad-->>Repo: City[]
        Repo-->>DF: resultado (cidades ou vazio)
        DF-->>CS: SUCCESS / EMPTY / ERROR
        CS-->>SB: traduz estados
        SB-->>Usuario: lista de resultados
    end

    Usuario->>SB: seleciona uma cidade
    SB->>Dash: onSelect(city)
    Dash->>DB: define cidade selecionada
    DB->>DF: consulta de clima (chave = city + escopo)
    alt cache hit
        DF-->>DB: dados prontos
    else cache miss
        DF-->>DB: estado loading (descarta/cancela obsoleta)
        DF->>Repo: fetcher obterClima(city)
        Repo->>HTTP: GET /weather?coords&scope
        HTTP->>API: requisição
        API-->>HTTP: DTO do clima/previsão
        HTTP-->>Repo: resposta / erro tipado
        Repo->>Ad: normaliza DTO → modelos
        Ad-->>Repo: CurrentWeather · Forecasts · HourlyForecast · DailyForecast
        Repo-->>DF: dados normalizados
        DF->>DF: cacheia (chave → dados)
        DF->>DB: descarta/ignora resposta obsoleta
    end
    DB-->>Dash: SUCCESS / ERROR / EMPTY (traduzido)
    Dash-->>Usuario: dashboard atualizado (widgets + estados)
```
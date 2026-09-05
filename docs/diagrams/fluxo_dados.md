# Fluxo de Dados

Mostra o pipeline completo de dados do dashboard, da busca de cidade pelo usuário até a exibição do clima nos widgets, passando pelas consultas da camada de data-fetching, repositórios, cliente HTTP e adaptadores.

```mermaid
flowchart LR
    DIG["Usuário digita o nome"] --> SB["SearchBar (estado local)"]
    SB -->|"submete"| CS["use-city-search"]
    CS -->|"valida · traduz LOADING"| CS
    CS -->|"consulta de cidades<br/>(chave = termo)"| Q1["Data-fetching<br/>(city-query)"]
    Q1 -->|"fetcher"| CREPO["Repositório de cidades"]
    CREPO -->|"endpoint + parâmetros"| HTTP1["Cliente HTTP"]
    HTTP1 --> APIA[("API externa — busca de cidades")]
    APIA -->|"DTO"| CREPO
    CREPO -->|"adapter DTO → City[]"| AD1["Adaptador de cidade"]
    AD1 -->|"City[]"| Q1
    Q1 -->|"SUCCESS / ERROR / EMPTY"| CS
    CS -->|"traduz estados"| SB
    SB -->|"lista de resultados"| U1["Usuário"]
    U1 -->|"seleciona a cidade"| WD["WeatherDashboard"]
    WD -->|"cidade selecionada"| W["use-weather"]
    W -->|"consulta de clima<br/>(chave = cidade + escopo)"| Q2["Data-fetching<br/>(weather-query)"]
    Q2 -->|"cache? hit → imediato"| Q2
    Q2 -->|"miss · descarta/cancela obsoleta"| WREPO["Repositório de clima"]
    WREPO -->|"endpoint + parâmetros"| HTTP2["Cliente HTTP"]
    HTTP2 --> APIB[("API externa — clima/previsão")]
    APIB -->|"DTO"| WREPO
    WREPO -->|"adapter DTO → modelos"| AD2["Adaptador de clima"]
    AD2 -->|"CurrentWeather · HourlyForecast · DailyForecast"| Q2
    Q2 -->|"SUCCESS / ERROR / EMPTY"| W
    W -->|"traduz estados + modelos"| DERIV["Selectors / formatters<br/>(utils/)"]
    DERIV -->|"dados prontos p/ exibição"| DASH["Dashboard (widgets weather + state)"]
```
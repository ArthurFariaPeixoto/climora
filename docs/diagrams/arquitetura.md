# Arquitetura de Camadas

Representa a arquitetura de camadas funcionais do projeto (apresentação, aplicação, dados e contrato de domínio) e as regras de dependência entre elas, incluindo a integração com a API externa de clima.

```mermaid
flowchart TB
    U["Usuário"] --> UI

    subgraph UI["Camada de Apresentação — app/ · components/"]
        C["Componentes de feature<br/>(search · weather)"]
        G["Componentes reutilizáveis<br/>(ui · state)"]
    end

    subgraph APP["Camada de Aplicação — hooks/ · utils/"]
        H["Hooks de feature (fachadas)<br/>(use-city-search · use-weather)"]
        DF["Camada de data-fetching<br/>(consultas · estados · cache)"]
        DER["Estado derivado<br/>(formatters · selectors)"]
    end

    subgraph DATA["Camada de Dados — services/"]
        REPO["Repositórios (fetchers)"]
        HTTP["Cliente HTTP + Endpoints"]
        ADAPTER["Adaptadores DTO → Modelo"]
    end

    subgraph DOM["Contrato de Domínio — models/"]
        MODEL["City · CurrentWeather · Forecasts"]
    end

    API["API externa de clima"]

    C --> G
    C --> DER
    C --> H
    H --> DF
    H --> MODEL
    DF --> REPO
    DF --> MODEL
    REPO --> HTTP
    REPO --> ADAPTER
    HTTP --> API
    ADAPTER --> MODEL
    REPO --> MODEL
```
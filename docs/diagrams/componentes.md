# Componentes

Apresenta os principais componentes da aplicação organizados por pasta (`app/`, `components/search/`, `components/state/`, `components/weather/` e `components/ui/`) e as relações de composição entre eles.

```mermaid
flowchart TB
    subgraph App["app/"]
        AppRoot["App"]
        Layout["DashboardLayout (grade responsiva)"]
        Dash["WeatherDashboard (estado elevado)"]
    end

    subgraph Search["components/search/"]
        SB["SearchBar"]
        SR["SearchResults"]
        SRI["SearchResultItem"]
    end

    subgraph StateC["components/state/"]
        Load["LoadingState"]
        Err["ErrorState (retry)"]
        Empty["EmptyState"]
    end

    subgraph Weather["components/weather/"]
        Cur["CurrentWeatherCard"]
        Met["MetricsGrid"]
        Hour["HourlyForecast"]
        Day["DailyForecast"]
        Chart["WeatherCharts"]
    end

    subgraph UI["components/ui/"]
        Card["Card"]
        Metric["MetricTile"]
        Btn["Button"]
        Skel["Skeleton"]
    end

    AppRoot --> Layout --> Dash
    Dash --> SB
    Dash --> SR
    SB --> SR
    SR --> SRI
    Dash --> Load
    Dash --> Err
    Dash --> Empty
    Dash --> Cur
    Dash --> Met
    Dash --> Hour
    Dash --> Day
    Dash --> Chart
    Cur --> Card
    Met --> Metric
    Hour --> Card
    Day --> Card
    Chart --> Card
    Load --> Skel
    Err --> Btn
```
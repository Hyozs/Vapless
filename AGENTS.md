# AGENTS.md â€” GuÃ­a de arquitectura para agentes de IA

**Proyecto:** `vapless.`
**Eslogan:** Menos vape. MÃ¡s vida.
**InstituciÃ³n:** Instituto TÃ©cnico Industrial Pascual Bravo â€” MedellÃ­n, Colombia
**Grado:** 10Â° de Bachillerato TÃ©cnico
**Equipo:** Juan Manuel Hoyos, Miguel Ãngel Buitrago, SimÃ³n Montoya Torres, Valery SofÃ­a RÃ­os, MarÃ­a JosÃ© Ãlvarez Montoya.
**Reto:** Hackathon Crack the Code â€” Entender el problema â†’ Inventar soluciÃ³n â†’ Construirla â†’ Contarla.

---

## 1. Resumen del proyecto

`vapless.` es una aplicaciÃ³n web progresiva (PWA) con API local para acompaÃ±ar la reducciÃ³n y el cese del vapeo en jÃ³venes de MedellÃ­n. Trabaja tres frentes:

1. **Mi salida (M4):** racha personal, registro de antojos (cravings), calculadora de dinero ahorrado en COP y nicotina evitada.
2. **Pulso y MedellÃ­n (M1 + M2):** encuesta anÃ³nima por comunas, mapa de riesgo explicable con k-anonimato (k = 5) y anÃ¡lisis psicosocial del vapeo escolar.
3. **Dojo (M3):** mazo de tarjetas "Hack al hÃ¡bito" con dinÃ¡mica de swipe (mito/realidad) y escenarios de presiÃ³n social con respuestas asertivas.

Principios de producto:

- Modo oscuro por defecto.
- Cero mensajes de culpa, miedo o castigo. Nunca usar rojo `#EF4444`.
- Voseo empoderador y cercano: "RespirÃ¡", "TÃº mandÃ¡s", "+ $X ahorrados".
- Privacidad de menores: sin nombres, correos, documentos ni geolocalizaciÃ³n precisa.
- Todo el progreso personal vive en `localStorage`; la API solo guarda agregados anÃ³nimos y datos locales de la instalaciÃ³n.

---

## 2. Stack tecnolÃ³gico

- **Lenguaje:** C# 13 / .NET 10.
- **API:** ASP.NET Core Web API (monolito modular, ejecuciÃ³n local).
- **Persistencia:** Entity Framework Core 10 + SQLite (`vapless.db`).
- **Frontend:** HTML5, CSS3 y JavaScript vanilla (sin frameworks ni build step), servido como archivos estÃ¡ticos por la API.
- **PWA:** `manifest.json` + Service Worker (`sw.js`) con estrategia network-first para `/api` y cache-first para estÃ¡ticos.
- **Diagramas:** Mermaid (documentaciÃ³n, no dependencia de runtime).
- **Sin cloud, sin Git remoto, sin ramas:** un solo equipo sobre una sola mÃ¡quina.

Paquetes relevantes:

- `Microsoft.EntityFrameworkCore.Sqlite` 10.0.0
- `Microsoft.EntityFrameworkCore.Design` 10.0.0 (opcional, para migraciones)
- `Microsoft.Extensions.DependencyInjection.Abstractions` 10.0.0

---

## 3. Arquitectura por capas (Clean Architecture)

```text
Vapless/
â”œâ”€â”€ AGENTS.md
â”œâ”€â”€ Vapless.slnx
â”œâ”€â”€ src/
â”‚   â”œâ”€â”€ Vapless.Domain/                    # NÃºcleo puro, sin dependencias externas
â”‚   â”‚   â”œâ”€â”€ Common/
â”‚   â”‚   â”‚   â”œâ”€â”€ BaseEntity.cs
â”‚   â”‚   â”‚   â””â”€â”€ ValueObject.cs
â”‚   â”‚   â”œâ”€â”€ Entities/
â”‚   â”‚   â”‚   â”œâ”€â”€ UserProgress.cs        # Racha, costo diario, nicotina base
â”‚   â”‚   â”‚   â”œâ”€â”€ Craving.cs               # Antojo registrado + disparador emocional
â”‚   â”‚   â”‚   â”œâ”€â”€ RiskSurvey.cs             # Encuesta anÃ³nima comunal
â”‚   â”‚   â”‚   â”œâ”€â”€ HackCard.cs                 # Tarjeta mito/realidad (M3)
â”‚   â”‚   â”‚   â”œâ”€â”€ SocialScenario.cs           # Escenario de presiÃ³n social
â”‚   â”‚   â”‚   â”œâ”€â”€ SupportHotline.cs           # Rutas de ayuda de MedellÃ­n
â”‚   â”‚   â”‚   â””â”€â”€ SchoolAirReading.cs         # Lectura sintÃ©tica de aire (M5)
â”‚   â”‚   â”œâ”€â”€ Enums/
â”‚   â”‚   â”‚   â”œâ”€â”€ ComunaMedellin.cs           # 16 comunas + 5 corregimientos + catÃ¡logo
â”‚   â”‚   â”‚   â”œâ”€â”€ DeviceType.cs               # Desechable, pod, mod + nicotina estimada
â”‚   â”‚   â”‚   â”œâ”€â”€ CravingIntensity.cs
â”‚   â”‚   â”‚   â”œâ”€â”€ EmotionalTrigger.cs         # Incluye contexto familiar
â”‚   â”‚   â”‚   â””â”€â”€ RiskLevel.cs                # Niveles + categorÃ­as de mazo
â”‚   â”‚   â”œâ”€â”€ Interfaces/
â”‚   â”‚   â”‚   â”œâ”€â”€ IRiskRule.cs                # Regla de riesgo explicable (OCP)
â”‚   â”‚   â”‚   â”œâ”€â”€ IRepositories.cs            # Repositorios + IUnitOfWork
â”‚   â”‚   â”‚   â””â”€â”€ ISavingsCalculator.cs       # CÃ¡lculo COP/nicotina + observadores
â”‚   â”‚   â””â”€â”€ Security/
â”‚   â”‚       â””â”€â”€ KAnonymityPolicy.cs         # k = 5
â”‚   â”‚
â”‚   â”œâ”€â”€ Vapless.Application/               # Casos de uso y orquestaciÃ³n
â”‚   â”‚   â”œâ”€â”€ DTOs/Dtos.cs
â”‚   â”‚   â”œâ”€â”€ Interfaces/Services.cs
â”‚   â”‚   â”œâ”€â”€ Interfaces/ISchoolAirGenerator.cs
â”‚   â”‚   â”œâ”€â”€ Services/                       # Craving, Savings, Profile, ComunaPulse,
â”‚   â”‚   â”‚                                   # PsychoSocial, Hack, Dojo, Support, SchoolAir
â”‚   â”‚   â”œâ”€â”€ RiskRules/                      # 6 reglas explicables de riesgo comunal
â”‚   â”‚   â”œâ”€â”€ Calculators/                    # SavingsCalculator + catÃ¡logo de metas COP
â”‚   â”‚   â”œâ”€â”€ Factories/                      # CravingInterventionFactory
â”‚   â”‚   â”œâ”€â”€ Strategies/                     # SwipeEvaluationStrategy + respuestas asertivas
â”‚   â”‚   â”œâ”€â”€ Events/                         # Publisher + observadores de craving
â”‚   â”‚   â””â”€â”€ DependencyInjection.cs          # AddApplication()
â”‚   â”‚
â”‚   â”œâ”€â”€ Vapless.Infrastructure/            # Implementaciones tÃ©cnicas
â”‚   â”‚   â”œâ”€â”€ Data/
â”‚   â”‚   â”‚   â”œâ”€â”€ VaplessDbContext.cs
â”‚   â”‚   â”‚   â””â”€â”€ DbSeeder.cs                  # Tarjetas, escenarios, lÃ­neas de ayuda,
â”‚   â”‚   â”‚                                   # 21 encuestas sintÃ©ticas, perfil demo
â”‚   â”‚   â”œâ”€â”€ Repositories/Repositories.cs
â”‚   â”‚   â”œâ”€â”€ Security/KAnonymityEvaluator.cs
â”‚   â”‚   â”œâ”€â”€ AirQuality/SchoolAirSimulator.cs # synthetic: true
â”‚   â”‚   â””â”€â”€ DependencyInjection.cs           # AddInfrastructure() + InitializeDatabaseAsync()
â”‚   â”‚
â”‚   â”œâ”€â”€ Vapless.Api/                        # PresentaciÃ³n HTTP
â”‚   â”‚   â”œâ”€â”€ Controllers/                     # /api/v1/*
â”‚   â”‚   â”œâ”€â”€ Middlewares/ExceptionHandlingMiddleware.cs
â”‚   â”‚   â”œâ”€â”€ Program.cs                       # DI, estÃ¡ticos, EnsureCreated + seed
â”‚   â”‚   â”œâ”€â”€ appsettings.json                 # ConnectionStrings:VaplessDb
â”‚   â”‚   â””â”€â”€ Properties/launchSettings.json   # http://localhost:5080
â”‚   â”‚
â”‚   â””â”€â”€ Vapless.Client/                     # PWA servida por la API
â”‚       â”œâ”€â”€ index.html
â”‚       â”œâ”€â”€ manifest.json
â”‚       â”œâ”€â”€ sw.js
â”‚       â”œâ”€â”€ assets/icon.svg
â”‚       â”œâ”€â”€ css/tokens.css
â”‚       â”œâ”€â”€ css/style.css
â”‚       â””â”€â”€ js/
â”‚           â”œâ”€â”€ api.js                       # Cliente fetch + utilidades de formato
â”‚           â”œâ”€â”€ app.js                       # NavegaciÃ³n, dashboard, perfil, toasts
â”‚           â”œâ”€â”€ craving.js                   # Temporizador 4-7-8 y registro de antojo
â”‚           â”œâ”€â”€ hack.js                      # Mazos swipe, XP y progreso local
â”‚           â””â”€â”€ pulse.js                     # Mapa, anÃ¡lisis, encuesta, apoyo, aire
```

Regla de dependencias: `Api â†’ Infrastructure â†’ Application â†’ Domain`. El `Client` solo habla con `/api/v1` y con `localStorage`.

ConfiguraciÃ³n de estÃ¡ticos: `Program.cs` resuelve `../Vapless.Client` desde el content root de la API. Si la carpeta no existe, registra un warning y la API sigue funcionando.

---

## 4. Convenciones de cÃ³digo

### C#

- `Nullable` e `ImplicitUsings` habilitados en todos los proyectos.
- Un tipo pÃºblico por archivo cuando sea posible; se permiten agrupaciones por feature (p. ej. `RiskRules.cs`).
- Entidades con propiedades `get; set;` y comportamiento de dominio en mÃ©todos (`DaysClean`, `CopSaved`, `NicotineAvoidedMg`).
- DTOs como `record` inmutables en `Vapless.Application.DTOs`.
- Controladores delgados: validan forma, delegan en servicios y devuelven DTOs.
- ValidaciÃ³n de reglas de negocio en Application; las excepciones se traducen a HTTP en `ExceptionHandlingMiddleware`:
  - `ArgumentOutOfRangeException` / `ArgumentException` â†’ 400.
  - `KeyNotFoundException` â†’ 404.
  - Cualquier otra â†’ 500 con mensaje neutro, sin stack trace.
- Comentarios solo cuando aporten intenciÃ³n; no comentar lo obvio.
- Nombres de clases, mÃ©todos y variables en inglÃ©s; textos de interfaz y contenido en espaÃ±ol con voseo.

### SOLID aplicado

- **SRP:** `SavingsCalculator`, `SavingsComparisonCatalog`, `KAnonymityEvaluator` y cada `IRiskRule` tienen una sola responsabilidad.
- **OCP:** nuevas reglas de riesgo se agregan implementando `IRiskRule` y registrÃ¡ndolas en DI, sin tocar `ComunaPulseService`.
- **LSP:** cualquier `IRiskRule` es sustituible dentro de `IEnumerable<IRiskRule>`.
- **ISP:** repositorios pequeÃ±os y separados (`ICravingRepository`, `ISurveyRepository`, `IHackCardRepository`, etc.).
- **DIP:** servicios dependen de interfaces de Domain/Application; Infrastructure implementa y se inyecta en `Program.cs`.

### Patrones de diseÃ±o

- **Strategy:** `IRiskRule`, `ICalculatorStrategy`, `ISwipeEvaluationStrategy`, `IAssertiveStrategy`.
- **Repository + Unit of Work:** acceso a SQLite desacoplado de Application.
- **Factory:** `ICravingInterventionFactory` elige la intervenciÃ³n segÃºn la intensidad (1â€“4).
- **Observer:** `ICravingEventPublisher` notifica a `StreakObserver`, `SavingsInsightObserver` y `TriggerCoachObserver` despuÃ©s de registrar un antojo.
- **DI nativa:** contenedor de ASP.NET Core, sin service locator.

### Frontend

- JavaScript en IIFE, sin mÃ³dulos ES ni bundler. Cada archivo expone un Ãºnico global (`VaplessApi`, `VaplessHack`, `VaplessCraving`, `VaplessPulse`, `VaplessToast`).
- Toda inserciÃ³n de texto proveniente de la API pasa por `VaplessUtils.escapeHtml`.
- Estado personal en `localStorage`:
  - `vapless.xp`: XP acumulado en el Dojo.
  - `vapless.completedDecks`: array JSON de categorÃ­as completadas.
- No se usan librerÃ­as de UI, Ã­conos externos ni emojis en la interfaz.
- Accesibilidad mÃ­nima: botones con `aria-label`, modal con `role="dialog"`, foco visible y cierre con `Escape`.

---

## 5. Sistema de diseÃ±o Vapless

### Tokens (en `css/tokens.css`)

| Token | Valor | Uso |
|---|---|---|
| `--vapless-bg` | `#0B0D12` | Fondo global |
| `--vapless-surface` | `#141821` | Tarjetas y superficies |
| `--vapless-surface-hover` | `#1C2230` | Hover de superficies |
| `--vapless-border` | `#232936` | Bordes y divisores |
| `--vapless-yellow` | `#FACC15` | CTA primario, rachas, punto del logo |
| `--vapless-orange` | `#F97316` | Exclusivo craving / alertas de impulso |
| `--vapless-green` | `#4ADE80` | Logros, ahorro, confirmaciones |
| `--vapless-text` | `#F8FAFC` | Texto principal |
| `--vapless-text-muted` | `#94A3B8` | Texto secundario |
| `--vapless-text-dim` | `#64748B` | Texto terciario |

**Prohibido:** rojo `#EF4444`, tonos de alarma y mensajes de culpa.

### TipografÃ­a

- `Poppins 800` para tÃ­tulos, cifras grandes y logo.
- `Inter 400/600` para cuerpo e interfaz.
- Fuentes locales en `assets/fonts/` (`inter-400.woff2`, `inter-600.woff2`, `poppins-800.woff2`) declaradas en `css/fonts.css`. Sin CDN ni peticiones externas.

### Componentes clave

- **Logo:** `vapless` en minÃºscula + punto amarillo.
- **Header sticky:** logo, eslogan y chip de racha.
- **BottomNav de 3 tabs:** Mi salida, Pulso, Dojo. Activo en amarillo con punto indicador.
- **BotÃ³n flotante naranja** "Siento ganas": abre el modal de respiraciÃ³n.
- **Tarjetas:** fondo `#141821`, borde `#232936`, radio 18â€“26 px.
- **Barras de progreso:** amarillas para racha/XP, verdes para ahorro y metas.
- **Badges de riesgo:** verde (bajo), amarillo (medio), naranja (alto y muy alto).

---

## 6. MÃ³dulos y mapeo de requisitos

| MÃ³dulo | Tier | ImplementaciÃ³n |
|---|---|---|
| Shared Kernel | â€” | Entidades, SQLite, `KAnonymityPolicy` (k = 5), calculadora COP/nicotina, rutas de ayuda |
| M1 Pulso Comunal | MUST | `POST /api/v1/surveys`, `GET /api/v1/surveys/risk-map`, reglas `IRiskRule` |
| M2 AnÃ¡lisis Psicosocial | MUST | `GET /api/v1/surveys/analysis`: familia, ansiedad, presiÃ³n social, inicio temprano, desechables |
| M3 Hack al HÃ¡bito + Dojo | SHOULD | Mazos swipe (`/api/v1/hack/*`) y escenarios asertivos (`/api/v1/dojo/scenarios`) |
| M4 Ruta de Salida | SHOULD | `/api/v1/cravings`, `/api/v1/progress/summary`, `/api/v1/progress` |
| M5 Aire Escolar | COULD | `/api/v1/school-air/metrics`, siempre `synthetic: true` |

### Reglas de riesgo (mÃ¡ximo 13 puntos â†’ Ã­ndice 0â€“10)

1. `R-FREQ` frecuencia diaria.
2. `R-NIC` nicotina estimada por dispositivo.
3. `R-AGE` inicio temprano con uso diario.
4. `R-FAM` contexto familiar (solo en casa, acudiente, un solo padre).
5. `R-EMO` disparador emocional (familia, ansiedad, presiÃ³n social, estrÃ©s, aburrimiento).
6. `R-SCH` uso dentro del colegio.

El Ã­ndice se calcula como `min(10, puntos / 13 * 10)` y se clasifica: bajo `< 2.5`, medio `< 5.0`, alto `< 7.5`, muy alto `>= 7.5`.

---

## 7. API REST (`/api/v1`)

| MÃ©todo | Ruta | DescripciÃ³n |
|---|---|---|
| `POST` | `/cravings` | Registra un antojo superado y devuelve racha, ahorro, nicotina e intervenciÃ³n |
| `GET` | `/cravings?profileId=1` | Historial de antojos |
| `GET` | `/progress/summary?profileId=` | Resumen financiero, nicotina evitada y metas |
| `GET` | `/progress?profileId=` | Perfil local actual |
| `PUT` | `/progress` | Actualiza fecha de inicio, costo, pods y dispositivo |
| `POST` | `/surveys` | Encuesta anÃ³nima comunal |
| `GET` | `/surveys/comunas` | CatÃ¡logo de comunas y corregimientos |
| `GET` | `/surveys/risk-map` | Mapa de riesgo con k-anonimato |
| `GET` | `/surveys/analysis` | Hallazgos psicosociales agregados |
| `GET` | `/hack/decks` | Mazos completos con tarjetas |
| `GET` | `/hack/decks/{category}` | Un mazo por categorÃ­a (1â€“4) |
| `POST` | `/hack/cards/{id}/answer` | EvalÃºa `answerIsMyth`, devuelve feedback, explicaciÃ³n y XP |
| `GET` | `/dojo/scenarios` | Escenarios de presiÃ³n social y 3 respuestas asertivas |
| `GET` | `/support/lines` | LÃ­neas de ayuda (LÃ­nea Amiga 106, 123, ICBF 141, psicoorientaciÃ³n) |
| `GET` | `/school-air/metrics` | Lecturas sintÃ©ticas de calidad del aire |
| `GET` | `/api/health` | Estado de la API |

Respuestas de error: `{ "error": "mensaje en espaÃ±ol" }`.

---

## 8. Privacidad y seguridad (Ley 1581 de 2012 y Ley 1098 de 2006)

- No se recolectan datos personales identificables de menores.
- La ubicaciÃ³n se limita a la comuna seleccionada manualmente; no hay GPS.
- Los agregados comunales solo se publican con `n >= 5`. Si no se cumple, la API devuelve `hasSufficientData: false`, Ã­ndice 0 y un mensaje de enmascaramiento.
- El progreso personal (XP, mazos completados, racha visible) se guarda en el navegador del estudiante.
- SQLite opera como archivo local (`vapless.db`); no hay servicios externos.
- Los textos de apoyo recuerdan que la LÃ­nea Amiga 106 y psicoorientaciÃ³n son confidenciales, no un reporte disciplinario.

---

## 9. Comandos de desarrollo

```powershell
# Restaurar y compilar
dotnet restore Vapless.slnx
dotnet build Vapless.slnx

# Ejecutar la API + PWA
dotnet run --project src/Vapless.Api

# La base SQLite se crea y se siembra automÃ¡ticamente al iniciar:
# - EnsureCreatedAsync()
# - DbSeeder.SeedAsync()
# Archivo resultante: src/Vapless.Api/vapless.db

# Migraciones (opcional si se reemplaza EnsureCreated por migraciones)
dotnet tool install --global dotnet-ef
dotnet ef migrations add InitialCreate --project src/Vapless.Infrastructure --startup-project src/Vapless.Api
dotnet ef database update --project src/Vapless.Infrastructure --startup-project src/Vapless.Api
```

URL local: `http://localhost:5080`

Datos de demostraciÃ³n sembrados: perfil con 12 dÃ­as de racha, 2 antojos de ejemplo, 24 tarjetas de Hack al HÃ¡bito, 6 escenarios de presiÃ³n social, 4 lÃ­neas de ayuda y 21 encuestas sintÃ©ticas en Robledo, La Candelaria, San Javier, Manrique y BelÃ©n. Las encuestas llevan `Synthetic = true` para no confundirlas con datos reales.

---

## 10. Reglas para futuras sesiones de IA

1. No romper la direcciÃ³n de dependencias entre capas.
2. No agregar paquetes, frameworks de frontend ni servicios cloud sin justificarlo.
3. Mantener el modo oscuro y la paleta; nunca introducir rojo ni mensajes de miedo.
4. Todo texto de cara al usuario va en espaÃ±ol con voseo.
5. Cualquier dato nuevo de menores debe pasar por la polÃ­tica de k-anonimato o quedarse en `localStorage`.
6. Si se agrega una regla de riesgo, implementar `IRiskRule` y registrarla en `AddApplication()`.
7. Si se agrega una dinÃ¡mica del Dojo, implementar una estrategia (`ISwipeEvaluationStrategy` o `IAssertiveStrategy`) en lugar de condicionales en los servicios.
8. Verificar siempre con `dotnet build Vapless.slnx` y probar `GET /api/health` antes de cerrar un cambio.
9. No ejecutar migraciones sobre una base con datos de demostraciÃ³n sin respaldo previo.
10. Mantener este archivo actualizado cuando cambie la arquitectura, la API o los tokens de diseÃ±o.





# AGENTS.md — Guía de arquitectura para agentes de IA

**Proyecto:** `vapless.`
**Eslogan:** Menos vape. Más vida.
**Institución:** Instituto Técnico Industrial Pascual Bravo — Medellín, Colombia
**Grado:** 10° de Bachillerato Técnico
**Equipo:** Juan Manuel Hoyos, Miguel Ángel Buitrago, Simón Montoya Torres, Valery Sofía Ríos, María José Álvarez Montoya.
**Reto:** Hackathon Crack the Code — Entender el problema → Inventar solución → Construirla → Contarla.

---

## 1. Resumen del proyecto

`vapless.` es una aplicación web progresiva (PWA) con API local para acompañar la reducción y el cese del vapeo en jóvenes de Medellín. Trabaja tres frentes:

1. **Mi salida (M4):** racha personal, registro de antojos (cravings), calculadora de dinero ahorrado en COP y nicotina evitada.
2. **Pulso y Medellín (M1 + M2):** encuesta anónima por comunas, mapa de riesgo explicable con k-anonimato (k = 5) y análisis psicosocial del vapeo escolar.
3. **Dojo (M3):** mazo de tarjetas "Hack al hábito" con dinámica de swipe (mito/realidad) y escenarios de presión social con respuestas asertivas.

Principios de producto:

- Modo oscuro por defecto, con modo claro opcional.
- Paleta mínima de máximo 3 colores base: amarillo `#FACC15` (acento), superficies `#0B0D12` / `#141821` y neutros `#E5E7EB` / `#232936`. El naranja `#F97316` solo aparece en el temporizador de Craving activo.
- Cero mensajes de culpa, miedo o castigo. Nunca usar rojo `#EF4444`, verdes fosforescentes, azules ni morados.
- Voseo empoderador y cercano: "Respirá", "Tú mandás", "+ $X ahorrados".
- Privacidad de menores: sin nombres, correos, documentos ni geolocalización precisa.
- Todo el progreso personal vive en `localStorage`; la API solo guarda agregados anónimos y datos locales de la instalación.

---

## 2. Stack tecnológico

- **Lenguaje:** C# 13 / .NET 10.
- **API:** ASP.NET Core Web API (monolito modular, ejecución local).
- **Persistencia:** Entity Framework Core 10 + SQLite (`vapless.db`).
- **Frontend:** HTML5, CSS3 y JavaScript vanilla (sin frameworks ni build step), servido como archivos estáticos por la API.
- **PWA:** `manifest.json` + Service Worker (`sw.js`) con estrategia network-first para `/api` y cache-first para estáticos.
- **Diagramas:** Mermaid (documentación, no dependencia de runtime).
- **Sin cloud, sin Git remoto, sin ramas:** un solo equipo sobre una sola máquina.

Paquetes relevantes:

- `Microsoft.EntityFrameworkCore.Sqlite` 10.0.0
- `Microsoft.EntityFrameworkCore.Design` 10.0.0 (opcional, para migraciones)
- `Microsoft.Extensions.DependencyInjection.Abstractions` 10.0.0

---

## 3. Arquitectura por capas (Clean Architecture)

```text
Vapless/
├── AGENTS.md
├── Vapless.slnx
├── src/
│   ├── Vapless.Domain/                    # Núcleo puro, sin dependencias externas
│   │   ├── Common/
│   │   │   ├── BaseEntity.cs
│   │   │   ├── PodProfile.cs                 # Catálogo de pods: mg, cigarrillos y COP
│   │   │   └── ValueObject.cs
│   │   ├── Entities/
│   │   │   ├── UserProgress.cs        # Racha, costo diario, nicotina base
│   │   │   ├── Craving.cs               # Antojo registrado + disparador emocional
│   │   │   ├── RiskSurvey.cs             # Encuesta anónima comunal
│   │   │   ├── HackCard.cs                 # Tarjeta mito/realidad (M3)
│   │   │   ├── SocialScenario.cs           # Escenario de presión social
│   │   │   └── SupportHotline.cs           # Rutas de ayuda de Medellín
│   │   ├── Enums/
│   │   │   ├── ComunaMedellin.cs           # 16 comunas + 5 corregimientos + catálogo
│   │   │   ├── DeviceType.cs               # Desechable, pod, mod + nicotina estimada
│   │   │   ├── CravingIntensity.cs
│   │   │   ├── EmotionalTrigger.cs         # Incluye contexto familiar
│   │   │   ├── AssessmentLevel.cs          # Leve / Moderado / Grave
│   │   │   ├── AssessmentDimension.cs      # Frecuencia, dependencia, control, entorno
│   │   │   └── RiskLevel.cs                # Niveles + categorías de mazo
│   │   ├── Interfaces/
│   │   │   ├── IRiskRule.cs                # Regla de riesgo explicable (OCP)
│   │   │   ├── IRepositories.cs            # Repositorios + IUnitOfWork
│   │   │   └── ISavingsCalculator.cs       # Cálculo COP/nicotina + observadores
│   │   └── Security/
│   │       └── KAnonymityPolicy.cs         # k = 5
│   │
│   ├── Vapless.Application/               # Casos de uso y orquestación
│   │   ├── DTOs/Dtos.cs
│   │   ├── Interfaces/Services.cs
│   │   ├── Assessments/AssessmentQuestionBank.cs # Banco de 10 preguntas del test
│   │   ├── Services/                       # Craving, Savings, Profile, ComunaPulse,
│   │   │                                   # PsychoSocial, Hack, Dojo, Support,
│   │   │                                   # Assessment, NicotineProfile
│   │   ├── RiskRules/                      # 6 reglas explicables de riesgo comunal
│   │   ├── Calculators/                    # SavingsCalculator, NicotineProfileCalculator,
│   │   │                                   # catálogo de metas COP
│   │   ├── Factories/                      # CravingInterventionFactory
│   │   ├── Strategies/                     # SwipeEvaluationStrategy + respuestas asertivas
│   │   ├── Events/                         # Publisher + observadores de craving
│   │   └── DependencyInjection.cs          # AddApplication()
│   │
│   ├── Vapless.Infrastructure/            # Implementaciones técnicas
│   │   ├── Data/
│   │   │   ├── VaplessDbContext.cs
│   │   │   └── DbSeeder.cs                  # Tarjetas, escenarios, líneas de ayuda,
│   │   │                                   # 21 encuestas sintéticas, perfil demo
│   │   ├── Repositories/Repositories.cs
│   │   ├── Security/KAnonymityEvaluator.cs
│   │   └── DependencyInjection.cs           # AddInfrastructure() + InitializeDatabaseAsync()
│   │
│   ├── Vapless.Api/                        # Presentación HTTP
│   │   ├── Controllers/                     # /api/v1/*
│   │   ├── Middlewares/ExceptionHandlingMiddleware.cs
│   │   ├── Program.cs                       # DI, estáticos, EnsureCreated + seed
│   │   ├── appsettings.json                 # ConnectionStrings:VaplessDb
│   │   └── Properties/launchSettings.json   # http://localhost:5080
│   │
│   └── Vapless.Client/                     # PWA servida por la API
│       ├── index.html
│       ├── manifest.json
│       ├── sw.js
│       ├── assets/icon.svg
│       ├── css/tokens.css                  # Tokens de los dos temas (oscuro y claro)
│       ├── css/style.css
│       └── js/
│           ├── api.js                       # Cliente fetch + utilidades de formato
│           ├── theme.js                     # Conmutador claro/oscuro + localStorage
│           ├── app.js                       # Navegación (topnav), dashboard, perfil, toasts
│           ├── accordion.js                 # Acordeones (análisis y rutas de apoyo)
│           ├── assessment.js                # Test psicosocial (10 preguntas) + derivación
│           ├── craving.js                   # Pantalla Craving: 4-4-4 / 4-7-8 indefinida + registro
│           ├── hack.js                      # Mazos swipe, XP y progreso local
│           └── pulse.js                     # Mapa, análisis, reporte Robledo, encuesta, apoyo
```

Regla de dependencias: `Api → Infrastructure → Application → Domain`. El `Client` solo habla con `/api/v1` y con `localStorage`.

Configuración de estáticos: `Program.cs` resuelve `../Vapless.Client` desde el content root de la API. Si la carpeta no existe, registra un warning y la API sigue funcionando.

---

## 4. Convenciones de código

### C#

- `Nullable` e `ImplicitUsings` habilitados en todos los proyectos.
- Un tipo público por archivo cuando sea posible; se permiten agrupaciones por feature (p. ej. `RiskRules.cs`).
- Entidades con propiedades `get; set;` y comportamiento de dominio en métodos (`DaysClean`, `CopSaved`, `NicotineAvoidedMg`).
- DTOs como `record` inmutables en `Vapless.Application.DTOs`.
- Controladores delgados: validan forma, delegan en servicios y devuelven DTOs.
- Validación de reglas de negocio en Application; las excepciones se traducen a HTTP en `ExceptionHandlingMiddleware`:
  - `ArgumentOutOfRangeException` / `ArgumentException` → 400.
  - `KeyNotFoundException` → 404.
  - Cualquier otra → 500 con mensaje neutro, sin stack trace.
- Comentarios solo cuando aporten intención; no comentar lo obvio.
- Nombres de clases, métodos y variables en inglés; textos de interfaz y contenido en español con voseo.

### SOLID aplicado

- **SRP:** `SavingsCalculator`, `SavingsComparisonCatalog`, `KAnonymityEvaluator` y cada `IRiskRule` tienen una sola responsabilidad.
- **OCP:** nuevas reglas de riesgo se agregan implementando `IRiskRule` y registrándolas en DI, sin tocar `ComunaPulseService`.
- **LSP:** cualquier `IRiskRule` es sustituible dentro de `IEnumerable<IRiskRule>`.
- **ISP:** repositorios pequeños y separados (`ICravingRepository`, `ISurveyRepository`, `IHackCardRepository`, etc.).
- **DIP:** servicios dependen de interfaces de Domain/Application; Infrastructure implementa y se inyecta en `Program.cs`.

### Patrones de diseño

- **Strategy:** `IRiskRule`, `ICalculatorStrategy`, `ISwipeEvaluationStrategy`, `IAssertiveStrategy`.
- **Repository + Unit of Work:** acceso a SQLite desacoplado de Application.
- **Factory:** `ICravingInterventionFactory` elige la intervención según la intensidad (1–4).
- **Observer:** `ICravingEventPublisher` notifica a `StreakObserver`, `SavingsInsightObserver` y `TriggerCoachObserver` después de registrar un antojo.
- **DI nativa:** contenedor de ASP.NET Core, sin service locator.

### Frontend

- JavaScript en IIFE, sin módulos ES ni bundler. Cada archivo expone un único global (`VaplessApi`, `VaplessTheme`, `VaplessHack`, `VaplessCraving`, `VaplessPulse`, `VaplessToast`, `VaplessAccordion`, `VaplessAssessment`).
- Navegación: una sola barra superior (`nav.topnav-tabs`) con todas las secciones visibles, sin menús anidados: Inicio, Craving / Ansiedad, Test Psicosocial, Dojo, Reporte Robledo, Rutas de Apoyo y Perfil. Cada pestaña es una vista (`section#view-<tab>`) y `showTab(tab)` en `app.js` alterna la vista, marca la pestaña activa (`is-active` + `aria-current="page"`) y desplaza la barra para dejarla visible en pantallas angostas.
- Tema: `data-theme="dark" | "light"` en `<html>`; `js/theme.js` aplica y persiste la preferencia en `localStorage` (`vapless.theme`). El script inline del `<head>` aplica el tema antes del primer pintado para evitar parpadeos.
- Toda inserción de texto proveniente de la API pasa por `VaplessUtils.escapeHtml`.
- **Todo usuario de Vapless es consumidor activo, exfumador en cesación o joven bajo presión real de consumo.** Por eso ninguna encuesta, formulario o test ofrece opciones tipo "Nunca he vapeado", "No uso", "Ninguno" o "0 veces": la escala arranca en el mínimo de consumo activo ("1 a 3 veces por semana", "Ocasional en fiestas", "Diario"). El banco de preguntas del test llega desde la API, así que `js/assessment.js` filtra en cliente las opciones que niegan el consumo (`NON_CONSUMER_OPTIONS` + `NON_CONSUMER_PATTERN`).
- Estado personal en `localStorage`:
  - `vapless.theme`: `dark` (predeterminado) o `light`.
  - `vapless.xp`: XP acumulado en el Dojo.
  - `vapless.completedDecks`: array JSON de categorías completadas.
- No se usan librerías de UI, íconos externos ni emojis en la interfaz.
- Accesibilidad mínima: botones con `aria-label`, modal con `role="dialog"`, foco visible y cierre con `Escape`.

---

## 5. Sistema de diseño Vapless

### Tokens (en `css/tokens.css`)

La paleta se declara una sola vez por tema. El modo oscuro vive en `:root` y el claro en `[data-theme="light"]`; el atributo se fija en `<html>`.

**Máximo 3 colores base:** un acento (amarillo), una superficie (fondo + tarjetas) y un neutro de texto/bordes. El naranja es la única excepción y solo se usa en el temporizador de Craving activo.

| Token | Modo oscuro | Modo claro | Uso |
|---|---|---|---|
| `--vapless-bg` | `#0B0D12` | `#F8FAFC` | Fondo de pantalla |
| `--vapless-surface` | `#141821` | `#FFFFFF` | Tarjetas y contenedores |
| `--vapless-surface-2` | `#1E2638` | `#F1F5F9` | Hover, chips y badges |
| `--vapless-border` | `#232936` | `#E2E8F0` | Bordes sutiles |
| `--vapless-text` | `#E5E7EB` | `#0F172A` | Texto principal |
| `--vapless-text-muted` | `#9CA3AF` | `#64748B` | Texto secundario y pestañas inactivas |
| `--vapless-text-dim` | `#6B7280` | `#64748B` | Placeholders y deshabilitados |
| `--vapless-yellow` | `#FACC15` | `#FACC15` | Acento único: CTA primario, racha, progreso |
| `--vapless-yellow-ink` | `#FACC15` | `#B45309` | Variante legible del acento sobre fondo claro |
| `--vapless-on-accent` | `#0B0D12` | `#0B0D12` | Texto sobre amarillo |
| `--vapless-orange` | `#F97316` | `#F97316` | Exclusivo del temporizador de Craving activo |

Tokens derivados: `--vapless-yellow-soft`, `--vapless-orange-ink`, `--vapless-field`, `--vapless-track`, `--vapless-soft-bg`, `--vapless-nav-bg`, `--vapless-app-bg`, `--vapless-divider`, `--vapless-skeleton-*` y las sombras neutras.

**Prohibido:** rojo `#EF4444`, verdes fosforescentes, azules, morados y cualquier otro color fuera de la paleta de 3 bases; también los gradientes de color y los fondos multicolores (solo superficies planas con borde `#232936`). El amarillo nunca ocupa un fondo completo salvo el CTA primario, el FAB y el tile de logro. Cero mensajes de culpa, miedo o castigo.

### Tipografía

- `Poppins 800` para títulos, cifras grandes y logo; `Poppins 600` para subtítulos.
- `Inter 400/500/600/800` para cuerpo e interfaz.
- Fuentes locales en `assets/fonts/` (`inter-var.woff2` variable 100–900, `poppins-600.woff2`, `poppins-800.woff2`) declaradas en `css/fonts.css`. Sin CDN ni peticiones externas.
- Escala tipográfica: 12 / 14 / 16 / 20 / 28 / 36 / 48 / 72 px.

### Formas y espaciado

- Radios: botones 12 px, tarjetas 16–20 px, modales 28 px, pills 999.
- Espaciado: solo la escala 4 / 8 / 12 / 16 / 20 / 24 / 40.
- Sombra de tarjeta: `0 8px 24px rgba(0,0,0,0.35)`.

### Componentes clave

- **Logo:** `vapless` en minúscula + punto amarillo (nunca existe la versión sin punto).
- **TopNav (barra superior sticky):** logo + eslogan, chip de racha ("N días vapeless") y conmutador de tema en la esquina superior derecha; debajo, la fila de pestañas con todas las secciones: Inicio, Craving / Ansiedad, Test Psicosocial, Dojo, Reporte Robledo, Rutas de Apoyo y Perfil. Fondo `#141821`, borde inferior `#232936`; la pestaña activa se marca **solo** con texto `#FACC15` y una línea inferior amarilla, y las demás quedan en neutro `#9CA3AF`. En pantallas angostas la fila se desplaza y la pestaña activa queda centrada.
- **Conmutador de tema:** botón circular con ícono de luna (modo oscuro) o sol (modo claro); alterna `data-theme` en `<html>` y guarda la preferencia en `localStorage` (`vapless.theme`).
- **Pantalla Craving:** estados `idle → respirando → completado`. El naranja `#F97316` aparece únicamente mientras el temporizador está en marcha (anillo de respiración, reloj y borde de la tarjeta); en reposo todo es neutro y el estado completado usa el acento amarillo.
- **Botón flotante "Siento ganas":** CTA principal en amarillo `#FACC15` con texto `#0B0D12`.
- **Tarjetas:** fondo `#141821` (oscuro) / `#FFFFFF` (claro), borde `#232936` / `#E2E8F0`, radio 18 px, padding 20 px, sin gradientes.
- **ProgressRing:** SVG con trazo amarillo de 8 px sobre track `#232936`; centro con número Poppins 800 y label en 10 px uppercase.
- **Tiles de logros:** 48×48, radio 12; desbloqueado con fondo amarillo, bloqueado con `#141821` y opacidad 0.35.
- **Barras de progreso:** amarillas (relleno sólido, sin degradado) para racha, XP, ahorro y metas.
- **Badges:** neutros (fondo `#1E2638`, borde `#232936`); solo `.badge.accent` usa el amarillo para marcar acciones.
- **Reporte por comuna (Robledo):** tarjeta con índice de riesgo, nivel, respuestas, k-anonimato, puesto entre comunas, disparadores más reportados (como chips) y razones explicables; se alimenta de `GET /api/v1/surveys/risk-map`.
- **Chips de disparadores (`.trigger-chip`):** cada disparador va en su propia píldora (fondo `#232936`, borde limpio, texto `#E5E7EB`) con el conteo en neutro. Las tarjetas de métricas usan `padding: 16px`, `min-height: fit-content` y `overflow: visible` para que el texto nunca se corte.
- **Acordeones (`js/accordion.js`):** secciones plegables de Vapless (tarjeta `#141821`, borde `#232936`, título en `#FACC15` con ícono +/−) para el análisis psicosocial y las rutas de apoyo local. Un grupo por sección: al abrir uno se cierran los demás.
- **Panel de nicotina:** recálculo en vivo (mg semanales, mg diarios, equivalente en cigarrillos, nicotina ingerida/evitada y ahorro en COP) a partir del tipo de pod y los pods por semana.

---

## 6. Módulos y mapeo de requisitos

| Módulo | Tier | Implementación |
|---|---|---|
| Shared Kernel | — | Entidades, SQLite, `KAnonymityPolicy` (k = 5), calculadora COP/nicotina, rutas de ayuda |
| M1 Pulso Comunal | MUST | `POST /api/v1/surveys`, `GET /api/v1/surveys/risk-map`, reglas `IRiskRule`; el cliente arma el Reporte Robledo con esos agregados |
| M2 Análisis Psicosocial | MUST | `GET /api/v1/surveys/analysis`: familia, ansiedad, presión social, inicio temprano, desechables |
| M3 Hack al Hábito + Dojo | SHOULD | Mazos swipe (`/api/v1/hack/*`) y escenarios asertivos (`/api/v1/dojo/scenarios`) |
| M4 Ruta de Salida | SHOULD | `/api/v1/cravings`, `/api/v1/progress/summary`, `/api/v1/progress`, `/api/v1/progress/nicotine` |
| M5 Autoevaluación Psicosocial | SHOULD | `GET /api/v1/assessment/questions` (banco de 10 preguntas) + `POST /api/v1/assessment/evaluate` con puntuación ponderada y clasificación Leve / Moderado / Grave |
| M6 Aire Escolar | ELIMINADO | El simulador de sensores y su endpoint `/api/v1/school-air/metrics` fueron removidos del backend y del cliente |

### Test psicosocial: puntuación ponderada

Dimensiones y pesos: `Frecuencia y horarios` 25 %, `Dependencia emocional` 30 %, `Control del consumo` 25 %, `Entorno y presión escolar` 20 %. Cada opción vale de 0 a 3; la dimensión se normaliza a 0–100 y el total es el promedio ponderado.

Clasificación: `Leve / Bajo` `< 30`, `Moderado` `30–59`, `Grave / Alerta Alta` `>= 60`. En el nivel Grave el resultado activa la tarjeta de prioridad alta con la Línea 106, la Línea 123 y el enlace directo a los acordeones de rutas de apoyo.

### Reglas de riesgo (máximo 13 puntos → índice 0–10)

1. `R-FREQ` frecuencia diaria.
2. `R-NIC` nicotina estimada por dispositivo.
3. `R-AGE` inicio temprano con uso diario.
4. `R-FAM` contexto familiar (solo en casa, acudiente, un solo padre).
5. `R-EMO` disparador emocional (familia, ansiedad, presión social, estrés, aburrimiento).
6. `R-SCH` uso dentro del colegio.

El índice se calcula como `min(10, puntos / 13 * 10)` y se clasifica: bajo `< 2.5`, medio `< 5.0`, alto `< 7.5`, muy alto `>= 7.5`.

---

## 7. API REST (`/api/v1`)

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/cravings` | Registra un antojo superado y devuelve racha, ahorro, nicotina e intervención |
| `GET` | `/cravings?profileId=1` | Historial de antojos |
| `GET` | `/progress/summary?profileId=` | Resumen financiero, nicotina evitada y metas |
| `GET` | `/progress?profileId=` | Perfil local actual |
| `PUT` | `/progress` | Actualiza fecha de inicio, costo, pods y dispositivo (el mg por pod se autoasigna según el tipo de pod) |
| `GET` | `/progress/nicotine?profileId=` | Cálculo de nicotina por pods: mg semanales, equivalente en cigarrillos, nicotina ingerida/evitada y ahorro en COP |
| `POST` | `/surveys` | Encuesta anónima comunal |
| `GET` | `/surveys/comunas` | Catálogo de comunas y corregimientos |
| `GET` | `/surveys/risk-map` | Mapa de riesgo con k-anonimato |
| `GET` | `/surveys/analysis` | Hallazgos psicosociales agregados |
| `GET` | `/hack/decks` | Mazos completos con tarjetas |
| `GET` | `/hack/decks/{category}` | Un mazo por categoría (1–4) |
| `POST` | `/hack/cards/{id}/answer` | Evalúa `answerIsMyth`, devuelve feedback, explicación y XP |
| `GET` | `/dojo/scenarios` | Escenarios de presión social y 3 respuestas asertivas |
| `GET` | `/support/lines` | Líneas de ayuda (Línea Amiga 106, 123, ICBF 141, psicoorientación) |
| `GET` | `/assessment/questions` | Banco de 10 preguntas del test psicosocial con sus opciones |
| `POST` | `/assessment/evaluate` | Evalúa las respuestas: score 0–100, nivel, dimensiones, recomendaciones y líneas de apoyo |
| `GET` | `/api/health` | Estado de la API |

Respuestas de error: `{ "error": "mensaje en español" }`.

---

## 8. Privacidad y seguridad (Ley 1581 de 2012 y Ley 1098 de 2006)

- No se recolectan datos personales identificables de menores.
- La ubicación se limita a la comuna seleccionada manualmente; no hay GPS.
- Los agregados comunales solo se publican con `n >= 5`. Si no se cumple, la API devuelve `hasSufficientData: false`, índice 0 y un mensaje de enmascaramiento.
- El progreso personal (XP, mazos completados, racha visible, tema claro/oscuro) se guarda en el navegador del estudiante.
- SQLite opera como archivo local (`vapless.db`); no hay servicios externos.
- Los textos de apoyo recuerdan que la Línea Amiga 106 y psicoorientación son confidenciales, no un reporte disciplinario.

---

## 9. Comandos de desarrollo

```powershell
# Restaurar y compilar
dotnet restore Vapless.slnx
dotnet build Vapless.slnx

# Ejecutar la API + PWA
dotnet run --project src/Vapless.Api

# La base SQLite se crea y se siembra automáticamente al iniciar:
# - EnsureCreatedAsync()
# - DbSeeder.SeedAsync()
# Archivo resultante: src/Vapless.Api/vapless.db

# Migraciones (opcional si se reemplaza EnsureCreated por migraciones)
dotnet tool install --global dotnet-ef
dotnet ef migrations add InitialCreate --project src/Vapless.Infrastructure --startup-project src/Vapless.Api
dotnet ef database update --project src/Vapless.Infrastructure --startup-project src/Vapless.Api
```

URL local: `http://localhost:5080`

Datos de demostración sembrados: perfil con 12 días de racha, 2 antojos de ejemplo, 24 tarjetas de Hack al Hábito, 6 escenarios de presión social, 4 líneas de ayuda y 21 encuestas sintéticas en Robledo, La Candelaria, San Javier, Manrique y Belén. Las encuestas llevan `Synthetic = true` para no confundirlas con datos reales.

---

## 10. Reglas para futuras sesiones de IA

1. No romper la dirección de dependencias entre capas.
2. No agregar paquetes, frameworks de frontend ni servicios cloud sin justificarlo.
3. Mantener el modo oscuro por defecto y la paleta de 3 colores base; nunca introducir rojo, verdes fosforescentes, azules, morados, gradientes de color ni mensajes de miedo.
4. Todo texto de cara al usuario va en español con voseo.
5. Cualquier dato nuevo de menores debe pasar por la política de k-anonimato o quedarse en `localStorage`.
6. Si se agrega una regla de riesgo, implementar `IRiskRule` y registrarla en `AddApplication()`.
7. Si se agrega una dinámica del Dojo, implementar una estrategia (`ISwipeEvaluationStrategy` o `IAssertiveStrategy`) en lugar de condicionales en los servicios.
8. Verificar siempre con `dotnet build Vapless.slnx` y probar `GET /api/health` antes de cerrar un cambio.
9. No ejecutar migraciones sobre una base con datos de demostración sin respaldo previo.
10. Mantener este archivo actualizado cuando cambie la arquitectura, la API o los tokens de diseño.
11. No reintroducir opciones de "nunca he vapeado / no uso / 0 veces" en ningún formulario, encuesta o test del cliente.





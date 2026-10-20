(function () {
  const utils = window.VaplessUtils;
  const api = window.VaplessApi;
  let toast = function () {};
  let onSupport = function () {};
  let catalogLoaded = false;

  function badgeClass(level) {
    if (level === "Bajo") {
      return "green";
    }
    if (level === "Medio") {
      return "yellow";
    }
    return "orange";
  }

  async function loadCatalog() {
    try {
      const comunas = await api.get("/surveys/comunas");
      const select = document.getElementById("survey-comuna");
      const current = select.value;
      select.innerHTML = comunas
        .map(function (comuna) {
          return '<option value="' + comuna.code + '">' + utils.escapeHtml(comuna.name) + "</option>";
        })
        .join("");
      if (current) {
        select.value = current;
      }
      catalogLoaded = true;
    } catch (error) {
      toast(error.message);
    }
  }

  async function loadRiskMap() {
    const container = document.getElementById("risk-map");
    const counter = document.getElementById("risk-count");

    try {
      const map = await api.get("/surveys/risk-map");
      counter.textContent = map.totalSurveys + " respuestas · k=" + map.kAnonymity;

      if (!map.comunas || !map.comunas.length) {
        container.innerHTML =
          '<p class="card-text">Todavía no hay respuestas. Sé de los primeros en sumar tu pulso anónimo.</p>';
        return;
      }

      const rows = map.comunas
        .map(function (comuna) {
          const enough = comuna.hasSufficientData;
          const width = enough ? Math.round((comuna.riskIndex / 10) * 100) : 0;
          const reasons =
            enough && comuna.explainableReasons && comuna.explainableReasons.length
              ? '<details class="comuna-reasons"><summary>¿Por qué este riesgo?</summary><ul>' +
                comuna.explainableReasons
                  .map(function (reason) {
                    return "<li>" + utils.escapeHtml(reason) + "</li>";
                  })
                  .join("") +
                "</ul></details>"
              : "";

          return (
            '<div class="comuna-row">' +
            '<div><div class="comuna-name">' + utils.escapeHtml(comuna.comunaName) + "</div>" +
            '<div class="comuna-meta">' +
            (enough ? comuna.totalResponses + " respuestas" : utils.escapeHtml(comuna.explainableReasons[0] || "Sin datos")) +
            "</div></div>" +
            '<span class="badge ' + (enough ? badgeClass(comuna.riskLevel) : "") + '">' +
            (enough ? utils.escapeHtml(comuna.riskLevel) + " · " + utils.formatNumber(comuna.riskIndex, 1) + "/10" : "Sin datos") +
            "</span>" +
            '<div class="progress"><span style="width: ' + width + '%"></span></div>' +
            reasons +
            "</div>"
          );
        })
        .join("");

      const triggers =
        map.topTriggers && map.topTriggers.length
          ? '<p class="card-text mt-12 dim small">Disparadores más reportados: ' +
            map.topTriggers.map(utils.escapeHtml).join(" · ") +
            "</p>"
          : "";

      container.innerHTML = rows + triggers;
    } catch (error) {
      container.innerHTML = '<p class="card-text">No pudimos cargar el mapa de riesgo.</p>';
      toast(error.message);
    }
  }

  async function loadAnalysis() {
    const container = document.getElementById("analysis-list");
    try {
      const analysis = await api.get("/surveys/analysis");
      if (!analysis.insights || !analysis.insights.length) {
        container.innerHTML = '<p class="card-text">Aún no hay muestra suficiente para leer la ciudad.</p>';
        return;
      }

      container.innerHTML = analysis.insights
        .map(function (insight) {
          return (
            '<div class="insight">' +
            "<h4>" + utils.escapeHtml(insight.title) + "</h4>" +
            "<p>" + utils.escapeHtml(insight.finding) + "</p>" +
            '<p class="rec">' + utils.escapeHtml(insight.recommendation) + "</p>" +
            "</div>"
          );
        })
        .join("");
    } catch (error) {
      container.innerHTML = '<p class="card-text">No pudimos cargar el análisis psicosocial.</p>';
    }
  }

  async function loadHotlines() {
    const container = document.getElementById("hotlines-list");
    try {
      const lines = await api.get("/support/lines");
      if (!lines || !lines.length) {
        container.innerHTML = '<p class="card-text">Todavía no hay líneas cargadas.</p>';
        return;
      }

      container.innerHTML = lines
        .map(function (line) {
          const numeric = /^\d+$/.test(line.phone);
          const phone = numeric
            ? '<a class="hotline-phone" href="tel:' + line.phone + '">' + utils.escapeHtml(line.phone) + "</a>"
            : '<span class="hotline-phone" style="font-size: 14px">' + utils.escapeHtml(line.phone) + "</span>";

          return (
            '<div class="hotline" style="padding: 12px 0; border-bottom: 1px dashed rgba(35,41,54,.9)">' +
            "<div>" +
            '<h3 class="card-title">' + utils.escapeHtml(line.name) + "</h3>" +
            '<p class="card-text">' + utils.escapeHtml(line.description) + "</p>" +
            '<p class="card-text dim small mt-8">' + utils.escapeHtml(line.schedule) + " · " + utils.escapeHtml(line.scope) + "</p>" +
            "</div>" +
            phone +
            "</div>"
          );
        })
        .join("");
    } catch (error) {
      container.innerHTML = '<p class="card-text">No pudimos cargar las líneas de apoyo.</p>';
    }
  }

  async function loadAir() {
    const container = document.getElementById("air-card");
    try {
      const readings = await api.get("/school-air/metrics");
      if (!readings || !readings.length) {
        container.innerHTML = '<p class="card-text">Sin lecturas por ahora.</p>';
        return;
      }

      const cells = readings
        .slice(0, 4)
        .map(function (reading) {
          return (
            '<div class="air-cell">' +
            '<div class="label">' + utils.escapeHtml(reading.zone) + "</div>" +
            '<div class="value">' + utils.formatNumber(reading.co2Ppm, 0) + " ppm CO₂</div>" +
            '<div class="label">' + utils.escapeHtml(reading.airQualityLabel) + " · PM2.5 " +
            utils.formatNumber(reading.pm25, 1) + "</div>" +
            "</div>"
          );
        })
        .join("");

      container.innerHTML =
        '<div class="air-grid">' + cells + "</div>" +
        '<p class="synthetic-note">synthetic: true · datos simulados para el prototipo escolar.</p>';
    } catch (error) {
      container.innerHTML = '<p class="card-text">No pudimos cargar el aire escolar.</p>';
    }
  }

  async function loadScenarios() {
    const container = document.getElementById("scenarios-list");
    try {
      const scenarios = await api.get("/dojo/scenarios");
      if (!scenarios || !scenarios.length) {
        container.innerHTML = '<div class="empty-card">Todavía no hay escenarios cargados.</div>';
        return;
      }

      container.innerHTML = scenarios
        .map(function (scenario) {
          const responses = (scenario.responses || [])
            .map(function (response) {
              return (
                '<button class="response" type="button">' +
                '<span class="strategy">' + utils.escapeHtml(response.strategy) + "</span>" +
                '<span class="text">' + utils.escapeHtml(response.text) + "</span>" +
                "</button>"
              );
            })
            .join("");

          return (
            '<div class="scenario">' +
            '<div class="section-head" style="margin-bottom: 4px">' +
            '<h3 class="card-title">' + utils.escapeHtml(scenario.title) + "</h3>" +
            '<span class="badge">' + utils.escapeHtml(scenario.trigger) + "</span>" +
            "</div>" +
            '<p class="card-text">' + utils.escapeHtml(scenario.context) + "</p>" +
            '<div class="peer">' + utils.escapeHtml(scenario.peerPhrase) + "</div>" +
            '<div class="responses">' + responses + "</div>" +
            "</div>"
          );
        })
        .join("");

      container.querySelectorAll(".scenario").forEach(function (card) {
        card.querySelectorAll(".response").forEach(function (button) {
          button.addEventListener("click", function () {
            card.querySelectorAll(".response").forEach(function (other) {
              other.classList.remove("is-selected");
            });
            button.classList.add("is-selected");
          });
        });
      });
    } catch (error) {
      container.innerHTML = '<div class="empty-card">No pudimos cargar los escenarios.</div>';
    }
  }

  function setupSurvey() {
    const form = document.getElementById("survey-form");
    form.addEventListener("submit", async function (event) {
      event.preventDefault();

      if (!catalogLoaded) {
        toast("Todavía estamos cargando las comunas. Probá en un segundo.");
        return;
      }

      const payload = {
        comunaCode: Number(document.getElementById("survey-comuna").value),
        age: Number(document.getElementById("survey-age").value),
        deviceType: Number(document.getElementById("survey-device").value),
        frequencyPerDay: Number(document.getElementById("survey-frequency").value),
        usesInSchool: document.getElementById("survey-school").checked,
        trigger: Number(document.getElementById("survey-trigger").value),
        familyContext: Number(document.getElementById("survey-family").value)
      };

      try {
        const result = await api.post("/surveys", payload);
        toast(result.message, "green");
        document.getElementById("survey-school").checked = false;
        await Promise.all([loadRiskMap(), loadAnalysis()]);
      } catch (error) {
        toast(error.message);
      }
    });
  }

  function init(options) {
    toast = (options && options.toast) || window.VaplessToast || toast;
    onSupport = (options && options.onSupport) || onSupport;

    setupSurvey();
    loadCatalog();
    loadRiskMap();
    loadAnalysis();
    loadHotlines();
    loadAir();
    loadScenarios();
  }

  window.VaplessPulse = { init, reload: loadRiskMap, goSupport: onSupport };
})();

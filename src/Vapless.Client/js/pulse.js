(function () {
  const utils = window.VaplessUtils;
  const api = window.VaplessApi;
  let toast = function () {};
  let onSupport = function () {};
  let catalogLoaded = false;

  /* Toda la inteligencia epidemiológica de Vapless es de la Comuna 7 - Robledo. */
  const ROBLEDO = "Robledo";

  function renderRobledoReport(map) {
    const container = document.getElementById("robledo-report");
    if (!container) {
      return;
    }

    const rows = map.comunas || [];
    const robledo = rows.find(function (comuna) {
      return comuna.comunaName === ROBLEDO;
    });

    if (!robledo) {
      container.innerHTML =
        '<div class="card-eyebrow">Robledo</div>' +
        '<p class="card-text">Todavía no hay respuestas de Robledo. Cuando la comuna reúna ' +
        map.kAnonymity +
        " respuestas, este reporte se activa solo.</p>";
      return;
    }

    if (!robledo.hasSufficientData) {
      container.innerHTML =
        '<div class="card-eyebrow">Robledo</div>' +
        '<p class="card-text">' +
        utils.escapeHtml(robledo.explainableReasons[0] || "Sin datos suficientes") +
        "</p>" +
        '<p class="form-note">Se necesitan al menos ' +
        map.kAnonymity +
        " respuestas anónimas para publicar el dato de la comuna.</p>";
      return;
    }

    const width = Math.round((robledo.riskIndex / 10) * 100);

    const reasons = (robledo.explainableReasons || [])
      .map(function (reason) {
        return "<li>" + utils.escapeHtml(reason) + "</li>";
      })
      .join("");

    container.innerHTML =
      '<div class="card-eyebrow">Reporte por comuna · Robledo</div>' +
      '<div class="report-head">' +
      '<div><div class="report-index">' +
      utils.formatNumber(robledo.riskIndex, 1) +
      "<small>/10</small></div>" +
      '<div class="card-text">Índice de riesgo del barrio</div></div>' +
      '<span class="badge">' +
      utils.escapeHtml(robledo.riskLevel) +
      " · " +
      utils.formatNumber(robledo.riskIndex, 1) +
      "/10</span>" +
      "</div>" +
      '<div class="progress"><span style="width: ' +
      width +
      '%"></span></div>' +
      '<div class="report-meta">' +
      '<div class="report-meta-item"><div class="report-meta-label">Respuestas de Robledo</div><div class="report-meta-value">' +
      robledo.totalResponses +
      "</div></div>" +
      '<div class="report-meta-item"><div class="report-meta-label">k-anonimato</div><div class="report-meta-value">' +
      map.kAnonymity +
      "</div></div>" +
      '<div class="report-meta-item"><div class="report-meta-label">Comuna</div><div class="report-meta-value">7 · Robledo</div></div>' +
      "</div>" +
      '<div class="card-eyebrow mt-16">Por qué este riesgo</div>' +
      '<ul class="report-reasons">' +
      reasons +
      "</ul>" +
      '<p class="form-note mt-8">Datos agregados y anónimos: nunca mostramos quién respondió.</p>';
  }

  async function loadCatalog() {
    try {
      const comunas = await api.get("/surveys/comunas");
      const select = document.getElementById("survey-comuna");
      const current = select.value;
      const robledo = comunas.filter(function (comuna) {
        return comuna.name === ROBLEDO;
      });

      select.innerHTML = (robledo.length ? robledo : [])
        .map(function (comuna) {
          return '<option value="' + comuna.code + '">' + utils.escapeHtml(comuna.name) + " (Comuna 7)</option>";
        })
        .join("");

      if (!select.options.length) {
        select.innerHTML = '<option value="7">Robledo (Comuna 7)</option>';
      }
      if (current) {
        select.value = current;
      }
      select.disabled = true;
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
      const robledo = (map.comunas || []).find(function (comuna) {
        return comuna.comunaName === ROBLEDO;
      });

      counter.textContent = robledo
        ? robledo.totalResponses + " respuestas de Robledo · k=" + map.kAnonymity
        : "Sin datos de Robledo · k=" + map.kAnonymity;

      if (!robledo) {
        container.innerHTML =
          '<p class="card-text">Todavía no hay respuestas de Robledo. Sé de los primeros en sumar tu pulso anónimo.</p>';
        renderRobledoReport(map);
        return;
      }

      const enough = robledo.hasSufficientData;
      const width = enough ? Math.round((robledo.riskIndex / 10) * 100) : 0;
      const reasons =
        enough && robledo.explainableReasons && robledo.explainableReasons.length
          ? '<details class="comuna-reasons"><summary>¿Por qué este riesgo?</summary><ul>' +
            robledo.explainableReasons
              .map(function (reason) {
                return "<li>" + utils.escapeHtml(reason) + "</li>";
              })
              .join("") +
            "</ul></details>"
          : "";

      container.innerHTML =
        '<div class="comuna-row is-focus">' +
        '<div><div class="comuna-name">' + utils.escapeHtml(robledo.comunaName) + " (Comuna 7)</div>" +
        '<div class="comuna-meta">' +
        (enough
          ? robledo.totalResponses + " respuestas"
          : utils.escapeHtml(robledo.explainableReasons[0] || "Sin datos")) +
        "</div></div>" +
        '<span class="badge">' +
        (enough
          ? utils.escapeHtml(robledo.riskLevel) + " · " + utils.formatNumber(robledo.riskIndex, 1) + "/10"
          : "Sin datos") +
        "</span>" +
        '<div class="progress"><span style="width: ' + width + '%"></span></div>' +
        reasons +
        "</div>";

      renderRobledoReport(map);
    } catch (error) {
      container.innerHTML = '<p class="card-text">No pudimos cargar el mapa de riesgo.</p>';
      toast(error.message);
    }
  }

  function renderAnalysisSummary(analysis) {
    const container = document.getElementById("analysis-summary");
    const counter = document.getElementById("analysis-count");
    const insights = analysis.insights || [];

    if (counter) {
      counter.textContent = insights.length + " categorías";
    }

    if (!container) {
      return;
    }

    const visibles = insights.filter(function (insight) {
      return insight.hasSufficientData;
    }).length;

    container.innerHTML =
      '<div class="card-eyebrow">Muestra analizada</div>' +
      '<div class="report-meta">' +
      '<div class="report-meta-item"><div class="report-meta-label">Respuestas</div>' +
      '<div class="report-meta-value">' + analysis.totalSurveys + "</div></div>" +
      '<div class="report-meta-item"><div class="report-meta-label">k-anonimato</div>' +
      '<div class="report-meta-value">' + analysis.kAnonymity + "</div></div>" +
      '<div class="report-meta-item"><div class="report-meta-label">Categorías visibles</div>' +
      '<div class="report-meta-value">' + visibles + " de " + insights.length + "</div></div>" +
      "</div>" +
      '<p class="form-note mt-8">Solo se publica lo que tiene 5 o más respuestas. Lo demás queda enmascarado.</p>';
  }

  async function loadAnalysis() {
    const container = document.getElementById("analysis-list");
    try {
      const analysis = await api.get("/surveys/analysis");
      renderAnalysisSummary(analysis);

      if (!analysis.insights || !analysis.insights.length) {
        container.innerHTML = '<p class="card-text">Aún no hay muestra suficiente para leer la ciudad.</p>';
        return;
      }

      const items = analysis.insights.map(function (insight, index) {
        const enough = insight.hasSufficientData;
        return {
          id: "analysis-" + index,
          title: insight.title,
          subtitle: enough ? "Dato visible en la muestra" : "Muestra insuficiente: dato enmascarado",
          badge: enough ? "Visible" : "Enmascarado",
          badgeClass: enough ? "accent" : "",
          content:
            '<div class="card-eyebrow analysis-eyebrow">Hallazgo</div>' +
            '<p class="analysis-finding">' + utils.escapeHtml(insight.finding) + "</p>" +
            '<div class="card-eyebrow analysis-eyebrow mt-12">Qué te recomendamos</div>' +
            '<p class="analysis-rec">' + utils.escapeHtml(insight.recommendation) + "</p>"
        };
      });

      window.VaplessAccordion.render(container, items, { group: "analysis" });
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

      const items = lines.map(function (line, index) {
        const numeric = /^\d+$/.test(line.phone);
        const phone = numeric
          ? '<a class="hotline-phone" href="tel:' + utils.escapeHtml(line.phone) + '">' + utils.escapeHtml(line.phone) + "</a>"
          : '<span class="hotline-phone" style="font-size: 14px">' + utils.escapeHtml(line.phone) + "</span>";

        return {
          id: "line-" + index,
          title: line.name,
          subtitle: line.schedule + " · " + line.scope,
          badge: numeric ? "Llamar ahora" : "Contacto",
          badgeClass: numeric ? "accent" : "",
          content:
            '<p class="card-text">' + utils.escapeHtml(line.description) + "</p>" +
            '<div class="btn-row mt-12">' +
            phone +
            '<a class="btn btn-ghost btn-small" href="tel:' + utils.escapeHtml(line.phone) + '">Llamar ' + utils.escapeHtml(line.phone) + "</a>" +
            "</div>"
        };
      });

      window.VaplessAccordion.render(container, items, { group: "support" });
    } catch (error) {
      container.innerHTML = '<p class="card-text">No pudimos cargar las líneas de apoyo.</p>';
    }
  }

  async function loadScenarios() {
    const container = document.getElementById("scenarios-list");
    try {
      const local = window.VaplessDojoData && window.VaplessDojoData.scenarios;
      const scenarios = local && local.length ? local : await api.get("/dojo/scenarios");

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
        toast(result.message, "accent");
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
    loadScenarios();
  }

  window.VaplessPulse = {
    init,
    reload: loadRiskMap,
    reloadAnalysis: loadAnalysis,
    goSupport: onSupport
  };
})();

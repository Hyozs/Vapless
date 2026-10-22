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

  function renderRobledoReport(map) {
    const container = document.getElementById("robledo-report");
    if (!container) {
      return;
    }

    const rows = map.comunas || [];
    const robledo = rows.find(function (comuna) {
      return comuna.comunaName === "Robledo";
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
    const visibles = rows
      .filter(function (comuna) {
        return comuna.hasSufficientData;
      })
      .sort(function (a, b) {
        return b.riskIndex - a.riskIndex;
      });
    const position = visibles.findIndex(function (comuna) {
      return comuna.comunaName === "Robledo";
    });

    const reasons = (robledo.explainableReasons || [])
      .map(function (reason) {
        return "<li>" + utils.escapeHtml(reason) + "</li>";
      })
      .join("");

    const triggers =
      map.topTriggers && map.topTriggers.length
        ? '<div class="report-meta-item"><div class="report-meta-label">Disparadores más reportados</div>' +
          '<div class="report-meta-value" style="font-size: 13px; font-weight: 600">' +
          utils.escapeHtml(map.topTriggers.join(" · ")) +
          "</div></div>"
        : "";

    container.innerHTML =
      '<div class="card-eyebrow">Reporte por comuna · Robledo</div>' +
      '<div class="report-head">' +
      '<div><div class="report-index">' +
      utils.formatNumber(robledo.riskIndex, 1) +
      "<small>/10</small></div>" +
      '<div class="card-text">Índice de riesgo del barrio</div></div>' +
      '<span class="badge ' +
      badgeClass(robledo.riskLevel) +
      '">' +
      utils.escapeHtml(robledo.riskLevel) +
      " · " +
      utils.formatNumber(robledo.riskIndex, 1) +
      "/10</span>" +
      "</div>" +
      '<div class="progress"><span style="width: ' +
      width +
      '%"></span></div>' +
      '<div class="report-meta">' +
      '<div class="report-meta-item"><div class="report-meta-label">Respuestas</div><div class="report-meta-value">' +
      robledo.totalResponses +
      "</div></div>" +
      '<div class="report-meta-item"><div class="report-meta-label">k-anonimato</div><div class="report-meta-value">' +
      map.kAnonymity +
      "</div></div>" +
      '<div class="report-meta-item"><div class="report-meta-label">Puesto entre comunas</div><div class="report-meta-value">' +
      (position >= 0 ? position + 1 : "—") +
      " de " +
      visibles.length +
      "</div></div>" +
      triggers +
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
      select.innerHTML = comunas
        .map(function (comuna) {
          return '<option value="' + comuna.code + '">' + utils.escapeHtml(comuna.name) + "</option>";
        })
        .join("");
      if (current) {
        select.value = current;
      }
      const robledo = comunas.find(function (comuna) {
        return comuna.name === "Robledo";
      });
      if (robledo) {
        select.value = String(robledo.code);
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
        renderRobledoReport(map);
        return;
      }

      const rows = map.comunas
        .map(function (comuna) {
          const enough = comuna.hasSufficientData;
          const width = enough ? Math.round((comuna.riskIndex / 10) * 100) : 0;
          const focus = comuna.comunaName === "Robledo" ? " is-focus" : "";
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
            '<div class="comuna-row' + focus + '">' +
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
      renderRobledoReport(map);
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

      const items = analysis.insights.map(function (insight, index) {
        const enough = insight.hasSufficientData;
        return {
          id: "analysis-" + index,
          title: insight.title,
          subtitle: enough ? "Dato visible para la ciudad" : "Muestra insuficiente: dato enmascarado",
          badge: enough ? "Visible" : "Enmascarado",
          badgeClass: enough ? "green" : "",
          content:
            '<p class="card-text">' + utils.escapeHtml(insight.finding) + "</p>" +
            '<p class="rec">' + utils.escapeHtml(insight.recommendation) + "</p>"
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
          badgeClass: numeric ? "green" : "",
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
    loadScenarios();
  }

  window.VaplessPulse = { init, reload: loadRiskMap, goSupport: onSupport };
})();

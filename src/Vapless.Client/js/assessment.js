(function () {
  const api = window.VaplessApi;
  const utils = window.VaplessUtils;

  let form;
  let questionsEl;
  let resultEl;
  let levelEl;
  let scoreEl;
  let resultTitleEl;
  let resultTextEl;
  let supportEl;
  let onSupport = function () {};
  let onDone = function () {};
  let toast = function (message) {
    if (window.VaplessToast) {
      window.VaplessToast(message);
    }
  };

  let questions = [];
  let loading = false;

  /* En Vapless todos son consumidores activos o exconsumidores: se descartan las
     opciones que niegan el consumo (el banco llega desde la API). */
  const NON_CONSUMER_OPTIONS = {
    "q-frecuencia": ["Nunca"],
    "q-dias": ["Ninguno"]
  };

  const NON_CONSUMER_PATTERN =
    /(nunca\s+(he\s+)?vape|ninguna\s+vez|no\s+consumo|no\s+uso\s+(el\s+)?vapeador|0\s+(veces|d[ií]as|episodios))/i;

  function isNonConsumerOption(question, option) {
    const label = (option && option.label) || "";
    const blocked = NON_CONSUMER_OPTIONS[question.id] || [];
    if (blocked.indexOf(label) >= 0) {
      return true;
    }
    return NON_CONSUMER_PATTERN.test(label);
  }

  function activeOptions(question) {
    const options = (question.options || []).filter(function (option) {
      return !isNonConsumerOption(question, option);
    });
    return options.length ? options : question.options || [];
  }

  function escape(value) {
    return utils ? utils.escapeHtml(value) : String(value);
  }

  function renderQuestions() {
    if (!questions.length) {
      questionsEl.innerHTML = '<p class="card-text">Cargando el test…</p>';
      return;
    }

    questionsEl.innerHTML = questions
      .map(function (question, index) {
        const options = activeOptions(question)
          .map(function (option, optionIndex) {
            return (
              '<label class="quiz-option">' +
              '<input type="radio" name="q-' +
              escape(question.id) +
              '" value="' +
              escape(option.id) +
              '"' +
              (optionIndex === 0 ? " required" : "") +
              " />" +
              "<span>" +
              escape(option.label) +
              "</span>" +
              "</label>"
            );
          })
          .join("");

        return (
          '<fieldset class="quiz-question" data-dimension="' +
          escape(question.dimensionLabel) +
          '">' +
          '<legend><span class="quiz-number">' +
          (index + 1) +
          "</span>" +
          "<span>" +
          escape(question.prompt) +
          '<em class="quiz-helper">' +
          escape(question.helper) +
          "</em></span>" +
          "</legend>" +
          '<div class="quiz-options">' +
          options +
          "</div>" +
          "</fieldset>"
        );
      })
      .join("");
  }

  async function loadQuestions() {
    if (questions.length || loading) {
      return;
    }

    loading = true;
    try {
      const data = await api.get("/assessment/questions");
      questions = data.questions || [];
      renderQuestions();
    } catch (error) {
      questionsEl.innerHTML =
        '<p class="card-text">No pudimos cargar el test. Revisá que la API local esté corriendo.</p>';
      toast(error.message);
    } finally {
      loading = false;
    }
  }

  function collectAnswers() {
    const answers = [];
    questions.forEach(function (question) {
      const selected = form.querySelector('input[name="q-' + question.id + '"]:checked');
      if (selected) {
        answers.push({ questionId: question.id, optionId: selected.value });
      }
    });
    return answers;
  }

  function dimensionRows(dimensions) {
    return (dimensions || [])
      .map(function (dimension) {
        const percent = Math.max(0, Math.min(100, dimension.score || 0));
        return (
          '<div class="dimension">' +
          '<div class="dimension-head">' +
          '<span class="dimension-label">' + escape(dimension.label) + "</span>" +
          '<span class="dimension-score">' + percent + "/100</span>" +
          "</div>" +
          '<div class="progress"><span style="width: ' + percent + '%"></span></div>' +
          '<p class="card-text mt-8">' + escape(dimension.finding) + "</p>" +
          "</div>"
        );
      })
      .join("");
  }

  function list(items, className) {
    if (!items || !items.length) {
      return "";
    }
    return (
      '<ul class="' +
      className +
      '">' +
      items
        .map(function (item) {
          return "<li>" + escape(item) + "</li>";
        })
        .join("") +
      "</ul>"
    );
  }

  function supportCard(result) {
    const lines = result.supportLines || [];
    const mental = lines.filter(function (line) {
      return line.phone.indexOf("106") >= 0 || line.name.toLowerCase().indexOf("amiga") >= 0;
    });
    const emergency = lines.filter(function (line) {
      return line.phone.indexOf("123") >= 0;
    });
    const others = lines.filter(function (line) {
      return mental.indexOf(line) < 0 && emergency.indexOf(line) < 0;
    });

    const calls = []
      .concat(mental)
      .concat(emergency)
      .map(function (line) {
        const numeric = /^\d+$/.test(line.phone);
        return (
          '<a class="btn ' +
          (numeric ? "btn-craving" : "btn-ghost") +
          '" href="tel:' +
          escape(line.phone) +
          '">Llamar ' +
          escape(line.phone) +
          "</a>"
        );
      })
      .join("");

    const othersHtml = others.length
      ? list(
          others.map(function (line) {
            return line.name + " · " + line.phone + " · " + line.description;
          }),
          "support-list"
        )
      : "";

    if (result.requiresSupport) {
      return (
        '<div class="support-card priority" data-level="grave">' +
        '<div class="card-eyebrow">Prioridad alta · derivación recomendada</div>' +
        "<h4>Esto ya pide acompañamiento psicosocial</h4>" +
        "<p>No lo vas a cargar solo. La Línea Amiga 106 da orientación psicológica confidencial en Medellín, 24/7, y la Línea 123 atiende urgencias de salud mental. Atendé el llamado hoy.</p>" +
        '<div class="btn-row">' +
        calls +
        '<button class="btn btn-ghost" type="button" data-action="support">Ver rutas de apoyo</button>' +
        "</div>" +
        othersHtml +
        "</div>"
      );
    }

    return (
      '<div class="support-card" data-level="' +
      (result.level === "Leve" ? "leve" : "moderado") +
      '">' +
      '<div class="card-eyebrow">Rutas de apoyo</div>' +
      "<p>Si en algún momento querés hablar con alguien, estas líneas están disponibles y son confidenciales.</p>" +
      '<div class="btn-row">' +
      calls +
      '<button class="btn btn-ghost" type="button" data-action="support">Ver rutas de apoyo</button>' +
      "</div>" +
      othersHtml +
      "</div>"
    );
  }

  function showResult(result) {
    const level = (result.level || "Leve").toLowerCase();
    resultEl.dataset.level = level;
    levelEl.textContent = result.levelLabel || result.level || "";
    scoreEl.textContent = String(result.score);
    resultTitleEl.textContent = result.headline || "";
    resultTextEl.textContent =
      (result.findings && result.findings.length
        ? result.findings.join(" ")
        : "Tus respuestas no muestran señales de riesgo alto.") + "";

    supportEl.innerHTML =
      '<div class="assessment-dimensions">' + dimensionRows(result.dimensions) + "</div>" +
      (result.recommendations && result.recommendations.length
        ? '<div class="card-eyebrow mt-16">Qué te recomendamos</div>' + list(result.recommendations, "recommendation-list")
        : "") +
      supportCard(result);

    const supportButton = supportEl.querySelector('[data-action="support"]');
    if (supportButton) {
      supportButton.addEventListener("click", function () {
        onSupport(result.level === "Grave" ? ["106", "123"] : null);
      });
    }

    form.classList.add("hidden");
    resultEl.classList.remove("hidden");
    resultEl.scrollTop = 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const answers = collectAnswers();
    if (answers.length < questions.length) {
      toast("Respondé las " + questions.length + " preguntas para ver tu resultado.");
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Calculando…";
    }

    try {
      const result = await api.post("/assessment/evaluate", { answers: answers });
      showResult(result);
    } catch (error) {
      toast(error.message);
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Ver mi resultado";
      }
    }
  }

  function reset() {
    form.reset();
    form.classList.remove("hidden");
    resultEl.classList.add("hidden");
    resultEl.removeAttribute("data-level");
    supportEl.innerHTML = "";
    form.querySelectorAll(".quiz-option").forEach(function (label) {
      label.classList.remove("is-checked");
    });
  }

  function open() {
    reset();
    loadQuestions();
  }

  function init(options) {
    onSupport = (options && options.onSupport) || onSupport;
    onDone = (options && options.onDone) || onDone;
    if (options && options.toast) {
      toast = options.toast;
    }

    form = document.getElementById("assessment-form");
    questionsEl = document.getElementById("assessment-questions");
    resultEl = document.getElementById("assessment-result");
    levelEl = document.getElementById("assessment-level");
    scoreEl = document.getElementById("assessment-score");
    resultTitleEl = document.getElementById("assessment-result-title");
    resultTextEl = document.getElementById("assessment-result-text");
    supportEl = document.getElementById("assessment-support");

    form.addEventListener("submit", handleSubmit);
    form.addEventListener("change", function () {
      form.querySelectorAll(".quiz-option").forEach(function (label) {
        const input = label.querySelector("input");
        label.classList.toggle("is-checked", Boolean(input && input.checked));
      });
    });

    document.getElementById("assessment-retry").addEventListener("click", function () {
      reset();
      form.scrollTop = 0;
    });

    document.getElementById("assessment-done").addEventListener("click", function () {
      onDone();
    });
  }

  window.VaplessAssessment = { init, open };
})();

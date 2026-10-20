(function () {
  const TECHNIQUES = {
    square: {
      id: "square",
      label: "Respiración Cuadrada 4-4-4",
      purpose: "Ansiedad e impulsos de consumo en tiempo real",
      strategy: "RespiracionCuadrada444",
      instruction:
        "Inhalá 4 segundos por la nariz, sostené 4 sin moverte y exhalá 4 por la boca. El ritmo cuadrado baja la señal de alarma del cuerpo.",
      phases: [
        { name: "Inhalá", seconds: 4 },
        { name: "Sostené", seconds: 4 },
        { name: "Exhalá", seconds: 4 }
      ]
    },
    sleep: {
      id: "sleep",
      label: "Respiración Guiada para Dormir 4-7-8",
      purpose: "Relajación profunda y conciliar el sueño",
      strategy: "Respiracion478",
      instruction:
        "Inhalá 4 segundos, sostené 7 y exhalá 8 por la boca. Es la técnica de Harvey Karp: el cuerpo baja el ritmo y se prepara para dormir.",
      phases: [
        { name: "Inhalá", seconds: 4 },
        { name: "Retené", seconds: 7 },
        { name: "Soltá", seconds: 8 }
      ]
    }
  };

  const CIRCUMFERENCE = 596.9;

  let card;
  let bar;
  let phaseEl;
  let countEl;
  let cyclesEl;
  let hintEl;
  let elapsedEl;
  let minutesEl;
  let startBtn;
  let stopBtn;
  let logEl;
  let resultEl;
  let resultTitle;
  let resultText;
  let resultMessages;
  let technique = TECHNIQUES.square;
  let state = "idle";
  let intensity = 1;
  let timer = null;
  let clockTimer = null;
  let phaseIndex = 0;
  let remaining = TECHNIQUES.square.phases[0].seconds;
  let cycle = 1;
  let startedAt = 0;
  let saved = false;
  let onSaved = function () {};
  let onSupport = function () {};

  function setRing(progress) {
    bar.style.strokeDashoffset = String(CIRCUMFERENCE * (1 - Math.min(1, Math.max(0, progress))));
  }

  function paint() {
    const phase = technique.phases[phaseIndex];
    phaseEl.textContent = phase.name;
    countEl.textContent = String(remaining);
    cyclesEl.textContent = "Ciclo " + cycle;
    setRing((phase.seconds - remaining) / phase.seconds);
  }

  function tick() {
    remaining -= 1;
    if (remaining <= 0) {
      phaseIndex += 1;
      if (phaseIndex >= technique.phases.length) {
        phaseIndex = 0;
        cycle += 1;
      }
      remaining = technique.phases[phaseIndex].seconds;
    }
    paint();
  }

  function startBreathing() {
    stopBreathing();
    phaseIndex = 0;
    cycle = 1;
    remaining = technique.phases[0].seconds;
    paint();
    timer = setInterval(tick, 1000);
  }

  function stopBreathing() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  function formatClock(totalSeconds) {
    const safe = Math.max(0, totalSeconds);
    const minutes = String(Math.floor(safe / 60)).padStart(2, "0");
    const seconds = String(safe % 60).padStart(2, "0");
    return minutes + ":" + seconds;
  }

  function paintClock() {
    const elapsed = Math.floor((Date.now() - startedAt) / 1000);
    elapsedEl.textContent = formatClock(elapsed);
    minutesEl.textContent = String(Math.floor(elapsed / 60));
  }

  function startClock() {
    stopClock();
    paintClock();
    clockTimer = setInterval(paintClock, 1000);
  }

  function stopClock() {
    if (clockTimer) {
      clearInterval(clockTimer);
      clockTimer = null;
    }
  }

  function setState(next) {
    state = next;
    card.classList.remove("is-respirando", "is-completado");

    if (next === "respirando") {
      card.classList.add("is-respirando");
      startBtn.classList.add("hidden");
      stopBtn.classList.remove("hidden");
      logEl.classList.add("hidden");
      resultEl.classList.add("hidden");
      return;
    }

    if (next === "completado") {
      card.classList.add("is-completado");
      startBtn.classList.add("hidden");
      stopBtn.classList.add("hidden");
      logEl.classList.remove("hidden");
      return;
    }

    startBtn.classList.remove("hidden");
    stopBtn.classList.add("hidden");
    logEl.classList.add("hidden");
    resultEl.classList.add("hidden");
  }

  function applyTechnique(next) {
    technique = next;
    document.querySelectorAll(".technique").forEach(function (button) {
      const active = button.dataset.technique === technique.id;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-selected", active ? "true" : "false");
    });
    hintEl.textContent = technique.instruction;

    if (state === "respirando") {
      startBreathing();
    } else {
      phaseIndex = 0;
      remaining = technique.phases[0].seconds;
      phaseEl.textContent = technique.phases[0].name;
      countEl.textContent = String(technique.phases[0].seconds);
      cyclesEl.textContent = "Listo para empezar";
      setRing(0);
    }
  }

  function start() {
    saved = false;
    startedAt = Date.now();
    setState("respirando");
    startBreathing();
    startClock();
  }

  function stop() {
    stopBreathing();
    stopClock();
    setState("completado");
    phaseEl.textContent = "Completado";
    countEl.textContent = "✓";
    cyclesEl.textContent = "Lo superaste";
    setRing(1);
  }

  function reset() {
    stopBreathing();
    stopClock();
    saved = false;
    startedAt = 0;
    elapsedEl.textContent = "00:00";
    minutesEl.textContent = "0";
    intensity = 1;
    document.querySelectorAll(".intensity").forEach(function (button) {
      button.classList.toggle("is-active", button.dataset.intensity === "1");
    });
    setState("idle");
    applyTechnique(technique);
  }

  async function save() {
    if (saved) {
      return;
    }

    const seconds = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
    const minutes = Math.max(1, Math.round(seconds / 60));
    const trigger = Number(document.getElementById("craving-trigger").value);

    const doneBtn = document.getElementById("craving-done");
    doneBtn.disabled = true;
    doneBtn.textContent = "Guardando…";

    try {
      const result = await window.VaplessApi.post("/cravings", {
        intensity: intensity,
        minutesResisted: minutes,
        strategyUsed: technique.strategy,
        trigger: trigger
      });

      saved = true;
      resultTitle.textContent = result.headline;
      resultText.textContent = technique.instruction;
      resultMessages.innerHTML = (result.messages || [])
        .map(function (message) {
          return "<li>" + window.VaplessUtils.escapeHtml(message) + "</li>";
        })
        .join("");
      resultEl.classList.remove("hidden");
      resultEl.classList.add("is-green");
      logEl.classList.add("hidden");
      doneBtn.textContent = "Registrar mi antojo";
      doneBtn.disabled = false;
      onSaved(result);
    } catch (error) {
      doneBtn.disabled = false;
      doneBtn.textContent = "Registrar mi antojo";
      window.VaplessToast(error.message);
    }
  }

  function init(options) {
    onSaved = (options && options.onSaved) || onSaved;
    onSupport = (options && options.onSupport) || onSupport;

    card = document.getElementById("craving-card");
    bar = document.getElementById("breath-bar");
    phaseEl = document.getElementById("breath-phase");
    countEl = document.getElementById("breath-count");
    cyclesEl = document.getElementById("breath-cycles");
    hintEl = document.getElementById("technique-hint");
    elapsedEl = document.getElementById("craving-elapsed");
    minutesEl = document.getElementById("craving-minutes");
    startBtn = document.getElementById("craving-start");
    stopBtn = document.getElementById("craving-stop");
    logEl = document.getElementById("craving-log");
    resultEl = document.getElementById("craving-result");
    resultTitle = document.getElementById("craving-result-title");
    resultText = document.getElementById("craving-result-text");
    resultMessages = document.getElementById("craving-result-messages");

    startBtn.addEventListener("click", start);
    stopBtn.addEventListener("click", stop);
    document.getElementById("craving-reset").addEventListener("click", reset);
    document.getElementById("craving-done").addEventListener("click", save);

    document.getElementById("craving-support").addEventListener("click", function () {
      onSupport();
    });

    document.querySelectorAll(".intensity").forEach(function (button) {
      button.addEventListener("click", function () {
        intensity = Number(button.dataset.intensity);
        document.querySelectorAll(".intensity").forEach(function (other) {
          other.classList.remove("is-active");
        });
        button.classList.add("is-active");
      });
    });

    document.querySelectorAll(".technique").forEach(function (button) {
      button.addEventListener("click", function () {
        const next = TECHNIQUES[button.dataset.technique];
        if (next) {
          applyTechnique(next);
        }
      });
    });

    applyTechnique(technique);
  }

  window.VaplessCraving = { init, start, stop, reset };
})();

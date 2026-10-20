(function () {
  const PHASES = [
    { name: "InhalÃ¡", seconds: 4 },
    { name: "RetenÃ©", seconds: 7 },
    { name: "SoltÃ¡", seconds: 8 }
  ];
  const CYCLES = 4;
  const CIRCUMFERENCE = 596.9;
  const CRAVING_SECONDS = 180;

  let modal;
  let bar;
  let phaseEl;
  let countEl;
  let cyclesEl;
  let doneBtn;
  let resultBox;
  let resultTitle;
  let resultText;
  let resultMessages;
  let intensity = 1;
  let timer = null;
  let clockTimer = null;
  let elapsedEl;
  let remainingEl;
  let phaseIndex = 0;
  let remaining = PHASES[0].seconds;
  let cycle = 1;
  let openedAt = 0;
  let saved = false;
  let onSaved = function () {};
  let onSupport = function () {};

  function setRing(progress) {
    bar.style.strokeDashoffset = String(CIRCUMFERENCE * (1 - Math.min(1, Math.max(0, progress))));
  }

  function paint() {
    const phase = PHASES[phaseIndex];
    phaseEl.textContent = phase.name;
    countEl.textContent = String(remaining);
    cyclesEl.textContent = "Ciclo " + cycle + " de " + CYCLES;
    setRing((phase.seconds - remaining) / phase.seconds);
  }

  function tick() {
    remaining -= 1;
    if (remaining <= 0) {
      phaseIndex += 1;
      if (phaseIndex >= PHASES.length) {
        phaseIndex = 0;
        cycle += 1;
        if (cycle > CYCLES) {
          finishBreathing();
          return;
        }
      }
      remaining = PHASES[phaseIndex].seconds;
    }
    paint();
  }

  function startBreathing() {
    stopBreathing();
    phaseIndex = 0;
    cycle = 1;
    remaining = PHASES[0].seconds;
    paint();
    timer = setInterval(tick, 1000);
  }

  function stopBreathing() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  function finishBreathing() {
    stopBreathing();
    phaseEl.textContent = "Listo";
    countEl.textContent = "0";
    cyclesEl.textContent = "RespirÃ¡ tranquilo";
    setRing(1);
  }

  function formatClock(totalSeconds) {
    const safe = Math.max(0, totalSeconds);
    const minutes = String(Math.floor(safe / 60)).padStart(2, "0");
    const seconds = String(safe % 60).padStart(2, "0");
    return minutes + ":" + seconds;
  }

  function paintClock() {
    const elapsed = Math.floor((Date.now() - openedAt) / 1000);
    elapsedEl.textContent = formatClock(elapsed);
    remainingEl.textContent = formatClock(CRAVING_SECONDS - elapsed);
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

  function reset() {
    stopBreathing();
    saved = false;
    openedAt = Date.now();
    startClock();
    resultBox.classList.add("hidden");
    doneBtn.disabled = false;
    doneBtn.textContent = "Ya pasÃ³, lo superÃ©";
    resultMessages.innerHTML = "";
    intensity = 1;
    document.querySelectorAll(".intensity").forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.intensity === "1");
    });
    startBreathing();
  }

  function open() {
    modal.classList.add("is-open");
    reset();
  }

  function close() {
    modal.classList.remove("is-open");
    stopBreathing();
    stopClock();
  }

  async function save() {
    if (saved) {
      close();
      return;
    }

    const seconds = Math.max(1, Math.round((Date.now() - openedAt) / 1000));
    const minutes = Math.max(1, Math.round(seconds / 60));
    const trigger = Number(document.getElementById("craving-trigger").value);

    doneBtn.disabled = true;
    doneBtn.textContent = "Guardandoâ€¦";

    try {
      const result = await window.VaplessApi.post("/cravings", {
        intensity: intensity,
        minutesResisted: minutes,
        strategyUsed: "Respiracion478",
        trigger: trigger
      });

      saved = true;
      resultTitle.textContent = result.headline;
      resultText.textContent = result.intervention.instructions;
      resultMessages.innerHTML = (result.messages || [])
        .map((message) => "<li>" + window.VaplessUtils.escapeHtml(message) + "</li>")
        .join("");
      resultBox.classList.remove("hidden");
      doneBtn.textContent = "Cerrar";
      doneBtn.disabled = false;
      onSaved(result);
    } catch (error) {
      doneBtn.disabled = false;
      doneBtn.textContent = "Ya pasÃ³, lo superÃ©";
      window.VaplessToast(error.message);
    }
  }

  function init(options) {
    onSaved = (options && options.onSaved) || onSaved;
    onSupport = (options && options.onSupport) || onSupport;

    modal = document.getElementById("craving-modal");
    bar = document.getElementById("breath-bar");
    phaseEl = document.getElementById("breath-phase");
    countEl = document.getElementById("breath-count");
    cyclesEl = document.getElementById("breath-cycles");
    doneBtn = document.getElementById("craving-done");
    resultBox = document.getElementById("craving-result");
    resultTitle = document.getElementById("craving-result-title");
    resultText = document.getElementById("craving-result-text");
    resultMessages = document.getElementById("craving-result-messages");
    elapsedEl = document.getElementById("craving-elapsed");
    remainingEl = document.getElementById("craving-remaining");

    ["craving-fab", "craving-open"].forEach(function (id) {
      const button = document.getElementById(id);
      if (button) {
        button.addEventListener("click", open);
      }
    });
    document.getElementById("craving-close").addEventListener("click", close);
    doneBtn.addEventListener("click", save);

    document.getElementById("craving-support").addEventListener("click", function () {
      close();
      onSupport();
    });

    document.querySelectorAll(".intensity").forEach((btn) => {
      btn.addEventListener("click", function () {
        intensity = Number(btn.dataset.intensity);
        document.querySelectorAll(".intensity").forEach((other) => other.classList.remove("is-active"));
        btn.classList.add("is-active");
      });
    });

    modal.addEventListener("click", function (event) {
      if (event.target === modal) {
        close();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && modal.classList.contains("is-open")) {
        close();
      }
    });
  }

  window.VaplessCraving = { init, open, close };
})();


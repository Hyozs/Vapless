(function () {
  const RING_CIRCUMFERENCE = 540.35;
  const RING_CYCLE_DAYS = 30;

  const POD_PROFILES = {
    0: { name: "No usa", mg: 0, cigs: 0, cost: 0, range: "0 mg" },
    1: { name: "Desechable", mg: 50, cigs: 50, cost: 15000, range: "20-50 mg" },
    2: { name: "Pod recargable", mg: 30, cigs: 30, cost: 25000, range: "20-40 mg" },
    3: { name: "Mod / caja", mg: 20, cigs: 20, cost: 40000, range: "10-30 mg" }
  };

  const ACHIEVEMENTS = [
    { days: 7, label: "7 días" },
    { days: 14, label: "14 días" },
    { days: 30, label: "30 días" },
    { days: 90, label: "90 días" }
  ];

  let toastTimer = null;
  let currentDays = 0;
  let costTouched = false;

  const utils = window.VaplessUtils;
  const api = window.VaplessApi;

  function toast(message, kind) {
    const element = document.getElementById("toast");
    element.textContent = message;
    element.className = "toast is-visible" + (kind === "green" ? " green" : "");
    if (toastTimer) {
      clearTimeout(toastTimer);
    }
    toastTimer = setTimeout(function () {
      element.classList.remove("is-visible");
    }, 3600);
  }

  window.VaplessToast = toast;

  function showTab(tab, scroll) {
    document.querySelectorAll(".view").forEach(function (view) {
      view.classList.toggle("is-active", view.id === "view-" + tab);
    });
    document.querySelectorAll(".topnav-tab").forEach(function (button) {
      const active = button.dataset.tab === tab;
      button.classList.toggle("is-active", active);
      if (active) {
        button.setAttribute("aria-current", "page");
      } else {
        button.removeAttribute("aria-current");
      }
    });
    revealActiveTab();
    if (scroll !== false) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  /* En pantallas angostas la barra de pestañas se desplaza: mantenemos visible la activa. */
  function revealActiveTab() {
    const strip = document.querySelector(".topnav-tabs");
    const active = document.querySelector(".topnav-tab.is-active");
    if (!strip || !active || strip.scrollWidth <= strip.clientWidth) {
      return;
    }
    const stripBox = strip.getBoundingClientRect();
    const activeBox = active.getBoundingClientRect();
    const delta = activeBox.left - stripBox.left;
    const target = strip.scrollLeft + delta - (strip.clientWidth - activeBox.width) / 2;
    strip.scrollLeft = Math.max(0, target);
  }

  function goSupport(lines) {
    showTab("apoyo");
    const container = document.getElementById("hotlines-list");
    setTimeout(function () {
      if (container && window.VaplessAccordion) {
        (lines || ["106", "123"]).forEach(function (needle) {
          window.VaplessAccordion.openByTitle(container, needle);
        });
      }
    }, 220);
  }

  function setRing(days) {
    const arc = document.getElementById("streak-arc");
    if (!arc) {
      return;
    }
    const progress = Math.min(RING_CYCLE_DAYS, Math.max(0, days)) / RING_CYCLE_DAYS;
    arc.style.strokeDashoffset = String(RING_CIRCUMFERENCE * (1 - progress));
  }

  function recoveryMilestones(days) {
    return [
      { threshold: 0, title: "Primeras horas", text: "Tu cuerpo empieza a soltar la nicotina y el ritmo del corazón se calma." },
      { threshold: 1, title: "24 horas", text: "El monóxido de carbono baja y tu sangre lleva más oxígeno." },
      { threshold: 2, title: "48 horas", text: "El gusto y el olfato empiezan a despertar." },
      { threshold: 3, title: "72 horas", text: "Respirar se siente más liviano y los bronquios se relajan." },
      { threshold: 14, title: "2 semanas", text: "La circulación mejora y caminar o subir escaleras cuesta menos." },
      { threshold: 30, title: "1 mes", text: "Tus pulmones ganan capacidad y la tos empieza a bajar." },
      { threshold: 90, title: "3 meses", text: "Tu cuerpo ya sostiene la nueva rutina con más energía." }
    ];
  }

  function renderRecovery(days) {
    const container = document.getElementById("recovery-list");
    container.innerHTML = recoveryMilestones(days)
      .map(function (milestone) {
        const done = days >= milestone.threshold;
        return (
          '<div class="recovery-item' + (done ? " done" : "") + '">' +
          '<div class="recovery-mark">' + (done ? "OK" : "·") + "</div>" +
          "<div>" +
          '<div class="recovery-title">' + utils.escapeHtml(milestone.title) + "</div>" +
          '<div class="recovery-text">' + utils.escapeHtml(milestone.text) + "</div>" +
          "</div></div>"
        );
      })
      .join("");
  }

  function renderGoals(goals) {
    const container = document.getElementById("goals-list");
    if (!goals || !goals.length) {
      container.innerHTML = '<p class="card-text">Apenas arrancás: tu primera meta aparece con el primer día.</p>';
      return;
    }

    container.innerHTML = goals
      .map(function (goal) {
        const percent = Math.max(0, Math.min(100, goal.progressPercent || 0));
        return (
          '<div class="goal' + (goal.reached ? " reached" : "") + '">' +
          '<span class="goal-name">' + utils.escapeHtml(goal.name) + "</span>" +
          '<span class="goal-value">' + utils.formatCop(goal.targetCop) + "</span>" +
          '<div class="progress' + (goal.reached ? " green" : "") + '">' +
          '<span style="width: ' + percent + '%"></span>' +
          "</div></div>"
        );
      })
      .join("");
  }

  function renderAchievements(days) {
    const container = document.getElementById("achievement-row");
    if (!container) {
      return;
    }

    container.innerHTML = ACHIEVEMENTS.map(function (achievement) {
      const unlocked = days >= achievement.days;
      return (
        '<div class="achievement ' + (unlocked ? "is-unlocked" : "is-locked") + '">' +
        '<div class="achievement-tile">' + achievement.days + "</div>" +
        '<span class="achievement-label">' + achievement.label + "</span>" +
        "</div>"
      );
    }).join("");
  }

  function podProfile() {
    const select = document.getElementById("profile-pod-type");
    const type = Number(select.value);
    return POD_PROFILES[type] || POD_PROFILES[0];
  }

  function renderNicotinePreview() {
    const profile = podProfile();
    const pods = Number(document.getElementById("profile-pods").value) || 0;
    const mg = Number(document.getElementById("profile-mg").value) || 0;

    const weeklyMg = pods * mg;
    const dailyMg = weeklyMg / 7;
    const cigarettes = pods * profile.cigs;
    const weeklyCost = pods * profile.cost;
    const weeks = currentDays / 7;
    const ingested = Math.round(weeklyMg * weeks * 10) / 10;
    const avoided = Math.round(weeklyMg * weeks * 10) / 10;
    const cigarettesAvoided = Math.round(cigarettes * weeks * 10) / 10;

    document.getElementById("profile-cigs").value =
      profile.cigs > 0 ? profile.cigs + " cigarrillos por pod" : "sin equivalente";

    document.getElementById("nic-weekly").textContent = utils.formatNumber(weeklyMg, 1) + " mg";
    document.getElementById("nic-weekly-sub").textContent = utils.formatNumber(dailyMg, 1) + " mg al día";
    document.getElementById("nic-cigarettes").textContent = utils.formatNumber(cigarettes, 1);
    document.getElementById("nic-cigarettes-sub").textContent =
      utils.formatNumber(cigarettesAvoided, 1) + " evitados en tu racha";
    document.getElementById("nic-ingested").textContent = utils.formatNumber(ingested, 1) + " mg";
    document.getElementById("nic-avoided").textContent = utils.formatNumber(avoided, 1) + " mg";
    document.getElementById("nic-avoided-sub").textContent =
      utils.formatNumber(cigarettesAvoided, 1) + " cigarrillos en " + currentDays + " días";
    document.getElementById("nic-cost").textContent = utils.formatCop(weeklyCost);
    document.getElementById("nic-cost-sub").textContent = "por semana · pod de " + utils.formatCop(profile.cost);
    document.getElementById("nic-note").textContent =
      profile.name + ": " + profile.range + " de nicotina por pod. La cuenta se recalcula sola con cada cambio.";
  }

  function renderNicotineSummary(nicotine) {
    const container = document.getElementById("nicotine-summary");
    if (!container) {
      return;
    }

    if (!nicotine) {
      container.innerHTML = '<p class="card-text">Ajustá tu perfil para ver el cálculo de nicotina.</p>';
      return;
    }

    container.innerHTML =
      '<div class="card-eyebrow">' + utils.escapeHtml(nicotine.podTypeName) + " · " + nicotine.podsPerWeek + " pods/semana</div>" +
      '<div class="nicotine-summary-grid">' +
      '<div class="stat"><div class="stat-label">Nicotina por semana</div><div class="stat-value green">' +
      utils.formatNumber(nicotine.weeklyNicotineMg, 1) + ' mg</div><div class="stat-sub">' +
      utils.formatNumber(nicotine.dailyNicotineMg, 1) + " mg al día</div></div>" +
      '<div class="stat"><div class="stat-label">Equivalente en cigarrillos</div><div class="stat-value green">' +
      utils.formatNumber(nicotine.weeklyCigarettes, 1) + '</div><div class="stat-sub">' +
      utils.formatNumber(nicotine.cigarettesAvoided, 1) + " evitados</div></div>" +
      '<div class="stat"><div class="stat-label">Nicotina ingerida</div><div class="stat-value green">' +
      utils.formatNumber(nicotine.nicotineIngestedMg, 1) + ' mg</div><div class="stat-sub">desde que empezaste</div></div>' +
      '<div class="stat"><div class="stat-label">Nicotina evitada</div><div class="stat-value green">' +
      utils.formatNumber(nicotine.nicotineAvoidedMg, 1) + ' mg</div><div class="stat-sub">en tu racha</div></div>' +
      '<div class="stat"><div class="stat-label">Ahorro por pods</div><div class="stat-value green">' +
      utils.formatCop(nicotine.weeklyCostCop) + '</div><div class="stat-sub">por semana</div></div>' +
      '<div class="stat"><div class="stat-label">Ahorro total</div><div class="stat-value green">' +
      utils.formatCop(nicotine.copSaved) + '</div><div class="stat-sub">en tu racha</div></div>' +
      "</div>" +
      '<p class="card-text mt-12">' + utils.escapeHtml(nicotine.phrase) + "</p>";
  }

  function fillProfileForm(profile) {
    document.getElementById("profile-quitdate").value = (profile.quitDate || "").slice(0, 10);
    document.getElementById("profile-alias").value = profile.alias || "";
    document.getElementById("profile-cost").value = Math.round(profile.dailyCostCop || 0);
    document.getElementById("profile-pods").value = profile.podsPerWeek;
    document.getElementById("profile-mg").value = profile.nicotineMgPerPod;
    document.getElementById("profile-pod-type").value = String(profile.primaryDevice);
    costTouched = false;
    renderNicotinePreview();
  }

  function renderIdentity(profile) {
    const alias = (profile && profile.alias) || "parce";
    document.getElementById("greeting").textContent = "Hola, " + alias;
    document.getElementById("profile-name").textContent = alias;
  }

  async function loadDashboard() {
    let summary = null;
    try {
      summary = await api.get("/progress/summary");
      const days = summary.daysClean || 0;
      currentDays = days;

      document.getElementById("header-streak").textContent = String(days);
      document.getElementById("streak-days").textContent = String(days);
      document.getElementById("streak-label").textContent = days === 1 ? "día vapeless" : "días vapeless";
      setRing(days);

      document.getElementById("stat-cop").textContent = utils.formatCop(summary.totalCopSaved);
      document.getElementById("stat-cop-sub").textContent = utils.formatCop(summary.dailyCostCop) + " por día";
      document.getElementById("stat-nicotine").textContent =
        utils.formatNumber(summary.nicotineMgAvoidedMg, 1) + " mg";

      document.getElementById("home-cop").textContent = "+ " + utils.formatCop(summary.totalCopSaved) + " ahorrados";
      document.getElementById("home-life").textContent =
        "+ " + utils.formatNumber(summary.nicotineMgAvoidedMg, 1) + " mg de vida recuperada";

      document.getElementById("savings-phrase").textContent = summary.copComparisonPhrase;
      document.getElementById("nicotine-phrase").textContent = summary.nicotinePhrase;

      renderGoals(summary.nextGoals);
      renderRecovery(days);
      renderAchievements(days);
      renderNicotineSummary(summary.nicotine);
      renderNicotinePreview();
    } catch (error) {
      toast(error.message);
      document.getElementById("savings-phrase").textContent =
        "No pudimos leer tu resumen. Revisá que la API local esté corriendo.";
    }

    try {
      const profile = await api.get("/progress");
      fillProfileForm(profile);
      renderIdentity(profile);
    } catch {
      /* El resumen ya muestra el error principal. */
    }
  }

  function setupNavigation() {
    document.querySelectorAll(".topnav-tab").forEach(function (button) {
      button.addEventListener("click", function () {
        const tab = button.dataset.tab;
        showTab(tab);

        if (tab === "test" && window.VaplessAssessment) {
          window.VaplessAssessment.open();
        }
        if (tab === "reporte" && window.VaplessPulse) {
          window.VaplessPulse.reload();
        }
      });
    });

    document.querySelectorAll("[data-goto]").forEach(function (button) {
      button.addEventListener("click", function () {
        showTab(button.dataset.goto);
      });
    });

    document.getElementById("toggle-progress").addEventListener("click", function () {
      showTab("inicio");
      setTimeout(function () {
        const block = document.getElementById("progress-block");
        if (block) {
          block.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 140);
    });

    ["craving-open", "craving-fab"].forEach(function (id) {
      const button = document.getElementById(id);
      if (button) {
        button.addEventListener("click", function () {
          showTab("craving");
          window.VaplessCraving.start();
        });
      }
    });

    const assessmentOpen = document.getElementById("assessment-open");
    if (assessmentOpen) {
      assessmentOpen.addEventListener("click", function () {
        showTab("test");
        if (window.VaplessAssessment) {
          window.VaplessAssessment.open();
        }
      });
    }
  }

  function setupProfileForm() {
    const form = document.getElementById("profile-form");
    const podType = document.getElementById("profile-pod-type");
    const podsInput = document.getElementById("profile-pods");
    const mgInput = document.getElementById("profile-mg");
    const costInput = document.getElementById("profile-cost");

    function syncDailyCost() {
      if (costTouched) {
        return;
      }
      const profile = podProfile();
      const pods = Number(podsInput.value) || 0;
      costInput.value = Math.round(((pods * profile.cost) / 7) / 500) * 500;
    }

    podType.addEventListener("change", function () {
      const profile = podProfile();
      mgInput.value = profile.mg;
      syncDailyCost();
      renderNicotinePreview();
    });

    podsInput.addEventListener("input", function () {
      syncDailyCost();
      renderNicotinePreview();
    });

    mgInput.addEventListener("input", renderNicotinePreview);

    costInput.addEventListener("input", function () {
      costTouched = true;
    });

    form.addEventListener("submit", async function (event) {
      event.preventDefault();
      const quitDateValue = document.getElementById("profile-quitdate").value;

      const payload = {
        alias: document.getElementById("profile-alias").value.trim() || null,
        quitDate: quitDateValue ? new Date(quitDateValue + "T12:00:00").toISOString() : null,
        dailyCostCop: Number(costInput.value),
        podsPerWeek: Number(podsInput.value),
        nicotineMgPerPod: Number(mgInput.value),
        primaryDevice: Number(podType.value)
      };

      try {
        await api.put("/progress", payload);
        toast("Listo. Tu ruta quedó actualizada.", "green");
        await loadDashboard();
      } catch (error) {
        toast(error.message);
      }
    });
  }

  function setupShareStreak() {
    const button = document.getElementById("share-streak");
    button.addEventListener("click", async function () {
      const text =
        "Llevo " + currentDays + " días vapeless. Menos vape. Más vida.";

      try {
        if (navigator.share) {
          await navigator.share({ title: "vapless.", text: text });
          return;
        }
        await navigator.clipboard.writeText(text);
        toast("Racha copiada. Compartila cuando quieras.", "green");
      } catch (error) {
        toast("No pudimos compartir. Tu racha sigue siendo tuya.");
      }
    });
  }

  function init() {
    if (window.VaplessTheme) {
      window.VaplessTheme.init();
    }

    setupNavigation();
    setupProfileForm();
    setupShareStreak();
    loadDashboard();

    window.VaplessCraving.init({
      onSaved: function () {
        loadDashboard();
        toast("Antojo registrado. Sumaste otro día de control.", "green");
      },
      onSupport: goSupport
    });

    window.VaplessHack.init({ onSupport: goSupport });

    if (window.VaplessPulse) {
      window.VaplessPulse.init({ onSupport: goSupport, toast: toast });
    }

    if (window.VaplessAssessment) {
      window.VaplessAssessment.init({
        onSupport: goSupport,
        onDone: function () {
          showTab("inicio");
        },
        toast: toast
      });
    }

    if ("serviceWorker" in navigator) {
      window.addEventListener("load", function () {
        navigator.serviceWorker.register("sw.js").catch(function () {
          /* La app funciona igual sin service worker. */
        });
      });
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();

(function () {
  const RING_CIRCUMFERENCE = 540.35;
  const RING_CYCLE_DAYS = 30;
  let toastTimer = null;

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
    document.querySelectorAll(".nav-tab").forEach(function (button) {
      button.classList.toggle("is-active", button.dataset.tab === tab);
    });
    if (scroll !== false) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function goSupport() {
    showTab("pulso");
    const section = document.getElementById("support-section");
    if (section) {
      setTimeout(function () {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 120);
    }
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
      { threshold: 30, title: "1 mes", text: "Los pulmones ganan capacidad y la tos empieza a bajar." },
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

  function fillProfileForm(profile) {
    const quitDate = document.getElementById("profile-quitdate");
    quitDate.value = (profile.quitDate || "").slice(0, 10);
    document.getElementById("profile-cost").value = Math.round(profile.dailyCostCop || 0);
    document.getElementById("profile-pods").value = profile.podsPerWeek;
    document.getElementById("profile-mg").value = profile.nicotineMgPerPod;
    document.getElementById("profile-device").value = String(profile.primaryDevice);
  }

  async function loadDashboard() {
    try {
      const summary = await api.get("/progress/summary");
      const days = summary.daysClean || 0;

      document.getElementById("header-streak").textContent = String(days);
      document.getElementById("streak-days").textContent = String(days);
      document.getElementById("streak-label").textContent =
        days === 1 ? "día de racha" : "días de racha";
      setRing(days);

      document.getElementById("stat-cop").textContent = utils.formatCop(summary.totalCopSaved);
      document.getElementById("stat-cop-sub").textContent =
        utils.formatCop(summary.dailyCostCop) + " por día";
      document.getElementById("stat-nicotine").textContent =
        utils.formatNumber(summary.nicotineMgAvoidedMg, 1) + " mg";

      document.getElementById("savings-phrase").textContent = summary.copComparisonPhrase;
      document.getElementById("nicotine-phrase").textContent = summary.nicotinePhrase;

      renderGoals(summary.nextGoals);
      renderRecovery(days);
    } catch (error) {
      toast(error.message);
      document.getElementById("savings-phrase").textContent =
        "No pudimos leer tu resumen. Revisá que la API local esté corriendo.";
    }

    try {
      const profile = await api.get("/progress");
      fillProfileForm(profile);
    } catch {
      /* El resumen ya muestra el error principal. */
    }
  }

  function setupNavigation() {
    document.querySelectorAll(".nav-tab").forEach(function (button) {
      button.addEventListener("click", function () {
        showTab(button.dataset.tab);
      });
    });
  }

  function setupProfileForm() {
    const form = document.getElementById("profile-form");
    const toggle = document.getElementById("toggle-profile");

    toggle.addEventListener("click", function () {
      form.classList.toggle("hidden");
      if (!form.classList.contains("hidden")) {
        form.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });

    form.addEventListener("submit", async function (event) {
      event.preventDefault();
      const quitDateValue = document.getElementById("profile-quitdate").value;

      const payload = {
        quitDate: quitDateValue ? new Date(quitDateValue + "T12:00:00").toISOString() : null,
        dailyCostCop: Number(document.getElementById("profile-cost").value),
        podsPerWeek: Number(document.getElementById("profile-pods").value),
        nicotineMgPerPod: Number(document.getElementById("profile-mg").value),
        primaryDevice: Number(document.getElementById("profile-device").value)
      };

      try {
        await api.put("/progress", payload);
        toast("Listo. Tu ruta quedó actualizada.", "green");
        form.classList.add("hidden");
        await loadDashboard();
      } catch (error) {
        toast(error.message);
      }
    });
  }

  function init() {
    setupNavigation();
    setupProfileForm();
    loadDashboard();

    document.getElementById("refresh-dashboard").addEventListener("click", loadDashboard);

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

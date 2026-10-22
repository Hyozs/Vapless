(function () {
  const SEEN_KEY = "hasSeenWelcome";

  let modal;
  let onStart = function () {};

  function hasSeen() {
    try {
      return localStorage.getItem(SEEN_KEY) === "true";
    } catch {
      return true;
    }
  }

  function markSeen() {
    try {
      localStorage.setItem(SEEN_KEY, "true");
    } catch {
      /* Modo privado: se vuelve a mostrar la próxima vez. */
    }
  }

  function open() {
    if (!modal) {
      return;
    }
    modal.hidden = false;
    modal.classList.add("is-open");
    document.body.classList.add("has-modal");

    const start = document.getElementById("welcome-start");
    if (start) {
      start.focus();
    }
  }

  function close() {
    if (!modal || modal.hidden) {
      return;
    }
    modal.classList.remove("is-open");
    modal.hidden = true;
    document.body.classList.remove("has-modal");
    markSeen();
    onStart();
  }

  function init(options) {
    modal = document.getElementById("welcome-modal");
    onStart = (options && options.onStart) || onStart;

    const start = document.getElementById("welcome-start");
    if (start) {
      start.addEventListener("click", close);
    }

    if (modal) {
      modal.addEventListener("click", function (event) {
        if (event.target === modal) {
          close();
        }
      });
    }

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && modal && !modal.hidden) {
        close();
      }
    });

    if (!hasSeen()) {
      setTimeout(open, 400);
    }
  }

  window.VaplessWelcome = { init, open, close };
})();

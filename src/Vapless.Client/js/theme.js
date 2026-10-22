(function () {
  const STORAGE_KEY = "vapless.theme";
  const DARK = "dark";
  const LIGHT = "light";

  function stored() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  }

  function current() {
    return document.documentElement.getAttribute("data-theme") === LIGHT ? LIGHT : DARK;
  }

  function persist(theme) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* Modo privado: el tema dura lo que dure la sesión. */
    }
  }

  function paint(theme) {
    document.documentElement.setAttribute("data-theme", theme);

    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute("content", theme === LIGHT ? "#F8FAFC" : "#0B0D12");
    }

    const button = document.getElementById("theme-toggle");
    if (button) {
      const next = theme === LIGHT ? "oscuro" : "claro";
      button.setAttribute("aria-label", "Cambiar a modo " + next);
      button.setAttribute("title", "Cambiar a modo " + next);
      button.setAttribute("aria-pressed", theme === LIGHT ? "true" : "false");
    }
  }

  function setTheme(theme) {
    const next = theme === LIGHT ? LIGHT : DARK;
    paint(next);
    persist(next);
    return next;
  }

  function toggle() {
    return setTheme(current() === LIGHT ? DARK : LIGHT);
  }

  function init() {
    paint(stored() === LIGHT ? LIGHT : DARK);

    const button = document.getElementById("theme-toggle");
    if (button && !button.dataset.bound) {
      button.dataset.bound = "true";
      button.addEventListener("click", function () {
        toggle();
      });
    }
  }

  window.VaplessTheme = { init, toggle, setTheme, current };
})();

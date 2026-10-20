(function () {
  const BASE = "/api/v1";

  async function request(path, options) {
    const response = await fetch(BASE + path, {
      headers: { "Content-Type": "application/json" },
      ...options
    });

    let payload = null;
    const text = await response.text();
    if (text) {
      try {
        payload = JSON.parse(text);
      } catch {
        payload = { error: text };
      }
    }

    if (!response.ok) {
      const message = (payload && payload.error) || "No pudimos completar la acción.";
      throw new Error(message);
    }

    return payload;
  }

  window.VaplessApi = {
    get: (path) => request(path, { method: "GET" }),
    post: (path, body) => request(path, { method: "POST", body: JSON.stringify(body) }),
    put: (path, body) => request(path, { method: "PUT", body: JSON.stringify(body) })
  };

  const cop = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0
  });

  window.VaplessUtils = {
    formatCop: (value) => cop.format(Number(value) || 0),
    formatNumber: (value, digits) => {
      const n = Number(value) || 0;
      return n.toLocaleString("es-CO", {
        minimumFractionDigits: digits || 0,
        maximumFractionDigits: digits || 0
      });
    },
    escapeHtml: (value) =>
      String(value == null ? "" : value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;"),
    todayISO: () => new Date().toISOString().slice(0, 10)
  };
})();

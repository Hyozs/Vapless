(function () {
  const XP_KEY = "vapless.xp";
  const DONE_KEY = "vapless.completedDecks";
  const DECK_ID = "mitos-y-realidades";
  const DECK_NAME = "Mitos y Realidades";

  let cards = [];
  let cardIndex = 0;
  let busy = false;
  let answered = false;
  let onSupport = function () {};

  function utils() {
    return window.VaplessUtils;
  }

  function xp() {
    return Number(localStorage.getItem(XP_KEY) || 0);
  }

  function setXp(value) {
    localStorage.setItem(XP_KEY, String(value));
    const label = document.getElementById("xp-value");
    if (label) {
      label.textContent = String(value);
    }
  }

  function completedDecks() {
    try {
      const parsed = JSON.parse(localStorage.getItem(DONE_KEY) || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function markCompleted(id) {
    const done = completedDecks();
    if (!done.includes(id)) {
      done.push(id);
      localStorage.setItem(DONE_KEY, JSON.stringify(done));
    }
  }

  function currentCard() {
    return cards[cardIndex];
  }

  function cardFront(card) {
    return (
      '<div class="card-front">' +
      '<div><div class="deck-tag">' + utils().escapeHtml(card.theme) + "</div>" +
      '<div class="statement">' + utils().escapeHtml(card.statement) + "</div></div>" +
      '<div class="swipe-hint">¿Es mito o es realidad? Arrastrá la tarjeta o usá los botones.</div>' +
      "</div>"
    );
  }

  function bindDrag(card) {
    let startX = 0;
    let startY = 0;
    let dx = 0;
    let active = false;

    card.addEventListener("pointerdown", function (event) {
      if (event.target.closest("button")) {
        return;
      }
      active = true;
      startX = event.clientX;
      startY = event.clientY;
      dx = 0;
      card.classList.add("is-dragging");
      card.setPointerCapture(event.pointerId);
    });

    card.addEventListener("pointermove", function (event) {
      if (!active) {
        return;
      }

      dx = event.clientX - startX;
      const dy = event.clientY - startY;
      card.style.transform = "translate(" + dx + "px, " + dy * 0.12 + "px) rotate(" + dx / 22 + "deg)";
      card.style.opacity = String(1 - Math.min(0.35, Math.abs(dx) / 520));
    });

    function release() {
      if (!active) {
        return;
      }
      active = false;
      card.classList.remove("is-dragging");
      card.style.transform = "";
      card.style.opacity = "";

      if (dx <= -90) {
        answer(true);
      } else if (dx >= 90) {
        answer(false);
      }
    }

    card.addEventListener("pointerup", release);
    card.addEventListener("pointercancel", release);
  }

  function renderDeck() {
    const card = currentCard();
    const stage = document.getElementById("deck-stage");
    const actions = document.getElementById("swipe-actions");
    const summary = document.getElementById("deck-summary");
    const position = document.getElementById("deck-position");
    const bar = document.getElementById("deck-bar");
    const deckName = document.getElementById("deck-name");

    if (!card) {
      stage.innerHTML = "";
      actions.classList.add("hidden");
      return;
    }

    if (cardIndex >= cards.length) {
      stage.innerHTML = "";
      actions.classList.add("hidden");
      summary.classList.remove("hidden");
      position.textContent = cards.length + " / " + cards.length;
      bar.style.width = "100%";
      deckName.textContent = DECK_NAME;
      document.getElementById("summary-title").textContent = DECK_NAME + " completado. Bien ahí.";
      document.getElementById("summary-text").textContent =
        "Repasaste mitos y realidades, y ganaste XP. Si querés seguir, abrí el Dojo de presión social para ensayar respuestas asertivas.";
      markCompleted(DECK_ID);
      return;
    }

    summary.classList.add("hidden");
    actions.classList.remove("hidden");
    runActionsState(false);

    const next = cards[cardIndex + 1];

    let html = "";
    if (next) {
      html =
        '<div class="swipe-card is-behind" aria-hidden="true">' +
        '<div class="card-front"><div><div class="deck-tag">' +
        utils().escapeHtml(next.theme) +
        "</div>" +
        '<div class="statement">' +
        utils().escapeHtml(next.statement) +
        '</div></div><div class="swipe-hint">Después</div></div></div>';
    }

    html +=
      '<div class="swipe-card" id="top-card" data-card-id="' + card.id + '">' +
      cardFront(card) +
      '<div class="card-back"></div>' +
      "</div>";

    stage.innerHTML = html;

    const top = document.getElementById("top-card");
    bindDrag(top);

    position.textContent = cardIndex + 1 + " / " + cards.length;
    bar.style.width = Math.round((cardIndex / cards.length) * 100) + "%";
    deckName.textContent = DECK_NAME;
    answered = false;
    busy = false;
  }

  function runActionsState(disabled) {
    const myth = document.getElementById("swipe-myth");
    const real = document.getElementById("swipe-real");
    if (myth) {
      myth.disabled = disabled;
    }
    if (real) {
      real.disabled = disabled;
    }
  }

  function answer(isMyth) {
    if (busy || answered) {
      return;
    }

    const card = currentCard();
    if (!card) {
      return;
    }

    busy = true;
    answered = true;
    runActionsState(true);

    const correct = card.isMyth === isMyth;
    const truth = card.isMyth ? "un mito" : "una realidad";

    const top = document.getElementById("top-card");
    const back = top.querySelector(".card-back");
    back.innerHTML =
      '<div class="verdict ' + (correct ? "good" : "miss") + '">' +
      utils().escapeHtml(correct ? "Correcto: era " + truth + "." : "Al revés: esto es " + truth + ".") +
      "</div>" +
      '<div class="explanation">' + utils().escapeHtml(card.explanation) + "</div>" +
      '<button class="btn btn-primary btn-block" type="button" data-next="1">Siguiente</button>';

    if (correct) {
      setXp(xp() + (card.xp || window.VaplessDojoData.xpPerCard || 10));
    }

    top.classList.add("flipped");
    top.addEventListener("click", function (event) {
      if (event.target.closest("[data-next]")) {
        advance();
      }
    });
  }

  function advance() {
    const top = document.getElementById("top-card");
    if (top) {
      top.classList.add("leaving-left");
    }
    setTimeout(function () {
      cardIndex += 1;
      renderDeck();
    }, 240);
  }

  function load() {
    const data = window.VaplessDojoData;
    if (!data || !data.cards || !data.cards.length) {
      document.getElementById("deck-stage").innerHTML =
        '<div class="empty-card">Todavía no hay tarjetas cargadas.</div>';
      return;
    }

    cards = data.cards.slice();
    setXp(xp());

    const done = completedDecks();
    const alreadyDone = done.includes(DECK_ID);
    cardIndex = alreadyDone ? 0 : 0;
    renderDeck();
  }

  function init(options) {
    onSupport = (options && options.onSupport) || onSupport;
    setXp(xp());

    document.getElementById("swipe-myth").addEventListener("click", function () {
      answer(true);
    });
    document.getElementById("swipe-real").addEventListener("click", function () {
      answer(false);
    });
    document.getElementById("summary-support").addEventListener("click", function () {
      onSupport();
    });

    load();
  }

  window.VaplessHack = { init, reload: load };
})();

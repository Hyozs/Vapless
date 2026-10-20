(function () {
  const XP_KEY = "vapless.xp";
  const DONE_KEY = "vapless.completedDecks";

  let decks = [];
  let activeDeck = 0;
  let cardIndex = 0;
  let busy = false;
  let answered = false;
  let onSupport = function () {};

  function xp() {
    return Number(localStorage.getItem(XP_KEY) || 0);
  }

  function setXp(value) {
    localStorage.setItem(XP_KEY, String(value));
    document.getElementById("xp-value").textContent = String(value);
  }

  function completedDecks() {
    try {
      const parsed = JSON.parse(localStorage.getItem(DONE_KEY) || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function markCompleted(category) {
    const done = completedDecks();
    if (!done.includes(category)) {
      done.push(category);
      localStorage.setItem(DONE_KEY, JSON.stringify(done));
    }
  }

  function currentDeck() {
    return decks[activeDeck];
  }

  function currentCard() {
    const deck = currentDeck();
    return deck ? deck.cards[cardIndex] : null;
  }

  function renderChips() {
    const container = document.getElementById("deck-chips");
    const done = completedDecks();

    container.innerHTML = decks
      .map((deck, index) => {
        const isActive = index === activeDeck ? " is-active" : "";
        const finished = done.includes(deck.category) ? " · listo" : "";
        return (
          '<button class="chip' + isActive + '" type="button" data-deck="' + index + '">' +
          window.VaplessUtils.escapeHtml(deck.name) +
          " (" + deck.cardCount + ")" + finished +
          "</button>"
        );
      })
      .join("");

    container.querySelectorAll("[data-deck]").forEach((button) => {
      button.addEventListener("click", function () {
        activeDeck = Number(button.dataset.deck);
        cardIndex = 0;
        answered = false;
        busy = false;
        document.getElementById("deck-summary").classList.add("hidden");
        renderChips();
        renderDeck();
      });
    });
  }

  function cardFront(card) {
    return (
      '<div class="card-front">' +
      '<div><div class="deck-tag">' + window.VaplessUtils.escapeHtml(card.categoryName) + "</div>" +
      '<div class="statement">' + window.VaplessUtils.escapeHtml(card.statement) + "</div></div>" +
      '<div class="swipe-hint">Arrastrá la tarjeta o usá los botones</div>' +
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
      const dy = (event.clientY - startY) * 0.12;
      card.style.transform = "translate(" + dx + "px, " + dy + "px) rotate(" + dx / 22 + "deg)";
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
    const deck = currentDeck();
    const stage = document.getElementById("deck-stage");
    const actions = document.getElementById("swipe-actions");
    const summary = document.getElementById("deck-summary");
    const position = document.getElementById("deck-position");
    const bar = document.getElementById("deck-bar");
    const deckName = document.getElementById("deck-name");

    if (!deck || !deck.cards.length) {
      stage.innerHTML = '<div class="empty-card">No hay tarjetas en este mazo.</div>';
      actions.classList.add("hidden");
      return;
    }

    if (cardIndex >= deck.cards.length) {
      stage.innerHTML = "";
      actions.classList.add("hidden");
      summary.classList.remove("hidden");
      position.textContent = deck.cards.length + " / " + deck.cards.length;
      bar.style.width = "100%";
      deckName.textContent = deck.name;
      document.getElementById("summary-title").textContent = deck.name + " completado. Bien ahí.";
      document.getElementById("summary-text").textContent =
        "Sumaste tarjetas a tu criterio. Si querés seguir, elegí otro mazo o abrí el Dojo de presión social.";
      markCompleted(deck.category);
      renderChips();
      return;
    }

    summary.classList.add("hidden");
    actions.classList.remove("hidden");
    runActionsState(false);

    const card = deck.cards[cardIndex];
    const next = deck.cards[cardIndex + 1];

    let html = "";
    if (next) {
      html +=
        '<div class="swipe-card is-behind" aria-hidden="true">' +
        '<div class="card-front"><div><div class="deck-tag">' +
        window.VaplessUtils.escapeHtml(next.categoryName) +
        "</div><div class=\"statement\">" +
        window.VaplessUtils.escapeHtml(next.statement) +
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

    position.textContent = (cardIndex + 1) + " / " + deck.cards.length;
    bar.style.width = Math.round((cardIndex / deck.cards.length) * 100) + "%";
    deckName.textContent = deck.name;
    answered = false;
    busy = false;
  }

  function runActionsState(disabled) {
    document.getElementById("swipe-myth").disabled = disabled;
    document.getElementById("swipe-real").disabled = disabled;
  }

  async function answer(isMyth) {
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

    try {
      const result = await window.VaplessApi.post("/hack/cards/" + card.id + "/answer", {
        answerIsMyth: isMyth
      });

      if (result.correct) {
        setXp(xp() + result.xpEarned);
      }

      const top = document.getElementById("top-card");
      const back = top.querySelector(".card-back");
      back.innerHTML =
        '<div class="verdict ' + (result.correct ? "good" : "miss") + '">' +
        window.VaplessUtils.escapeHtml(result.feedback) +
        "</div>" +
        '<div class="explanation">' +
        window.VaplessUtils.escapeHtml(result.explanation) +
        "</div>" +
        '<button class="btn btn-primary btn-block" type="button" data-next="1">Siguiente</button>';

      top.classList.add("flipped");
      top.addEventListener("click", function (event) {
        if (event.target.closest("[data-next]")) {
          advance();
        }
      });
    } catch (error) {
      answered = false;
      busy = false;
      runActionsState(false);
      window.VaplessToast(error.message);
    }
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

  async function load() {
    try {
      const data = await window.VaplessApi.get("/hack/decks");
      decks = Array.isArray(data) ? data : [];
      setXp(xp());

      if (!decks.length) {
        document.getElementById("deck-stage").innerHTML =
          '<div class="empty-card">Todavía no hay tarjetas cargadas.</div>';
        return;
      }

      const done = completedDecks();
      const pending = decks.findIndex((deck) => !done.includes(deck.category));
      activeDeck = pending >= 0 ? pending : 0;
      cardIndex = 0;
      renderChips();
      renderDeck();
    } catch (error) {
      document.getElementById("deck-stage").innerHTML =
        '<div class="empty-card">No pudimos cargar los mazos. Revisá que la API local esté corriendo.</div>';
      window.VaplessToast(error.message);
    }
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

(function () {
  const utils = window.VaplessUtils;

  function escape(value) {
    return utils ? utils.escapeHtml(value) : String(value);
  }

  function itemMarkup(item, index) {
    const id = "acc-" + (item.id || index);
    const badge = item.badge
      ? '<span class="badge ' + (item.badgeClass || "") + '">' + escape(item.badge) + "</span>"
      : "";

    return (
      '<div class="accordion-item" data-accordion-item data-accordion-id="' + escape(id) + '">' +
      '<button class="accordion-trigger" type="button" aria-expanded="false" aria-controls="' + escape(id) + '">' +
      '<span class="accordion-head">' +
      '<span class="accordion-title">' + escape(item.title) + "</span>" +
      (item.subtitle ? '<span class="accordion-sub">' + escape(item.subtitle) + "</span>" : "") +
      "</span>" +
      badge +
      '<span class="accordion-icon" aria-hidden="true"></span>' +
      "</button>" +
      '<div class="accordion-panel" id="' + escape(id) + '" hidden>' +
      '<div class="accordion-content">' + (item.content || "") + "</div>" +
      "</div>" +
      "</div>"
    );
  }

  function render(container, items, options) {
    if (!container) {
      return;
    }

    const settings = options || {};
    const list = (items || []).map(function (item, index) {
      return itemMarkup(item, index);
    });

    container.innerHTML =
      '<div class="accordion"' + (settings.group ? ' data-accordion-group="' + escape(settings.group) + '"' : "") + ">" +
      list.join("") +
      "</div>";

    container.setAttribute("data-accordion-initialized", "true");
  }

  function items(container) {
    return container ? container.querySelectorAll(".accordion-item") : [];
  }

  function closeItem(item) {
    const trigger = item.querySelector(".accordion-trigger");
    const panel = item.querySelector(".accordion-panel");
    if (!trigger || !panel) {
      return;
    }
    trigger.setAttribute("aria-expanded", "false");
    item.classList.remove("is-open");
    panel.hidden = true;
  }

  function openItem(item) {
    const trigger = item.querySelector(".accordion-trigger");
    const panel = item.querySelector(".accordion-panel");
    if (!trigger || !panel) {
      return;
    }
    trigger.setAttribute("aria-expanded", "true");
    item.classList.add("is-open");
    panel.hidden = false;
  }

  function open(container, id) {
    items(container).forEach(function (item) {
      if (item.dataset.accordionId === id) {
        openItem(item);
      }
    });
  }

  function openByTitle(container, title) {
    let found = false;
    items(container).forEach(function (item) {
      const label = item.querySelector(".accordion-title");
      if (label && label.textContent.toLowerCase().indexOf(title.toLowerCase()) >= 0) {
        openItem(item);
        found = true;
      }
    });
    return found;
  }

  function closeAll(container) {
    items(container).forEach(closeItem);
  }

  function handleClick(event) {
    const trigger = event.target.closest(".accordion-trigger");
    if (!trigger) {
      return;
    }

    const item = trigger.closest(".accordion-item");
    const container = trigger.closest("[data-accordion-initialized]");
    if (!item) {
      return;
    }

    const isOpen = trigger.getAttribute("aria-expanded") === "true";

    if (!isOpen && container) {
      const group = container.querySelector(".accordion[data-accordion-group]");
      if (group) {
        group.querySelectorAll(".accordion-item").forEach(function (other) {
          if (other !== item) {
            closeItem(other);
          }
        });
      }
    }

    if (isOpen) {
      closeItem(item);
    } else {
      openItem(item);
    }
  }

  document.addEventListener("click", handleClick);

  window.VaplessAccordion = { render, open, openByTitle, closeAll };
})();

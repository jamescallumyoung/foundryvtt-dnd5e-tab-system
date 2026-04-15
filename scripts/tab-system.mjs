/**
 * Tab system for dynamically-injected tabs in ApplicationV2 actor sheets.
 *
 * ApplicationV2's native TabsV2 ignores dynamically-injected tabs. This module
 * provides lifecycle management for such tabs, supporting multiple tabs, from
 * one or multiple modules, without collision.
 */

// Module-level registry of all registered dynamic tab IDs.
const _registeredTabs = new Set();

// Key used to store the active dynamic tab ID on an app instance.
// Written as app[DYNAMIC_TAB_ACTIVE] = tabId | false.
export const DYNAMIC_TAB_ACTIVE = '_dynamicTabActive';

/**
 * Registers the tab ID of a new dynamic tab.
 * 
 * Call once from your module's init or ready hook.
 * Idempotent — calling again with the same tabId is a no-op.
 *
 * @param {string} tabId  The id of the dynamically-injected tab.
 */
export function registerDynamicTab(tabId) {
  _registeredTabs.add(tabId);
}

/**
 * Activates a dynamic tab, marking it as the current primary tab.
 *
 * Removes the active class from all tabs and re-applies it to the 
 * specified tab. Updates ApplicationV2's tabGroups so that native 
 * tab clicks afterward are never treated as "already active"
 * (which would be a no-op).
 *
 * @param {ApplicationV2} app    The actor sheet application instance.
 * @param {HTMLElement}   root   The root HTML element of the rendered sheet.
 * @param {string}        tabId  The data-tab value of the tab to activate.
 */
export function activateDynamicTab(app, root, tabId) {
  if (app.tabGroups) app.tabGroups["primary"] = tabId;

  root.querySelectorAll('nav[data-group="primary"] .item')
    .forEach((el) => el.classList.remove("active"));
  root.querySelectorAll('[data-group="primary"][data-tab]')
    .forEach((el) => el.classList.remove("active"));

  root.querySelector(`a[data-tab="${tabId}"][data-group="primary"]`)
    ?.classList.add("active");
  root.querySelector(`section[data-tab="${tabId}"][data-group="primary"]`)
    ?.classList.add("active");

  app[DYNAMIC_TAB_ACTIVE] = tabId;
}

/**
 * Deactivates all registered dynamic tabs and returns navigation control to
 * the native tab system.
 *
 * Called automatically when a native tab is clicked. Safe to call when no
 * dynamic tab is active.
 *
 * @param {ApplicationV2} app   The actor sheet application instance.
 * @param {HTMLElement}   root  The root HTML element of the rendered sheet.
 */
export function deactivateDynamicTabs(app, root) {
  for (const tabId of _registeredTabs) {
    root.querySelector(`a[data-tab="${tabId}"][data-group="primary"]`)
      ?.classList.remove("active");
    root.querySelector(`section[data-tab="${tabId}"][data-group="primary"]`)
      ?.classList.remove("active");
  }
  app[DYNAMIC_TAB_ACTIVE] = false;
}

/**
 * Restores dynamic tab state and wires event listeners after a render.
 *
 * Call on every renderActorSheetV2 hook. For each registered dynamic tab:
 * - Skips tabs whose button is not present in the rendered DOM.
 * - Removes stale listeners from the previous render before attaching new ones.
 * - Restores the active tab if one was active before the re-render.
 * - Wires the tab button to activate this tab on click.
 * - Wires the nav to deactivate all dynamic tabs when a native tab is clicked.
 *
 * @param {ApplicationV2} app   The actor sheet application instance.
 * @param {HTMLElement}   root  The root HTML element of the rendered sheet.
 */
export function restoreDynamicTabs(app, root) {
  const tabNav = root.querySelector('nav[data-group="primary"]');

  for (const tabId of _registeredTabs) {
    const tabBtn = root.querySelector(`a[data-tab="${tabId}"][data-group="primary"]`);
    if (!tabBtn || !tabNav) continue;

    if (!app._dynamicTabHandlers) app._dynamicTabHandlers = new Map();

    // Remove stale listeners from the previous render.
    const prev = app._dynamicTabHandlers.get(tabId);
    if (prev) {
      tabBtn.removeEventListener("click", prev.btnHandler);
      tabNav.removeEventListener("click", prev.navHandler);
    }

    // Restore active state after a re-render wiped and re-injected the panel.
    if (app[DYNAMIC_TAB_ACTIVE] === tabId) {
      activateDynamicTab(app, root, tabId);
    }

    // Wire click on this tab's button.
    const btnHandler = () => activateDynamicTab(app, root, tabId);

    // Wire click on the nav: deactivate dynamic tabs when a native tab is clicked.
    // Clicking another dynamic tab is handled by that tab's own btnHandler.
    const navHandler = (e) => {
      const target = e.target.closest(".item[data-tab]");
      if (target && !_registeredTabs.has(target.dataset.tab)) {
        deactivateDynamicTabs(app, root);
      }
    };

    tabBtn.addEventListener("click", btnHandler);
    tabNav.addEventListener("click", navHandler);
    app._dynamicTabHandlers.set(tabId, { btnHandler, navHandler });
  }
}

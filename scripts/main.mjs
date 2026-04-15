/**
 * D&D 5e Tab System
 *
 * Entry point. Exposes the tab system API on the module's game.modules entry
 * so that depending modules can access it after the ready hook fires.
 * 
 * Usage pattern in a depending module:
 *
 *   // Once, in init or ready:
 *   game.modules.get("dnd5e-tab-system").api.registerDynamicTab("my-tab");
 *
 *   // On every renderActorSheetV2:
 *   game.modules.get("dnd5e-tab-system").api.restoreDynamicTabs(app, root);
 */

import {
  registerDynamicTab,
  restoreDynamicTabs,
  activateDynamicTab,
  deactivateDynamicTabs,
  DYNAMIC_TAB_ACTIVE,
} from "./tab-system.mjs";

const MODULE_ID = "dnd5e-tab-system";

Hooks.once("ready", () => {
  game.modules.get(MODULE_ID).api = {
    registerDynamicTab,
    restoreDynamicTabs,
    activateDynamicTab,
    deactivateDynamicTabs,
    DYNAMIC_TAB_ACTIVE,
  };

  console.log(`${MODULE_ID} | Ready`);
});

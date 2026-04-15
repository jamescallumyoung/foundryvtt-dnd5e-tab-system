# Tab System for D&D 5e

A FoundryVTT module that provides lifecycle management for dynamically-injected tabs on D&D 5e actor sheets (ApplicationV2).

ApplicationV2's native `TabsV2` ignores tabs injected at runtime. This module bridges that gap, supporting multiple tabs from one or more modules without collision.

## Requirements

- FoundryVTT v13+
- D&D 5e system v5.1.0+

## Usage

In your dependent module, call the API after the `ready` hook fires:

```js
// Register your tab once (init or ready):
game.modules.get("jych-dnd5e-tab-system").api.registerDynamicTab("my-tab");

// Restore state on every renderActorSheetV2:
Hooks.on("renderActorSheetV2", (app, [root]) => {
  game.modules.get("jych-dnd5e-tab-system").api.restoreDynamicTabs(app, root);
});
```

## API

| Function | Description |
|---|---|
| `registerDynamicTab(tabId)` | Register a tab ID. Idempotent. |
| `restoreDynamicTabs(app, root)` | Restore active state and wire listeners after each render. |
| `activateDynamicTab(app, root, tabId)` | Programmatically activate a tab. |
| `deactivateDynamicTabs(app, root)` | Deactivate all dynamic tabs, returning control to native tabs. |
| `DYNAMIC_TAB_ACTIVE` | Key used on the app instance to track the active dynamic tab. |

## Example

For an example of this module in use, check out [LaserLlama Alternate Artificer — Junker](https://github.com/jamescallumyoung/foundryvtt-dnd5e-laserllama-alt-artificer-junker).

## License

See [LICENSE](./LICENSE) for details.

import { App } from "./app.js?v=20260410f41";
import { createRoot, html } from "./react-shim.js";

const root = createRoot(document.getElementById("root"));
root.render(html`<${App} />`);

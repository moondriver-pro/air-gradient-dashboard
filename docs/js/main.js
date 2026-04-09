import { App } from "./app.js?v=20260409f19";
import { createRoot, html } from "./react-shim.js";

const root = createRoot(document.getElementById("root"));
root.render(html`<${App} />`);

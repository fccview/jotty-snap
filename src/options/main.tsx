import { render } from "preact";
import { App } from "@/options/App";
import "@/ui/styles.css";

const mount = document.getElementById("app");
if (mount) render(<App />, mount);

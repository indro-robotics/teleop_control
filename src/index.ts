import { ExtensionContext } from "@foxglove/studio";
import { initTeleopPanel } from "./TeleopPanel";

export function activate(extensionContext: ExtensionContext): void {
  extensionContext.registerPanel({ name: "teleOP_Control", initPanel: initTeleopPanel });
}

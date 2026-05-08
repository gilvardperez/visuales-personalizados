import { KpiRenderData } from "./types";
import { VisualSettings } from "../settings";

export function render(container: HTMLElement, data: KpiRenderData, settings: VisualSettings): void {
    const wrapper = document.createElement("div");
    wrapper.className = "kpi-card kpi-default";

    const label = document.createElement("div");
    label.className = "kpi-label";
    label.textContent = data.label;
    label.style.fontSize = `${settings.labelFontSize}px`;

    const value = document.createElement("div");
    value.className = "kpi-value";
    value.textContent = data.valueText;
    value.style.fontSize = `${settings.valueFontSize}px`;
    value.style.color = settings.valueColor;

    const delta = document.createElement("div");
    delta.className = "kpi-delta";

    if (data.deltaText) {
        const positive = !!data.isDeltaPositive;
        delta.textContent = `${positive ? "▲" : "▼"} ${data.deltaText}`;
        delta.style.color = positive ? settings.positiveColor : settings.negativeColor;
    }

    if (settings.labelPosition === "top") {
        wrapper.appendChild(label);
        wrapper.appendChild(value);
    } else {
        wrapper.appendChild(value);
        wrapper.appendChild(label);
    }

    wrapper.appendChild(delta);
    container.appendChild(wrapper);
}

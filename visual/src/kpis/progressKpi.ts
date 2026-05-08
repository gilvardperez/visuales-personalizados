import { KpiRenderData } from "./types";
import { VisualSettings } from "../settings";

export function render(container: HTMLElement, data: KpiRenderData, settings: VisualSettings): void {
    const wrapper = document.createElement("div");
    wrapper.className = "kpi-card kpi-progress";

    const label = document.createElement("div");
    label.className = "kpi-label";
    label.textContent = data.label;
    label.style.fontSize = `${settings.labelFontSize}px`;

    const value = document.createElement("div");
    value.className = "kpi-value";
    value.textContent = data.valueText;
    value.style.fontSize = `${settings.valueFontSize}px`;
    value.style.color = settings.valueColor;

    const ratio = Math.max(0, data.progressRatio ?? 0);
    const displayRatio = Math.min(ratio, 1);

    const progressTrack = document.createElement("div");
    progressTrack.className = "kpi-progress-track";

    const progressFill = document.createElement("div");
    progressFill.className = "kpi-progress-fill";
    progressFill.style.width = `${displayRatio * 100}%`;
    progressFill.style.backgroundColor = ratio > 1 ? settings.successColor : settings.progressColor;

    progressTrack.appendChild(progressFill);

    const progressText = document.createElement("div");
    progressText.className = "kpi-progress-text";
    progressText.textContent = `${(ratio * 100).toFixed(settings.decimalPlaces)}%`;

    if (settings.labelPosition === "top") {
        wrapper.appendChild(label);
        wrapper.appendChild(value);
    } else {
        wrapper.appendChild(value);
        wrapper.appendChild(label);
    }

    wrapper.appendChild(progressTrack);
    wrapper.appendChild(progressText);
    container.appendChild(wrapper);
}

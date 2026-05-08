import { KpiRenderData } from "./types";
import { VisualSettings } from "../settings";
import { appendTopSection, clearAndCreateCard, getViewport, renderNoData } from "./_shared";

export function renderProgressKpi(container: HTMLElement, data: KpiRenderData, settings: VisualSettings): void {
    if (!data) {
        renderNoData(container);
        return;
    }

    const viewport = getViewport(container);
    const card = clearAndCreateCard(container, "progress");
    appendTopSection(card, data, settings, viewport);

    const ratio = Math.max(0, data.progressRatio ?? 0);
    const displayRatio = Math.min(ratio, 1);

    const track = document.createElement("div");
    track.className = "kpi-progress-track";

    const fill = document.createElement("div");
    fill.className = "kpi-progress-fill";
    fill.style.width = `${displayRatio * 100}%`;
    fill.style.backgroundColor = ratio > 1 ? settings.successColor : settings.progressColor;
    track.appendChild(fill);

    const text = document.createElement("div");
    text.className = "kpi-progress-text";
    text.textContent = `${(ratio * 100).toFixed(settings.decimalPlaces)}%`;

    card.appendChild(track);
    card.appendChild(text);
}

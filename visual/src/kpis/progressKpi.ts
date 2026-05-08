import { KpiRenderData } from "./types";
import { VisualSettings } from "../settings";
import { appendTopSection, applyCardContainer, getViewport, renderNoData, resolveTheme } from "./_shared";

export function renderProgressKpi(container: HTMLElement, data: KpiRenderData, settings: VisualSettings): void {
    if (!data) {
        renderNoData(container);
        return;
    }

    const viewport = getViewport(container);
    const theme = resolveTheme(settings, viewport);
    const card = applyCardContainer(container, settings, theme, "progress");
    const targetText = data.comparisonText ?? "Sin meta";

    appendTopSection(card, data, settings, viewport, theme, {
        subtitleOverride: `Meta: ${targetText}`,
        suppressComparisonSubtitle: true
    });

    const ratio = Math.max(0, data.progressRatio ?? 0);
    const displayRatio = Math.min(ratio, 1);

    const track = document.createElement("div");
    track.className = "kpi-progress-track";

    const fill = document.createElement("div");
    fill.className = "kpi-progress-fill";
    fill.style.width = `${displayRatio * 100}%`;
    fill.style.backgroundColor = ratio > 1 ? theme.positive : (settings.progressColor || theme.accent);

    track.appendChild(fill);

    const text = document.createElement("div");
    text.className = "kpi-progress-text";
    text.textContent = `${(ratio * 100).toFixed(settings.decimalPlaces)}% logro`;

    card.appendChild(track);
    card.appendChild(text);
}

import { KpiRenderData } from "./types";
import { VisualSettings } from "../settings";
import {
    applyCardContainer,
    formatValue,
    getViewport,
    renderDeltaBadge,
    renderHeader,
    renderNoData,
    resolveTheme
} from "./_shared";

export function renderComparisonKpi(container: HTMLElement, data: KpiRenderData, settings: VisualSettings): void {
    if (!data) {
        renderNoData(container);
        return;
    }

    const viewport = getViewport(container);
    const theme = resolveTheme(settings, viewport);
    const card = applyCardContainer(container, settings, theme, "comparison");
    renderHeader(card, data.label, settings.titleText, settings, theme, viewport);

    const target = Math.max(1, data.comparison ?? data.value);
    const actualPct = Math.min(100, (Math.max(0, data.value) / target) * 100);

    const chart = document.createElement("div");
    chart.className = "kpi-comparison-chart";

    chart.appendChild(buildRow("Actual", actualPct, theme.accent, formatValue(data.value, settings)));
    chart.appendChild(buildRow("Target", 100, theme.neutral, formatValue(target, settings)));

    card.appendChild(chart);
    renderDeltaBadge(card, data.deltaRaw, settings, theme, data.deltaText);
}

function buildRow(label: string, pct: number, barColor: string, valueText: string): HTMLDivElement {
    const row = document.createElement("div");
    row.className = "kpi-comparison-row";

    const labelEl = document.createElement("span");
    labelEl.textContent = label;

    const track = document.createElement("div");
    const fill = document.createElement("div");
    fill.style.width = `${pct}%`;
    fill.style.background = barColor;
    track.appendChild(fill);

    const value = document.createElement("strong");
    value.textContent = valueText;

    row.appendChild(labelEl);
    row.appendChild(track);
    row.appendChild(value);

    return row;
}

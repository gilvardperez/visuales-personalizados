import { KpiRenderData } from "./types";
import { VisualSettings } from "../settings";
import { applyCardContainer, formatValue, getViewport, renderHeader, renderNoData, resolveTheme } from "./_shared";

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
    const actualRatio = Math.max(0, Math.min(1, data.value / target));

    const chart = document.createElement("div");
    chart.className = "kpi-comparison-chart";
    chart.appendChild(buildRow("Actual", actualRatio, settings.progressColor || theme.accent, formatValue(data.value, settings)));
    chart.appendChild(buildRow("Meta", 1, theme.border, formatValue(target, settings)));
    card.appendChild(chart);

    const diff = document.createElement("div");
    diff.className = "kpi-comparison-diff";
    if (data.deltaRaw !== undefined && Number.isFinite(data.deltaRaw)) {
        const positive = data.deltaRaw >= 0;
        const sign = positive ? "+" : "";
        const arrow = settings.deltaShowArrow ? (positive ? "▲" : "▼") : "";
        diff.style.color = positive ? theme.positive : theme.negative;
        diff.textContent = `${arrow ? `${arrow} ` : ""}${sign}${(data.deltaRaw * 100).toFixed(settings.decimalPlaces)}%`;
    }
    card.appendChild(diff);
}

function buildRow(label: string, ratio: number, barColor: string, valueText: string): HTMLDivElement {
    const row = document.createElement("div");
    row.className = "kpi-comparison-row";

    const labelEl = document.createElement("span");
    labelEl.textContent = label;

    const track = document.createElement("div");
    const fill = document.createElement("div");
    fill.style.width = `${Math.max(0, Math.min(1, ratio)) * 100}%`;
    fill.style.background = barColor;
    track.appendChild(fill);

    const value = document.createElement("strong");
    value.textContent = valueText;

    row.appendChild(labelEl);
    row.appendChild(track);
    row.appendChild(value);
    return row;
}

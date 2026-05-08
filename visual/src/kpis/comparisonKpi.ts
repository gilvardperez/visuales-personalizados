import { KpiRenderData } from "./types";
import { VisualSettings } from "../settings";
import { applyCardContainer, buildChartBlock, clamp, formatValue, getViewport, renderDeltaBadge, renderHeader, renderNoData, resolveTheme } from "./_shared";

export function renderComparisonKpi(container: HTMLElement, data: KpiRenderData, settings: VisualSettings): void {
    if (!data) {
        renderNoData(container);
        return;
    }

    const viewport = getViewport(container);
    const theme = resolveTheme(settings, viewport);
    const card = applyCardContainer(container, settings, theme, "comparison");

    const { label } = renderHeader(card, data.label, settings.titleText, settings, theme, viewport);
    const topRow = document.createElement("div");
    topRow.className = "kpi-top-row";
    topRow.appendChild(label);
    renderDeltaBadge(topRow, data.deltaRaw, settings, theme, data.deltaText);
    card.appendChild(topRow);

    const target = data.comparison !== null && data.comparison !== undefined && data.comparison > 0
        ? data.comparison
        : Math.max(1, data.value);

    const bigger = Math.max(data.value, target);
    const actualRatio = clamp(data.value / bigger, 0, 1);
    const targetRatio = clamp(target / bigger, 0, 1);

    const accentColor = settings.progressColor || theme.accent;

    const chartBlock = buildChartBlock(card);
    chartBlock.style.justifyContent = "center";

    const chart = document.createElement("div");
    chart.className = "kpi-comparison-chart";
    chart.style.gap = "10px";
    chart.appendChild(buildBar("ACTUAL", actualRatio, accentColor, data.valueText));
    chart.appendChild(buildBar("META", targetRatio, theme.border, formatValue(target, settings), theme.textSecondary));
    chartBlock.appendChild(chart);

    // Absolute + percentage difference
    if (data.deltaRaw !== undefined && Number.isFinite(data.deltaRaw)) {
        const diff = document.createElement("div");
        diff.className = "kpi-comparison-diff";
        const isPositive = data.deltaRaw >= 0;
        const arrow = settings.deltaShowArrow ? (isPositive ? "▲" : "▼") : "";
        const sign = isPositive ? "+" : "";
        const absDiff = Math.abs(data.value - target);
        const absText = formatValue(absDiff, settings);
        const pctText = `${sign}${(data.deltaRaw * 100).toFixed(settings.decimalPlaces)}%`;
        diff.textContent = `${arrow ? `${arrow} ` : ""}${sign}${absText} (${pctText})`;
        diff.style.color = isPositive ? theme.positive : theme.negative;
        chartBlock.appendChild(diff);
    }
}

function buildBar(label: string, ratio: number, fillColor: string, valueText: string, textColor?: string): HTMLDivElement {
    const wrap = document.createElement("div");
    wrap.className = "kpi-comparison-bar-wrap";

    const labelEl = document.createElement("div");
    labelEl.className = "kpi-comparison-bar-label";
    labelEl.textContent = label;
    wrap.appendChild(labelEl);

    const outer = document.createElement("div");
    outer.className = "kpi-comparison-bar-outer";

    const fill = document.createElement("div");
    fill.className = "kpi-comparison-bar-fill";
    fill.style.width = `${Math.max(4, ratio * 100)}%`; // 4% min ensures bar is always visible
    fill.style.backgroundColor = fillColor;

    const valEl = document.createElement("div");
    valEl.className = "kpi-comparison-bar-value";
    valEl.textContent = valueText;
    if (textColor) {
        valEl.style.color = textColor;
    }

    fill.appendChild(valEl);
    outer.appendChild(fill);
    wrap.appendChild(outer);
    return wrap;
}


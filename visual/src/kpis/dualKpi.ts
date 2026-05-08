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

export function renderDualKpi(container: HTMLElement, data: KpiRenderData, settings: VisualSettings): void {
    if (!data) {
        renderNoData(container);
        return;
    }

    const viewport = getViewport(container);
    const theme = resolveTheme(settings, viewport);
    const card = applyCardContainer(container, settings, theme, "dual");
    renderHeader(card, data.label, settings.titleText, settings, theme, viewport);

    const dual = document.createElement("div");
    dual.className = "kpi-dual-grid";

    const primary = document.createElement("div");
    primary.className = "kpi-dual-item";
    const primaryLabel = document.createElement("div");
    primaryLabel.className = "kpi-dual-label";
    primaryLabel.textContent = data.label;
    const primaryValue = document.createElement("div");
    primaryValue.className = "kpi-dual-value";
    primaryValue.textContent = data.valueText;
    primary.appendChild(primaryLabel);
    primary.appendChild(primaryValue);

    const secondary = document.createElement("div");
    secondary.className = "kpi-dual-item";
    const secondaryLabel = document.createElement("div");
    secondaryLabel.className = "kpi-dual-label";
    secondaryLabel.textContent = data.comparison !== null ? "Target" : "Secondary";
    const secondaryValue = document.createElement("div");
    secondaryValue.className = "kpi-dual-value";
    secondaryValue.textContent = data.comparison !== null ? formatValue(data.comparison, settings) : "—";
    secondary.appendChild(secondaryLabel);
    secondary.appendChild(secondaryValue);

    renderDeltaBadge(primary, data.deltaRaw, settings, theme, data.deltaText);

    const trendDelta = computeDeltaFromSeries(data.trendPoints);
    renderDeltaBadge(secondary, trendDelta, settings, theme, `${trendDelta >= 0 ? "+" : ""}${(trendDelta * 100).toFixed(settings.decimalPlaces)}%`);

    dual.appendChild(primary);
    dual.appendChild(secondary);
    card.appendChild(dual);
}

function computeDeltaFromSeries(points: KpiRenderData["trendPoints"]): number {
    if (points.length < 2) {
        return 0;
    }

    const last = points[points.length - 1].y;
    const previous = points[points.length - 2].y;

    if (previous === 0) {
        return 0;
    }

    return (last - previous) / previous;
}

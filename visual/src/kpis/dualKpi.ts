import { KpiRenderData } from "./types";
import { VisualSettings } from "../settings";
import { buildTitle, clearAndCreateCard, formatNumber, getViewport, renderNoData } from "./_shared";

export function renderDualKpi(container: HTMLElement, data: KpiRenderData, settings: VisualSettings): void {
    if (!data) {
        renderNoData(container);
        return;
    }

    const viewport = getViewport(container);
    const card = clearAndCreateCard(container, "dual");

    const title = buildTitle(settings, viewport);
    if (title) {
        card.appendChild(title);
    }

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

    const comparisonLabel = data.comparison !== null ? "Comparison" : "Secondary";
    const secondaryValue = data.comparison !== null ? formatNumber(data.comparison, settings) : "—";
    const secondary = document.createElement("div");
    secondary.className = "kpi-dual-item";
    const secondaryLabel = document.createElement("div");
    secondaryLabel.className = "kpi-dual-label";
    secondaryLabel.textContent = comparisonLabel;
    const secondaryValueEl = document.createElement("div");
    secondaryValueEl.className = "kpi-dual-value";
    secondaryValueEl.textContent = secondaryValue;
    secondary.appendChild(secondaryLabel);
    secondary.appendChild(secondaryValueEl);

    const trendDelta = computeDeltaFromSeries(data.trendPoints);
    const comparisonDelta = data.trendComparisonPoints.length ? computeDeltaFromSeries(data.trendComparisonPoints) : trendDelta;

    const primaryDelta = document.createElement("div");
    primaryDelta.className = `kpi-dual-delta ${trendDelta >= 0 ? "is-pos" : "is-neg"}`;
    primaryDelta.textContent = `${trendDelta >= 0 ? "+" : ""}${trendDelta.toFixed(settings.decimalPlaces)}%`;
    primary.appendChild(primaryDelta);

    const secondaryDelta = document.createElement("div");
    secondaryDelta.className = `kpi-dual-delta ${comparisonDelta >= 0 ? "is-pos" : "is-neg"}`;
    secondaryDelta.textContent = `${comparisonDelta >= 0 ? "+" : ""}${comparisonDelta.toFixed(settings.decimalPlaces)}%`;
    secondary.appendChild(secondaryDelta);

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

    return ((last - previous) / previous) * 100;
}

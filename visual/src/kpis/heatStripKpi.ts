import * as d3 from "d3";
import { KpiRenderData } from "./types";
import { VisualSettings } from "../settings";
import {
    appendTopSection,
    applyCardContainer,
    getViewport,
    renderNoData,
    resolveTheme,
    shouldHideMiniChart
} from "./_shared";

export function renderHeatStripKpi(container: HTMLElement, data: KpiRenderData, settings: VisualSettings): void {
    if (!data) {
        renderNoData(container);
        return;
    }

    const viewport = getViewport(container);
    const theme = resolveTheme(settings, viewport);
    const card = applyCardContainer(container, settings, theme, "heat-strip");
    appendTopSection(card, data, settings, viewport, false, theme);

    if (!data.trendPoints.length || shouldHideMiniChart(viewport)) {
        return;
    }

    const host = document.createElement("div");
    host.className = "kpi-heat-strip";
    card.appendChild(host);

    const max = d3.max(data.trendPoints, (d) => d.y) ?? 1;
    const minColor = theme.mode === "dark" ? "#1E293B" : "#DBEAFE";
    const scale = d3.scaleLinear<string>()
        .domain([0, max])
        .range([minColor, theme.accent]);

    data.trendPoints.slice(0, 12).forEach((point) => {
        const cell = document.createElement("div");
        cell.className = "kpi-heat-cell";
        cell.style.backgroundColor = scale(point.y);
        cell.title = `${point.x}: ${point.y.toFixed(settings.decimalPlaces)}`;
        host.appendChild(cell);
    });
}

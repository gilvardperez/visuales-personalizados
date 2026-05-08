import * as d3 from "d3";
import { KpiRenderData } from "./types";
import { VisualSettings } from "../settings";
import {
    appendTopSection,
    clearAndCreateCard,
    clamp,
    formatNumber,
    getViewport,
    renderLastValueLabel,
    renderMonthLabels,
    renderNoData
} from "./_shared";

export function renderBarsKpi(container: HTMLElement, data: KpiRenderData, settings: VisualSettings): void {
    if (!data) {
        renderNoData(container);
        return;
    }

    const viewport = getViewport(container);
    const card = clearAndCreateCard(container, "bars");
    appendTopSection(card, data, settings, viewport);

    if (!data.trendPoints.length) {
        return;
    }

    const host = document.createElement("div");
    host.className = "kpi-chart-host";
    card.appendChild(host);

    const width = Math.max(160, viewport.width - 24);
    const chartHeight = clamp(settings.chartHeight, 20, 200);
    const height = Math.min(chartHeight, Math.max(62, Math.floor(viewport.height * 0.55)));

    const svg = d3.select(host)
        .append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("width", "100%")
        .attr("height", height);

    const xScale = d3.scaleBand<number>()
        .domain(d3.range(data.trendPoints.length))
        .range([8, width - 8])
        .padding(0.25);

    const maxY = d3.max(data.trendPoints, (d) => d.y) ?? 0;
    const yScale = d3.scaleLinear().domain([0, maxY <= 0 ? 1 : maxY]).range([height - 20, 8]);

    svg.selectAll("rect.kpi-bar")
        .data(data.trendPoints)
        .join("rect")
        .attr("class", "kpi-bar")
        .attr("x", (_, index) => xScale(index) ?? 0)
        .attr("y", (d) => yScale(Math.max(0, d.y)))
        .attr("width", xScale.bandwidth())
        .attr("height", (d) => Math.max(1, height - 20 - yScale(Math.max(0, d.y))))
        .attr("fill", (d, index) => settings.highlightLastPoint && index === data.trendPoints.length - 1 ? settings.highlightColor : settings.barColor);

    if (settings.showLastValueLabel) {
        const lastIndex = data.trendPoints.length - 1;
        const last = data.trendPoints[lastIndex];
        const x = (xScale(lastIndex) ?? 0) + xScale.bandwidth() / 2;
        const y = yScale(Math.max(0, last.y));
        renderLastValueLabel(svg, x, y, formatNumber(last.y, settings), settings.highlightLastPoint ? settings.highlightColor : settings.barColor);
    }

    renderMonthLabels(svg, data.trendPoints, (index) => (xScale(index) ?? 0) + xScale.bandwidth() / 2, height);
}

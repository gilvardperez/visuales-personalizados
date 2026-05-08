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

export function renderBarsLineKpi(container: HTMLElement, data: KpiRenderData, settings: VisualSettings): void {
    if (!data) {
        renderNoData(container);
        return;
    }

    const viewport = getViewport(container);
    const card = clearAndCreateCard(container, "bars-line");
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

    const xBand = d3.scaleBand<number>().domain(d3.range(data.trendPoints.length)).range([8, width - 8]).padding(0.25);
    const xLine = d3.scaleLinear().domain([0, data.trendPoints.length - 1]).range([8 + xBand.bandwidth() / 2, width - 8 - xBand.bandwidth() / 2]);
    const maxY = d3.max(data.trendPoints, (d) => d.y) ?? 0;
    const yScale = d3.scaleLinear().domain([0, maxY <= 0 ? 1 : maxY]).range([height - 20, 8]);

    svg.selectAll("rect.kpi-bar-bg")
        .data(data.trendPoints)
        .join("rect")
        .attr("class", "kpi-bar-bg")
        .attr("x", (_, index) => xBand(index) ?? 0)
        .attr("y", (d) => yScale(Math.max(0, d.y)))
        .attr("width", xBand.bandwidth())
        .attr("height", (d) => Math.max(1, height - 20 - yScale(Math.max(0, d.y))))
        .attr("fill", "#E5E7EB");

    const line = d3.line<typeof data.trendPoints[number]>()
        .x((_, index) => xLine(index))
        .y((d) => yScale(Math.max(0, d.y)))
        .curve(d3.curveMonotoneX);

    svg.append("path")
        .datum(data.trendPoints)
        .attr("fill", "none")
        .attr("stroke", settings.lineColor)
        .attr("stroke-width", 2)
        .attr("d", line);

    const lastIndex = data.trendPoints.length - 1;
    const last = data.trendPoints[lastIndex];
    const markerColor = settings.highlightLastPoint ? settings.highlightColor : settings.lineColor;

    svg.append("circle")
        .attr("cx", xLine(lastIndex))
        .attr("cy", yScale(last.y))
        .attr("r", 3)
        .attr("fill", markerColor);

    if (settings.showLastValueLabel) {
        renderLastValueLabel(svg, xLine(lastIndex), yScale(last.y), formatNumber(last.y, settings), markerColor);
    }

    renderMonthLabels(svg, data.trendPoints, (index) => xLine(index), height);
}

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

export function renderAreaKpi(container: HTMLElement, data: KpiRenderData, settings: VisualSettings): void {
    if (!data) {
        renderNoData(container);
        return;
    }

    const viewport = getViewport(container);
    const card = clearAndCreateCard(container, "area");
    appendTopSection(card, data, settings, viewport);

    if (!data.trendPoints.length) {
        return;
    }

    const host = document.createElement("div");
    host.className = "kpi-chart-host";
    card.appendChild(host);

    const width = Math.max(160, viewport.width - 24);
    const chartHeight = clamp(settings.chartHeight, 20, 200);
    const height = Math.min(chartHeight, Math.max(56, Math.floor(viewport.height * 0.52)));

    const svg = d3.select(host)
        .append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("width", "100%")
        .attr("height", height);

    const xScale = d3.scaleLinear().domain([0, data.trendPoints.length - 1]).range([8, width - 8]);
    const extent = d3.extent(data.trendPoints, (d) => d.y);
    const minY = extent[0] ?? 0;
    const maxY = extent[1] ?? 0;
    const yScale = d3.scaleLinear()
        .domain(minY === maxY ? [minY - 1, maxY + 1] : [minY, maxY])
        .range([height - 20, 8]);

    const area = d3.area<typeof data.trendPoints[number]>()
        .x((_, i) => xScale(i))
        .y0(height - 20)
        .y1((d) => yScale(d.y))
        .curve(d3.curveMonotoneX);

    const line = d3.line<typeof data.trendPoints[number]>()
        .x((_, i) => xScale(i))
        .y((d) => yScale(d.y))
        .curve(d3.curveMonotoneX);

    svg.append("path")
        .datum(data.trendPoints)
        .attr("fill", settings.progressColor)
        .attr("fill-opacity", clamp(settings.areaFillOpacity, 0, 1))
        .attr("d", area);

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
        .attr("cx", xScale(lastIndex))
        .attr("cy", yScale(last.y))
        .attr("r", 3)
        .attr("fill", markerColor);

    if (settings.showLastValueLabel) {
        renderLastValueLabel(svg, xScale(lastIndex), yScale(last.y), formatNumber(last.y, settings), markerColor);
    }

    renderMonthLabels(svg, data.trendPoints, (index) => xScale(index), height);
}

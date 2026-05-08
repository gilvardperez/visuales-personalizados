import * as d3 from "d3";
import { KpiRenderData } from "./types";
import { VisualSettings } from "../settings";
import {
    appendTopSection,
    applyCardContainer,
    createGradient,
    createUniqueId,
    formatValue,
    getChartHeight,
    getViewport,
    renderLastValueLabel,
    renderMonthLabels,
    renderNoData,
    resolveTheme,
    shouldHideMiniChart
} from "./_shared";

export function renderAreaKpi(container: HTMLElement, data: KpiRenderData, settings: VisualSettings): void {
    if (!data) {
        renderNoData(container);
        return;
    }

    const viewport = getViewport(container);
    const theme = resolveTheme(settings, viewport);
    const card = applyCardContainer(container, settings, theme, "area");
    appendTopSection(card, data, settings, viewport, theme);

    if (!data.trendPoints.length || shouldHideMiniChart(viewport)) {
        return;
    }

    const host = document.createElement("div");
    host.className = "kpi-chart-host";
    card.appendChild(host);

    const width = Math.max(120, viewport.width - 32);
    const height = getChartHeight(settings, viewport, 0.45, 62);

    const svg = d3.select(host)
        .append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("width", "100%")
        .attr("height", "100%");

    const xScale = d3.scaleLinear().domain([0, data.trendPoints.length - 1]).range([10, width - 10]);
    const extent = d3.extent(data.trendPoints, (d) => d.y);
    const minY = extent[0] ?? 0;
    const maxY = extent[1] ?? 0;
    const yScale = d3.scaleLinear()
        .domain(minY === maxY ? [minY - 1, maxY + 1] : [minY, maxY])
        .range([height - 22, 12]);

    const area = d3.area<typeof data.trendPoints[number]>()
        .x((_, i) => xScale(i))
        .y0(height - 22)
        .y1((d) => yScale(d.y))
        .curve(d3.curveMonotoneX);

    const line = d3.line<typeof data.trendPoints[number]>()
        .x((_, i) => xScale(i))
        .y((d) => yScale(d.y))
        .curve(d3.curveMonotoneX);

    const areaFill = settings.useGradient
        ? createGradient(svg, createUniqueId("area"), settings.progressColor || theme.accent)
        : (settings.progressColor || theme.accent);

    svg.append("path")
        .datum(data.trendPoints)
        .attr("fill", areaFill)
        .attr("fill-opacity", settings.useGradient ? 1 : settings.areaFillOpacity)
        .attr("d", area);

    svg.append("path")
        .datum(data.trendPoints)
        .attr("fill", "none")
        .attr("stroke", settings.lineColor || theme.accent)
        .attr("stroke-width", 1.75)
        .attr("d", line);

    const lastIndex = data.trendPoints.length - 1;
    const last = data.trendPoints[lastIndex];
    const markerColor = settings.highlightLastPoint ? settings.highlightColor : (settings.lineColor || theme.accent);
    const markerX = xScale(lastIndex);
    const markerY = yScale(last.y);

    svg.append("circle")
        .attr("cx", markerX)
        .attr("cy", markerY)
        .attr("r", 3)
        .attr("fill", markerColor);

    if (settings.showLastValueLabel) {
        renderLastValueLabel(svg, markerX, markerY - 10, formatValue(last.y, settings), markerColor, { width, top: 6 });
    }

    renderMonthLabels(svg, data.trendPoints, (index) => xScale(index), height);
}

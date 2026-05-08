import * as d3 from "d3";
import { KpiRenderData } from "./types";
import { VisualSettings } from "../settings";
import {
    applyAnimation,
    applyCardContainer,
    buildLabel,
    buildValue,
    createGradient,
    createUniqueId,
    formatValue,
    getChartHeight,
    getViewport,
    renderDeltaBadge,
    renderLastValueLabel,
    renderMonthLabels,
    renderNoData,
    resolveTheme,
    shouldHideMiniChart
} from "./_shared";

export function renderMicrochartKpi(container: HTMLElement, data: KpiRenderData, settings: VisualSettings): void {
    if (!data) {
        renderNoData(container);
        return;
    }

    const viewport = getViewport(container);
    const theme = resolveTheme(settings, viewport);
    const card = applyCardContainer(container, settings, theme, "microchart");

    const row = document.createElement("div");
    row.className = "kpi-value-row";
    const value = buildValue(data.valueText, settings, viewport, theme);
    const delta = renderDeltaBadge(document.createElement("div"), data.deltaRaw, settings, theme, data.deltaText);
    row.appendChild(value);
    if (viewport.width >= 200) {
        row.appendChild(delta);
    }

    const label = buildLabel(data.label, settings, viewport, theme);

    if (settings.labelPosition === "top") {
        card.appendChild(label);
        card.appendChild(row);
    } else {
        card.appendChild(row);
        card.appendChild(label);
    }

    if (viewport.width < 200) {
        card.appendChild(delta);
    }

    const points = data.trendPoints;
    if (!points.length || shouldHideMiniChart(viewport)) {
        return;
    }

    const host = document.createElement("div");
    host.className = "kpi-chart-host";
    card.appendChild(host);

    const width = Math.max(120, viewport.width - 30);
    const height = getChartHeight(settings, viewport, 0.5, 48);

    const svg = d3.select(host)
        .append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("width", "100%")
        .attr("height", height);

    const xScale = d3.scaleLinear().domain([0, points.length - 1]).range([8, width - 8]);
    const extent = d3.extent(points, (d) => d.y);
    const minY = extent[0] ?? 0;
    const maxY = extent[1] ?? 0;
    const yScale = d3.scaleLinear()
        .domain(minY === maxY ? [minY - 1, maxY + 1] : [minY, maxY])
        .range([height - 20, 8]);

    const line = d3.line<typeof points[number]>()
        .x((_, i) => xScale(i))
        .y((d) => yScale(d.y))
        .curve(d3.curveMonotoneX);

    if (settings.useGradient) {
        const area = d3.area<typeof points[number]>()
            .x((_, i) => xScale(i))
            .y0(height - 20)
            .y1((d) => yScale(d.y))
            .curve(d3.curveMonotoneX);

        svg.append("path")
            .datum(points)
            .attr("fill", createGradient(svg, createUniqueId('micro'), theme.accent))
            .attr("d", area);
    }

    const linePath = svg.append("path")
        .datum(points)
        .attr("class", "kpi-line")
        .attr("fill", "none")
        .attr("stroke", settings.lineColor || theme.accent)
        .attr("stroke-width", 2)
        .attr("d", line);

    applyAnimation(linePath.node() as SVGPathElement, "line", settings);

    const lastIndex = points.length - 1;
    const last = points[lastIndex];
    const markerColor = settings.highlightLastPoint ? settings.highlightColor : (settings.lineColor || theme.accent);

    svg.append("circle")
        .attr("cx", xScale(lastIndex))
        .attr("cy", yScale(last.y))
        .attr("r", 3)
        .attr("fill", markerColor);

    if (settings.showLastValueLabel) {
        renderLastValueLabel(svg, xScale(lastIndex), yScale(last.y), formatValue(last.y, settings), markerColor);
    }

    renderMonthLabels(svg, points, (index) => xScale(index), height);
}

import * as d3 from "d3";
import { KpiRenderData } from "./types";
import { VisualSettings } from "../settings";
import {
    appendTopSectionInline,
    applyCardContainer,
    buildChartBlock,
    clamp,
    colorWithAlpha,
    computeChartHeight,
    formatValue,
    getViewport,
    monthLabels,
    renderNoData,
    resolveTheme,
    shouldHideMiniChart,
    visibleTickIndexes
} from "./_shared";

export function renderAreaKpi(container: HTMLElement, data: KpiRenderData, settings: VisualSettings): void {
    if (!data) {
        renderNoData(container);
        return;
    }

    const viewport = getViewport(container);
    const theme = resolveTheme(settings, viewport);
    const card = applyCardContainer(container, settings, theme, "area");

    const suffix = settings.comparisonSuffix.trim();
    const metaLabel = data.comparison !== null && data.comparisonText
        ? `Meta: ${data.comparisonText}${suffix ? ` ${suffix}` : ""}`
        : "";

    appendTopSectionInline(card, data, settings, viewport, theme, metaLabel);

    if (!data.trendPoints.length || shouldHideMiniChart(viewport)) {
        return;
    }

    const chartBlock = buildChartBlock(card);
    const chartH = computeChartHeight(data, settings, viewport, false);
    const width = Math.max(80, viewport.width - 28);

    const svg = d3.select(chartBlock)
        .append("svg")
        .attr("viewBox", `0 0 ${width} ${chartH}`)
        .attr("width", "100%")
        .attr("height", chartH)
        .attr("preserveAspectRatio", "none");

    const labelH = 14; // height reserved for month labels
    const plotH = chartH - labelH;

    const xScale = d3.scaleLinear()
        .domain([0, Math.max(1, data.trendPoints.length - 1)])
        .range([0, width]);

    const extent = d3.extent(data.trendPoints, (d) => d.y);
    let minY = extent[0] ?? 0;
    let maxY = extent[1] ?? 0;

    // Include target in y-domain if present
    if (data.comparison !== null && data.comparison !== undefined) {
        minY = Math.min(minY, data.comparison);
        maxY = Math.max(maxY, data.comparison);
    }

    if (minY === maxY) {
        minY = minY - 1;
        maxY = maxY + 1;
    }
    const yPad = (maxY - minY) * 0.1; // 10% vertical padding so line/area doesn't clip at edges
    const yScale = d3.scaleLinear()
        .domain([minY - yPad, maxY + yPad])
        .range([plotH, 4]);

    const accentColor = settings.lineColor || theme.accent;

    // Area fill — solid color with opacity, NO gradient
    const area = d3.area<typeof data.trendPoints[number]>()
        .x((_, i) => xScale(i))
        .y0(plotH)
        .y1((d) => yScale(d.y))
        .curve(d3.curveMonotoneX);

    svg.append("path")
        .datum(data.trendPoints)
        .attr("fill", colorWithAlpha(accentColor, clamp(settings.areaFillOpacity, 0.08, 0.25)))
        .attr("d", area);

    // Line
    const line = d3.line<typeof data.trendPoints[number]>()
        .x((_, i) => xScale(i))
        .y((d) => yScale(d.y))
        .curve(d3.curveMonotoneX);

    svg.append("path")
        .datum(data.trendPoints)
        .attr("fill", "none")
        .attr("stroke", accentColor)
        .attr("stroke-width", 2)
        .attr("d", line);

    // Dashed target line
    if (data.comparison !== null && data.comparison !== undefined) {
        const ty = yScale(data.comparison);
        svg.append("line")
            .attr("x1", 0).attr("x2", width)
            .attr("y1", ty).attr("y2", ty)
            .attr("stroke", theme.textSecondary)
            .attr("stroke-width", 1)
            .attr("stroke-dasharray", "4,4");
    }

    // Last point circle
    const lastIndex = data.trendPoints.length - 1;
    const last = data.trendPoints[lastIndex];
    const markerX = xScale(lastIndex);
    const markerY = yScale(last.y);
    const markerColor = settings.highlightLastPoint ? (settings.highlightColor || theme.accent) : accentColor;

    svg.append("circle")
        .attr("cx", markerX).attr("cy", markerY)
        .attr("r", 3.5)
        .attr("fill", markerColor)
        .attr("stroke", theme.background)
        .attr("stroke-width", 1.5);

    // Last value label inside SVG (right-adjusted to avoid cutoff)
    if (settings.showLastValueLabel) {
        const labelText = formatValue(last.y, settings);
        const labelX = clamp(markerX, 18, width - 18);
        const labelY = Math.max(11, markerY - 6);
        svg.append("text")
            .attr("x", labelX)
            .attr("y", labelY)
            .attr("text-anchor", markerX > width * 0.8 ? "end" : "middle")
            .attr("font-size", 10)
            .attr("font-weight", 700)
            .attr("fill", markerColor)
            .text(labelText);
    }

    // Month labels
    const labels = monthLabels(data.trendPoints);
    const indexes = visibleTickIndexes(data.trendPoints.length);
    indexes.forEach((idx) => {
        svg.append("text")
            .attr("class", "kpi-month-label")
            .attr("x", xScale(idx))
            .attr("y", chartH - 2)
            .attr("text-anchor", "middle")
            .text(labels[idx]);
    });
}


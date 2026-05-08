import * as d3 from "d3";
import { KpiRenderData } from "./types";
import { VisualSettings } from "../settings";
import {
    appendTopSectionInline,
    applyCardContainer,
    buildChartBlock,
    clamp,
    computeChartHeight,
    formatValue,
    getViewport,
    monthLabels,
    renderNoData,
    resolveTheme,
    shouldHideMiniChart,
    visibleTickIndexes
} from "./_shared";

export function renderBarsKpi(container: HTMLElement, data: KpiRenderData, settings: VisualSettings): void {
    if (!data) {
        renderNoData(container);
        return;
    }

    const viewport = getViewport(container);
    const theme = resolveTheme(settings, viewport);
    const card = applyCardContainer(container, settings, theme, "bars");

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

    const labelH = 14;
    const plotH = chartH - labelH;

    const xScale = d3.scaleBand<number>()
        .domain(d3.range(data.trendPoints.length))
        .range([2, width - 2])
        .padding(0.15);

    const maxActual = d3.max(data.trendPoints, (d) => d.y) ?? 0;
    const domainMax = Math.max(1, maxActual, data.comparison ?? 0) * 1.05; // 5% headroom above tallest bar
    const yScale = d3.scaleLinear().domain([0, domainMax]).range([plotH, 2]);

    const barColor = settings.barColor || theme.accent;
    const lastColor = settings.highlightColor || theme.accent;

    // Optional: gray target bars (avg comparison per bar)
    const avgComparison = data.comparison && data.comparison > 0 ? data.comparison / data.trendPoints.length : null;

    if (avgComparison !== null) {
        svg.selectAll("rect.kpi-bar-bg")
            .data(data.trendPoints)
            .join("rect")
            .attr("class", "kpi-bar-bg")
            .attr("x", (_, i) => xScale(i) ?? 0)
            .attr("y", yScale(avgComparison))
            .attr("width", xScale.bandwidth())
            .attr("height", Math.max(1, plotH - yScale(avgComparison)))
            .attr("rx", 3)
            .attr("fill", theme.border);
    }

    // Actual value bars
    svg.selectAll("rect.kpi-bar")
        .data(data.trendPoints)
        .join("rect")
        .attr("class", "kpi-bar")
        .attr("x", (_, i) => xScale(i) ?? 0)
        .attr("y", (d) => yScale(clamp(d.y, 0, domainMax)))
        .attr("width", xScale.bandwidth())
        .attr("height", (d) => Math.max(1, plotH - yScale(clamp(d.y, 0, domainMax))))
        .attr("rx", 3)
        .attr("fill", (_, i) => (i === data.trendPoints.length - 1 ? lastColor : barColor));

    // Last bar value label
    if (settings.showLastValueLabel) {
        const lastIndex = data.trendPoints.length - 1;
        const last = data.trendPoints[lastIndex];
        const bx = (xScale(lastIndex) ?? 0) + xScale.bandwidth() / 2;
        const by = yScale(clamp(last.y, 0, domainMax));
        if (by > 14) {
            svg.append("text")
                .attr("class", "kpi-last-bar-label")
                .attr("x", bx)
                .attr("y", by - 3)
                .attr("text-anchor", "middle")
                .attr("font-size", 10)
                .attr("font-weight", 700)
                .attr("fill", lastColor)
                .text(formatValue(last.y, settings));
        }
    }

    // Month labels
    const labels = monthLabels(data.trendPoints);
    const indexes = visibleTickIndexes(data.trendPoints.length);
    indexes.forEach((idx) => {
        svg.append("text")
            .attr("class", "kpi-month-label")
            .attr("x", (xScale(idx) ?? 0) + xScale.bandwidth() / 2)
            .attr("y", chartH - 2)
            .attr("text-anchor", "middle")
            .text(labels[idx]);
    });
}


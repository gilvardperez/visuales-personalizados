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

export function renderStackedCompareKpi(container: HTMLElement, data: KpiRenderData, settings: VisualSettings): void {
    if (!data) {
        renderNoData(container);
        return;
    }

    const viewport = getViewport(container);
    const card = clearAndCreateCard(container, "stacked-compare");
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

    const xScale = d3.scaleBand<number>().domain(d3.range(data.trendPoints.length)).range([8, width - 8]).padding(0.25);

    const stackedPairs = data.trendPoints.map((point, index) => {
        const compareValue = data.trendComparisonPoints[index]?.y ?? 0;
        return {
            primary: Math.max(0, point.y),
            secondary: Math.max(0, compareValue)
        };
    });

    const maxTotal = d3.max(stackedPairs, (d) => d.primary + d.secondary) ?? 0;
    const yScale = d3.scaleLinear().domain([0, maxTotal <= 0 ? 1 : maxTotal]).range([height - 20, 8]);

    svg.selectAll("rect.kpi-stack-primary")
        .data(stackedPairs)
        .join("rect")
        .attr("class", "kpi-stack-primary")
        .attr("x", (_, index) => xScale(index) ?? 0)
        .attr("y", (d) => yScale(d.primary))
        .attr("width", xScale.bandwidth())
        .attr("height", (d) => Math.max(1, height - 20 - yScale(d.primary)))
        .attr("fill", settings.barColor);

    if (data.hasTrendComparison && data.trendComparisonPoints.length) {
        svg.selectAll("rect.kpi-stack-secondary")
            .data(stackedPairs)
            .join("rect")
            .attr("class", "kpi-stack-secondary")
            .attr("x", (_, index) => xScale(index) ?? 0)
            .attr("y", (d) => yScale(d.primary + d.secondary))
            .attr("width", xScale.bandwidth())
            .attr("height", (d) => Math.max(1, yScale(d.primary) - yScale(d.primary + d.secondary)))
            .attr("fill", "#9CA3AF");
    }

    if (settings.highlightLastPoint) {
        const lastIndex = data.trendPoints.length - 1;
        const lastX = xScale(lastIndex) ?? 0;

        svg.append("rect")
            .attr("x", lastX)
            .attr("y", 8)
            .attr("width", xScale.bandwidth())
            .attr("height", height - 28)
            .attr("fill", "none")
            .attr("stroke", settings.highlightColor)
            .attr("stroke-width", 2);
    }

    if (settings.showLastValueLabel) {
        const lastIndex = data.trendPoints.length - 1;
        const last = data.trendPoints[lastIndex];
        const x = (xScale(lastIndex) ?? 0) + xScale.bandwidth() / 2;
        const y = yScale(Math.max(0, last.y));
        renderLastValueLabel(svg, x, y, formatNumber(last.y, settings), settings.highlightColor);
    }

    renderMonthLabels(svg, data.trendPoints, (index) => (xScale(index) ?? 0) + xScale.bandwidth() / 2, height);
}

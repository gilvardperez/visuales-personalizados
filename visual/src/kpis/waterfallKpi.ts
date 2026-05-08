import * as d3 from "d3";
import { KpiRenderData } from "./types";
import { VisualSettings } from "../settings";
import {
    appendTopSection,
    applyAnimation,
    applyCardContainer,
    getChartHeight,
    getViewport,
    renderNoData,
    resolveTheme,
    shouldHideMiniChart
} from "./_shared";

export function renderWaterfallKpi(container: HTMLElement, data: KpiRenderData, settings: VisualSettings): void {
    if (!data) {
        renderNoData(container);
        return;
    }

    const viewport = getViewport(container);
    const theme = resolveTheme(settings, viewport);
    const card = applyCardContainer(container, settings, theme, "waterfall");
    appendTopSection(card, data, settings, viewport, false, theme);

    if (!data.trendPoints.length || shouldHideMiniChart(viewport)) {
        return;
    }

    const host = document.createElement("div");
    host.className = "kpi-chart-host";
    card.appendChild(host);

    const width = Math.max(120, viewport.width - 30);
    const height = getChartHeight(settings, viewport, 0.55, 62);

    const svg = d3.select(host)
        .append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("width", "100%")
        .attr("height", height);

    const diffs = data.trendPoints.map((point, index) => point.y - (data.trendPoints[index - 1]?.y ?? 0));
    const xScale = d3.scaleBand<number>().domain(d3.range(diffs.length)).range([8, width - 8]).padding(0.25);
    const maxAbs = d3.max(diffs.map((value) => Math.abs(value))) ?? 1;
    const yScale = d3.scaleLinear().domain([-maxAbs, maxAbs]).range([height - 20, 8]);

    svg.selectAll("rect.kpi-waterfall")
        .data(diffs)
        .join("rect")
        .attr("class", "kpi-waterfall")
        .attr("x", (_, index) => xScale(index) ?? 0)
        .attr("y", (value) => yScale(Math.max(0, value)))
        .attr("width", xScale.bandwidth())
        .attr("height", (value) => Math.abs(yScale(value) - yScale(0)))
        .attr("fill", (value) => value >= 0 ? theme.positive : theme.negative)
        .each(function () {
            applyAnimation(this as SVGRectElement, "bar", settings);
        });

    svg.selectAll("line.kpi-waterfall-link")
        .data(diffs.slice(0, -1))
        .join("line")
        .attr("class", "kpi-waterfall-link")
        .attr("x1", (_, index) => (xScale(index) ?? 0) + xScale.bandwidth())
        .attr("x2", (_, index) => (xScale(index + 1) ?? 0))
        .attr("y1", (_, index) => yScale(diffs[index] >= 0 ? diffs[index] : 0))
        .attr("y2", (_, index) => yScale(diffs[index + 1] >= 0 ? diffs[index + 1] : 0))
        .attr("stroke", theme.neutral)
        .attr("stroke-dasharray", "3,3");
}

import * as d3 from "d3";
import { KpiRenderData } from "./types";
import { VisualSettings } from "../settings";
import {
    appendTopSection,
    applyAnimation,
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

export function renderBarsKpi(container: HTMLElement, data: KpiRenderData, settings: VisualSettings): void {
    if (!data) {
        renderNoData(container);
        return;
    }

    const viewport = getViewport(container);
    const theme = resolveTheme(settings, viewport);
    const card = applyCardContainer(container, settings, theme, "bars");
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

    const xScale = d3.scaleBand<number>()
        .domain(d3.range(data.trendPoints.length))
        .range([8, width - 8])
        .padding(0.25);

    const maxY = d3.max(data.trendPoints, (d) => d.y) ?? 0;
    const yScale = d3.scaleLinear().domain([0, maxY <= 0 ? 1 : maxY]).range([height - 20, 8]);

    const gradient = settings.useGradient
        ? createGradient(svg, createUniqueId('bars'), settings.barColor || theme.accent)
        : "";

    svg.selectAll("rect.kpi-bar")
        .data(data.trendPoints)
        .join("rect")
        .attr("class", "kpi-bar")
        .attr("x", (_, index) => xScale(index) ?? 0)
        .attr("y", (d) => yScale(Math.max(0, d.y)))
        .attr("width", xScale.bandwidth())
        .attr("height", (d) => Math.max(1, height - 20 - yScale(Math.max(0, d.y))))
        .attr("fill", (d, index) => {
            if (settings.highlightLastPoint && index === data.trendPoints.length - 1) {
                return settings.highlightColor;
            }
            return settings.useGradient ? gradient : (settings.barColor || theme.accent);
        })
        .each(function () {
            applyAnimation(this as SVGRectElement, "bar", settings);
        });

    if (settings.showLastValueLabel) {
        const lastIndex = data.trendPoints.length - 1;
        const last = data.trendPoints[lastIndex];
        const x = (xScale(lastIndex) ?? 0) + xScale.bandwidth() / 2;
        const y = yScale(Math.max(0, last.y));
        renderLastValueLabel(svg, x, y, formatValue(last.y, settings), settings.highlightLastPoint ? settings.highlightColor : (settings.barColor || theme.accent));
    }

    renderMonthLabels(svg, data.trendPoints, (index) => (xScale(index) ?? 0) + xScale.bandwidth() / 2, height);
}

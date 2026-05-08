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
    appendTopSection(card, data, settings, viewport, theme);

    if (!data.trendPoints.length || shouldHideMiniChart(viewport)) {
        return;
    }

    const host = document.createElement("div");
    host.className = "kpi-chart-host";
    card.appendChild(host);

    const width = Math.max(120, viewport.width - 32);
    const height = getChartHeight(settings, viewport, 0.46, 62);

    const svg = d3.select(host)
        .append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("width", "100%")
        .attr("height", "100%");

    const xScale = d3.scaleBand<number>()
        .domain(d3.range(data.trendPoints.length))
        .range([10, width - 10])
        .padding(0.18);

    const maxY = d3.max(data.trendPoints, (d) => d.y) ?? 0;
    const yScale = d3.scaleLinear().domain([0, maxY <= 0 ? 1 : maxY]).range([height - 22, 10]);

    const gradient = settings.useGradient
        ? createGradient(svg, createUniqueId("bars"), settings.barColor || theme.accent)
        : "";

    svg.selectAll("rect.kpi-bar")
        .data(data.trendPoints)
        .join("rect")
        .attr("class", "kpi-bar")
        .attr("x", (_, index) => xScale(index) ?? 0)
        .attr("y", (d) => yScale(Math.max(0, d.y)))
        .attr("width", xScale.bandwidth())
        .attr("height", (d) => Math.max(1, height - 22 - yScale(Math.max(0, d.y))))
        .attr("rx", 3)
        .attr("fill", (d, index) => {
            if (index === data.trendPoints.length - 1) {
                return settings.highlightColor || theme.accent;
            }
            return settings.useGradient ? gradient : (settings.barColor || theme.accent);
        });

    if (settings.showLastValueLabel) {
        const lastIndex = data.trendPoints.length - 1;
        const last = data.trendPoints[lastIndex];
        const valueText = formatValue(last.y, settings);
        const x = (xScale(lastIndex) ?? 0) + xScale.bandwidth() / 2;
        const y = yScale(Math.max(0, last.y));

        if (valueText.length <= 10 && y > 18) {
            svg.append("text")
                .attr("class", "kpi-last-bar-label")
                .attr("x", x)
                .attr("y", y - 6)
                .attr("text-anchor", "middle")
                .attr("fill", settings.highlightColor || theme.accent)
                .text(valueText);
        }
    }

    renderMonthLabels(svg, data.trendPoints, (index) => (xScale(index) ?? 0) + xScale.bandwidth() / 2, height);
}

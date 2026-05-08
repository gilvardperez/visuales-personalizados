import * as d3 from "d3";
import { KpiRenderData } from "./types";
import { VisualSettings } from "../settings";
import { appendTopSection, applyCardContainer, clamp, getViewport, renderNoData, resolveTheme } from "./_shared";

export function renderDonutKpi(container: HTMLElement, data: KpiRenderData, settings: VisualSettings): void {
    if (!data) {
        renderNoData(container);
        return;
    }

    const viewport = getViewport(container);
    const theme = resolveTheme(settings, viewport);
    const card = applyCardContainer(container, settings, theme, "donut");
    appendTopSection(card, data, settings, viewport, theme, {
        subtitleOverride: `Meta: ${data.comparisonText ?? "Sin meta"}`,
        suppressComparisonSubtitle: true
    });

    const hasTarget = !!(data.comparison && data.comparison > 0);
    const ratio = hasTarget ? Math.max(0, data.value / (data.comparison as number)) : 0;
    const displayRatio = Math.min(1, ratio);

    const host = document.createElement("div");
    host.className = "kpi-donut-host";
    card.appendChild(host);

    const size = Math.max(84, Math.min(viewport.width - 36, Math.floor(viewport.height * 0.5)));
    const radius = size / 2;
    const thickness = clamp(settings.donutThickness, 4, 40);

    const svg = d3.select(host)
        .append("svg")
        .attr("viewBox", `0 0 ${size} ${size}`)
        .attr("width", "100%")
        .attr("height", "100%");

    const g = svg.append("g").attr("transform", `translate(${radius}, ${radius})`);

    const arc = d3.arc<d3.PieArcDatum<number>>()
        .innerRadius(Math.max(4, radius - thickness))
        .outerRadius(Math.max(6, radius - 1));

    const pie = d3.pie<number>().value((d) => d).sort(null);
    const values = hasTarget ? [displayRatio, 1 - displayRatio] : [0, 1];

    g.selectAll("path")
        .data(pie(values))
        .join("path")
        .attr("d", arc)
        .attr("fill", (_, idx) => (idx === 0 && hasTarget ? (settings.progressColor || theme.accent) : theme.border));

    g.append("text")
        .attr("class", "kpi-donut-value")
        .attr("text-anchor", "middle")
        .attr("y", -2)
        .text(hasTarget ? `${(ratio * 100).toFixed(settings.decimalPlaces)}%` : "Sin meta");

    g.append("text")
        .attr("class", "kpi-donut-caption")
        .attr("text-anchor", "middle")
        .attr("y", 14)
        .text(hasTarget ? "% logro" : "");
}

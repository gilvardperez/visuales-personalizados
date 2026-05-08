import * as d3 from "d3";
import { KpiRenderData } from "./types";
import { VisualSettings } from "../settings";
import { appendTopSection, applyAnimation, applyCardContainer, clamp, getViewport, renderNoData, resolveTheme } from "./_shared";

export function renderDonutKpi(container: HTMLElement, data: KpiRenderData, settings: VisualSettings): void {
    if (!data) {
        renderNoData(container);
        return;
    }

    const viewport = getViewport(container);
    const theme = resolveTheme(settings, viewport);
    const card = applyCardContainer(container, settings, theme, "donut");
    appendTopSection(card, data, settings, viewport, false, theme);

    const ratio = Math.max(0, data.progressRatio ?? 0);
    const displayRatio = Math.min(ratio, 1);

    const size = Math.max(90, Math.min(viewport.width - 24, viewport.height * 0.45));
    const thickness = clamp(settings.donutThickness, 4, 40);
    const radius = size / 2;

    const host = document.createElement("div");
    host.className = "kpi-donut-host";
    card.appendChild(host);

    const svg = d3.select(host)
        .append("svg")
        .attr("viewBox", `0 0 ${size} ${size}`)
        .attr("width", size)
        .attr("height", size);

    const arc = d3.arc<d3.PieArcDatum<number>>()
        .innerRadius(radius - thickness)
        .outerRadius(radius - 2);

    const pie = d3.pie<number>().value((d) => d).sort(null);
    const values = [displayRatio, 1 - displayRatio];

    const group = svg.append("g").attr("transform", `translate(${radius}, ${radius})`);

    group.selectAll("path")
        .data(pie(values))
        .join("path")
        .attr("d", arc)
        .attr("fill", (_, idx) => (idx === 0 ? theme.accent : theme.border))
        .each(function (_, idx) {
            if (idx === 0) {
                applyAnimation(this as SVGPathElement, "arc", settings);
            }
        });

    group.append("text")
        .attr("class", "kpi-donut-value")
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .text(`${(ratio * 100).toFixed(settings.decimalPlaces)}%`);
}

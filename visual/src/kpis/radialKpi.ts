import * as d3 from "d3";
import { KpiRenderData } from "./types";
import { VisualSettings } from "../settings";
import { appendTopSection, applyAnimation, applyCardContainer, clamp, getViewport, renderNoData, resolveTheme } from "./_shared";

export function renderRadialKpi(container: HTMLElement, data: KpiRenderData, settings: VisualSettings): void {
    if (!data) {
        renderNoData(container);
        return;
    }

    const viewport = getViewport(container);
    const theme = resolveTheme(settings, viewport);
    const card = applyCardContainer(container, settings, theme, "radial");
    appendTopSection(card, data, settings, viewport, false, theme);

    const host = document.createElement("div");
    host.className = "kpi-donut-host";
    card.appendChild(host);

    const ratio = clamp(data.progressRatio ?? 0, 0, 1);
    const size = Math.max(100, Math.min(viewport.width - 24, viewport.height * 0.5));
    const radius = size / 2;
    const thickness = clamp(settings.donutThickness + 4, 8, 44);

    const svg = d3.select(host)
        .append("svg")
        .attr("viewBox", `0 0 ${size} ${size}`)
        .attr("width", size)
        .attr("height", size);

    const group = svg.append("g").attr("transform", `translate(${radius}, ${radius})`);
    const arc = d3.arc<d3.DefaultArcObject>()
        .innerRadius(radius - thickness)
        .outerRadius(radius - 2)
        .startAngle(-Math.PI / 2)
        .endAngle(1.5 * Math.PI);

    group.append("path")
        .attr("d", arc({ innerRadius: radius - thickness, outerRadius: radius - 2, startAngle: -Math.PI / 2, endAngle: 1.5 * Math.PI } as d3.DefaultArcObject) || "")
        .attr("fill", "none")
        .attr("stroke", theme.border)
        .attr("stroke-width", thickness)
        .attr("stroke-linecap", "round");

    const valueArc = d3.arc<d3.DefaultArcObject>()
        .innerRadius(radius - thickness)
        .outerRadius(radius - 2)
        .startAngle(-Math.PI / 2)
        .endAngle(-Math.PI / 2 + ratio * 2 * Math.PI);

    const valuePath = group.append("path")
        .attr("d", valueArc({ innerRadius: radius - thickness, outerRadius: radius - 2, startAngle: -Math.PI / 2, endAngle: -Math.PI / 2 + ratio * 2 * Math.PI } as d3.DefaultArcObject) || "")
        .attr("fill", "none")
        .attr("stroke", theme.accent)
        .attr("stroke-width", thickness)
        .attr("stroke-linecap", "round");

    applyAnimation(valuePath.node() as SVGPathElement, "arc", settings);

    group.append("text")
        .attr("class", "kpi-donut-value")
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .text(`${(ratio * 100).toFixed(settings.decimalPlaces)}%`);
}

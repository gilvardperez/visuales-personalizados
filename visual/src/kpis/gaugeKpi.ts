import * as d3 from "d3";
import { KpiRenderData } from "./types";
import { VisualSettings } from "../settings";
import {
    appendTopSection,
    applyAnimation,
    applyCardContainer,
    clamp,
    getViewport,
    renderNoData,
    resolveTheme
} from "./_shared";

export function renderGaugeKpi(container: HTMLElement, data: KpiRenderData, settings: VisualSettings): void {
    if (!data) {
        renderNoData(container);
        return;
    }

    const viewport = getViewport(container);
    const theme = resolveTheme(settings, viewport);
    const card = applyCardContainer(container, settings, theme, "gauge");
    appendTopSection(card, data, settings, viewport, false, theme);

    const gaugeHost = document.createElement("div");
    gaugeHost.className = "kpi-donut-host";
    card.appendChild(gaugeHost);

    const size = Math.max(120, Math.min(viewport.width - 24, viewport.height * 0.6));
    const radius = size / 2;
    const innerRadius = radius - 16;

    const svg = d3.select(gaugeHost)
        .append("svg")
        .attr("viewBox", `0 0 ${size} ${radius + 20}`)
        .attr("width", size)
        .attr("height", radius + 20);

    const g = svg.append("g").attr("transform", `translate(${radius}, ${radius})`);

    const min = settings.gaugeMinValue;
    const max = settings.gaugeMaxValue <= min ? 100 : settings.gaugeMaxValue;
    const value = clamp(data.progressRatio !== undefined ? data.progressRatio * 100 : data.value, min, max);
    const red = clamp(settings.gaugeRedThreshold, min, max);
    const yellow = clamp(settings.gaugeYellowThreshold, red, max);

    const scale = d3.scaleLinear().domain([min, max]).range([-Math.PI / 2, Math.PI / 2]);
    const arc = d3.arc().innerRadius(innerRadius).outerRadius(radius - 2);

    const segments = [
        { from: min, to: red, color: theme.negative },
        { from: red, to: yellow, color: "#F59E0B" },
        { from: yellow, to: max, color: theme.positive }
    ];

    segments.forEach((segment) => {
        g.append("path")
            .attr("d", arc({ startAngle: scale(segment.from), endAngle: scale(segment.to) } as d3.DefaultArcObject) || "")
            .attr("fill", segment.color);
    });

    const needleAngle = scale(value);
    const needleLength = radius - 8;
    const needle = g.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", Math.cos(needleAngle) * needleLength)
        .attr("y2", Math.sin(needleAngle) * needleLength)
        .attr("stroke", theme.textPrimary)
        .attr("stroke-width", 2);

    applyAnimation(needle.node() as SVGLineElement, "arc", settings);

    g.append("circle")
        .attr("r", 4)
        .attr("fill", theme.textPrimary);

    g.append("text")
        .attr("y", 18)
        .attr("text-anchor", "middle")
        .attr("class", "kpi-donut-value")
        .text(`${value.toFixed(settings.decimalPlaces)}%`);
}

import * as d3 from "d3";
import { KpiRenderData } from "./types";
import { VisualSettings } from "../settings";
import { appendTopSection, applyCardContainer, clamp, getViewport, renderNoData, resolveTheme } from "./_shared";

export function renderGaugeKpi(container: HTMLElement, data: KpiRenderData, settings: VisualSettings): void {
    if (!data) {
        renderNoData(container);
        return;
    }

    const viewport = getViewport(container);
    const theme = resolveTheme(settings, viewport);
    const card = applyCardContainer(container, settings, theme, "gauge");
    appendTopSection(card, data, settings, viewport, theme, {
        subtitleOverride: `Meta: ${data.comparisonText ?? "Sin meta"}`,
        suppressComparisonSubtitle: true
    });

    const host = document.createElement("div");
    host.className = "kpi-donut-host";
    card.appendChild(host);

    const size = Math.max(140, Math.min(viewport.width - 28, Math.floor(viewport.height * 0.56)));
    const radius = size / 2;
    const innerRadius = radius - 16;

    const svg = d3.select(host)
        .append("svg")
        .attr("viewBox", `0 0 ${size} ${radius + 28}`)
        .attr("width", "100%")
        .attr("height", "100%");

    const g = svg.append("g").attr("transform", `translate(${radius}, ${radius})`);

    const min = settings.gaugeMinValue;
    const max = settings.gaugeMaxValue > min ? settings.gaugeMaxValue : min + 100;
    const ratio = data.progressRatio !== undefined ? data.progressRatio * 100 : data.value;
    const value = clamp(ratio, min, max);

    const red = clamp(settings.gaugeRedThreshold, min, max);
    const yellow = clamp(settings.gaugeYellowThreshold, red, max);

    const scale = d3.scaleLinear().domain([min, max]).range([-Math.PI, 0]);
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
    const needleLength = radius - 6;
    g.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", Math.cos(needleAngle) * needleLength)
        .attr("y2", Math.sin(needleAngle) * needleLength)
        .attr("stroke", theme.textPrimary)
        .attr("stroke-width", 2);

    g.append("circle").attr("r", 4).attr("fill", theme.textPrimary);

    g.append("text")
        .attr("class", "kpi-donut-value")
        .attr("text-anchor", "middle")
        .attr("y", 18)
        .text(`${value.toFixed(settings.decimalPlaces)}%`);
}

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

    // Header row only (no subtitle — shown inside SVG below arc)
    appendTopSection(card, data, settings, viewport, theme, {
        suppressComparisonSubtitle: true
    });

    // Gauge host fills remaining space
    const host = document.createElement("div");
    host.className = "kpi-donut-host";
    card.appendChild(host);

    const min = settings.gaugeMinValue;
    const max = settings.gaugeMaxValue > min ? settings.gaugeMaxValue : min + 100;
    const rawValue = data.progressRatio !== undefined ? data.progressRatio * 100 : data.value;
    const value = clamp(rawValue, min, max);

    const redThresh = clamp(settings.gaugeRedThreshold, min, max);
    const yellowThresh = clamp(settings.gaugeYellowThreshold, redThresh, max);

    // Fixed viewBox for proportional scaling
    // Semicircle: center at (100, 100), outer radius 90, inner radius 68 (22px thick)
    // viewBox extends 10px above and 40px below center for text
    const vw = 200;
    const vh = 145;  // top of arc is at y=10, text is at y=130
    const cx = 100;
    const cy = 100;
    const outerR = 90;
    const innerR = 68;  // ~22px thick arc

    const svg = d3.select(host)
        .append("svg")
        .attr("viewBox", `0 0 ${vw} ${vh}`)
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("preserveAspectRatio", "xMidYMid meet");

    // d3.arc angle convention: 0=top(12 o'clock), clockwise positive
    // Horizontal semicircle: -π/2 (left/9 o'clock) to +π/2 (right/3 o'clock) through top
    const arcScale = d3.scaleLinear()
        .domain([min, max])
        .range([-Math.PI / 2, Math.PI / 2]);

    const arcGen = d3.arc()
        .innerRadius(innerR)
        .outerRadius(outerR);

    const segments = [
        { from: min, to: redThresh, color: theme.negative },
        { from: redThresh, to: yellowThresh, color: "#F59E0B" },
        { from: yellowThresh, to: max, color: theme.positive }
    ];

    const g = svg.append("g").attr("transform", `translate(${cx}, ${cy})`);

    segments.forEach((seg) => {
        if (seg.to <= seg.from) {
            return;
        }
        const startAngle = arcScale(seg.from);
        const endAngle = arcScale(seg.to);
        g.append("path")
            .attr("d", arcGen({ startAngle, endAngle, innerRadius: innerR, outerRadius: outerR } as d3.DefaultArcObject) || "")
            .attr("fill", seg.color);
    });

    // Triangle needle
    // For d3 arc angle θ: arc position = (sin(θ)*r, -cos(θ)*r) relative to center
    // Needle direction aligns with arc by using same trigonometry
    const theta = arcScale(value);
    const needleLen = innerR - 10;
    const nx = Math.sin(theta) * needleLen;
    const ny = -Math.cos(theta) * needleLen;
    const perpTheta = theta + Math.PI / 2;
    const bw = 6; // half-width of needle base
    const b1x = Math.sin(perpTheta) * bw;
    const b1y = -Math.cos(perpTheta) * bw;

    g.append("path")
        .attr("d", `M ${b1x},${b1y} L ${nx},${ny} L ${-b1x},${-b1y} Z`)
        .attr("fill", theme.textPrimary);

    // Pivot circle
    g.append("circle")
        .attr("r", 6)
        .attr("fill", theme.textPrimary);

    // % logro — displayed below the pivot (in the open space below the arc base)
    const pct = (rawValue).toFixed(settings.decimalPlaces);
    svg.append("text")
        .attr("x", cx)
        .attr("y", cy + 20)
        .attr("text-anchor", "middle")
        .attr("font-size", 22)
        .attr("font-weight", 800)
        .attr("fill", theme.textPrimary)
        .text(`${pct}%`);

    // Value / Meta below %
    const hasTarget = data.comparison !== null && data.comparison !== undefined && data.comparison > 0;
    if (hasTarget && data.comparisonText) {
        svg.append("text")
            .attr("x", cx)
            .attr("y", cy + 35)
            .attr("text-anchor", "middle")
            .attr("font-size", 11)
            .attr("font-weight", 600)
            .attr("fill", theme.textSecondary)
            .text(`${data.valueText} / Meta ${data.comparisonText}`);
    }
}


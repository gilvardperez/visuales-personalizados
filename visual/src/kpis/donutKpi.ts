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

    // Header (label + delta only, no subtitle here — meta shown below ring)
    appendTopSection(card, data, settings, viewport, theme, {
        suppressComparisonSubtitle: true
    });

    const hasTarget = data.comparison !== null && data.comparison !== undefined && data.comparison > 0;
    const ratio = hasTarget ? Math.max(0, data.value / (data.comparison as number)) : 0;
    const displayRatio = Math.min(1, ratio);
    const pct = (ratio * 100).toFixed(settings.decimalPlaces);

    // Donut host fills remaining space
    const host = document.createElement("div");
    host.className = "kpi-donut-host";
    card.appendChild(host);

    // Fixed viewBox for proportional scaling; SVG fills the host
    const vw = 200;
    const vh = 200;
    const cx = 100;
    const cy = 100;
    const outerR = 88;
    const thickness = clamp(settings.donutThickness, 8, 40);
    const innerR = Math.max(outerR - thickness, 12);

    const svg = d3.select(host)
        .append("svg")
        .attr("viewBox", `0 0 ${vw} ${vh}`)
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("preserveAspectRatio", "xMidYMid meet");

    const g = svg.append("g").attr("transform", `translate(${cx}, ${cy})`);

    const arc = d3.arc<d3.PieArcDatum<number>>()
        .innerRadius(innerR)
        .outerRadius(outerR);

    const pie = d3.pie<number>().value((d) => d).sort(null);
    const values = hasTarget ? [displayRatio, 1 - displayRatio] : [0, 1];

    g.selectAll("path")
        .data(pie(values))
        .join("path")
        .attr("d", arc)
        .attr("fill", (_, idx) => (idx === 0 && hasTarget
            ? (settings.progressColor || theme.accent)
            : theme.border));

    // Center text: % logro (large) + value (smaller)
    g.append("text")
        .attr("text-anchor", "middle")
        .attr("y", hasTarget ? -10 : 6)
        .attr("font-size", hasTarget ? 26 : 20)
        .attr("font-weight", 800)
        .attr("fill", theme.textPrimary)
        .text(hasTarget ? `${pct}%` : "Sin meta");

    if (hasTarget) {
        g.append("text")
            .attr("text-anchor", "middle")
            .attr("y", 14)
            .attr("font-size", 14)
            .attr("font-weight", 700)
            .attr("fill", theme.textSecondary)
            .text(data.valueText);
    }

    // "vs Meta X" subtitle below donut host
    if (hasTarget && data.comparisonText) {
        const sub = document.createElement("div");
        sub.className = "kpi-subtitle";
        sub.style.textAlign = "center";
        sub.style.color = theme.textSecondary;
        const suffix = settings.comparisonSuffix.trim();
        sub.textContent = `vs Meta ${data.comparisonText}${suffix ? ` ${suffix}` : ""}`;
        card.appendChild(sub);
    }
}


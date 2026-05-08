import * as d3 from "d3";
import { KpiRenderData } from "./types";
import { VisualSettings } from "../settings";

export function render(container: HTMLElement, data: KpiRenderData, settings: VisualSettings): void {
    const wrapper = document.createElement("div");
    wrapper.className = "kpi-card kpi-microchart";

    const label = document.createElement("div");
    label.className = "kpi-label";
    label.textContent = data.label;
    label.style.fontSize = `${settings.labelFontSize}px`;

    const valueRow = document.createElement("div");
    valueRow.className = "kpi-value-row";

    const value = document.createElement("div");
    value.className = "kpi-value";
    value.textContent = data.valueText;
    value.style.fontSize = `${settings.valueFontSize}px`;
    value.style.color = settings.valueColor;

    const delta = document.createElement("div");
    delta.className = "kpi-delta";
    if (data.deltaText) {
        const positive = !!data.isDeltaPositive;
        delta.textContent = `${positive ? "▲" : "▼"} ${data.deltaText}`;
        delta.style.color = positive ? settings.positiveColor : settings.negativeColor;
    }

    valueRow.appendChild(value);
    valueRow.appendChild(delta);

    const svgHost = document.createElement("div");
    svgHost.className = "kpi-microchart-host";

    if (settings.labelPosition === "top") {
        wrapper.appendChild(label);
        wrapper.appendChild(valueRow);
    } else {
        wrapper.appendChild(valueRow);
        wrapper.appendChild(label);
    }

    wrapper.appendChild(svgHost);
    container.appendChild(wrapper);

    const points = data.trendPoints ?? [];
    if (!points.length) {
        return;
    }

    const width = Math.max(140, container.clientWidth - 24);
    const height = 56;

    const svg = d3.select(svgHost)
        .append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("width", "100%")
        .attr("height", height);

    const xScale = d3.scaleLinear().domain([0, points.length - 1]).range([4, width - 4]);
    const yExtent = d3.extent(points, (d) => d.y);
    const minY = yExtent[0] ?? 0;
    const maxY = yExtent[1] ?? 0;
    const yScale = d3.scaleLinear()
        .domain(minY === maxY ? [minY - 1, maxY + 1] : [minY, maxY])
        .range([height - 6, 6]);

    const line = d3.line<{ y: number }>()
        .x((_, i) => xScale(i))
        .y((d) => yScale(d.y))
        .curve(d3.curveMonotoneX);

    svg.append("path")
        .datum(points)
        .attr("fill", "none")
        .attr("stroke", settings.progressColor)
        .attr("stroke-width", 2)
        .attr("d", line as any);

    const last = points[points.length - 1];
    svg.append("circle")
        .attr("cx", xScale(points.length - 1))
        .attr("cy", yScale(last.y))
        .attr("r", 3)
        .attr("fill", settings.progressColor);
}

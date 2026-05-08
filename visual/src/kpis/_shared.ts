import * as d3 from "d3";
import { KpiRenderData, TrendPoint } from "./types";
import { VisualSettings } from "../settings";

const MONTH_INITIALS: string[] = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

export function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

export function getViewport(container: HTMLElement): { width: number; height: number } {
    const rect = container.getBoundingClientRect();
    const width = Math.max(160, Math.floor(rect.width || container.clientWidth || 320));
    const height = Math.max(120, Math.floor(rect.height || container.clientHeight || 220));
    return { width, height };
}

export function responsiveFont(baseSize: number, viewport: { width: number; height: number }, min: number, max: number): number {
    const scale = Math.min(viewport.width / 320, viewport.height / 220);
    return clamp(Math.round(baseSize * scale), min, max);
}

export function clearAndCreateCard(container: HTMLElement, variantClass: string): HTMLDivElement {
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
    const card = document.createElement("div");
    card.className = `kpi-card kpi-${variantClass}`;
    container.appendChild(card);
    return card;
}

export function renderNoData(container: HTMLElement): void {
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
    const noData = document.createElement("div");
    noData.className = "kpi-no-data";
    noData.textContent = "No data";
    container.appendChild(noData);
}

export function buildTitle(settings: VisualSettings, viewport: { width: number; height: number }): HTMLDivElement | null {
    if (!settings.showTitle || !settings.titleText.trim()) {
        return null;
    }

    const title = document.createElement("div");
    title.className = "kpi-title";
    title.textContent = settings.titleText;
    title.style.fontSize = `${responsiveFont(settings.titleFontSize, viewport, 10, 28)}px`;
    return title;
}

export function buildLabel(text: string, settings: VisualSettings, viewport: { width: number; height: number }): HTMLDivElement {
    const label = document.createElement("div");
    label.className = "kpi-label";
    label.textContent = text;
    label.style.fontSize = `${responsiveFont(settings.labelFontSize, viewport, 10, 22)}px`;
    return label;
}

export function buildValue(text: string, settings: VisualSettings, viewport: { width: number; height: number }): HTMLDivElement {
    const value = document.createElement("div");
    value.className = "kpi-value";
    value.textContent = text;
    value.style.fontSize = `${responsiveFont(settings.valueFontSize, viewport, 18, 82)}px`;
    value.style.color = settings.valueColor;
    return value;
}

export function buildDelta(data: KpiRenderData, settings: VisualSettings, viewport: { width: number; height: number }): HTMLDivElement {
    const delta = document.createElement("div");
    delta.className = "kpi-delta";
    delta.style.fontSize = `${responsiveFont(settings.labelFontSize, viewport, 10, 20)}px`;

    if (!data.deltaText) {
        return delta;
    }

    const positive = !!data.isDeltaPositive;
    const suffix = settings.deltaSuffix.trim();
    delta.textContent = `${positive ? "▲" : "▼"} ${data.deltaText}${suffix ? ` ${suffix}` : ""}`;
    delta.style.color = positive ? settings.positiveColor : settings.negativeColor;
    return delta;
}

export function appendTopSection(
    card: HTMLElement,
    data: KpiRenderData,
    settings: VisualSettings,
    viewport: { width: number; height: number },
    valueFirst: boolean = false
): { value: HTMLDivElement; label: HTMLDivElement; delta: HTMLDivElement } {
    const title = buildTitle(settings, viewport);
    if (title) {
        card.appendChild(title);
    }

    const label = buildLabel(data.label, settings, viewport);
    const value = buildValue(data.valueText, settings, viewport);
    const delta = buildDelta(data, settings, viewport);

    const useTopLabel = settings.labelPosition === "top";

    if (valueFirst || !useTopLabel) {
        card.appendChild(value);
        card.appendChild(label);
    } else {
        card.appendChild(label);
        card.appendChild(value);
    }

    card.appendChild(delta);

    return { value, label, delta };
}

export function monthLabels(points: TrendPoint[]): string[] {
    return points.map((point, index) => toMonthLabel(point.x, index));
}

function toMonthLabel(rawValue: string, index: number): string {
    const raw = rawValue?.toString().trim() || "";
    const numeric = Number(raw);

    if (!Number.isNaN(numeric) && Number.isFinite(numeric) && numeric >= 1 && numeric <= 12) {
        return MONTH_INITIALS[Math.floor(numeric) - 1];
    }

    const firstLetter = raw.replace(/[^\p{L}\p{N}]/gu, "").charAt(0).toUpperCase();
    if (firstLetter) {
        return firstLetter;
    }

    return MONTH_INITIALS[index % MONTH_INITIALS.length];
}

export function visibleTickIndexes(length: number): number[] {
    if (length <= 0) {
        return [];
    }

    if (length <= 12) {
        return Array.from({ length }, (_, idx) => idx);
    }

    const step = Math.ceil(length / 12);
    const indexes: number[] = [];

    for (let i = 0; i < length; i += step) {
        indexes.push(i);
    }

    if (indexes[indexes.length - 1] !== length - 1) {
        indexes.push(length - 1);
    }

    return indexes;
}

export function renderMonthLabels(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    points: TrendPoint[],
    xForIndex: (index: number) => number,
    chartHeight: number
): void {
    const labels = monthLabels(points);
    const indexes = visibleTickIndexes(points.length);

    indexes.forEach((index) => {
        svg.append("text")
            .attr("class", "kpi-month-label")
            .attr("x", xForIndex(index))
            .attr("y", chartHeight - 2)
            .attr("text-anchor", "middle")
            .text(labels[index]);
    });
}

export function formatNumber(value: number, settings: VisualSettings): string {
    let divisor = 1;
    let suffix = "";
    const absolute = Math.abs(value);

    if (settings.displayUnits === "billions" || (settings.displayUnits === "auto" && absolute >= 1e9)) {
        divisor = 1e9;
        suffix = "B";
    } else if (settings.displayUnits === "millions" || (settings.displayUnits === "auto" && absolute >= 1e6)) {
        divisor = 1e6;
        suffix = "M";
    } else if (settings.displayUnits === "thousands" || (settings.displayUnits === "auto" && absolute >= 1e3)) {
        divisor = 1e3;
        suffix = "K";
    }

    const formatted = new Intl.NumberFormat(undefined, {
        minimumFractionDigits: settings.decimalPlaces,
        maximumFractionDigits: settings.decimalPlaces
    }).format(value / divisor);

    return `${formatted}${suffix}`;
}

export function renderLastValueLabel(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    x: number,
    y: number,
    text: string,
    color: string
): void {
    const labelGroup = svg.append("g").attr("class", "kpi-last-value");

    labelGroup.append("text")
        .attr("x", x)
        .attr("y", y - 8)
        .attr("text-anchor", "middle")
        .attr("fill", color)
        .text(text);
}

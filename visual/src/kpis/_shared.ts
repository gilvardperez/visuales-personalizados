import * as d3 from "d3";
import { KpiRenderData, TrendPoint } from "./types";
import { VisualSettings } from "../settings";

const MONTH_INITIALS: string[] = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

type ThemeModeResolved = "light" | "dark";

export interface ThemeTokens {
    mode: ThemeModeResolved;
    background: string;
    textPrimary: string;
    textSecondary: string;
    border: string;
    positive: string;
    negative: string;
    accent: string;
    neutral: string;
}

let gradientCounter = 0;

function toHexUpper(value: string): string {
    return (value || "").trim().toUpperCase();
}

function resolveThemeMode(settings: VisualSettings): ThemeModeResolved {
    if (settings.theme === "auto") {
        if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
            return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        }
        return "light";
    }

    return settings.theme;
}

function resolveColorOverride(value: string, lightDefault: string, darkDefault: string, fallback: string): string {
    const current = toHexUpper(value);
    if (!current || current === toHexUpper(lightDefault) || current === toHexUpper(darkDefault)) {
        return fallback;
    }

    return value;
}

export function colorWithAlpha(color: string, alpha: number): string {
    const safeAlpha = clamp(alpha, 0, 1);
    const hex = (color || "").trim().replace("#", "");
    if (/^[0-9a-fA-F]{6}$/.test(hex)) {
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);
        return `rgba(${r}, ${g}, ${b}, ${safeAlpha})`;
    }

    return color;
}

export function resolveTheme(settings: VisualSettings, _viewport: { width: number; height: number }): ThemeTokens {
    const mode = resolveThemeMode(settings);
    const light = {
        background: "#FFFFFF",
        textPrimary: "#111827",
        textSecondary: "#6B7280",
        border: "#E5E7EB",
        positive: "#10B981",
        negative: "#EF4444",
        accent: "#2563EB",
        neutral: "#9CA3AF"
    };

    const dark = {
        background: "#0F172A",
        textPrimary: "#F9FAFB",
        textSecondary: "#9CA3AF",
        border: "#1F2937",
        positive: "#34D399",
        negative: "#F87171",
        accent: "#60A5FA",
        neutral: "#6B7280"
    };

    const base = mode === "dark" ? dark : light;

    return {
        mode,
        background: settings.transparentBackground ? "transparent" : base.background,
        textPrimary: resolveColorOverride(settings.valueColor, light.textPrimary, dark.textPrimary, base.textPrimary),
        textSecondary: base.textSecondary,
        border: resolveColorOverride(settings.borderColor, light.border, dark.border, base.border),
        positive: resolveColorOverride(settings.positiveColor, light.positive, dark.positive, base.positive),
        negative: resolveColorOverride(settings.negativeColor, light.negative, dark.negative, base.negative),
        accent: resolveColorOverride(settings.accentColor, light.accent, dark.accent, base.accent),
        neutral: base.neutral
    };
}

export function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

export function getViewport(container: HTMLElement): { width: number; height: number } {
    const rect = container.getBoundingClientRect();
    const width = Math.floor(rect.width || container.clientWidth || 320);
    const height = Math.floor(rect.height || container.clientHeight || 220);
    return { width: Math.max(1, width), height: Math.max(1, height) };
}

export function responsiveFont(baseSize: number, viewport: { width: number; height: number }, min: number, max: number): number {
    const scale = Math.min(viewport.width / 320, viewport.height / 220);
    return clamp(Math.round(baseSize * scale), min, max);
}

export function isCompactViewport(viewport: { width: number; height: number }): boolean {
    return viewport.width < 220;
}

export function shouldHideMiniChart(viewport: { width: number; height: number }): boolean {
    return viewport.height < 110;
}

export function getChartHeight(settings: VisualSettings, viewport: { width: number; height: number }, ratio: number = 0.42, minHeight: number = 48): number {
    const chartHeight = clamp(settings.chartHeight, 20, 200);
    return Math.min(chartHeight, Math.max(minHeight, Math.floor(viewport.height * ratio)));
}

export function applyCardContainer(
    container: HTMLElement,
    settings: VisualSettings,
    theme: ThemeTokens,
    variantClass: string = "default"
): HTMLDivElement {
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }

    const card = document.createElement("div");
    card.className = `kpi-card kpi-${variantClass}`;
    card.style.setProperty("--kpi-bg", theme.background);
    card.style.setProperty("--kpi-text", theme.textPrimary);
    card.style.setProperty("--kpi-text-secondary", theme.textSecondary);
    card.style.setProperty("--kpi-border", theme.border);
    card.style.setProperty("--kpi-positive", theme.positive);
    card.style.setProperty("--kpi-negative", theme.negative);
    card.style.setProperty("--kpi-accent", theme.accent);
    card.style.setProperty("--kpi-neutral", theme.neutral);
    card.style.setProperty("--kpi-highlight", settings.highlightColor || theme.accent);
    card.style.setProperty("--kpi-radius", `${clamp(settings.cornerRadius, 0, 32)}px`);

    if (settings.cardStyle === "flat") {
        card.classList.add("kpi-card-flat");
    }
    if (settings.cardStyle === "bordered") {
        card.classList.add("kpi-card-bordered");
    }
    if (settings.cardStyle === "accent-left") {
        card.classList.add("kpi-card-accent-left");
        card.style.setProperty("--kpi-accent-left", theme.accent);
    }

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

export function renderHeader(
    parent: HTMLElement,
    label: string,
    titleText: string,
    settings: VisualSettings,
    theme: ThemeTokens,
    viewport: { width: number; height: number } = getViewport(parent)
): { title?: HTMLDivElement; label: HTMLDivElement } {
    const header: { title?: HTMLDivElement; label: HTMLDivElement } = {
        label: document.createElement("div")
    };

    if (settings.showTitle && titleText.trim()) {
        header.title = document.createElement("div");
        header.title.className = "kpi-title";
        header.title.textContent = titleText;
        header.title.style.fontSize = `${responsiveFont(settings.titleFontSize, viewport, 11, 28)}px`;
        header.title.style.color = theme.textSecondary;
        parent.appendChild(header.title);
    }

    header.label.className = "kpi-label";
    header.label.textContent = label;
    header.label.style.fontSize = `${responsiveFont(settings.labelFontSize, viewport, 11, 20)}px`;
    header.label.style.color = theme.textSecondary;
    parent.appendChild(header.label);

    return header;
}

export function buildValue(
    text: string,
    settings: VisualSettings,
    viewport: { width: number; height: number },
    theme?: ThemeTokens
): HTMLDivElement {
    const value = document.createElement("div");
    value.className = "kpi-value";
    value.textContent = text;
    value.style.fontSize = `${responsiveFont(settings.valueFontSize, viewport, 18, 86)}px`;
    value.style.color = theme?.textPrimary || settings.valueColor;
    return value;
}

export function renderDeltaBadge(
    parent: HTMLElement,
    deltaPct: number | null | undefined,
    settings: VisualSettings,
    theme: ThemeTokens,
    textOverride?: string
): HTMLDivElement {
    const delta = document.createElement("div");
    delta.className = "kpi-delta";

    if (deltaPct === null || deltaPct === undefined || !Number.isFinite(deltaPct)) {
        parent.appendChild(delta);
        return delta;
    }

    const isPositive = deltaPct >= 0;
    const arrow = settings.deltaShowArrow ? (isPositive ? "▲" : "▼") : "";
    const sign = deltaPct >= 0 ? "+" : "";
    const suffix = settings.deltaSuffix.trim();
    const text = textOverride ?? `${sign}${(deltaPct * 100).toFixed(settings.decimalPlaces)}%`;
    delta.textContent = `${arrow ? `${arrow} ` : ""}${text}${suffix ? ` ${suffix}` : ""}`;
    delta.style.color = isPositive ? theme.positive : theme.negative;

    if (settings.deltaBadgeStyle !== "text") {
        delta.classList.add("kpi-delta-badge");
        if (settings.deltaBadgeStyle === "pill") {
            delta.classList.add("kpi-delta-pill");
        }
        delta.style.backgroundColor = colorWithAlpha(isPositive ? theme.positive : theme.negative, 0.12);
        delta.style.borderColor = colorWithAlpha(isPositive ? theme.positive : theme.negative, 0.28);
    }

    parent.appendChild(delta);
    return delta;
}

function buildSubtitle(
    data: KpiRenderData,
    settings: VisualSettings,
    theme: ThemeTokens,
    subtitleOverride?: string,
    suppressComparisonSubtitle?: boolean
): HTMLDivElement | null {
    if (subtitleOverride !== undefined) {
        const subtitle = document.createElement("div");
        subtitle.className = "kpi-subtitle";
        subtitle.textContent = subtitleOverride;
        subtitle.style.color = theme.textSecondary;
        return subtitle;
    }

    if (suppressComparisonSubtitle || !settings.showComparisonValue || data.comparison === null || data.comparisonText === undefined) {
        return null;
    }

    const subtitle = document.createElement("div");
    subtitle.className = "kpi-subtitle";
    const suffix = settings.comparisonSuffix.trim();
    subtitle.textContent = `vs ${data.comparisonText}${suffix ? ` ${suffix}` : ""}`;
    subtitle.style.color = theme.textSecondary;
    return subtitle;
}

export function appendTopSection(
    card: HTMLElement,
    data: KpiRenderData,
    settings: VisualSettings,
    viewport: { width: number; height: number },
    theme: ThemeTokens,
    options?: { subtitleOverride?: string; suppressComparisonSubtitle?: boolean }
): { value: HTMLDivElement; label: HTMLDivElement; delta: HTMLDivElement; subtitle: HTMLDivElement | null } {
    const { label } = renderHeader(card, data.label, settings.titleText, settings, theme, viewport);

    const topRow = document.createElement("div");
    topRow.className = "kpi-top-row";
    topRow.appendChild(label);
    const delta = renderDeltaBadge(topRow, data.deltaRaw, settings, theme, data.deltaText);
    card.appendChild(topRow);

    const value = buildValue(data.valueText, settings, viewport, theme);
    card.appendChild(value);

    const subtitle = buildSubtitle(data, settings, theme, options?.subtitleOverride, options?.suppressComparisonSubtitle);
    if (subtitle) {
        card.appendChild(subtitle);
    }

    if (isCompactViewport(viewport)) {
        delta.classList.add("kpi-delta-compact");
    }

    return { value, label, delta, subtitle };
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

export function formatValue(value: number, settings: VisualSettings): string {
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
    color: string,
    bounds: { width: number; top: number }
): void {
    const labelGroup = svg.append("g").attr("class", "kpi-last-value");

    const textNode = labelGroup.append("text")
        .attr("x", x)
        .attr("y", y)
        .attr("text-anchor", "middle")
        .attr("fill", color)
        .text(text);

    const textNodeElement = textNode.node();
    if (!textNodeElement) {
        return;
    }

    const bbox = textNodeElement.getBBox();
    const halfWidth = (bbox.width + 8) / 2;
    const safeX = clamp(x, halfWidth + 2, bounds.width - halfWidth - 2);
    const safeY = Math.max(bounds.top + bbox.height + 8, y);

    textNode
        .attr("x", safeX)
        .attr("y", safeY - 6);

    labelGroup.insert("rect", "text")
        .attr("x", safeX - halfWidth)
        .attr("y", safeY - bbox.height - 8)
        .attr("width", bbox.width + 8)
        .attr("height", bbox.height + 4)
        .attr("rx", 4)
        .attr("ry", 4)
        .attr("fill", colorWithAlpha(color, 0.12))
        .attr("stroke", colorWithAlpha(color, 0.25));
}

export function createUniqueId(prefix: string): string {
    gradientCounter += 1;
    return `${prefix}-${gradientCounter}`;
}

export function createGradient(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    id: string,
    color: string,
    direction: "vertical" | "horizontal" = "vertical"
): string {
    const defs = svg.select("defs").empty() ? svg.append("defs") : svg.select("defs");
    const gradient = defs.append("linearGradient")
        .attr("id", id)
        .attr("x1", "0%")
        .attr("x2", direction === "horizontal" ? "100%" : "0%")
        .attr("y1", "0%")
        .attr("y2", direction === "horizontal" ? "0%" : "100%");

    gradient.append("stop").attr("offset", "0%").attr("stop-color", color).attr("stop-opacity", 0.35);
    gradient.append("stop").attr("offset", "100%").attr("stop-color", color).attr("stop-opacity", 0);

    return `url(#${id})`;
}

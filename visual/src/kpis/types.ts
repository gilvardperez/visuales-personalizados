import { VisualSettings } from "../settings";

export interface TrendPoint {
    x: string;
    y: number;
    index: number;
}

export interface KpiRenderData {
    label: string;
    value: number;
    comparison: number | null;
    valueText: string;
    comparisonText?: string;
    deltaText?: string;
    deltaRaw?: number;
    isDeltaPositive?: boolean;
    progressRatio?: number;
    trendPoints: TrendPoint[];
    trendComparisonPoints: TrendPoint[];
    hasTrendComparison: boolean;
}

export type KpiRenderer = (container: HTMLElement, data: KpiRenderData, settings: VisualSettings) => void;

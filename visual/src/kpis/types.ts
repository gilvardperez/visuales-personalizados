import { VisualSettings } from "../settings";

export interface TrendPoint {
    x: string;
    y: number;
}

export interface KpiRenderData {
    label: string;
    valueText: string;
    deltaText?: string;
    isDeltaPositive?: boolean;
    progressRatio?: number;
    trendPoints?: TrendPoint[];
}

export type KpiRenderer = (container: HTMLElement, data: KpiRenderData, settings: VisualSettings) => void;

"use strict";

import powerbi from "powerbi-visuals-api";
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import { valueFormatter } from "powerbi-visuals-utils-formattingutils";
import "./style/visual.less";

import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import DataView = powerbi.DataView;
import DataViewValueColumn = powerbi.DataViewValueColumn;

import { getVisualSettings, VisualFormattingSettingsModel } from "./settings";
import { KpiRenderData, TrendPoint } from "./kpis/types";
import { render as renderDefaultKpi } from "./kpis/defaultKpi";
import { render as renderProgressKpi } from "./kpis/progressKpi";
import { render as renderMicrochartKpi } from "./kpis/microchartKpi";

export class Visual implements IVisual {
    private hostElement: HTMLElement;
    private formattingSettings: VisualFormattingSettingsModel;
    private formattingSettingsService: FormattingSettingsService;

    constructor(options: VisualConstructorOptions) {
        this.hostElement = options.element;
        this.formattingSettingsService = new FormattingSettingsService();
    }

    public update(options: VisualUpdateOptions): void {
        const dataView = options.dataViews?.[0];
        while (this.hostElement.firstChild) {
            this.hostElement.removeChild(this.hostElement.firstChild);
        }

        if (!dataView) {
            this.renderNoData();
            return;
        }

        this.formattingSettings = this.formattingSettingsService.populateFormattingSettingsModel(
            VisualFormattingSettingsModel,
            dataView
        );

        const settings = getVisualSettings(this.formattingSettings);
        const renderData = this.buildRenderData(dataView, settings.decimalPlaces, settings.displayUnits);

        if (!renderData) {
            this.renderNoData();
            return;
        }

        switch (settings.kpiVariant) {
            case "progress":
                renderProgressKpi(this.hostElement, renderData, settings);
                break;
            case "microchart":
                renderMicrochartKpi(this.hostElement, renderData, settings);
                break;
            default:
                renderDefaultKpi(this.hostElement, renderData, settings);
                break;
        }
    }

    public getFormattingModel(): powerbi.visuals.FormattingModel {
        return this.formattingSettingsService.buildFormattingModel(this.formattingSettings);
    }

    private renderNoData(): void {
        const noData = document.createElement("div");
        noData.className = "kpi-no-data";
        noData.textContent = "No data";
        this.hostElement.appendChild(noData);
    }

    private buildRenderData(dataView: DataView, decimalPlaces: number, displayUnitsSelection: string): KpiRenderData | null {
        const valueColumn = this.getValueColumn(dataView, "value");
        const comparisonColumn = this.getValueColumn(dataView, "comparison");
        const trendValueColumn = this.getValueColumn(dataView, "trendValues");
        const trendCategory = this.getTrendCategory(dataView);

        const value = this.getPrimaryNumber(valueColumn);
        if (value === null) {
            return null;
        }

        const comparison = this.getPrimaryNumber(comparisonColumn);
        const scaleValue = this.resolveDisplayUnits(displayUnitsSelection, value);

        const formatter = valueFormatter.create({
            value: scaleValue,
            precision: decimalPlaces,
            format: valueColumn?.source?.format
        });

        const deltaRatio = comparison !== null && comparison !== 0 ? (value - comparison) / Math.abs(comparison) : null;
        const trendPoints = this.buildTrendPoints(trendCategory, trendValueColumn);

        return {
            label: valueColumn?.source?.displayName || "Value",
            valueText: formatter.format(value),
            deltaText: deltaRatio !== null ? `${(deltaRatio * 100).toFixed(decimalPlaces)}%` : undefined,
            isDeltaPositive: deltaRatio !== null ? deltaRatio >= 0 : undefined,
            progressRatio: comparison !== null && comparison !== 0 ? value / comparison : 0,
            trendPoints
        };
    }

    private getValueColumn(dataView: DataView, roleName: string): DataViewValueColumn | null {
        const values = dataView.categorical?.values;
        if (!values) {
            return null;
        }

        const match = values.find((column) => !!column.source?.roles?.[roleName]);
        return match || null;
    }

    private getTrendCategory(dataView: DataView): powerbi.DataViewCategoryColumn | null {
        const categories = dataView.categorical?.categories;
        if (!categories?.length) {
            return null;
        }

        return categories.find((category) => !!category.source?.roles?.trend) || null;
    }

    private getPrimaryNumber(column: DataViewValueColumn | null): number | null {
        if (!column?.values?.length) {
            return null;
        }

        for (let i = 0; i < column.values.length; i++) {
            const current = column.values[i] as number;
            if (current !== null && current !== undefined && Number.isFinite(current)) {
                return current;
            }
        }

        return null;
    }

    private buildTrendPoints(
        categoryColumn: powerbi.DataViewCategoryColumn | null,
        trendColumn: DataViewValueColumn | null
    ): TrendPoint[] {
        if (!categoryColumn?.values?.length || !trendColumn?.values?.length) {
            return [];
        }

        const maxLength = Math.min(categoryColumn.values.length, trendColumn.values.length);
        const points: TrendPoint[] = [];

        for (let i = 0; i < maxLength; i++) {
            const y = trendColumn.values[i] as number;
            if (y !== null && y !== undefined && Number.isFinite(y)) {
                points.push({
                    x: String(categoryColumn.values[i]),
                    y
                });
            }
        }

        return points;
    }

    private resolveDisplayUnits(displayUnitsSelection: string, value: number): number {
        switch (displayUnitsSelection) {
            case "thousands":
                return 1e3;
            case "millions":
                return 1e6;
            case "billions":
                return 1e9;
            default:
                if (Math.abs(value) >= 1e9) {
                    return 1e9;
                }
                if (Math.abs(value) >= 1e6) {
                    return 1e6;
                }
                if (Math.abs(value) >= 1e3) {
                    return 1e3;
                }
                return 0;
        }
    }
}

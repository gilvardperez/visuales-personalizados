"use strict";

import powerbi from "powerbi-visuals-api";
import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";

import FormattingSettingsCard = formattingSettings.SimpleCard;
import FormattingSettingsSlice = formattingSettings.Slice;
import FormattingSettingsModel = formattingSettings.Model;

export type KpiVariant =
    | "default"
    | "progress"
    | "microchart"
    | "area"
    | "bars"
    | "barsLine"
    | "bullet"
    | "donut"
    | "lollipop"
    | "dual"
    | "callout"
    | "stackedCompare";

export type LabelPosition = "top" | "bottom";
export type DisplayUnits = "auto" | "thousands" | "millions" | "billions";

export interface VisualSettings {
    kpiVariant: KpiVariant;
    labelPosition: LabelPosition;
    valueColor: string;
    positiveColor: string;
    negativeColor: string;
    progressColor: string;
    successColor: string;
    valueFontSize: number;
    labelFontSize: number;
    displayUnits: DisplayUnits;
    decimalPlaces: number;
    showLastValueLabel: boolean;
    highlightLastPoint: boolean;
    highlightColor: string;
    chartHeight: number;
    barColor: string;
    lineColor: string;
    areaFillOpacity: number;
    showTitle: boolean;
    titleText: string;
    titleFontSize: number;
    deltaSuffix: string;
    targetLineColor: string;
    bulletGoodColor: string;
    bulletMidColor: string;
    bulletBadColor: string;
    donutThickness: number;
}

const kpiVariants: powerbi.IEnumMember[] = [
    { value: "default", displayName: "Default" },
    { value: "progress", displayName: "Progress" },
    { value: "microchart", displayName: "Microchart" },
    { value: "area", displayName: "Area" },
    { value: "bars", displayName: "Bars" },
    { value: "barsLine", displayName: "Bars + Line" },
    { value: "bullet", displayName: "Bullet" },
    { value: "donut", displayName: "Donut" },
    { value: "lollipop", displayName: "Lollipop" },
    { value: "dual", displayName: "Dual" },
    { value: "callout", displayName: "Callout" },
    { value: "stackedCompare", displayName: "Stacked Compare" }
];

const labelPositions: powerbi.IEnumMember[] = [
    { value: "top", displayName: "top" },
    { value: "bottom", displayName: "bottom" }
];

const displayUnits: powerbi.IEnumMember[] = [
    { value: "auto", displayName: "auto" },
    { value: "thousands", displayName: "thousands" },
    { value: "millions", displayName: "millions" },
    { value: "billions", displayName: "billions" }
];

class KpiStyleCardSettings extends FormattingSettingsCard {
    kpiVariant = new formattingSettings.ItemDropdown({
        name: "kpiVariant",
        displayName: "kpiVariant",
        items: kpiVariants,
        value: kpiVariants[0]
    });

    labelPosition = new formattingSettings.ItemDropdown({
        name: "labelPosition",
        displayName: "labelPosition",
        items: labelPositions,
        value: labelPositions[0]
    });

    name: string = "kpiStyle";
    displayName: string = "KPI Style";
    slices: Array<FormattingSettingsSlice> = [this.kpiVariant, this.labelPosition];
}

class ColorsCardSettings extends FormattingSettingsCard {
    valueColor = new formattingSettings.ColorPicker({
        name: "valueColor",
        displayName: "valueColor",
        value: { value: "#111111" }
    });

    positiveColor = new formattingSettings.ColorPicker({
        name: "positiveColor",
        displayName: "positiveColor",
        value: { value: "#16A34A" }
    });

    negativeColor = new formattingSettings.ColorPicker({
        name: "negativeColor",
        displayName: "negativeColor",
        value: { value: "#E74C3C" }
    });

    progressColor = new formattingSettings.ColorPicker({
        name: "progressColor",
        displayName: "progressColor",
        value: { value: "#0078D4" }
    });

    successColor = new formattingSettings.ColorPicker({
        name: "successColor",
        displayName: "successColor",
        value: { value: "#16A34A" }
    });

    name: string = "colors";
    displayName: string = "Colors";
    slices: Array<FormattingSettingsSlice> = [
        this.valueColor,
        this.positiveColor,
        this.negativeColor,
        this.progressColor,
        this.successColor
    ];
}

class TextCardSettings extends FormattingSettingsCard {
    valueFontSize = new formattingSettings.NumUpDown({
        name: "valueFontSize",
        displayName: "valueFontSize",
        value: 32
    });

    labelFontSize = new formattingSettings.NumUpDown({
        name: "labelFontSize",
        displayName: "labelFontSize",
        value: 12
    });

    displayUnits = new formattingSettings.ItemDropdown({
        name: "displayUnits",
        displayName: "displayUnits",
        items: displayUnits,
        value: displayUnits[0]
    });

    decimalPlaces = new formattingSettings.NumUpDown({
        name: "decimalPlaces",
        displayName: "decimalPlaces",
        value: 1,
        options: {
            minValue: { type: powerbi.visuals.ValidatorType.Min, value: 0 },
            maxValue: { type: powerbi.visuals.ValidatorType.Max, value: 4 }
        }
    });

    name: string = "text";
    displayName: string = "Text";
    slices: Array<FormattingSettingsSlice> = [
        this.valueFontSize,
        this.labelFontSize,
        this.displayUnits,
        this.decimalPlaces
    ];
}

class MiniChartCardSettings extends FormattingSettingsCard {
    showLastValueLabel = new formattingSettings.ToggleSwitch({
        name: "showLastValueLabel",
        displayName: "showLastValueLabel",
        value: true
    });

    highlightLastPoint = new formattingSettings.ToggleSwitch({
        name: "highlightLastPoint",
        displayName: "highlightLastPoint",
        value: true
    });

    highlightColor = new formattingSettings.ColorPicker({
        name: "highlightColor",
        displayName: "highlightColor",
        value: { value: "#0078D4" }
    });

    chartHeight = new formattingSettings.NumUpDown({
        name: "chartHeight",
        displayName: "chartHeight",
        value: 60,
        options: {
            minValue: { type: powerbi.visuals.ValidatorType.Min, value: 20 },
            maxValue: { type: powerbi.visuals.ValidatorType.Max, value: 200 }
        }
    });

    barColor = new formattingSettings.ColorPicker({
        name: "barColor",
        displayName: "barColor",
        value: { value: "#E74C3C" }
    });

    lineColor = new formattingSettings.ColorPicker({
        name: "lineColor",
        displayName: "lineColor",
        value: { value: "#111111" }
    });

    areaFillOpacity = new formattingSettings.NumUpDown({
        name: "areaFillOpacity",
        displayName: "areaFillOpacity",
        value: 0.15,
        options: {
            minValue: { type: powerbi.visuals.ValidatorType.Min, value: 0 },
            maxValue: { type: powerbi.visuals.ValidatorType.Max, value: 1 }
        }
    });

    name: string = "miniChart";
    displayName: string = "Mini Chart";
    slices: Array<FormattingSettingsSlice> = [
        this.showLastValueLabel,
        this.highlightLastPoint,
        this.highlightColor,
        this.chartHeight,
        this.barColor,
        this.lineColor,
        this.areaFillOpacity
    ];
}

class TitleSubtitleCardSettings extends FormattingSettingsCard {
    showTitle = new formattingSettings.ToggleSwitch({
        name: "showTitle",
        displayName: "showTitle",
        value: false
    });

    titleText = new formattingSettings.TextInput({
        name: "titleText",
        displayName: "titleText",
        placeholder: "",
        value: ""
    });

    titleFontSize = new formattingSettings.NumUpDown({
        name: "titleFontSize",
        displayName: "titleFontSize",
        value: 14
    });

    deltaSuffix = new formattingSettings.TextInput({
        name: "deltaSuffix",
        displayName: "deltaSuffix",
        placeholder: "",
        value: ""
    });

    name: string = "titleSubtitle";
    displayName: string = "Title & Subtitle";
    slices: Array<FormattingSettingsSlice> = [this.showTitle, this.titleText, this.titleFontSize, this.deltaSuffix];
}

class BulletDonutCardSettings extends FormattingSettingsCard {
    targetLineColor = new formattingSettings.ColorPicker({
        name: "targetLineColor",
        displayName: "targetLineColor",
        value: { value: "#111111" }
    });

    bulletGoodColor = new formattingSettings.ColorPicker({
        name: "bulletGoodColor",
        displayName: "bulletGoodColor",
        value: { value: "#D1FAE5" }
    });

    bulletMidColor = new formattingSettings.ColorPicker({
        name: "bulletMidColor",
        displayName: "bulletMidColor",
        value: { value: "#FEF3C7" }
    });

    bulletBadColor = new formattingSettings.ColorPicker({
        name: "bulletBadColor",
        displayName: "bulletBadColor",
        value: { value: "#FEE2E2" }
    });

    donutThickness = new formattingSettings.NumUpDown({
        name: "donutThickness",
        displayName: "donutThickness",
        value: 14,
        options: {
            minValue: { type: powerbi.visuals.ValidatorType.Min, value: 4 },
            maxValue: { type: powerbi.visuals.ValidatorType.Max, value: 40 }
        }
    });

    name: string = "bulletDonut";
    displayName: string = "Bullet/Donut";
    slices: Array<FormattingSettingsSlice> = [
        this.targetLineColor,
        this.bulletGoodColor,
        this.bulletMidColor,
        this.bulletBadColor,
        this.donutThickness
    ];
}

export class VisualFormattingSettingsModel extends FormattingSettingsModel {
    kpiStyleCard = new KpiStyleCardSettings();
    colorsCard = new ColorsCardSettings();
    textCard = new TextCardSettings();
    miniChartCard = new MiniChartCardSettings();
    titleSubtitleCard = new TitleSubtitleCardSettings();
    bulletDonutCard = new BulletDonutCardSettings();

    cards = [
        this.kpiStyleCard,
        this.colorsCard,
        this.textCard,
        this.miniChartCard,
        this.titleSubtitleCard,
        this.bulletDonutCard
    ];
}

export function getVisualSettings(model: VisualFormattingSettingsModel): VisualSettings {
    return {
        kpiVariant: model.kpiStyleCard.kpiVariant.value.value as KpiVariant,
        labelPosition: model.kpiStyleCard.labelPosition.value.value as LabelPosition,
        valueColor: model.colorsCard.valueColor.value.value,
        positiveColor: model.colorsCard.positiveColor.value.value,
        negativeColor: model.colorsCard.negativeColor.value.value,
        progressColor: model.colorsCard.progressColor.value.value,
        successColor: model.colorsCard.successColor.value.value,
        valueFontSize: Math.max(8, model.textCard.valueFontSize.value),
        labelFontSize: Math.max(8, model.textCard.labelFontSize.value),
        displayUnits: model.textCard.displayUnits.value.value as DisplayUnits,
        decimalPlaces: Math.max(0, Math.min(4, Math.round(model.textCard.decimalPlaces.value))),
        showLastValueLabel: model.miniChartCard.showLastValueLabel.value,
        highlightLastPoint: model.miniChartCard.highlightLastPoint.value,
        highlightColor: model.miniChartCard.highlightColor.value.value,
        chartHeight: Math.max(20, Math.min(200, model.miniChartCard.chartHeight.value)),
        barColor: model.miniChartCard.barColor.value.value,
        lineColor: model.miniChartCard.lineColor.value.value,
        areaFillOpacity: Math.max(0, Math.min(1, model.miniChartCard.areaFillOpacity.value)),
        showTitle: model.titleSubtitleCard.showTitle.value,
        titleText: model.titleSubtitleCard.titleText.value,
        titleFontSize: Math.max(8, model.titleSubtitleCard.titleFontSize.value),
        deltaSuffix: model.titleSubtitleCard.deltaSuffix.value,
        targetLineColor: model.bulletDonutCard.targetLineColor.value.value,
        bulletGoodColor: model.bulletDonutCard.bulletGoodColor.value.value,
        bulletMidColor: model.bulletDonutCard.bulletMidColor.value.value,
        bulletBadColor: model.bulletDonutCard.bulletBadColor.value.value,
        donutThickness: Math.max(4, Math.min(40, model.bulletDonutCard.donutThickness.value))
    };
}

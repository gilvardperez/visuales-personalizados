"use strict";

import powerbi from "powerbi-visuals-api";
import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";

import FormattingSettingsCard = formattingSettings.SimpleCard;
import FormattingSettingsSlice = formattingSettings.Slice;
import FormattingSettingsModel = formattingSettings.Model;

export type KpiVariant = "default" | "progress" | "microchart";
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
}

const kpiVariants: powerbi.IEnumMember[] = [
    { value: "default", displayName: "default" },
    { value: "progress", displayName: "progress" },
    { value: "microchart", displayName: "microchart" }
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
        value: { value: "#1A1A1A" }
    });

    positiveColor = new formattingSettings.ColorPicker({
        name: "positiveColor",
        displayName: "positiveColor",
        value: { value: "#00B050" }
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
        value: { value: "#00B050" }
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

export class VisualFormattingSettingsModel extends FormattingSettingsModel {
    kpiStyleCard = new KpiStyleCardSettings();
    colorsCard = new ColorsCardSettings();
    textCard = new TextCardSettings();

    cards = [this.kpiStyleCard, this.colorsCard, this.textCard];
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
        decimalPlaces: Math.max(0, Math.min(4, Math.round(model.textCard.decimalPlaces.value)))
    };
}

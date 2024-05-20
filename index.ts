export interface HorizontalOptions {
    width?: number;
    height?: number;
    borderStyle?: BorderStyleName|BorderStyle|null;
    label?: string|true|null;
}

export function unicodeProgressBar(value: number, widthOrOptions: number|HorizontalOptions = 80): string[] {
    let width: number;
    let barHeight: number = 1;
    let borderStyle: BorderStyle|null = null;
    let label: string|true|null = null;

    if (typeof widthOrOptions === 'number') {
        width = widthOrOptions;
    } else {
        width = widthOrOptions.width ?? 80;
        const style = widthOrOptions.borderStyle;
        borderStyle = typeof style === 'string' ? BorderStyles[style] : style || null;
        label = widthOrOptions.label ?? null;
        const height = widthOrOptions.height ?? (borderStyle ? 3 : 1);
        barHeight = borderStyle ? height - 2 : height;
    }

    if (value < 0) {
        value = 0;
    } else if (value > 1) {
        value = 1;
    }

    let barWidth = width;
    if (label === true) {
        label = ((value * 100).toFixed(0) + '%').padStart(4);
    }

    if (label !== null) {
        barWidth = width - label.length - 1;
    }

    if (borderStyle) {
        barWidth -= 2;
    }

    let bar: string;

    if (barWidth <= 0) {
        bar = '';
    } else if (value === 1) {
        bar = '█'.repeat(barWidth);
    } else {
        const chars = barWidth * value;
        const full = chars|0;
        const rem = chars - full;
        bar = '█'.repeat(full);

        if (rem > 0) {
            bar += HCHAR_MAP[(rem * HCHAR_MAP.length)|0];
        }

        bar = bar.padEnd(barWidth);
    }

    const lines: string[] = [];

    for (let y = 0; y < barHeight; ++ y) {
        lines.push(bar);
    }

    if (label !== null) {
        lines[lines.length >> 1] = `${bar} ${label}`;
    }

    return borderStyle ? makeBox(lines, borderStyle) : lines;
}

const HCHAR_MAP = [
    '▏', // 1/8 0.125
    '▎', // 1/4 0.25
    '▍', // 3/8 0.375
    '▌', // 1/2 0.5
    '▋', // 5/8 0.625
    '▊', // 3/4 0.75
    '▉', // 7/8 0.875
    '█', // 1/1 1
];

export function verticalUnicodeProgressBar(value: number, height: number = 40): string[] {
    if (height <= 0) {
        return [];
    }

    if (value < 0) {
        value = 0;
    }

    const bar: string[] = [];
    if (value >= 1.0) {
        for (let index = 0; index < height; ++ index) {
            bar.push('█');
        }
        return bar;
    }

    const chars = height * value;
    const full = chars|0;
    const rem = chars - full;

    for (let index = Math.ceil(chars); index < height; ++ index) {
        bar.push(' ');
    }

    if (rem > 0) {
        bar.push(VCHAR_MAP[(rem * VCHAR_MAP.length)|0]);
    }

    for (let index = 0; index < full; ++ index) {
        bar.push('█');
    }

    return bar;
}

const VCHAR_MAP = [
    '▁', // 1/8 0.125
    '▂', // 1/4 0.25
    '▃', // 3/8 0.375
    '▄', // 1/2 0.5
    '▅', // 5/8 0.625
    '▆', // 3/4 0.75
    '▇', // 7/8 0.875
    '█', // 1/1 1
];

export type BorderStyle = [topLeft: string, topRight: string, bottomLeft: string, bottomRight: string, horizontal: string, vertical: string];

const BorderStyles = {
    space:   [' ',' ',' ',' ',' ',' '] as const satisfies BorderStyle,
    regular: ['┌','┐','└','┘','─','│'] as const satisfies BorderStyle,
    rounded: ['╭','╮','╰','╯','─','│'] as const satisfies BorderStyle,
    fat:     ['┏','┓','┗','┛','━','┃'] as const satisfies BorderStyle,
    double:  ['╔','╗','╚','╝','═','║'] as const satisfies BorderStyle,
};

export type BorderStyleName = keyof typeof BorderStyles;

export function makeBox(text: string|string[], style: BorderStyleName|BorderStyle='rounded'): string[] {
    const lines = Array.isArray(text) ? text : text.split('\n');
    let maxLen = 0;
    for (const line of lines) {
        const len = (line ?? '').length;
        if (len > maxLen) {
            maxLen = len;
        }
    }

    const [topLeft, topRight, bottomLeft, bottomRight, horizontal, vertical] =
        typeof style === 'string' ? BorderStyles[style] : style;
    const outline = horizontal.repeat(maxLen);
    const out: string[] = [];
    out.push(`${topLeft}${outline}${topRight}`);
    for (const line of lines) {
        out.push(`${vertical}${(line ?? '').padEnd(maxLen)}${vertical}`);
    }
    out.push(`${bottomLeft}${outline}${bottomRight}`);

    return out;
}


export default unicodeProgressBar;

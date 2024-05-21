export interface ProgressBarOptions {
    width?: number;
    height?: number;
    borderStyle?: BorderStyleName|BorderStyle|null;
    label?: string|true|null;
}

export function unicodeProgressBar(value: number, widthOrOptions: number|ProgressBarOptions = 80): string[] {
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

export interface VerticalProgressBarOptions extends ProgressBarOptions {
    barWidth?: number;
}

export function verticalUnicodeProgressBar(value: number, heightOrOptions: number|VerticalProgressBarOptions = 40): string[] {
    let height: number;
    let width: number = 2;
    let barWidth: number = 2;
    let borderStyle: BorderStyle|null = null;
    let label: string|true|null = null;

    if (value < 0) {
        value = 0;
    } else if (value > 1) {
        value = 1;
    }

    if (typeof heightOrOptions === 'number') {
        height = heightOrOptions;
    } else {
        height = heightOrOptions.height ?? 40;
        const style = heightOrOptions.borderStyle;
        borderStyle = typeof style === 'string' ? BorderStyles[style] : style || null;
        label = heightOrOptions.label ?? null;
        if (label === true) {
            label = ((value * 100).toFixed(0) + '%').padStart(4);
        }
        const borderWidth = borderStyle ? 2 : 0;
        if (heightOrOptions.width === undefined) {
            const labelWidth = label?.length ?? 0;
            barWidth = heightOrOptions.barWidth ?? 2;
            width = Math.max(barWidth, labelWidth) + borderWidth;
        } else {
            width = heightOrOptions.width;
            barWidth = heightOrOptions.barWidth ?? width - borderWidth;
        }
    }

    let barHeight = height;
    if (label !== null) {
        barHeight = height - 1;
    }

    let innerWidth = width;
    if (borderStyle) {
        barHeight -= 2;
        innerWidth -= 2;
    }

    const bar: string[] = [];
    if (value === 1) {
        for (let index = 0; index < barHeight; ++ index) {
            bar.push('█');
        }
    } else if (barHeight > 0) {
        const chars = barHeight * value;
        const full = chars|0;
        const rem = chars - full;

        for (let index = Math.ceil(chars); index < barHeight; ++ index) {
            bar.push(' ');
        }

        if (rem > 0) {
            bar.push(VCHAR_MAP[(rem * VCHAR_MAP.length)|0]);
        }

        for (let index = 0; index < full; ++ index) {
            bar.push('█');
        }
    }

    const lines: string[] = [];
    const prefix = ' '.repeat(Math.ceil((innerWidth - barWidth) / 2));
    for (const char of bar) {
        lines.push(prefix + char.repeat(barWidth))
    }
    if (label !== null) {
        lines.push(' '.repeat(Math.ceil((innerWidth - label.length) / 2)) + label);
    }

    return borderStyle ? makeBox(lines, borderStyle) : lines;
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

export type BorderStyle = [
    topLeft: string, topRight: string,
    bottomLeft: string, bottomRight: string,
    top: string, bottom: string,
    left: string, right: string,
];

const BorderStyles = {
    space:     [' ',' ',' ',' ',' ',' ',' ',' '] as const satisfies BorderStyle,
    regular:   ['┌','┐','└','┘','─','─','│','│'] as const satisfies BorderStyle,
    dots:      ['┌','┐','└','┘','┄','┄','┊','┊'] as const satisfies BorderStyle,
    dashed:    ['┌','┐','└','┘','╌','╌','╎','╎'] as const satisfies BorderStyle,
    rounded:   ['╭','╮','╰','╯','─','─','│','│'] as const satisfies BorderStyle,
    fat:       ['┏','┓','┗','┛','━','━','┃','┃'] as const satisfies BorderStyle,
    fatdots:   ['┏','┓','┗','┛','┅','┅','┇','┇'] as const satisfies BorderStyle,
    fatdashed: ['┏','┓','┗','┛','╍','╍','╏','╏'] as const satisfies BorderStyle,
    double:    ['╔','╗','╚','╝','═','═','║','║'] as const satisfies BorderStyle,
    'fat+':    ['▛','▜','▙','▟','▀','▄','▌','▐'] as const satisfies BorderStyle,
    pixel:     ['▞','▚','▚','▞','▀','▄','▌','▐'] as const satisfies BorderStyle,
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

    const [topLeft, topRight, bottomLeft, bottomRight, top, bottom, left, right] =
        typeof style === 'string' ? BorderStyles[style] : style;
    const out: string[] = [];
    out.push(`${topLeft}${top.repeat(maxLen)}${topRight}`);
    for (const line of lines) {
        out.push(`${left}${(line ?? '').padEnd(maxLen)}${right}`);
    }
    out.push(`${bottomLeft}${bottom.repeat(maxLen)}${bottomRight}`);

    return out;
}


export default unicodeProgressBar;

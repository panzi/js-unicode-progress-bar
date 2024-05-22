export type ColorSegment = readonly [start: number, color: Color];

export interface ProgressBarOptions {
    width?: number;
    height?: number;
    borderStyle?: BorderStyleName|BorderStyle|null;
    label?: string|true|null;
    borderColor?: Color|null;
    backgroundColor?: Color|null;
    labelColor?: Color|null;
    barColors?: ReadonlyArray<ColorSegment>;
}

export function unicodeProgressBar(value: number, widthOrOptions: number|ProgressBarOptions = 80): string[] {
    let width: number;
    let barHeight: number = 1;
    let borderStyle: BorderStyle|null = null;
    let label: string|true|null = null;
    let borderColor: Color|null = null;
    let labelColor: Color|null = null;
    let backgroundColor: Color|null = null;
    let barColors: ReadonlyArray<ColorSegment>|undefined;

    if (typeof widthOrOptions === 'number') {
        width = widthOrOptions;
    } else {
        width = widthOrOptions.width ?? 80;
        const style = widthOrOptions.borderStyle;
        borderStyle = typeof style === 'string' ? BorderStyles[style] : style || null;
        label = widthOrOptions.label ?? null;
        const height = widthOrOptions.height ?? (borderStyle ? 3 : 1);
        barHeight = borderStyle ? height - 2 : height;
        borderColor = widthOrOptions.borderColor ?? null;
        barColors = widthOrOptions.barColors;
        labelColor = widthOrOptions.labelColor ?? null;
        backgroundColor = widthOrOptions.backgroundColor ?? null;
    }

    if (value < 0) {
        value = 0;
    } else if (value > 1) {
        value = 1;
    }

    let barWidth = width;
    if (label === true) {
        label = ((value * 100).toFixed(0) + '%').padStart(4);
    } else if (label && backgroundColor) {
        label += COLOR_MAP[backgroundColor][1];
    }

    if (label !== null) {
        barWidth = width - getTextWidth(label) - 1;
        if (labelColor) {
            label = `${COLOR_MAP[labelColor][0]}${label}${COLOR_MAP.default[0]}`;
        }
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

    if (barColors && barColors.length > 0) {
        let prevIndex = 0;
        let chunks: string[] = [];

        for (const [start, color] of barColors) {
            const index = (barWidth * start)|0;
            chunks.push(bar.slice(prevIndex, index), COLOR_MAP[color][0]);
            prevIndex = index;
        }

        chunks.push(bar.slice(prevIndex));
        chunks.push(COLOR_MAP.default[0]);
        bar = chunks.join('');
    }

    let lines: string[] = [];

    for (let y = 0; y < barHeight; ++ y) {
        lines.push(bar);
    }

    if (label !== null) {
        lines[lines.length >> 1] = `${bar} ${label}`;
    }

    if (borderStyle) {
        lines = makeBox(lines, borderStyle, borderColor);
    }

    if (backgroundColor) {
        const endbg = COLOR_MAP.default[1];
        const bg = COLOR_MAP[backgroundColor][1];
        for (let index = 0; index < lines.length; ++ index) {
            lines[index] = `${bg}${lines[index]}${endbg}`;
        }
    }

    return lines;
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
    let labelWidth = 0;
    let borderColor: Color|null = null;
    let labelColor: Color|null = null;
    let backgroundColor: Color|null = null;
    let barColors: ReadonlyArray<ColorSegment>|undefined;

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
        if (label) {
            labelWidth = getTextWidth(label);
        }
        if (heightOrOptions.width === undefined) {
            barWidth = heightOrOptions.barWidth ?? 2;
            width = Math.max(barWidth, labelWidth) + borderWidth;
        } else {
            width = heightOrOptions.width;
            barWidth = heightOrOptions.barWidth ?? width - borderWidth;
        }
        borderColor = heightOrOptions.borderColor ?? null;
        barColors = heightOrOptions.barColors;
        labelColor = heightOrOptions.labelColor ?? null;
        backgroundColor = heightOrOptions.backgroundColor ?? null;
    }

    let barHeight = height;
    if (label !== null) {
        barHeight = height - 1;
        if (labelColor) {
            label = `${COLOR_MAP[labelColor][0]}${label}${COLOR_MAP.default[0]}`;
        }
        if (backgroundColor) {
            label += COLOR_MAP[backgroundColor][1];
        }
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

    if (barColors) {
        let prevColor: Color|null = null;
        let prevIndex = 0;
        const colorOff = COLOR_MAP.default[0];
        for (const [start, color] of barColors) {
            const endIndex = (barHeight * start)|0;

            if (prevColor) {
                const colorOn = COLOR_MAP[prevColor][0];
                for (let index = prevIndex; index < endIndex; ++ index) {
                    const i = bar.length - index - 1;
                    bar[i] = `${colorOn}${bar[i]}${colorOff}`;
                }
            }

            prevIndex = endIndex;
            prevColor = color;
        }

        if (prevColor) {
            const colorOn = COLOR_MAP[prevColor][0];
            for (let index = prevIndex; index < bar.length; ++ index) {
                const i = bar.length - index - 1;
                bar[i] = `${colorOn}${bar[i]}${colorOff}`;
            }
        }
    }

    let lines: string[] = [];
    const prefix = ' '.repeat(Math.ceil((innerWidth - barWidth) / 2));
    for (const char of bar) {
        lines.push(prefix + char.repeat(barWidth))
    }
    if (label !== null) {
        lines.push(' '.repeat(Math.ceil((innerWidth - labelWidth) / 2)) + label);
    }

    if (borderStyle) {
        lines = makeBox(lines, borderStyle, borderColor);
    }

    if (backgroundColor) {
        const endbg = COLOR_MAP.default[1];
        const bg = COLOR_MAP[backgroundColor][1];
        for (let index = 0; index < lines.length; ++ index) {
            lines[index] = `${bg}${lines[index]}${endbg}`;
        }
    }

    return lines;
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

export function makeBox(text: string|string[], style: BorderStyleName|BorderStyle='rounded', color: Color|null=null): string[] {
    const lines = Array.isArray(text) ? text : text.split('\n');
    let maxLen = 0;
    for (const line of lines) {
        const len = getTextWidth(line ?? '');
        if (len > maxLen) {
            maxLen = len;
        }
    }

    let colorOn: string;
    let colorOff: string;

    if (color) {
        [colorOn]  = COLOR_MAP[color];
        [colorOff] = COLOR_MAP.default;
    } else {
        colorOn = colorOff = '';
    }

    const [topLeft, topRight, bottomLeft, bottomRight, top, bottom, left, right] =
        typeof style === 'string' ? BorderStyles[style] : style;
    const out: string[] = [];
    out.push(`${colorOn}${topLeft}${top.repeat(maxLen)}${topRight}${colorOff}`);
    for (const line of lines) {
        const lineWidth = getTextWidth(line ?? '');
        const padding = ' '.repeat(maxLen - lineWidth);
        out.push(`${colorOn}${left}${colorOff}${line}${padding}${colorOn}${right}${colorOff}`);
    }
    out.push(`${colorOn}${bottomLeft}${bottom.repeat(maxLen)}${bottomRight}${colorOff}`);

    return out;
}

const ZERO_WIDTH_REGEX = /\x1B\[\d+(;\d+){0,4}m|[\u{E000}-\u{FFFF}\u{200B}-\u{200D}\u{2060}\u{FEFF}\p{Mn}]/gu;

/** HACK: Slow and not very accurat. */
export function getTextWidth(text: string): number {
    return text.replace(ZERO_WIDTH_REGEX, '').length;
}

export type Color =
    'black'|'red'|'green'|'yellow'|'blue'|'magenta'|'cyan'|'white'|'gray'|
    'bright_red'|'bright_green'|'bright_yellow'|'bright_blue'|'bright_magenta'|
    'bright_cyan'|'bright_white'|'default';

const COLOR_MAP: { [color in Color]: [fg: string, bg: string] } = {
    black:          ['\x1B[30m', '\x1B[40m'],
    red:            ['\x1B[31m', '\x1B[41m'],
    green:          ['\x1B[32m', '\x1B[42m'],
    yellow:         ['\x1B[33m', '\x1B[43m'],
    blue:           ['\x1B[34m', '\x1B[44m'],
    magenta:        ['\x1B[35m', '\x1B[45m'],
    cyan:           ['\x1B[36m', '\x1B[46m'],
    white:          ['\x1B[37m', '\x1B[47m'],
    gray:           ['\x1B[90m', '\x1B[100m'],
    bright_red:     ['\x1B[91m', '\x1B[101m'],
    bright_green:   ['\x1B[92m', '\x1B[102m'],
    bright_yellow:  ['\x1B[93m', '\x1B[103m'],
    bright_blue:    ['\x1B[94m', '\x1B[104m'],
    bright_magenta: ['\x1B[95m', '\x1B[105m'],
    bright_cyan:    ['\x1B[96m', '\x1B[106m'],
    bright_white:   ['\x1B[97m', '\x1B[107m'],
    default:        ['\x1B[39m', '\x1B[49m'],
};

export default unicodeProgressBar;

import { unicodeProgressBar, verticalUnicodeProgressBar, getTextWidth } from "./index.js";

function centerBox(text: string|string[], width: number, height: number): string[] {
    const lines = Array.isArray(text) ? text : text.split('\n');
    const box: string[] = [];
    const maxLen = lines.reduce((len, line) => Math.max(len, getTextWidth(line)), 0);
    const padStart = Math.max((width - maxLen) >> 1, 0);
    const prefix = ' '.repeat(padStart);

    const padLines = (height - lines.length) >> 1;
    for (let y = 0; y < padLines; ++ y) {
        box.push('');
    }

    for (const line of lines) {
        box.push((prefix + line));
    }

    return box;
}

function verticalJoin(...blocks: (string[]|string)[]): string[] {
    const lines: string[][] = [];
    let width = 0;
    for (let block of blocks) {
        if (typeof block === 'string') {
            block = block.split('\n');
        }
        const blockWidth = block.reduce((len, line) => Math.max(len, getTextWidth(line)), 0);
        let padLine = ' '.repeat(width);
        while (lines.length < block.length) {
            lines.push([padLine]);
        }

        for (let index = 0; index < block.length; ++ index) {
            lines[index].push(block[index].padEnd(blockWidth));
        }

        padLine = ' '.repeat(blockWidth);
        for (let index = block.length; index < lines.length; ++ index) {
            lines[index].push(padLine);
        }

        width += blockWidth;
    }
    return lines.map(block => block.join(''));
}

function main() {
    const message = 'Press Control+C to exit.';

    process.stdout.write('\x1B[?25l');

    let timeout: NodeJS.Timeout|null = null;
    let interval: NodeJS.Timeout|null = null;
    let start = Date.now();

    const redrawSleep = 1000/60;
    const duration = 15_000;
    let horizontal = true;
    const redraw = (now: number) => {
        process.stdout.write('\x1B[1;1H\x1B[2J');

        const availWidth  = process.stdout.columns ?? 80;
        const availHeight = process.stdout.rows ?? 40;
        const value = (now - start) / duration;

        if (horizontal) {
            const lines: string[] = [];
            lines.push(...unicodeProgressBar(value, availWidth));
            lines.push(...unicodeProgressBar(value, {
                width: availWidth,
                label: true,
                borderStyle: 'regular',
            }));
            lines.push(...unicodeProgressBar(value, {
                width: availWidth,
                label: true,
                borderStyle: 'dots',
            }));
            lines.push(...unicodeProgressBar(value, {
                width: availWidth,
                label: true,
                borderStyle: 'fatdots',
            }));
            lines.push(...unicodeProgressBar(value, {
                width: availWidth,
                label: true,
                borderStyle: 'dashed',
            }));
            lines.push(...unicodeProgressBar(value, {
                width: availWidth,
                label: true,
                borderStyle: 'fatdashed',
                borderColor: 'blue',
                labelColor: 'blue',
                barColors: [[0, 'green'], [0.5, 'yellow'], [0.8, 'red']],
            }));
            lines.push(...unicodeProgressBar(value, {
                width: availWidth,
                label: true,
                borderStyle: 'rounded',
            }));
            lines.push(...unicodeProgressBar(value, {
                width: availWidth,
                borderStyle: 'pixel',
            }));
            lines.push(...unicodeProgressBar(value, {
                width: availWidth,
                borderStyle: 'fat',
            }));
            lines.push(...unicodeProgressBar(value, {
                width: availWidth,
                borderStyle: 'fat+',
                barColors: [[0, 'bright_magenta'], [1/6, 'bright_red'], [2/6, 'bright_yellow'], [3/6, 'bright_green'], [4/6, 'bright_cyan'], [5/6, 'bright_blue']],
            }));
            lines.push(...unicodeProgressBar(value, {
                width: availWidth,
                label: true,
                borderStyle: 'double',
                height: 5,
                barColors: [[0, 'magenta'], [1/6, 'red'], [2/6, 'yellow'], [3/6, 'green'], [4/6, 'cyan'], [5/6, 'blue']],
            }));
            lines.push(...centerBox(message, availWidth, 1));
            console.log(centerBox(lines, availWidth, availHeight).join('\n'));
        } else {
            const barAvailHeight = availHeight - 3;
            const lines = verticalJoin(
                verticalUnicodeProgressBar(value, barAvailHeight),
                '  ',
                verticalUnicodeProgressBar(value, {
                    height: barAvailHeight,
                    label: true,
                    borderStyle: 'regular',
                }),
                '  ',
                verticalUnicodeProgressBar(value, {
                    height: barAvailHeight,
                    label: true,
                    borderStyle: 'dots',
                }),
                '  ',
                verticalUnicodeProgressBar(value, {
                    height: barAvailHeight,
                    label: true,
                    borderStyle: 'fatdots',
                }),
                '  ',
                verticalUnicodeProgressBar(value, {
                    height: barAvailHeight,
                    label: true,
                    borderStyle: 'dashed',
                }),
                '  ',
                verticalUnicodeProgressBar(value, {
                    height: barAvailHeight,
                    label: true,
                    borderStyle: 'fatdashed',
                    borderColor: 'blue',
                    labelColor: 'blue',
                    barColors: [[0, 'green'], [0.5, 'yellow'], [0.8, 'red']],
                }),
                '  ',
                verticalUnicodeProgressBar(value, {
                    height: barAvailHeight,
                    label: true,
                    borderStyle: 'rounded',
                }),
                '  ',
                verticalUnicodeProgressBar(value, {
                    height: barAvailHeight,
                    barWidth: 1,
                    borderStyle: 'pixel',
                }),
                '  ',
                verticalUnicodeProgressBar(value, {
                    height: barAvailHeight,
                    barWidth: 1,
                    borderStyle: 'fat',
                }),
                '  ',
                verticalUnicodeProgressBar(value, {
                    height: barAvailHeight,
                    barWidth: 1,
                    borderStyle: 'fat+',
                    barColors: [[0, 'bright_magenta'], [1/6, 'bright_red'], [2/6, 'bright_yellow'], [3/6, 'bright_green'], [4/6, 'bright_cyan'], [5/6, 'bright_blue']],
                }),
                '  ',
                verticalUnicodeProgressBar(value, {
                    height: barAvailHeight,
                    barWidth: 4,
                    label: true,
                    borderStyle: 'double',
                    barColors: [[0, 'magenta'], [1/6, 'red'], [2/6, 'yellow'], [3/6, 'green'], [4/6, 'cyan'], [5/6, 'blue']],
                }),
            );
            console.log();
            console.log(centerBox(lines, availWidth, barAvailHeight).join('\n'));
            console.log(centerBox(message, availWidth, 1).join('\n'));
        }

        if (value >= 1.0) {
            if (interval !== null) {
                clearInterval(interval);
                interval = null;
            }

            if (timeout !== null) {
                clearTimeout(timeout);
                timeout = null;
            }

            timeout = setTimeout(() => {
                timeout = null;
                horizontal = !horizontal;
                start = Date.now();
                redraw(start);
                interval = setInterval(() => redraw(Date.now()), redrawSleep);
            }, 1000);
        }
    };

    redraw(start);
    timeout = setTimeout(() => {
        timeout = null;
        start = Date.now();
        interval = setInterval(() => redraw(Date.now()), redrawSleep);
    }, 1000);

    const shutdown = () => {
        if (interval !== null) {
            clearInterval(interval);
            interval = null;
        }
        if (timeout !== null) {
            clearTimeout(timeout);
            timeout = null;
        }
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
    process.on('exit', () => {
        process.stdout.write('\x1B[?25h');
    });
}

main();

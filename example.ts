import { unicodeProgressBar, verticalUnicodeProgressBar, makeBox } from "./index.js";

function centerBox(text: string|string[], width: number, height: number): string[] {
    const lines = Array.isArray(text) ? text : text.split('\n');
    const box: string[] = [];
    const maxLen = lines.reduce((len, line) => Math.max(len, line.length), 0);
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
        const value = (now - start) / duration;

        process.stdout.write('\x1B[1;1H\x1B[2J');

        if (horizontal) {
            const availWidth  = process.stdout.columns ?? 80;
            const availHeight = process.stdout.rows ?? 40;

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
                borderStyle: 'rounded',
            }));
            lines.push(...unicodeProgressBar(value, {
                width: availWidth,
                borderStyle: 'fat',
            }));
            lines.push(...unicodeProgressBar(value, {
                width: availWidth,
                label: true,
                borderStyle: 'double',
                height: 5,
            }));
            lines.push(...centerBox(message, availWidth, 1));
            console.log(centerBox(lines, availWidth, availHeight).join('\n'));
        } else {
            const percent = (Math.min(value, 1.0) * 100).toFixed(0) + '%';
            const availWidth = Math.max(process.stdout.columns ?? 80, 6);
            const availHeight = Math.max(process.stdout.rows ?? 40, 6);
            const barHeight = availHeight - 5;

            const bar = verticalUnicodeProgressBar(value, barHeight).map(char => ` ${char}${char} `);
            bar.push(percent.length <= 2 ? percent.padStart(percent.length + ((4 - percent.length) >> 1)) : percent.padStart(4));
            const box = makeBox(bar);
            console.log(box.map(line => line.padStart(6 + (availWidth - 6) >> 1)).join('\n'));
            console.log(message.padStart(message.length + ((availWidth - message.length) >> 1)));
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

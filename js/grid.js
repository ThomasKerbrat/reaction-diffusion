
const SeedMethod = Object.freeze({
    none: Symbol('none'),
    middle: Symbol('middle'),
    random: Symbol('random'),
});

class Grid {
    constructor(width, height, { seedMethod, diffusionA, diffusionB, feed, kill } = {}) {
        this.width = width;
        this.height = height;

        this.diffusionA = diffusionA;
        this.diffusionB = diffusionB;
        this.feed = feed;
        this.kill = kill;

        this.cells = matrix(width, height, () => ({ a: 1, b: 0 }));
        this.next = matrix(width, height, () => ({ a: 1, b: 0 }));

        this.seed(seedMethod);
    }

    seed(method) {
        if (method === SeedMethod.none) { return; }

        const radius = 6;
        const seeds = [];

        if (method === SeedMethod.middle) {
            this.seedSquare(Math.floor(this.width / 2), Math.floor(this.height / 2), radius);
        } else if (method === SeedMethod.random) {
            const seedNb = 4;
            for (let i = 0; i < seedNb; i++) {
                seeds.push({
                    x: radius + Math.floor(Math.random() * (this.width - 2 * radius)),
                    y: radius + Math.floor(Math.random() * (this.height - 2 * radius)),
                });
            }

            for (let seed of seeds) {
                this.seedCircle(seed.x, seed.y, radius);
            }
        }

    }

    seedCircle(x, y, radius) {
        for (let i = x - radius; i <= x + radius; i++) {
            for (let j = y - radius; j <= y + radius; j++) {
                const distance = Math.sqrt(Math.pow(i - x, 2) + Math.pow(j - y, 2));
                if (distance - 0.5 <= radius && (i >= 0 && i < this.width && j >= 0 && j < this.height)) {
                    this.cells[i][j].b = 1;
                }
            }
        }
    }

    seedSquare(x, y, radius) {
        for (let i = x - radius; i <= x + radius; i++) {
            for (let j = y - radius; j <= y + radius; j++) {
                this.cells[i][j].b = 1;
            }
        }
    }

    step() {
        for (let i = 1; i < this.width - 1; i++) {
            for (let j = 1; j < this.height - 1; j++) {
                const reaction = this.cells[i][j].a * this.cells[i][j].b * this.cells[i][j].b;

                const laplacianA = Grid.laplacian(this.cells, i, j, 'a');
                this.next[i][j].a = this.cells[i][j].a + (
                    this.diffusionA
                    * laplacianA
                    - reaction
                    + this.feed * (1 - this.cells[i][j].a)
                );

                const laplacianB = Grid.laplacian(this.cells, i, j, 'b');
                this.next[i][j].b = this.cells[i][j].b + (
                    this.diffusionB
                    * laplacianB
                    + reaction
                    - (this.kill + this.feed) * this.cells[i][j].b
                );
            }
        }

        for (let i = 0; i < this.width; i++) {
            for (let j = 0; j < this.height; j++) {
                this.cells[i][j].a = this.next[i][j].a;
                this.cells[i][j].b = this.next[i][j].b;
            }
        }
    }

    static laplacian(grid, x, y, prop) {
        let sum = 0;
        sum += -1 * grid[x][y][prop];
        sum += 0.2 * grid[x - 1][y][prop];
        sum += 0.2 * grid[x + 1][y][prop];
        sum += 0.2 * grid[x][y - 1][prop];
        sum += 0.2 * grid[x][y + 1][prop];
        sum += 0.05 * grid[x - 1][y - 1][prop];
        sum += 0.05 * grid[x - 1][y + 1][prop];
        sum += 0.05 * grid[x + 1][y - 1][prop];
        sum += 0.05 * grid[x + 1][y + 1][prop];
        return sum;
    }

    /**
     * @param {CanvasRenderingContext2D} ctx
     */
    renderGrid(ctx) {
        const imageData = ctx.createImageData(this.width, this.height);

        for (let i = 0; i < this.width; i++) {
            for (let j = 0; j < this.height; j++) {
                const index = (i + j * this.width) * 4;

                let color = Math.floor((this.cells[i][j].a - this.cells[i][j].b) * 255);
                if (color < 0) { color = 0; }
                if (color > 255) { color = 255; }
                if (window.appconfig.inverseColor === true) { color = 255 - color; }

                imageData.data[index + 0] = color;
                imageData.data[index + 1] = color;
                imageData.data[index + 2] = color;
                imageData.data[index + 3] = 255;
            }
        }

        // See: https://stackoverflow.com/questions/3448347/how-to-scale-an-imagedata-in-html-canvas
        const tempCanvas = document.createElement('canvas');
        tempCanvas.setAttribute('width', this.width);
        tempCanvas.setAttribute('height', this.height);
        tempCanvas.getContext('2d').putImageData(imageData, 0, 0);
        ctx.drawImage(tempCanvas, 0, 0);
    }
}

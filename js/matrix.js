
function matrix(width, height, init) {
    const grid = [];

    for (let i = 0; i < width; i++) {
        grid[i] = [];
        for (let j = 0; j < height; j++) {
            grid[i][j] = typeof init === 'function' ? init(i, j, width, height) :
                arguments.length === 3 ? init :
                    undefined;
        }
    }

    return grid;
}

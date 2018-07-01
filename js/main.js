
window.addEventListener('load', function () {
    const width = 200, height = 200;
    const computationsPerSecond = 30;
    const grid = new Grid(width, height, computationsPerSecond);

    /** @type {HTMLCanvasElement} */
    const canvasElement = document.querySelector('#canvas');
    const context = canvasElement.getContext('2d');

    canvasElement.setAttribute('width', width * 4);
    canvasElement.setAttribute('height', height * 4);
    context.scale(4, 4);

    setInterval(() => {
        grid.step();
    }, 1000 / computationsPerSecond);

    render();
    function render() {
        requestAnimationFrame(render);
        grid.renderGrid(context);
    }
});

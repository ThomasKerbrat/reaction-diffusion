
window.addEventListener('load', function () {
    const canvasElement = document.querySelector('#canvas');
    const context = canvasElement.getContext('2d');

    const size = 800;
    const game = new Game(size,  context);

    canvasElement.setAttribute('width', size);
    canvasElement.setAttribute('height', size);
});

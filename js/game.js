
class Game {
    constructor(size, context) {
        // physical dimensions
        this.width = size;
        this.height = size;

        // log means logical
        this.logWidth = 0;
        this.logHeight = 0;
        this.scale = 0;

        this.context = context;

        this.grid = null;
        this.computationsPerSecond = 100;
        this.maxFramePerSecond = 20;
        this._lastFrameTime = null;

        this._intervalNumber = null;
        this._animationFrameNumber = null;

        this._isPlaying = false;
        this._isMoving = false;

        this.domElements = {
            controlsGroup: document.querySelector('#controls-form-group'),
            startButton: document.querySelector('#control-start'),
            pauseButton: document.querySelector('#control-pause'),
            stepButton: document.querySelector('#control-step'),
            clearButton: document.querySelector('#control-clear'),

            parametersGroup: document.querySelector('#parameters-form-group'),
            rateAInput: document.querySelector('#param-rate-a'),
            rateBInput: document.querySelector('#param-rate-b'),
            feedRateInput: document.querySelector('#param-feed-rate'),
            killRateInput: document.querySelector('#param-kill-rate'),
            resolutionInput: document.querySelector('#param-resolution'),
            seedRandom: document.querySelector('#param-seed-random'),
            seedDraw: document.querySelector('#param-seed-draw'),
            resetButton: document.querySelector('#param-reset-control'),
            generateButton: document.querySelector('#param-generate-control'),
        };

        this.domElements.startButton.addEventListener('click', this.start.bind(this));
        this.domElements.pauseButton.addEventListener('click', this.pause.bind(this));
        this.domElements.stepButton.addEventListener('click', this.step.bind(this));
        this.domElements.clearButton.addEventListener('click', this.clear.bind(this));

        this.domElements.resetButton.addEventListener('click', this.reset.bind(this));
        this.domElements.generateButton.addEventListener('click', this.generate.bind(this));

        this.reset();
        this.domElements.controlsGroup.setAttribute('disabled', true);

        this.context.canvas.addEventListener('mousedown', this.mousedown.bind(this));
        this.context.canvas.addEventListener('mousemove', this.mousemove.bind(this));
        this.context.canvas.addEventListener('mouseup', this.mouseup.bind(this));
    }



    // #region Controls
    start() {
        this._isPlaying = true;
        this._intervalNumber = setInterval(() => {
            this.grid.step();
        }, Math.floor(1000 / this.computationsPerSecond));

        const render = () => {
            this._animationFrameNumber = requestAnimationFrame(render);

            if ((Date.now() - this._lastFrameTime) > (1000 / this.maxFramePerSecond)) {
                this._lastFrameTime = Date.now();
                this.grid.renderGrid(this.context);
            }
        };

        this._animationFrameNumber = requestAnimationFrame(render);

        this.domElements.startButton.setAttribute('disabled', true);
        this.domElements.pauseButton.removeAttribute('disabled');
        this.domElements.stepButton.setAttribute('disabled', true);
        // this.domElements.clearButton.removeAttribute('disabled');
    }

    pause() {
        this._isPlaying = false;
        clearInterval(this._intervalNumber);
        cancelAnimationFrame(this._animationFrameNumber);

        this.domElements.startButton.removeAttribute('disabled');
        this.domElements.pauseButton.setAttribute('disabled', true);
        this.domElements.stepButton.removeAttribute('disabled');
    }

    step() {
        this.grid.step();

        this._lastFrameTime = Date.now();
        requestAnimationFrame(() => this.grid.renderGrid(this.context));
    }

    clear() {
        this._isPlaying = false;
        this.pause();
        this.grid = null;

        this.context.clearRect(0, 0, this.width, this.height);
        this.context.scale(1 / this.scale, 1 / this.scale);

        this.domElements.startButton.removeAttribute('disabled');
        this.domElements.pauseButton.removeAttribute('disabled');
        this.domElements.stepButton.removeAttribute('disabled');
        this.domElements.controlsGroup.setAttribute('disabled', true);
        this.domElements.parametersGroup.removeAttribute('disabled');
    }
    // #endregion



    // #region Parameters
    generate() {
        this.logWidth = this.logHeight = Number(this.domElements.resolutionInput.value);
        this.scale = this.width / this.logWidth;
        console.log(this.scale);

        const options = {
            doSeed: this.domElements.seedRandom.checked,
            diffusionA: Number(this.domElements.rateAInput.value),
            diffusionB: Number(this.domElements.rateBInput.value),
            feed: Number(this.domElements.feedRateInput.value),
            kill: Number(this.domElements.killRateInput.value),
        };

        this.grid = new Grid(this.logWidth, this.logHeight, options);
        this.context.scale(this.scale, this.scale);
        this.step();

        this.domElements.controlsGroup.removeAttribute('disabled');
        this.domElements.pauseButton.setAttribute('disabled', true);
        this.domElements.parametersGroup.setAttribute('disabled', true);
    }

    reset() {
        this.domElements.rateAInput.value = this.domElements.rateAInput.dataset.default;
        this.domElements.rateBInput.value = this.domElements.rateBInput.dataset.default;
        this.domElements.feedRateInput.value = this.domElements.feedRateInput.dataset.default;
        this.domElements.killRateInput.value = this.domElements.killRateInput.dataset.default;
        this.domElements.resolutionInput.value = this.domElements.resolutionInput.dataset.default;
    }
    // #endregion



    // #region Draw
    mousedown(event) {
        if (this.domElements.seedDraw.checked && !this._isPlaying) {
            this._isMoving = true;
            this.grid.seedCircle(Math.floor(event.offsetX / this.scale), Math.floor(event.offsetY / this.scale), 5);
            this.grid.renderGrid(this.context);
        }
    }

    mousemove(event) {
        if (this.domElements.seedDraw.checked && !this._isPlaying && this._isMoving) {
            this.grid.seedCircle(Math.floor(event.offsetX / this.scale), Math.floor(event.offsetY / this.scale), 5);
            this.grid.renderGrid(this.context);
        }
    }

    mouseup() {
        if (this.domElements.seedDraw.checked && !this._isPlaying) {
            this._isMoving = false;
        }
    }
    // #endregion
}

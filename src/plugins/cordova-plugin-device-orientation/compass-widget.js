// Copyright (c) Microsoft Corporation. All rights reserved.

/**
 * @param {object=} options
 * @constructor
 */
function CompassWidget(options) {
    options = options || {};

    this._container = options.container || document.body;

    this._canvasElement = document.createElement('canvas');
    this._indicatorCanvasElement = document.createElement('canvas');

    this._container.appendChild(this._indicatorCanvasElement);
    this._container.appendChild(this._canvasElement);

    this._context = this._canvasElement.getContext('2d');
    this._diameter = (typeof options.diameter === 'number') ? options.diameter : CompassWidget.Defaults.DIAMETER;

    this._wrapperSize = 25;
    this._compassBorderSize = 15;

    this._canvasElement.style.position = 'absolute';
    this._canvasElement.style.cursor = 'pointer';
    this._canvasElement.style.top = '12px';
    this._canvasElement.style.left = '12px';
    this._canvasElement.width = this._diameter;
    this._canvasElement.height = this._diameter;

    this._center = {
        x: this._diameter / 2,
        y: this._diameter / 2
    };

    this._pointer = {
        width: 30,
        height: this._diameter - this._compassBorderSize * 2,
        offset: this._compassBorderSize
    };

    this._onDragStartCallback = this._onDragStart.bind(this);
    this._onDraggingCallback = this._onDrag.bind(this);
    this._onDragEndCallback = this._onDragEnd.bind(this);

    this._canvasElement.addEventListener('mousedown', this._onDragStartCallback);

    this._canvasElement.addEventListener('click', function (event) {
        this._updateHeadingToPosition(event.x, event.y);
    }.bind(this));

    this._currentHeading = 0;
}

CompassWidget.Defaults = {
    DIAMETER: 160
};

CompassWidget.Direction = {
    N: 'N',
    NE: 'NE',
    E: 'E',
    SE: 'SE',
    S: 'S',
    SW: 'SW',
    W: 'W',
    NW: 'NW'
};

CompassWidget.getDirection = function (heading) {
    if (heading >= 337.5 || (heading >= 0 && heading <= 22.5)) {
        return CompassWidget.Direction.N;
    }

    if (heading >= 22.5 && heading <= 67.5) {
        return CompassWidget.Direction.NE;
    }

    if (heading >= 67.5 && heading <= 112.5) {
        return CompassWidget.Direction.E;
    }

    if (heading >= 112.5 && heading <= 157.5) {
        return CompassWidget.Direction.SE;
    }

    if (heading >= 157.5 && heading <= 202.5) {
        return CompassWidget.Direction.S;
    }

    if (heading >= 202.5 && heading <= 247.5) {
        return CompassWidget.Direction.SW;
    }

    if (heading >= 247.5 && heading <= 292.5) {
        return CompassWidget.Direction.W;
    }

    if (heading >= 292.5 && heading <= 337.5) {
        return CompassWidget.Direction.NW;
    }
};

CompassWidget.prototype.initialize = function () {
    var indicatorContext = this._indicatorCanvasElement.getContext('2d'),
        diameter = this._diameter + this._wrapperSize,
        x = this._center.x + this._wrapperSize / 2,
        y = this._center.y + this._wrapperSize / 2;

    this._indicatorCanvasElement.style.position = 'absolute';
    this._indicatorCanvasElement.width = this._diameter + this._wrapperSize;
    this._indicatorCanvasElement.height = this._diameter + this._wrapperSize;

    indicatorContext.beginPath();
    indicatorContext.arc(x, y, diameter / 2, 0, Math.PI * 2, false);
    indicatorContext.fillStyle = '#CCCCCC';
    indicatorContext.fill();

    indicatorContext.beginPath();
    indicatorContext.moveTo(x, 0);
    indicatorContext.lineTo(x, 5);
    indicatorContext.fillStyle = '#FF532B';
    indicatorContext.stroke();

    this._drawCompass();
};

CompassWidget.prototype._drawCompass = function () {
    this._context.beginPath();
    this._context.arc(this._center.x, this._center.y, this._diameter / 2, 0, Math.PI * 2, false);
    this._context.fillStyle = '#58B8EB';
    this._context.fill();

    this._context.beginPath();
    this._context.arc(this._center.x, this._center.y, (this._diameter / 2) - this._compassBorderSize, 0, Math.PI * 2, false);
    this._context.fillStyle = '#AFEEF9';
    this._context.fill();

    // pointer
    this._context.beginPath();
    this._context.moveTo(this._center.x, this._center.y);
    this._context.lineTo(this._center.x - this._pointer.width / 2, this._center.y);
    this._context.lineTo(this._center.x, this._pointer.offset);
    this._context.lineTo(this._center.x, this._center.y);
    this._context.fillStyle = '#FF532B';
    this._context.fill();

    this._context.beginPath();
    this._context.moveTo(this._center.x, this._center.y);
    this._context.lineTo(this._center.x + this._pointer.width / 2, this._center.y);
    this._context.lineTo(this._center.x, this._pointer.offset);
    this._context.lineTo(this._center.x, this._center.y);
    this._context.fillStyle = '#DC052C';
    this._context.fill();

    this._context.beginPath();
    this._context.moveTo(this._center.x, this._center.y);
    this._context.lineTo(this._center.x - this._pointer.width / 2, this._center.y);
    this._context.lineTo(this._center.x, this._center.y + this._pointer.height / 2);
    this._context.lineTo(this._center.x, this._center.y);
    this._context.fillStyle = '#DAE1EF';
    this._context.fill();

    this._context.beginPath();
    this._context.moveTo(this._center.x, this._center.y);
    this._context.lineTo(this._center.x + this._pointer.width / 2, this._center.y);
    this._context.lineTo(this._center.x, this._center.y + this._pointer.height / 2);
    this._context.lineTo(this._center.x, this._center.y);
    this._context.fillStyle = '#91AEDC';
    this._context.fill();

    // directions
    this._context.fillStyle = '#000000';
    this._context.font = '14px Arial';
    this._context.fillText(CompassWidget.Direction.N, this._center.x - 5, this._compassBorderSize - 3);
    this._context.fillText(CompassWidget.Direction.E, this._center.x + this._diameter / 2 - this._compassBorderSize + 3, this._center.y);
    this._context.fillText(CompassWidget.Direction.S, this._center.x - 5, this._center.y + this._diameter / 2 - 3);
    this._context.fillText(CompassWidget.Direction.W, this._center.x - this._diameter / 2 + 1, this._center.y);
};

/**
 * @param {number} x
 * @param {number} y
 * @private
 */
CompassWidget.prototype._updateHeadingToPosition = function (x, y) {
    var rect = this._indicatorCanvasElement.getBoundingClientRect(),
        radius = this._diameter / 2,
        top = rect.top + radius + this._compassBorderSize,
        left = rect.left + radius + this._compassBorderSize,
        rotationAngle = parseInt(Math.atan2(x - left, -(y - top)) * (180 / Math.PI));

    if (rotationAngle < 0) {
        rotationAngle = parseInt(360 + rotationAngle);
    }

    this._currentHeading = (rotationAngle !== 0) ? 360 - rotationAngle : rotationAngle;

    this._updateRotation(rotationAngle);
    this._notifyHeadingUpdated();
};

/**
 * @param {number} value
 */
CompassWidget.prototype.updateHeading = function (heading, notify) {
    var rotationAngle = (heading !== 0) ? 360 - heading : heading;
    this._currentHeading = heading;
    this._updateRotation(rotationAngle);

    this._notifyHeadingUpdated();
};

CompassWidget.prototype._updateRotation = function (rotationAngle) {
    var rotate = 'rotate(' + rotationAngle + 'deg)';
    this._canvasElement.style.transform = rotate;
    this._canvasElement.style.webkitTransform = rotate;
    this._canvasElement.style.MozTransform = rotate;
    this._canvasElement.style.msTransform = rotate;
    this._canvasElement.style.oTransform = rotate;
};

CompassWidget.prototype.addHeadingUpdatedCallback = function (callback) {
    this._onHeadingUpdatedCallback = callback;
};

/**
 * @private
 */
CompassWidget.prototype._notifyHeadingUpdated = function () {
    if (typeof this._onHeadingUpdatedCallback === 'function') {
        var heading = {
            value: this._currentHeading,
            direction: CompassWidget.getDirection(this._currentHeading)
        };

        this._onHeadingUpdatedCallback(heading);
    }
};

/**
 * @private
 */
CompassWidget.prototype._onDragStart = function (event) {
    document.addEventListener('mousemove', this._onDraggingCallback);
    document.addEventListener('mouseup', this._onDragEndCallback);
};

/**
 * @private
 */
CompassWidget.prototype._onDrag = function (event) {
    this._updateHeadingToPosition(event.x, event.y);
};

/**
 * @private
 */
CompassWidget.prototype._onDragEnd = function (event) {
    document.removeEventListener('mousemove', this._onDraggingCallback);
    document.removeEventListener('mouseup', this._onDragEndCallback);
};

module.exports = CompassWidget;

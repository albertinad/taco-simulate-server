// Copyright (c) Microsoft Corporation. All rights reserved.

var DirectionText = {
    N: 'N',
    NE: 'NE',
    E: 'E',
    SE: 'SE',
    S: 'S',
    SW: 'SW',
    W: 'W',
    NW: 'NW'
};

function getDirection(heading) {
    if (heading >= 337.5 || (heading >= 0 && heading <= 22.5)) {
        return DirectionText.N;
    }

    if (heading >= 22.5 && heading <= 67.5) {
        return DirectionText.NE;
    }

    if (heading >= 67.5 && heading <= 112.5) {
        return DirectionText.E;
    }

    if (heading >= 112.5 && heading <= 157.5) {
        return DirectionText.SE;
    }

    if (heading >= 157.5 && heading <= 202.5) {
        return DirectionText.S;
    }

    if (heading >= 202.5 && heading <= 247.5) {
        return DirectionText.SW;
    }

    if (heading >= 247.5 && heading <= 292.5) {
        return DirectionText.W;
    }

    if (heading >= 292.5 && heading <= 337.5) {
        return DirectionText.NW;
    }
}

module.exports = getDirection;

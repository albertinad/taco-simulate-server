// Copyright (c) Microsoft Corporation. All rights reserved.

module.exports = function (message) {

    var CompassWidget = require('./compass-widget');

    function initialize() {
        var compassElement = document.getElementById('compass-widget'),
            labelHeading = document.getElementById('compass-heading-value');

        function updateHeadingText(value) {
            labelHeading.value = value;
        }

        var compassWidget = new CompassWidget({ container: compassElement });
        compassWidget.addHeadingUpdatedCallback(updateHeadingText);
        compassWidget.initialize();
    }

    return {
        initialize: initialize
    };
};

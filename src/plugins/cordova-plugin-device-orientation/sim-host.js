// Copyright (c) Microsoft Corporation. All rights reserved.

module.exports = function (message) {

    var CompassWidget = require('./compass-widget'),
        compass = require('./compass');

    compass.initialize();

    function initialize() {
        var compassElement = document.getElementById('compass-widget'),
            inputHeading = document.getElementById('compass-heading-value'),
            headingText = document.querySelector('[data-compass-heading="text"]');

        function headingUpdated(heading) {
            compass.updateHeading(heading.value);

            // update UI
            inputHeading.value = heading.value;
            headingText.textContent = heading.direction;
        }

        var compassWidget = new CompassWidget({ container: compassElement });
        compassWidget.addHeadingUpdatedCallback(headingUpdated);
        compassWidget.initialize();
        compassWidget.updateHeading(compass.heading);

        inputHeading.addEventListener('input', function () {
            compassWidget.updateHeading(this.value);
        });
    }

    return {
        initialize: initialize
    };
};

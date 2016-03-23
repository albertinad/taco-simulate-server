// Copyright (c) Microsoft Corporation. All rights reserved.

var fs = require('fs'),
    cordovaServe = require('cordova-serve'),
    path = require('path'),
    config = require('./server/config'),
    log = require('./server/log'),
    simServer = require('./server/server'),
    simSocket = require('./server/socket');

/**
 * @param {object} opts
 * @param {object} simHostOpts
 * @constructor
 */
function SimulateServer(opts, simHostOpts) {
    this._appUrl = null;
    this._simHostUrl = null;
    this._state = SimulateServer.States.IDLE;
    this._dirs = require('./server/dirs');
    this._server = cordovaServe();

    this._opts = opts || {};

    this._platform = this._opts.platform || 'browser';
    this._target = this._opts.target || 'chrome';

    config.platform = this._platform;
    config.simHostOptions = simHostOpts || {};
    config.telemetry = opts.telemetry;

    this._config = null; // TODO complete
}

/**
 * @enum
 */
SimulateServer.States = {
    IDLE: 0,
    RUNNING: 1
};

Object.defineProperties(SimulateServer.prototype, {
    'appUrl': {
        get: function () {
            return this._appUrl;
        }
    },
    'simHostUrl': {
        get: function () {
            return this._simHostUrl;
        }
    },
    'config': {
        get: function () {
            return this._config;
        }
    },
    'app': { //module.exports.app = server.app;
        get: function () {
            return this._server.app;
        }
    },
    'server': {
        get: function () {
            return config.server;
        }
    },
    'dirs': {
        get: function () {
            return this._dirs;
        }
    },
    'log': { //module.exports.log = log;
        get: function () {
            return log; // TODO review this
        }
    }
});

SimulateServer.prototype.start = function () {
    simServer.attach(this.app);

    return this._server.servePlatform(this._platform, {
        port: this._opts.port,
        root: this._opts.dir,
        noServerInfo: true
    }).then(function () {
        this._onServerReady(this._server);

        simSocket.init(this._server.server);

        return { appUrl: this.appUrl, simHostUrl: this.simHostUrl };
    }.bind(this)).catch(function (error) {
        // Ensure server is closed, then rethrow so it can be handled by downstream consumers.
        this.stop();
        if (error instanceof Error) {
            throw error;
        } else {
            throw new Error(error);
        }
    }.bind(this));
};

SimulateServer.prototype.stop = function () {
    this._state = SimulateServer.States.IDLE;

    // TODO implement config.server && config.server.close();
};

/**
 * Check if the server is active.
 * @return {boolean} True if the simulate server is running, otherwise false.
 */
SimulateServer.prototype.isActive = function () {
    return (this._state !== SimulateServer.States.IDLE);
};

/**
 * @param {object} server
 * @private
 */
SimulateServer.prototype._onServerReady = function (server) {
    this._state = SimulateServer.States.RUNNING;

    var projectRoot = server.projectRoot;

    config.server = server.server;
    config.projectRoot = projectRoot;
    config.platformRoot = server.root;

    var urlRoot = 'http://localhost:' + server.port + '/';

    this._appUrl = urlRoot + parseStartPage(projectRoot);
    this._simHostUrl = urlRoot + 'simulator/index.html';

    log.log('Server started:\n- App running at: ' + this._appUrl +
            '\n- Sim host running at: ' + this._simHostUrl);
};

function parseStartPage(projectRoot) {
    // Start Page is defined as <content src="some_uri" /> in config.xml

    var configFile = path.join(projectRoot, 'config.xml');
    if (!fs.existsSync(configFile)) {
        throw new Error('Cannot find project config file: ' + configFile);
    }

    var startPageRegexp = /<content\s+src\s*=\s*"(.+)"\s*\/>/ig,
        configFileContent = fs.readFileSync(configFile);

    var match = startPageRegexp.exec(configFileContent);
    if (match) {
        return match[1];
    }

    return 'index.html'; // default uri
}

module.exports = SimulateServer;

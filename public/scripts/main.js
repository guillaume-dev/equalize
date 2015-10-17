(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _modulesEmitter = require('modules/emitter');

var _modulesScene = require('modules/scene');

var _modulesAudio = require('modules/audio');

var emitter = new _modulesEmitter.Emitter();

var audio = new _modulesAudio.Audio(emitter);

var scene = new _modulesScene.Scene(emitter, audio);

scene.init();

},{"modules/audio":2,"modules/emitter":3,"modules/scene":4}],2:[function(require,module,exports){
// Want to customize things ?
// http://www.airtightinteractive.com/demos/js/uberviz/audioanalysis/

"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Audio = (function () {
    function Audio(emitter) {
        _classCallCheck(this, Audio);

        this.emitter = emitter;
        this.context = new AudioContext();

        this.bufferSize = 1024;

        this.analyser = this.context.createAnalyser();
        this.analyser.fftSize = this.bufferSize;
        this.binCount = this.analyser.frequencyBinCount; // this.bufferSize / 2
        console.log(this.binCount);

        this.dataFreqArray = new Uint8Array(this.binCount);
        this.dataTimeArray = new Uint8Array(this.binCount);

        this.binds = {};
        this.binds.onLoad = this.onLoad.bind(this);
    }

    _createClass(Audio, [{
        key: "load",
        value: function load(url) {

            this.request = new XMLHttpRequest();
            this.request.open("GET", url, true);
            this.request.responseType = "arraybuffer";

            this.request.onload = this.binds.onLoad;
            this.request.send();
        }
    }, {
        key: "onLoad",
        value: function onLoad() {
            var _this = this;

            this.context.decodeAudioData(this.request.response, function (buffer) {

                _this.source = _this.context.createBufferSource();
                _this.source.connect(_this.analyser);
                _this.source.buffer = buffer;
                _this.source.connect(_this.context.destination);
                _this.source.start(0);

                _this.emitter.emit("start");
            }, function () {
                console.log("error");
            });
        }
    }, {
        key: "getData",
        value: function getData() {
            this.analyser.getByteFrequencyData(this.dataFreqArray);
            this.analyser.getByteTimeDomainData(this.dataTimeArray);
            return {
                freq: this.dataFreqArray, // from 0 - 256, no sound = 0
                time: this.dataTimeArray // from 0 -256, no sound = 128
            };
        }
    }]);

    return Audio;
})();

exports.Audio = Audio;

},{}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var EventEmitter = require('events');

var Emitter = (function (_EventEmitter) {
	_inherits(Emitter, _EventEmitter);

	function Emitter() {
		_classCallCheck(this, Emitter);

		_get(Object.getPrototypeOf(Emitter.prototype), 'constructor', this).call(this);
	}

	return Emitter;
})(EventEmitter);

exports.Emitter = Emitter;

},{"events":6}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _test = require('./test');

var Controls = require('orbit-controls');

var Scene = (function () {
    function Scene(emitter, sound) {
        var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

        _classCallCheck(this, Scene);

        this.emitter = emitter;
        this.sound = sound;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.composer = null;
        this.container = options.container || document.body;
        this.controls = null;

        this.params = {
            active: options.active || true,
            height: options.height || window.innerHeight,
            width: options.width || window.innerWidth
        };

        this.mouse = {
            x: null,
            y: null
        };

        this.clock = null;
    }

    _createClass(Scene, [{
        key: 'init',
        value: function init() {

            this.scene = new THREE.Scene();
            this.camera = new THREE.PerspectiveCamera(45, this.params.width / this.params.height, 1, 1000);

            this.target = new THREE.Vector3();

            this.camera.lookAt(this.target);

            this.raycaster = new THREE.Raycaster();

            this.test();

            // this.loadSound();

            this.renderer = new THREE.WebGLRenderer({
                antialias: true
            });

            this.renderer.setClearColor(0x222222, 1);
            this.renderer.setSize(this.params.width, this.params.height);

            this.container.appendChild(this.renderer.domElement);

            this.controls = new Controls({
                distance: 5
            });

            this.clock = Date.now();

            this.addListeners();

            this.animate();
        }
    }, {
        key: 'loadSound',
        value: function loadSound() {
            var _this = this;

            this.sound.load("music/jedimind.mp3");
            this.emitter.on("start", function () {
                _this.animate();
            });
        }
    }, {
        key: 'test',
        value: function test() {

            this.test = new _test.Test(this.scene, this.emitter);
        }
    }, {
        key: 'animate',
        value: function animate(ts) {

            if (this.params.active) {

                window.requestAnimationFrame(this.animate.bind(this));

                this.test.update(this.sound.getData());

                this.render(ts);
            }
        }
    }, {
        key: 'render',
        value: function render() {

            if (!this.params.active) this.params.active = true;

            var position = this.camera.position.toArray();
            var direction = this.target.toArray();
            this.controls.update(position, direction);
            this.camera.position.fromArray(position);
            this.camera.lookAt(this.target.fromArray(direction));

            this.renderer.render(this.scene, this.camera);
        }
    }, {
        key: 'addListeners',
        value: function addListeners() {

            window.addEventListener('resize', this.onWindowResize.bind(this), false);
        }
    }, {
        key: 'onWindowResize',
        value: function onWindowResize() {

            this.params.width = window.innerWidth;
            this.params.height = window.innerHeight;

            this.camera.aspect = this.params.width / this.params.height;
            this.camera.updateProjectionMatrix();

            this.renderer.setSize(this.params.width, this.params.height);
        }
    }]);

    return Scene;
})();

exports.Scene = Scene;

},{"./test":5,"orbit-controls":7}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
      value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }



var Test = (function () {
      function Test(scene, emitter) {
            var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

            _classCallCheck(this, Test);

            this.scene = scene;

            this.emitter = emitter;

            this.particlesCount = 10000;

            this.radius = 1;
            this.widthSegments = 32;
            this.heightSegments = 32;

            this.vertexShader = "#define GLSLIFY 1\n//\n// GLSL textureless classic 4D noise \"cnoise\",\n// with an RSL-style periodic variant \"pnoise\".\n// Author:  Stefan Gustavson (stefan.gustavson@liu.se)\n// Version: 2011-08-22\n//\n// Many thanks to Ian McEwan of Ashima Arts for the\n// ideas for permutation and gradient selection.\n//\n// Copyright (c) 2011 Stefan Gustavson. All rights reserved.\n// Distributed under the MIT license. See LICENSE file.\n// https://github.com/ashima/webgl-noise\n//\n\nvec4 mod289_1_0(vec4 x)\n{\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec4 permute_1_1(vec4 x)\n{\n  return mod289_1_0(((x*34.0)+1.0)*x);\n}\n\nvec4 taylorInvSqrt_1_2(vec4 r)\n{\n  return 1.79284291400159 - 0.85373472095314 * r;\n}\n\nvec4 fade_1_3(vec4 t) {\n  return t*t*t*(t*(t*6.0-15.0)+10.0);\n}\n\n// Classic Perlin noise\nfloat cnoise_1_4(vec4 P)\n{\n  vec4 Pi0 = floor(P); // Integer part for indexing\n  vec4 Pi1 = Pi0 + 1.0; // Integer part + 1\n  Pi0 = mod289_1_0(Pi0);\n  Pi1 = mod289_1_0(Pi1);\n  vec4 Pf0 = fract(P); // Fractional part for interpolation\n  vec4 Pf1 = Pf0 - 1.0; // Fractional part - 1.0\n  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);\n  vec4 iy = vec4(Pi0.yy, Pi1.yy);\n  vec4 iz0 = vec4(Pi0.zzzz);\n  vec4 iz1 = vec4(Pi1.zzzz);\n  vec4 iw0 = vec4(Pi0.wwww);\n  vec4 iw1 = vec4(Pi1.wwww);\n\n  vec4 ixy = permute_1_1(permute_1_1(ix) + iy);\n  vec4 ixy0 = permute_1_1(ixy + iz0);\n  vec4 ixy1 = permute_1_1(ixy + iz1);\n  vec4 ixy00 = permute_1_1(ixy0 + iw0);\n  vec4 ixy01 = permute_1_1(ixy0 + iw1);\n  vec4 ixy10 = permute_1_1(ixy1 + iw0);\n  vec4 ixy11 = permute_1_1(ixy1 + iw1);\n\n  vec4 gx00 = ixy00 * (1.0 / 7.0);\n  vec4 gy00 = floor(gx00) * (1.0 / 7.0);\n  vec4 gz00 = floor(gy00) * (1.0 / 6.0);\n  gx00 = fract(gx00) - 0.5;\n  gy00 = fract(gy00) - 0.5;\n  gz00 = fract(gz00) - 0.5;\n  vec4 gw00 = vec4(0.75) - abs(gx00) - abs(gy00) - abs(gz00);\n  vec4 sw00 = step(gw00, vec4(0.0));\n  gx00 -= sw00 * (step(0.0, gx00) - 0.5);\n  gy00 -= sw00 * (step(0.0, gy00) - 0.5);\n\n  vec4 gx01 = ixy01 * (1.0 / 7.0);\n  vec4 gy01 = floor(gx01) * (1.0 / 7.0);\n  vec4 gz01 = floor(gy01) * (1.0 / 6.0);\n  gx01 = fract(gx01) - 0.5;\n  gy01 = fract(gy01) - 0.5;\n  gz01 = fract(gz01) - 0.5;\n  vec4 gw01 = vec4(0.75) - abs(gx01) - abs(gy01) - abs(gz01);\n  vec4 sw01 = step(gw01, vec4(0.0));\n  gx01 -= sw01 * (step(0.0, gx01) - 0.5);\n  gy01 -= sw01 * (step(0.0, gy01) - 0.5);\n\n  vec4 gx10 = ixy10 * (1.0 / 7.0);\n  vec4 gy10 = floor(gx10) * (1.0 / 7.0);\n  vec4 gz10 = floor(gy10) * (1.0 / 6.0);\n  gx10 = fract(gx10) - 0.5;\n  gy10 = fract(gy10) - 0.5;\n  gz10 = fract(gz10) - 0.5;\n  vec4 gw10 = vec4(0.75) - abs(gx10) - abs(gy10) - abs(gz10);\n  vec4 sw10 = step(gw10, vec4(0.0));\n  gx10 -= sw10 * (step(0.0, gx10) - 0.5);\n  gy10 -= sw10 * (step(0.0, gy10) - 0.5);\n\n  vec4 gx11 = ixy11 * (1.0 / 7.0);\n  vec4 gy11 = floor(gx11) * (1.0 / 7.0);\n  vec4 gz11 = floor(gy11) * (1.0 / 6.0);\n  gx11 = fract(gx11) - 0.5;\n  gy11 = fract(gy11) - 0.5;\n  gz11 = fract(gz11) - 0.5;\n  vec4 gw11 = vec4(0.75) - abs(gx11) - abs(gy11) - abs(gz11);\n  vec4 sw11 = step(gw11, vec4(0.0));\n  gx11 -= sw11 * (step(0.0, gx11) - 0.5);\n  gy11 -= sw11 * (step(0.0, gy11) - 0.5);\n\n  vec4 g0000 = vec4(gx00.x,gy00.x,gz00.x,gw00.x);\n  vec4 g1000 = vec4(gx00.y,gy00.y,gz00.y,gw00.y);\n  vec4 g0100 = vec4(gx00.z,gy00.z,gz00.z,gw00.z);\n  vec4 g1100 = vec4(gx00.w,gy00.w,gz00.w,gw00.w);\n  vec4 g0010 = vec4(gx10.x,gy10.x,gz10.x,gw10.x);\n  vec4 g1010 = vec4(gx10.y,gy10.y,gz10.y,gw10.y);\n  vec4 g0110 = vec4(gx10.z,gy10.z,gz10.z,gw10.z);\n  vec4 g1110 = vec4(gx10.w,gy10.w,gz10.w,gw10.w);\n  vec4 g0001 = vec4(gx01.x,gy01.x,gz01.x,gw01.x);\n  vec4 g1001 = vec4(gx01.y,gy01.y,gz01.y,gw01.y);\n  vec4 g0101 = vec4(gx01.z,gy01.z,gz01.z,gw01.z);\n  vec4 g1101 = vec4(gx01.w,gy01.w,gz01.w,gw01.w);\n  vec4 g0011 = vec4(gx11.x,gy11.x,gz11.x,gw11.x);\n  vec4 g1011 = vec4(gx11.y,gy11.y,gz11.y,gw11.y);\n  vec4 g0111 = vec4(gx11.z,gy11.z,gz11.z,gw11.z);\n  vec4 g1111 = vec4(gx11.w,gy11.w,gz11.w,gw11.w);\n\n  vec4 norm00 = taylorInvSqrt_1_2(vec4(dot(g0000, g0000), dot(g0100, g0100), dot(g1000, g1000), dot(g1100, g1100)));\n  g0000 *= norm00.x;\n  g0100 *= norm00.y;\n  g1000 *= norm00.z;\n  g1100 *= norm00.w;\n\n  vec4 norm01 = taylorInvSqrt_1_2(vec4(dot(g0001, g0001), dot(g0101, g0101), dot(g1001, g1001), dot(g1101, g1101)));\n  g0001 *= norm01.x;\n  g0101 *= norm01.y;\n  g1001 *= norm01.z;\n  g1101 *= norm01.w;\n\n  vec4 norm10 = taylorInvSqrt_1_2(vec4(dot(g0010, g0010), dot(g0110, g0110), dot(g1010, g1010), dot(g1110, g1110)));\n  g0010 *= norm10.x;\n  g0110 *= norm10.y;\n  g1010 *= norm10.z;\n  g1110 *= norm10.w;\n\n  vec4 norm11 = taylorInvSqrt_1_2(vec4(dot(g0011, g0011), dot(g0111, g0111), dot(g1011, g1011), dot(g1111, g1111)));\n  g0011 *= norm11.x;\n  g0111 *= norm11.y;\n  g1011 *= norm11.z;\n  g1111 *= norm11.w;\n\n  float n0000 = dot(g0000, Pf0);\n  float n1000 = dot(g1000, vec4(Pf1.x, Pf0.yzw));\n  float n0100 = dot(g0100, vec4(Pf0.x, Pf1.y, Pf0.zw));\n  float n1100 = dot(g1100, vec4(Pf1.xy, Pf0.zw));\n  float n0010 = dot(g0010, vec4(Pf0.xy, Pf1.z, Pf0.w));\n  float n1010 = dot(g1010, vec4(Pf1.x, Pf0.y, Pf1.z, Pf0.w));\n  float n0110 = dot(g0110, vec4(Pf0.x, Pf1.yz, Pf0.w));\n  float n1110 = dot(g1110, vec4(Pf1.xyz, Pf0.w));\n  float n0001 = dot(g0001, vec4(Pf0.xyz, Pf1.w));\n  float n1001 = dot(g1001, vec4(Pf1.x, Pf0.yz, Pf1.w));\n  float n0101 = dot(g0101, vec4(Pf0.x, Pf1.y, Pf0.z, Pf1.w));\n  float n1101 = dot(g1101, vec4(Pf1.xy, Pf0.z, Pf1.w));\n  float n0011 = dot(g0011, vec4(Pf0.xy, Pf1.zw));\n  float n1011 = dot(g1011, vec4(Pf1.x, Pf0.y, Pf1.zw));\n  float n0111 = dot(g0111, vec4(Pf0.x, Pf1.yzw));\n  float n1111 = dot(g1111, Pf1);\n\n  vec4 fade_xyzw = fade_1_3(Pf0);\n  vec4 n_0w = mix(vec4(n0000, n1000, n0100, n1100), vec4(n0001, n1001, n0101, n1101), fade_xyzw.w);\n  vec4 n_1w = mix(vec4(n0010, n1010, n0110, n1110), vec4(n0011, n1011, n0111, n1111), fade_xyzw.w);\n  vec4 n_zw = mix(n_0w, n_1w, fade_xyzw.z);\n  vec2 n_yzw = mix(n_zw.xy, n_zw.zw, fade_xyzw.y);\n  float n_xyzw = mix(n_yzw.x, n_yzw.y, fade_xyzw.x);\n  return 2.2 * n_xyzw;\n}\n\n// Classic Perlin noise, periodic version\nfloat pnoise_1_5(vec4 P, vec4 rep)\n{\n  vec4 Pi0 = mod(floor(P), rep); // Integer part modulo rep\n  vec4 Pi1 = mod(Pi0 + 1.0, rep); // Integer part + 1 mod rep\n  Pi0 = mod289_1_0(Pi0);\n  Pi1 = mod289_1_0(Pi1);\n  vec4 Pf0 = fract(P); // Fractional part for interpolation\n  vec4 Pf1 = Pf0 - 1.0; // Fractional part - 1.0\n  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);\n  vec4 iy = vec4(Pi0.yy, Pi1.yy);\n  vec4 iz0 = vec4(Pi0.zzzz);\n  vec4 iz1 = vec4(Pi1.zzzz);\n  vec4 iw0 = vec4(Pi0.wwww);\n  vec4 iw1 = vec4(Pi1.wwww);\n\n  vec4 ixy = permute_1_1(permute_1_1(ix) + iy);\n  vec4 ixy0 = permute_1_1(ixy + iz0);\n  vec4 ixy1 = permute_1_1(ixy + iz1);\n  vec4 ixy00 = permute_1_1(ixy0 + iw0);\n  vec4 ixy01 = permute_1_1(ixy0 + iw1);\n  vec4 ixy10 = permute_1_1(ixy1 + iw0);\n  vec4 ixy11 = permute_1_1(ixy1 + iw1);\n\n  vec4 gx00 = ixy00 * (1.0 / 7.0);\n  vec4 gy00 = floor(gx00) * (1.0 / 7.0);\n  vec4 gz00 = floor(gy00) * (1.0 / 6.0);\n  gx00 = fract(gx00) - 0.5;\n  gy00 = fract(gy00) - 0.5;\n  gz00 = fract(gz00) - 0.5;\n  vec4 gw00 = vec4(0.75) - abs(gx00) - abs(gy00) - abs(gz00);\n  vec4 sw00 = step(gw00, vec4(0.0));\n  gx00 -= sw00 * (step(0.0, gx00) - 0.5);\n  gy00 -= sw00 * (step(0.0, gy00) - 0.5);\n\n  vec4 gx01 = ixy01 * (1.0 / 7.0);\n  vec4 gy01 = floor(gx01) * (1.0 / 7.0);\n  vec4 gz01 = floor(gy01) * (1.0 / 6.0);\n  gx01 = fract(gx01) - 0.5;\n  gy01 = fract(gy01) - 0.5;\n  gz01 = fract(gz01) - 0.5;\n  vec4 gw01 = vec4(0.75) - abs(gx01) - abs(gy01) - abs(gz01);\n  vec4 sw01 = step(gw01, vec4(0.0));\n  gx01 -= sw01 * (step(0.0, gx01) - 0.5);\n  gy01 -= sw01 * (step(0.0, gy01) - 0.5);\n\n  vec4 gx10 = ixy10 * (1.0 / 7.0);\n  vec4 gy10 = floor(gx10) * (1.0 / 7.0);\n  vec4 gz10 = floor(gy10) * (1.0 / 6.0);\n  gx10 = fract(gx10) - 0.5;\n  gy10 = fract(gy10) - 0.5;\n  gz10 = fract(gz10) - 0.5;\n  vec4 gw10 = vec4(0.75) - abs(gx10) - abs(gy10) - abs(gz10);\n  vec4 sw10 = step(gw10, vec4(0.0));\n  gx10 -= sw10 * (step(0.0, gx10) - 0.5);\n  gy10 -= sw10 * (step(0.0, gy10) - 0.5);\n\n  vec4 gx11 = ixy11 * (1.0 / 7.0);\n  vec4 gy11 = floor(gx11) * (1.0 / 7.0);\n  vec4 gz11 = floor(gy11) * (1.0 / 6.0);\n  gx11 = fract(gx11) - 0.5;\n  gy11 = fract(gy11) - 0.5;\n  gz11 = fract(gz11) - 0.5;\n  vec4 gw11 = vec4(0.75) - abs(gx11) - abs(gy11) - abs(gz11);\n  vec4 sw11 = step(gw11, vec4(0.0));\n  gx11 -= sw11 * (step(0.0, gx11) - 0.5);\n  gy11 -= sw11 * (step(0.0, gy11) - 0.5);\n\n  vec4 g0000 = vec4(gx00.x,gy00.x,gz00.x,gw00.x);\n  vec4 g1000 = vec4(gx00.y,gy00.y,gz00.y,gw00.y);\n  vec4 g0100 = vec4(gx00.z,gy00.z,gz00.z,gw00.z);\n  vec4 g1100 = vec4(gx00.w,gy00.w,gz00.w,gw00.w);\n  vec4 g0010 = vec4(gx10.x,gy10.x,gz10.x,gw10.x);\n  vec4 g1010 = vec4(gx10.y,gy10.y,gz10.y,gw10.y);\n  vec4 g0110 = vec4(gx10.z,gy10.z,gz10.z,gw10.z);\n  vec4 g1110 = vec4(gx10.w,gy10.w,gz10.w,gw10.w);\n  vec4 g0001 = vec4(gx01.x,gy01.x,gz01.x,gw01.x);\n  vec4 g1001 = vec4(gx01.y,gy01.y,gz01.y,gw01.y);\n  vec4 g0101 = vec4(gx01.z,gy01.z,gz01.z,gw01.z);\n  vec4 g1101 = vec4(gx01.w,gy01.w,gz01.w,gw01.w);\n  vec4 g0011 = vec4(gx11.x,gy11.x,gz11.x,gw11.x);\n  vec4 g1011 = vec4(gx11.y,gy11.y,gz11.y,gw11.y);\n  vec4 g0111 = vec4(gx11.z,gy11.z,gz11.z,gw11.z);\n  vec4 g1111 = vec4(gx11.w,gy11.w,gz11.w,gw11.w);\n\n  vec4 norm00 = taylorInvSqrt_1_2(vec4(dot(g0000, g0000), dot(g0100, g0100), dot(g1000, g1000), dot(g1100, g1100)));\n  g0000 *= norm00.x;\n  g0100 *= norm00.y;\n  g1000 *= norm00.z;\n  g1100 *= norm00.w;\n\n  vec4 norm01 = taylorInvSqrt_1_2(vec4(dot(g0001, g0001), dot(g0101, g0101), dot(g1001, g1001), dot(g1101, g1101)));\n  g0001 *= norm01.x;\n  g0101 *= norm01.y;\n  g1001 *= norm01.z;\n  g1101 *= norm01.w;\n\n  vec4 norm10 = taylorInvSqrt_1_2(vec4(dot(g0010, g0010), dot(g0110, g0110), dot(g1010, g1010), dot(g1110, g1110)));\n  g0010 *= norm10.x;\n  g0110 *= norm10.y;\n  g1010 *= norm10.z;\n  g1110 *= norm10.w;\n\n  vec4 norm11 = taylorInvSqrt_1_2(vec4(dot(g0011, g0011), dot(g0111, g0111), dot(g1011, g1011), dot(g1111, g1111)));\n  g0011 *= norm11.x;\n  g0111 *= norm11.y;\n  g1011 *= norm11.z;\n  g1111 *= norm11.w;\n\n  float n0000 = dot(g0000, Pf0);\n  float n1000 = dot(g1000, vec4(Pf1.x, Pf0.yzw));\n  float n0100 = dot(g0100, vec4(Pf0.x, Pf1.y, Pf0.zw));\n  float n1100 = dot(g1100, vec4(Pf1.xy, Pf0.zw));\n  float n0010 = dot(g0010, vec4(Pf0.xy, Pf1.z, Pf0.w));\n  float n1010 = dot(g1010, vec4(Pf1.x, Pf0.y, Pf1.z, Pf0.w));\n  float n0110 = dot(g0110, vec4(Pf0.x, Pf1.yz, Pf0.w));\n  float n1110 = dot(g1110, vec4(Pf1.xyz, Pf0.w));\n  float n0001 = dot(g0001, vec4(Pf0.xyz, Pf1.w));\n  float n1001 = dot(g1001, vec4(Pf1.x, Pf0.yz, Pf1.w));\n  float n0101 = dot(g0101, vec4(Pf0.x, Pf1.y, Pf0.z, Pf1.w));\n  float n1101 = dot(g1101, vec4(Pf1.xy, Pf0.z, Pf1.w));\n  float n0011 = dot(g0011, vec4(Pf0.xy, Pf1.zw));\n  float n1011 = dot(g1011, vec4(Pf1.x, Pf0.y, Pf1.zw));\n  float n0111 = dot(g0111, vec4(Pf0.x, Pf1.yzw));\n  float n1111 = dot(g1111, Pf1);\n\n  vec4 fade_xyzw = fade_1_3(Pf0);\n  vec4 n_0w = mix(vec4(n0000, n1000, n0100, n1100), vec4(n0001, n1001, n0101, n1101), fade_xyzw.w);\n  vec4 n_1w = mix(vec4(n0010, n1010, n0110, n1110), vec4(n0011, n1011, n0111, n1111), fade_xyzw.w);\n  vec4 n_zw = mix(n_0w, n_1w, fade_xyzw.z);\n  vec2 n_yzw = mix(n_zw.xy, n_zw.zw, fade_xyzw.y);\n  float n_xyzw = mix(n_yzw.x, n_yzw.y, fade_xyzw.x);\n  return 2.2 * n_xyzw;\n}\n\nprecision mediump float;\n\nuniform float time;\n\nvarying vec2 vUv;\nvarying vec3 vertPos;\nvarying vec3 vNormal, vTangent, vBinormal;\nvarying vec3 vPosition;\n\nvoid main() {\n\n\tvUv = uv;\n\n\tvPosition = position;\n\n    // voronoi noise\n    vec3 v = vPosition;\n    vec3 edges = mix( vec3( 3.0), vec3(5.0), smoothstep( 0.0, 1.0, v.x ) );\n\n    float easing = 0.8;\n\n\t// tangent space vectors for normal mapping\n\tvNormal = normalize( normalMatrix * normal );\n\tvTangent = normalize( normalMatrix * position );\n\tvBinormal = normalize( cross( normal, vTangent ) );\n\n\tvPosition.y += (cnoise_1_4(vec4(vec3(vPosition), (time * easing)))); \n    vPosition.z += (cnoise_1_4(vec4(vec3(vPosition), time * easing)));\n\n\t// deform mesh by the distance from the edge\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4( edges * normal + vPosition, 1.0);\n\n\tfloat d = 3.3 * sin( time * 3.+ vPosition.y * 5.);\t\t\t\t\t\t\t\t\t\n  \t// gl_Position.x += vec4(normal * d, 1. ).x;\n\n\tvertPos = ( modelViewMatrix * vec4( normal + position, 1.0) ).xyz;\n\n\t// gl_Position  = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n\n}";

            this.fragmentShader = "#define GLSLIFY 1\nprecision mediump float;\n\nvarying vec3 vNormal;\nvarying vec3 vertPos;\nvarying vec3 vTangent;\nvarying vec3 vBinormal;\nvarying vec2 vUv;\nvarying vec3 vPosition;\nconst vec3 lightPos = vec3(150.0);\nconst vec3 diffuseColor = vec3( 226.0 / 255.0, 92.0  / 255.0, 254.0 / 255.0);\nconst vec3 specColor = vec3(0.2);\n\nuniform vec2 mouse;\n\nfloat hash( float n )\n{\n    return fract(sin(n)*43758.5453);\n}\n\nvec2 hash( vec2 p )\n{\n    p = vec2( dot(p,vec2(127.1,311.7)), dot(p,vec2(269.5,183.3)) );\n    return fract(sin(p)*43758.5453);\n}\n\n/** \n * bump mapping aware phong shading \n *\n * @param 'normal' { vec3 }     - fragment normal\n * @param 'light' { vec3 }      - light position\n * @param 'position' { vec3 }   - fragment position\n * @param 'diffuse' { vec3 }    - diffuse color\n * @param 'spec' { vec3 }       - specular color\n * @return { vec3 }             - phong color \n */\nvec3 phong( in vec3 tanNormal, in vec3 normal, in vec3 light, in vec3 position, in vec3 diffuse, in vec3 spec)\n{\n    vec3 lightDir = normalize(light - position);\n    vec3 reflectDir = reflect( -lightDir, tanNormal);\n    vec3 viewDir = normalize( - position );\n    float lambertian = max( dot( lightDir, normal ), 0.0 );\n    float specular;\n\n    if( lambertian > 0.0 ) {\n        float specAngle = max( dot( reflectDir, viewDir ), 0.01 );\n        specular = pow(specAngle, 4.0);\n    }\n    return lambertian * diffuse + specular * spec;\n}\n\nvoid main( void )\n{\n\n    // vec3 v = voronoi( 16.0 * vUv );\n    vec3 v = vPosition;\n    vec3 edges = mix( diffuseColor, 2.5 * diffuseColor, smoothstep( 0.0, 1.5, v.x ) );\n\n    // convert the normal maps (in tangent-space) to eye-space\n    vec3 tanNormal = normalize( (vTangent * v.x) + (vBinormal * v.y) + (vNormal * v.z) );\n\n    vec3 diff = phong( tanNormal, vNormal, vec3(mouse,100.0), vertPos, edges, specColor);\n    // gl_FragColor = vec4(cells,1.0) + edges * vec4(diff,1.0);\n    gl_FragColor = vec4(diff,1.0);\n\n\t// gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);\n\n}";

            this.material = new THREE.ShaderMaterial({
                  uniforms: {
                        time: { type: "f", value: 0 }
                  },
                  side: THREE.DoubleSide,
                  vertexShader: this.vertexShader,
                  fragmentShader: this.fragmentShader,
                  shading: THREE.SmoothShading,
                  transparent: true
            });

            var geometry = new THREE.SphereGeometry(this.radius, this.widthSegments, this.heightSegments);

            // this.geometry = new THREE.BufferGeometry().fromGeometry( geometry );

            this.geometry = geometry;

            this.mesh = new THREE.Mesh(this.geometry, this.material);

            // this.mesh.position.z = -10;

            this.clock = Date.now();

            this.scene.add(this.mesh);
      }

      _createClass(Test, [{
            key: 'update',
            value: function update(ts) {

                  this.material.uniforms["time"].value = (Date.now() - this.clock) * 0.0008;
            }
      }, {
            key: 'addGUI',
            value: function addGUI() {

                  this.GUI = new dat.GUI();

                  this.GUI.add(this.geometry.parameters, 'radius');

                  this.GUI.add(this.geometry.parameters, 'widthSegments');

                  this.GUI.add(this.geometry.parameters, 'heightSegments');
            }
      }, {
            key: 'getMesh',
            value: function getMesh() {

                  return this.mesh;
            }
      }]);

      return Test;
})();

exports.Test = Test;

},{}],6:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],7:[function(require,module,exports){
var defined = require('defined')
var clamp = require('clamp')

var inputEvents = require('./lib/input')
var quatFromVec3 = require('quat-from-unit-vec3')
var quatInvert = require('gl-quat/invert')

var glVec3 = {
  length: require('gl-vec3/length'),
  add: require('gl-vec3/add'),
  subtract: require('gl-vec3/subtract'),
  transformQuat: require('gl-vec3/transformQuat'),
  copy: require('gl-vec3/copy'),
  normalize: require('gl-vec3/normalize'),
  cross: require('gl-vec3/cross')
}

var Y_UP = [0, 1, 0]
var EPSILON = 1e-10

module.exports = createOrbitControls
function createOrbitControls (opt) {
  opt = opt || {}

  var inputDelta = [0, 0, 0] // x, y, zoom
  var offset = [0, 0, 0]

  var upQuat = [0, 0, 0, 1]
  var upQuatInverse = upQuat.slice()

  var controls = {
    update: update,

    target: opt.target || [0, 0, 0],
    phi: opt.phi || 0,
    theta: opt.theta || 0,
    distance: defined(opt.distance, 1),
    damping: defined(opt.damping, 0.25),
    rotateSpeed: defined(opt.rotateSpeed, 0.28),
    zoomSpeed: defined(opt.zoomSpeed, 0.0075),
    pinchSpeed: defined(opt.pinchSpeed, 0.0075),

    pinch: opt.pinching !== false,
    zoom: opt.zoom !== false,
    rotate: opt.rotate !== false,

    phiBounds: opt.phiBounds || [0, Math.PI],
    thetaBounds: opt.thetaBounds || [-Infinity, Infinity],
    distanceBounds: opt.distanceBounds || [1, Infinity]
  }

  inputEvents({
    parent: opt.parent || window,
    element: opt.element,
    rotate: opt.rotate !== false ? inputRotate : null,
    zoom: opt.zoom !== false ? inputZoom : null,
    pinch: opt.pinch !== false ? inputPinch : null
  })

  return controls

  function inputRotate (dx, dy) {
    var PI2 = Math.PI * 2
    inputDelta[0] -= PI2 * dx * controls.rotateSpeed
    inputDelta[1] -= PI2 * dy * controls.rotateSpeed
  }

  function inputZoom (delta) {
    inputDelta[2] += delta * controls.zoomSpeed
  }

  function inputPinch (delta) {
    inputDelta[2] -= delta * controls.pinchSpeed
  }

  function update (position, direction, up) {
    var cameraUp = up || Y_UP
    quatFromVec3(upQuat, cameraUp, Y_UP)
    quatInvert(upQuatInverse, upQuat)

    var distance = controls.distance

    glVec3.subtract(offset, position, controls.target)
    glVec3.transformQuat(offset, offset, upQuat)

    var theta = Math.atan2(offset[0], offset[2])
    var phi = Math.atan2(Math.sqrt(offset[0] * offset[0] + offset[2] * offset[2]), offset[1])

    theta += inputDelta[0]
    phi += inputDelta[1]

    theta = clamp(theta, controls.thetaBounds[0], controls.thetaBounds[1])
    phi = clamp(phi, controls.phiBounds[0], controls.phiBounds[1])
    phi = clamp(phi, EPSILON, Math.PI - EPSILON)

    distance += inputDelta[2]
    distance = clamp(distance, controls.distanceBounds[0], controls.distanceBounds[1])

    var radius = Math.abs(distance) <= EPSILON ? EPSILON : distance
    offset[0] = radius * Math.sin(phi) * Math.sin(theta)
    offset[1] = radius * Math.cos(phi)
    offset[2] = radius * Math.sin(phi) * Math.cos(theta)

    controls.phi = phi
    controls.theta = theta
    controls.distance = distance

    glVec3.transformQuat(offset, offset, upQuatInverse)
    glVec3.add(position, controls.target, offset)
    camLookAt(direction, cameraUp, position, controls.target)

    var damp = typeof controls.damping === 'number' ? controls.damping : 1
    for (var i = 0; i < inputDelta.length; i++) {
      inputDelta[i] *= 1 - damp
    }
  }
}

function camLookAt (direction, up, position, target) {
  glVec3.copy(direction, target)
  glVec3.subtract(direction, direction, position)
  glVec3.normalize(direction, direction)
}

},{"./lib/input":8,"clamp":9,"defined":10,"gl-quat/invert":11,"gl-vec3/add":14,"gl-vec3/copy":15,"gl-vec3/cross":16,"gl-vec3/length":18,"gl-vec3/normalize":19,"gl-vec3/subtract":21,"gl-vec3/transformQuat":22,"quat-from-unit-vec3":27}],8:[function(require,module,exports){
var mouseWheel = require('mouse-wheel')
var eventOffset = require('mouse-event-offset')
var createPinch = require('touch-pinch')

module.exports = inputEvents
function inputEvents (opt) {
  var element = opt.element || window
  var parent = opt.parent || element
  var mouseStart = [0, 0]
  var dragging = false
  var tmp = [0, 0]
  var tmp2 = [0, 0]
  var pinch
  
  var zoomFn = opt.zoom
  var rotateFn = opt.rotate
  var pinchFn = opt.pinch
  
  if (zoomFn) {
    mouseWheel(element, function (dx, dy) {
      zoomFn(dy)
    }, true)
  }
  
  if (rotateFn) {
    // for dragging to work outside canvas bounds,
    // mouse events have to be added to parent
    parent.addEventListener('mousedown', onInputDown)
    parent.addEventListener('mousemove', onInputMove)
    parent.addEventListener('mouseup', onInputUp)
  }
  
  if (rotateFn || pinchFn) {
    pinch = createPinch(element)
    
    // don't allow simulated mouse events
    element.addEventListener('touchstart', preventDefault)
    
    if (rotateFn) touchRotate()
    if (pinchFn) touchPinch()
  }

  function preventDefault (ev) {
    ev.preventDefault()
  }
  
  function touchRotate () {
    element.addEventListener('touchmove', function (ev) {
      if (!dragging || isPinching()) return
        
      // find currently active finger
      for (var i=0; i<ev.changedTouches.length; i++) {
        var changed = ev.changedTouches[i]
        var idx = pinch.indexOfTouch(changed)
        // if pinch is disabled but rotate enabled,
        // only allow first finger to affect rotation
        var allow = pinchFn ? idx !== -1 : idx === 0
        if (allow) {
          onInputMove(changed)
          break
        }
      }
    })
    
    pinch.on('place', function (newFinger, lastFinger) {
      dragging = !isPinching()
      if (dragging) {
        var firstFinger = lastFinger || newFinger
        onInputDown(firstFinger)
      }
    })
    
    pinch.on('lift', function (lifted, remaining) {
      dragging = !isPinching()
      if (dragging && remaining) {
        eventOffset(remaining, element, mouseStart)
      }
    })
  }
  
  function isPinching () {
    return pinch.pinching && pinchFn
  }
  
  function touchPinch () {
    pinch.on('change', function (current, prev) {
      pinchFn(current - prev)
    })
  }
  
  function onInputDown (ev) {
    eventOffset(ev, element, mouseStart)    
    if (insideBounds(mouseStart)) {
      dragging = true
    }
  }
  
  function onInputUp () {
    dragging = false
  }
  
  function onInputMove (ev) {
    var end = eventOffset(ev, element, tmp)
    if (pinch && isPinching()) {
      mouseStart = end
      return
    }
    if (!dragging) return
    var rect = getClientSize(tmp2)
    var dx = (end[0] - mouseStart[0]) / rect[0]
    var dy = (end[1] - mouseStart[1]) / rect[1]
    rotateFn(dx, dy)
    mouseStart[0] = end[0]
    mouseStart[1] = end[1]
  }
  
  function insideBounds (pos) {
    if (element === window || 
        element === document ||
        element === document.body) {
      return true
    } else {
      var rect = element.getBoundingClientRect()
      return pos[0] >= 0 && pos[1] >= 0 &&
        pos[0] < rect.width && pos[1] < rect.height
    }
  }
  
  function getClientSize (out) {
    var source = element
    if (source === window ||
        source === document ||
        source === document.body) {
      source = document.documentElement
    }
    out[0] = source.clientWidth
    out[1] = source.clientHeight
    return out
  }
}

},{"mouse-event-offset":23,"mouse-wheel":26,"touch-pinch":28}],9:[function(require,module,exports){
module.exports = clamp

function clamp(value, min, max) {
  return min < max
    ? (value < min ? min : value > max ? max : value)
    : (value < max ? max : value > min ? min : value)
}

},{}],10:[function(require,module,exports){
module.exports = function () {
    for (var i = 0; i < arguments.length; i++) {
        if (arguments[i] !== undefined) return arguments[i];
    }
};

},{}],11:[function(require,module,exports){
module.exports = invert

/**
 * Calculates the inverse of a quat
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a quat to calculate inverse of
 * @returns {quat} out
 */
function invert (out, a) {
  var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3],
    dot = a0 * a0 + a1 * a1 + a2 * a2 + a3 * a3,
    invDot = dot ? 1.0 / dot : 0

  // TODO: Would be faster to return [0,0,0,0] immediately if dot == 0

  out[0] = -a0 * invDot
  out[1] = -a1 * invDot
  out[2] = -a2 * invDot
  out[3] = a3 * invDot
  return out
}

},{}],12:[function(require,module,exports){
module.exports = normalize

/**
 * Normalize a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a vector to normalize
 * @returns {vec4} out
 */
function normalize (out, a) {
  var x = a[0],
    y = a[1],
    z = a[2],
    w = a[3]
  var len = x * x + y * y + z * z + w * w
  if (len > 0) {
    len = 1 / Math.sqrt(len)
    out[0] = x * len
    out[1] = y * len
    out[2] = z * len
    out[3] = w * len
  }
  return out
}

},{}],13:[function(require,module,exports){
/**
 * Normalize a quat
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a quaternion to normalize
 * @returns {quat} out
 * @function
 */
module.exports = require('gl-vec4/normalize')

},{"gl-vec4/normalize":12}],14:[function(require,module,exports){
module.exports = add;

/**
 * Adds two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
function add(out, a, b) {
    out[0] = a[0] + b[0]
    out[1] = a[1] + b[1]
    out[2] = a[2] + b[2]
    return out
}
},{}],15:[function(require,module,exports){
module.exports = copy;

/**
 * Copy the values from one vec3 to another
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the source vector
 * @returns {vec3} out
 */
function copy(out, a) {
    out[0] = a[0]
    out[1] = a[1]
    out[2] = a[2]
    return out
}
},{}],16:[function(require,module,exports){
module.exports = cross;

/**
 * Computes the cross product of two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
function cross(out, a, b) {
    var ax = a[0], ay = a[1], az = a[2],
        bx = b[0], by = b[1], bz = b[2]

    out[0] = ay * bz - az * by
    out[1] = az * bx - ax * bz
    out[2] = ax * by - ay * bx
    return out
}
},{}],17:[function(require,module,exports){
module.exports = dot;

/**
 * Calculates the dot product of two vec3's
 *
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {Number} dot product of a and b
 */
function dot(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
}
},{}],18:[function(require,module,exports){
module.exports = length;

/**
 * Calculates the length of a vec3
 *
 * @param {vec3} a vector to calculate length of
 * @returns {Number} length of a
 */
function length(a) {
    var x = a[0],
        y = a[1],
        z = a[2]
    return Math.sqrt(x*x + y*y + z*z)
}
},{}],19:[function(require,module,exports){
module.exports = normalize;

/**
 * Normalize a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a vector to normalize
 * @returns {vec3} out
 */
function normalize(out, a) {
    var x = a[0],
        y = a[1],
        z = a[2]
    var len = x*x + y*y + z*z
    if (len > 0) {
        //TODO: evaluate use of glm_invsqrt here?
        len = 1 / Math.sqrt(len)
        out[0] = a[0] * len
        out[1] = a[1] * len
        out[2] = a[2] * len
    }
    return out
}
},{}],20:[function(require,module,exports){
module.exports = set;

/**
 * Set the components of a vec3 to the given values
 *
 * @param {vec3} out the receiving vector
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @returns {vec3} out
 */
function set(out, x, y, z) {
    out[0] = x
    out[1] = y
    out[2] = z
    return out
}
},{}],21:[function(require,module,exports){
module.exports = subtract;

/**
 * Subtracts vector b from vector a
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
function subtract(out, a, b) {
    out[0] = a[0] - b[0]
    out[1] = a[1] - b[1]
    out[2] = a[2] - b[2]
    return out
}
},{}],22:[function(require,module,exports){
module.exports = transformQuat;

/**
 * Transforms the vec3 with a quat
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to transform
 * @param {quat} q quaternion to transform with
 * @returns {vec3} out
 */
function transformQuat(out, a, q) {
    // benchmarks: http://jsperf.com/quaternion-transform-vec3-implementations

    var x = a[0], y = a[1], z = a[2],
        qx = q[0], qy = q[1], qz = q[2], qw = q[3],

        // calculate quat * vec
        ix = qw * x + qy * z - qz * y,
        iy = qw * y + qz * x - qx * z,
        iz = qw * z + qx * y - qy * x,
        iw = -qx * x - qy * y - qz * z

    // calculate result * inverse quat
    out[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy
    out[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz
    out[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx
    return out
}
},{}],23:[function(require,module,exports){
var rootPosition = { left: 0, top: 0 }

module.exports = mouseEventOffset
function mouseEventOffset (ev, target, out) {
  target = target || ev.currentTarget || ev.srcElement
  if (!Array.isArray(out)) {
    out = [ 0, 0 ]
  }
  var cx = ev.clientX || 0
  var cy = ev.clientY || 0
  var rect = getBoundingClientOffset(target)
  out[0] = cx - rect.left
  out[1] = cy - rect.top
  return out
}

function getBoundingClientOffset (element) {
  if (element === window ||
      element === document ||
      element === document.body) {
    return rootPosition
  } else {
    return element.getBoundingClientRect()
  }
}

},{}],24:[function(require,module,exports){
module.exports = function parseUnit(str, out) {
    if (!out)
        out = [ 0, '' ]

    str = String(str)
    var num = parseFloat(str, 10)
    out[0] = num
    out[1] = str.match(/[\d.\-\+]*\s*(.*)/)[1] || ''
    return out
}
},{}],25:[function(require,module,exports){
'use strict'

var parseUnit = require('parse-unit')

module.exports = toPX

var PIXELS_PER_INCH = 96

function getPropertyInPX(element, prop) {
  var parts = parseUnit(getComputedStyle(element).getPropertyValue(prop))
  return parts[0] * toPX(parts[1], element)
}

//This brutal hack is needed
function getSizeBrutal(unit, element) {
  var testDIV = document.createElement('div')
  testDIV.style['font-size'] = '128' + unit
  element.appendChild(testDIV)
  var size = getPropertyInPX(testDIV, 'font-size') / 128
  element.removeChild(testDIV)
  return size
}

function toPX(str, element) {
  element = element || document.body
  str = (str || 'px').trim().toLowerCase()
  if(element === window || element === document) {
    element = document.body 
  }
  switch(str) {
    case '%':  //Ambiguous, not sure if we should use width or height
      return element.clientHeight / 100.0
    case 'ch':
    case 'ex':
      return getSizeBrutal(str, element)
    case 'em':
      return getPropertyInPX(element, 'font-size')
    case 'rem':
      return getPropertyInPX(document.body, 'font-size')
    case 'vw':
      return window.innerWidth/100
    case 'vh':
      return window.innerHeight/100
    case 'vmin':
      return Math.min(window.innerWidth, window.innerHeight) / 100
    case 'vmax':
      return Math.max(window.innerWidth, window.innerHeight) / 100
    case 'in':
      return PIXELS_PER_INCH
    case 'cm':
      return PIXELS_PER_INCH / 2.54
    case 'mm':
      return PIXELS_PER_INCH / 25.4
    case 'pt':
      return PIXELS_PER_INCH / 72
    case 'pc':
      return PIXELS_PER_INCH / 6
  }
  return 1
}
},{"parse-unit":24}],26:[function(require,module,exports){
'use strict'

var toPX = require('to-px')

module.exports = mouseWheelListen

function mouseWheelListen(element, callback, noScroll) {
  if(typeof element === 'function') {
    noScroll = !!callback
    callback = element
    element = window
  }
  var lineHeight = toPX('ex', element)
  element.addEventListener('wheel', function(ev) {
    if(noScroll) {
      ev.preventDefault()
    }
    var dx = ev.deltaX || 0
    var dy = ev.deltaY || 0
    var dz = ev.deltaZ || 0
    var mode = ev.deltaMode
    var scale = 1
    switch(mode) {
      case 1:
        scale = lineHeight
      break
      case 2:
        scale = window.innerHeight
      break
    }
    dx *= scale
    dy *= scale
    dz *= scale
    if(dx || dy || dz) {
      return callback(dx, dy, dz)
    }
  })
}
},{"to-px":25}],27:[function(require,module,exports){
// Original implementation:
// http://lolengine.net/blog/2014/02/24/quaternion-from-two-vectors-final

var dot = require('gl-vec3/dot')
var set = require('gl-vec3/set')
var normalize = require('gl-quat/normalize')
var cross = require('gl-vec3/cross')

var tmp = [0, 0, 0]
var EPS = 1e-6

module.exports = quatFromUnitVec3
function quatFromUnitVec3 (out, a, b) {
  // assumes a and b are normalized
  var r = dot(a, b) + 1
  if (r < EPS) {
    /* If u and v are exactly opposite, rotate 180 degrees
     * around an arbitrary orthogonal axis. Axis normalisation
     * can happen later, when we normalise the quaternion. */
    r = 0
    if (Math.abs(a[0]) > Math.abs(a[2])) {
      set(tmp, -a[1], a[0], 0)
    } else {
      set(tmp, 0, -a[2], a[1])
    }
  } else {
    /* Otherwise, build quaternion the standard way. */
    cross(tmp, a, b)
  }

  out[0] = tmp[0]
  out[1] = tmp[1]
  out[2] = tmp[2]
  out[3] = r
  normalize(out, out)
  return out
}

},{"gl-quat/normalize":13,"gl-vec3/cross":16,"gl-vec3/dot":17,"gl-vec3/set":20}],28:[function(require,module,exports){
var getDistance = require('gl-vec2/distance')
var EventEmitter = require('events').EventEmitter
var dprop = require('dprop')
var eventOffset = require('mouse-event-offset')

module.exports = touchPinch
function touchPinch (target) {
  target = target || window

  var emitter = new EventEmitter()
  var fingers = [ null, null ]
  var activeCount = 0

  var lastDistance = 0
  var ended = false
  var enabled = false

  // some read-only values
  Object.defineProperties(emitter, {
    pinching: dprop(function () {
      return activeCount === 2
    }),

    fingers: dprop(function () {
      return fingers
    })
  })

  enable()
  emitter.enable = enable
  emitter.disable = disable
  emitter.indexOfTouch = indexOfTouch
  return emitter

  function indexOfTouch (touch) {
    var id = touch.identifier
    for (var i = 0; i < fingers.length; i++) {
      if (fingers[i] &&
        fingers[i].touch &&
        fingers[i].touch.identifier === id) {
        return i
      }
    }
    return -1
  }

  function enable () {
    if (enabled) return
    enabled = true
    target.addEventListener('touchstart', onTouchStart, false)
    target.addEventListener('touchmove', onTouchMove, false)
    target.addEventListener('touchend', onTouchRemoved, false)
    target.addEventListener('touchcancel', onTouchRemoved, false)
  }

  function disable () {
    if (!enabled) return
    enabled = false
    target.removeEventListener('touchstart', onTouchStart, false)
    target.removeEventListener('touchmove', onTouchMove, false)
    target.removeEventListener('touchend', onTouchRemoved, false)
    target.removeEventListener('touchcancel', onTouchRemoved, false)
  }

  function onTouchStart (ev) {
    for (var i = 0; i < ev.changedTouches.length; i++) {
      var newTouch = ev.changedTouches[i]
      var id = newTouch.identifier
      var idx = indexOfTouch(id)

      if (idx === -1 && activeCount < 2) {
        var first = activeCount === 0

        // newest and previous finger (previous may be undefined)
        var newIndex = fingers[0] ? 1 : 0
        var oldIndex = fingers[0] ? 0 : 1
        var newFinger = new Finger()

        // add to stack
        fingers[newIndex] = newFinger
        activeCount++

        // update touch event & position
        newFinger.touch = newTouch
        eventOffset(newTouch, target, newFinger.position)

        var oldTouch = fingers[oldIndex] ? fingers[oldIndex].touch : undefined
        emitter.emit('place', newTouch, oldTouch)

        if (!first) {
          var initialDistance = computeDistance()
          ended = false
          emitter.emit('start', initialDistance)
          lastDistance = initialDistance
        }
      }
    }
  }

  function onTouchMove (ev) {
    var changed = false
    for (var i = 0; i < ev.changedTouches.length; i++) {
      var movedTouch = ev.changedTouches[i]
      var idx = indexOfTouch(movedTouch)
      if (idx !== -1) {
        changed = true
        fingers[idx].touch = movedTouch // avoid caching touches
        eventOffset(movedTouch, target, fingers[idx].position)
      }
    }

    if (activeCount === 2 && changed) {
      var currentDistance = computeDistance()
      emitter.emit('change', currentDistance, lastDistance)
      lastDistance = currentDistance
    }
  }

  function onTouchRemoved (ev) {
    for (var i = 0; i < ev.changedTouches.length; i++) {
      var removed = ev.changedTouches[i]
      var idx = indexOfTouch(removed)

      if (idx !== -1) {
        fingers[idx] = null
        activeCount--
        var otherIdx = idx === 0 ? 1 : 0
        var otherTouch = fingers[otherIdx] ? fingers[otherIdx].touch : undefined
        emitter.emit('lift', removed, otherTouch)
      }
    }

    if (!ended && activeCount !== 2) {
      ended = true
      emitter.emit('end')
    }
  }

  function computeDistance () {
    if (activeCount < 2) return 0
    return getDistance(fingers[0].position, fingers[1].position)
  }
}

function Finger () {
  this.position = [0, 0]
  this.touch = null
}

},{"dprop":29,"events":6,"gl-vec2/distance":30,"mouse-event-offset":23}],29:[function(require,module,exports){
module.exports = defaultProperty

function defaultProperty (get, set) {
  return {
    configurable: true,
    enumerable: true,
    get: get,
    set: set
  }
}

},{}],30:[function(require,module,exports){
module.exports = distance

/**
 * Calculates the euclidian distance between two vec2's
 *
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {Number} distance between a and b
 */
function distance(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1]
    return Math.sqrt(x*x + y*y)
}
},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS9ndWlsbGF1bWUvZGV2L3Byb2plY3RzL3NvdW5kL2FwcC9zY3JpcHRzL21haW4uanMiLCIvaG9tZS9ndWlsbGF1bWUvZGV2L3Byb2plY3RzL3NvdW5kL2FwcC9zY3JpcHRzL21vZHVsZXMvYXVkaW8uanMiLCIvaG9tZS9ndWlsbGF1bWUvZGV2L3Byb2plY3RzL3NvdW5kL2FwcC9zY3JpcHRzL21vZHVsZXMvZW1pdHRlci5qcyIsIi9ob21lL2d1aWxsYXVtZS9kZXYvcHJvamVjdHMvc291bmQvYXBwL3NjcmlwdHMvbW9kdWxlcy9zY2VuZS5qcyIsIi9ob21lL2d1aWxsYXVtZS9kZXYvcHJvamVjdHMvc291bmQvYXBwL3NjcmlwdHMvbW9kdWxlcy90ZXN0LmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2V2ZW50cy9ldmVudHMuanMiLCJub2RlX21vZHVsZXMvb3JiaXQtY29udHJvbHMvaW5kZXguanMiLCJub2RlX21vZHVsZXMvb3JiaXQtY29udHJvbHMvbGliL2lucHV0LmpzIiwibm9kZV9tb2R1bGVzL29yYml0LWNvbnRyb2xzL25vZGVfbW9kdWxlcy9jbGFtcC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9vcmJpdC1jb250cm9scy9ub2RlX21vZHVsZXMvZGVmaW5lZC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9vcmJpdC1jb250cm9scy9ub2RlX21vZHVsZXMvZ2wtcXVhdC9pbnZlcnQuanMiLCJub2RlX21vZHVsZXMvb3JiaXQtY29udHJvbHMvbm9kZV9tb2R1bGVzL2dsLXF1YXQvbm9kZV9tb2R1bGVzL2dsLXZlYzQvbm9ybWFsaXplLmpzIiwibm9kZV9tb2R1bGVzL29yYml0LWNvbnRyb2xzL25vZGVfbW9kdWxlcy9nbC1xdWF0L25vcm1hbGl6ZS5qcyIsIm5vZGVfbW9kdWxlcy9vcmJpdC1jb250cm9scy9ub2RlX21vZHVsZXMvZ2wtdmVjMy9hZGQuanMiLCJub2RlX21vZHVsZXMvb3JiaXQtY29udHJvbHMvbm9kZV9tb2R1bGVzL2dsLXZlYzMvY29weS5qcyIsIm5vZGVfbW9kdWxlcy9vcmJpdC1jb250cm9scy9ub2RlX21vZHVsZXMvZ2wtdmVjMy9jcm9zcy5qcyIsIm5vZGVfbW9kdWxlcy9vcmJpdC1jb250cm9scy9ub2RlX21vZHVsZXMvZ2wtdmVjMy9kb3QuanMiLCJub2RlX21vZHVsZXMvb3JiaXQtY29udHJvbHMvbm9kZV9tb2R1bGVzL2dsLXZlYzMvbGVuZ3RoLmpzIiwibm9kZV9tb2R1bGVzL29yYml0LWNvbnRyb2xzL25vZGVfbW9kdWxlcy9nbC12ZWMzL25vcm1hbGl6ZS5qcyIsIm5vZGVfbW9kdWxlcy9vcmJpdC1jb250cm9scy9ub2RlX21vZHVsZXMvZ2wtdmVjMy9zZXQuanMiLCJub2RlX21vZHVsZXMvb3JiaXQtY29udHJvbHMvbm9kZV9tb2R1bGVzL2dsLXZlYzMvc3VidHJhY3QuanMiLCJub2RlX21vZHVsZXMvb3JiaXQtY29udHJvbHMvbm9kZV9tb2R1bGVzL2dsLXZlYzMvdHJhbnNmb3JtUXVhdC5qcyIsIm5vZGVfbW9kdWxlcy9vcmJpdC1jb250cm9scy9ub2RlX21vZHVsZXMvbW91c2UtZXZlbnQtb2Zmc2V0L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL29yYml0LWNvbnRyb2xzL25vZGVfbW9kdWxlcy9tb3VzZS13aGVlbC9ub2RlX21vZHVsZXMvdG8tcHgvbm9kZV9tb2R1bGVzL3BhcnNlLXVuaXQvaW5kZXguanMiLCJub2RlX21vZHVsZXMvb3JiaXQtY29udHJvbHMvbm9kZV9tb2R1bGVzL21vdXNlLXdoZWVsL25vZGVfbW9kdWxlcy90by1weC90b3B4LmpzIiwibm9kZV9tb2R1bGVzL29yYml0LWNvbnRyb2xzL25vZGVfbW9kdWxlcy9tb3VzZS13aGVlbC93aGVlbC5qcyIsIm5vZGVfbW9kdWxlcy9vcmJpdC1jb250cm9scy9ub2RlX21vZHVsZXMvcXVhdC1mcm9tLXVuaXQtdmVjMy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9vcmJpdC1jb250cm9scy9ub2RlX21vZHVsZXMvdG91Y2gtcGluY2gvaW5kZXguanMiLCJub2RlX21vZHVsZXMvb3JiaXQtY29udHJvbHMvbm9kZV9tb2R1bGVzL3RvdWNoLXBpbmNoL25vZGVfbW9kdWxlcy9kcHJvcC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9vcmJpdC1jb250cm9scy9ub2RlX21vZHVsZXMvdG91Y2gtcGluY2gvbm9kZV9tb2R1bGVzL2dsLXZlYzIvZGlzdGFuY2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs4QkNBd0IsaUJBQWlCOzs0QkFDbkIsZUFBZTs7NEJBQ2YsZUFBZTs7QUFFckMsSUFBSSxPQUFPLEdBQUcsNkJBQWEsQ0FBQzs7QUFFNUIsSUFBSSxLQUFLLEdBQUcsd0JBQVcsT0FBTyxDQUFFLENBQUM7O0FBRWpDLElBQUksS0FBSyxHQUFHLHdCQUFXLE9BQU8sRUFBRSxLQUFLLENBQUUsQ0FBQzs7QUFFeEMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7O0lDUFAsS0FBSztBQUVJLGFBRlQsS0FBSyxDQUVNLE9BQU8sRUFBRzs4QkFGckIsS0FBSzs7QUFJSCxZQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztBQUN2QixZQUFJLENBQUMsT0FBTyxHQUFHLElBQUksWUFBWSxFQUFFLENBQUM7O0FBRWxDLFlBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDOztBQUV2QixZQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsY0FBYyxFQUFFLENBQUM7QUFDOUMsWUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQztBQUN4QyxZQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsaUJBQWlCLENBQUM7QUFDaEQsZUFBTyxDQUFDLEdBQUcsQ0FBRSxJQUFJLENBQUMsUUFBUSxDQUFFLENBQUM7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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN1NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQgeyBFbWl0dGVyIH0gZnJvbSAnbW9kdWxlcy9lbWl0dGVyJztcbmltcG9ydCB7IFNjZW5lIH0gZnJvbSAnbW9kdWxlcy9zY2VuZSc7XG5pbXBvcnQgeyBBdWRpbyB9IGZyb20gJ21vZHVsZXMvYXVkaW8nO1xuXG5sZXQgZW1pdHRlciA9IG5ldyBFbWl0dGVyKCk7XG5cbmxldCBhdWRpbyA9IG5ldyBBdWRpbyggZW1pdHRlciApO1xuXG5sZXQgc2NlbmUgPSBuZXcgU2NlbmUoIGVtaXR0ZXIsIGF1ZGlvICk7XG5cbnNjZW5lLmluaXQoKTtcblxuIiwiLy8gV2FudCB0byBjdXN0b21pemUgdGhpbmdzID9cbi8vIGh0dHA6Ly93d3cuYWlydGlnaHRpbnRlcmFjdGl2ZS5jb20vZGVtb3MvanMvdWJlcnZpei9hdWRpb2FuYWx5c2lzL1xuXG5jbGFzcyBBdWRpbyAge1xuXG4gICAgY29uc3RydWN0b3IoIGVtaXR0ZXIgKSB7XG5cbiAgICAgICAgdGhpcy5lbWl0dGVyID0gZW1pdHRlcjtcbiAgICAgICAgdGhpcy5jb250ZXh0ID0gbmV3IEF1ZGlvQ29udGV4dCgpO1xuXG4gICAgICAgIHRoaXMuYnVmZmVyU2l6ZSA9IDEwMjQ7IFxuXG4gICAgICAgIHRoaXMuYW5hbHlzZXIgPSB0aGlzLmNvbnRleHQuY3JlYXRlQW5hbHlzZXIoKTtcbiAgICAgICAgdGhpcy5hbmFseXNlci5mZnRTaXplID0gdGhpcy5idWZmZXJTaXplO1xuICAgICAgICB0aGlzLmJpbkNvdW50ID0gdGhpcy5hbmFseXNlci5mcmVxdWVuY3lCaW5Db3VudDsgLy8gdGhpcy5idWZmZXJTaXplIC8gMlxuICAgICAgICBjb25zb2xlLmxvZyggdGhpcy5iaW5Db3VudCApO1xuXG4gICAgICAgIHRoaXMuZGF0YUZyZXFBcnJheSA9IG5ldyBVaW50OEFycmF5KCB0aGlzLmJpbkNvdW50ICk7XG4gICAgICAgIHRoaXMuZGF0YVRpbWVBcnJheSA9IG5ldyBVaW50OEFycmF5KCB0aGlzLmJpbkNvdW50ICk7XG5cbiAgICAgICAgdGhpcy5iaW5kcyA9IHt9O1xuICAgICAgICB0aGlzLmJpbmRzLm9uTG9hZCA9IHRoaXMub25Mb2FkLmJpbmQoIHRoaXMgKTtcbiAgICB9XG5cbiAgICBsb2FkKCB1cmwgKSB7XG5cbiAgICAgICAgdGhpcy5yZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgICAgIHRoaXMucmVxdWVzdC5vcGVuKCBcIkdFVFwiLCB1cmwsIHRydWUgKTtcbiAgICAgICAgdGhpcy5yZXF1ZXN0LnJlc3BvbnNlVHlwZSA9IFwiYXJyYXlidWZmZXJcIjtcblxuICAgICAgICB0aGlzLnJlcXVlc3Qub25sb2FkID0gdGhpcy5iaW5kcy5vbkxvYWQ7XG4gICAgICAgIHRoaXMucmVxdWVzdC5zZW5kKCk7XG4gICAgfVxuXG4gICAgb25Mb2FkKCkge1xuICAgICAgICB0aGlzLmNvbnRleHQuZGVjb2RlQXVkaW9EYXRhKCB0aGlzLnJlcXVlc3QucmVzcG9uc2UsICggYnVmZmVyICkgPT4ge1xuXG4gICAgICAgICAgICB0aGlzLnNvdXJjZSA9IHRoaXMuY29udGV4dC5jcmVhdGVCdWZmZXJTb3VyY2UoKTtcbiAgICAgICAgICAgIHRoaXMuc291cmNlLmNvbm5lY3QoIHRoaXMuYW5hbHlzZXIgKTtcbiAgICAgICAgICAgIHRoaXMuc291cmNlLmJ1ZmZlciA9IGJ1ZmZlcjtcbiAgICAgICAgICAgIHRoaXMuc291cmNlLmNvbm5lY3QoIHRoaXMuY29udGV4dC5kZXN0aW5hdGlvbiApO1xuICAgICAgICAgICAgdGhpcy5zb3VyY2Uuc3RhcnQoIDAgKTtcblxuICAgICAgICAgICAgdGhpcy5lbWl0dGVyLmVtaXQoIFwic3RhcnRcIiApO1xuICAgICAgICB9LCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyggXCJlcnJvclwiIClcbiAgICAgICAgfSApO1xuICAgIH1cblxuICAgIGdldERhdGEoKSB7XG4gICAgICAgIHRoaXMuYW5hbHlzZXIuZ2V0Qnl0ZUZyZXF1ZW5jeURhdGEoIHRoaXMuZGF0YUZyZXFBcnJheSApO1xuICAgICAgICB0aGlzLmFuYWx5c2VyLmdldEJ5dGVUaW1lRG9tYWluRGF0YSggdGhpcy5kYXRhVGltZUFycmF5ICk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgZnJlcTogdGhpcy5kYXRhRnJlcUFycmF5LCAvLyBmcm9tIDAgLSAyNTYsIG5vIHNvdW5kID0gMFxuICAgICAgICAgIHRpbWU6IHRoaXMuZGF0YVRpbWVBcnJheSAvLyBmcm9tIDAgLTI1Niwgbm8gc291bmQgPSAxMjhcbiAgICAgICAgfTtcbiAgICB9XG5cbn1cblxuZXhwb3J0IHsgQXVkaW8gfTtcblxuIiwibGV0IEV2ZW50RW1pdHRlciA9IHJlcXVpcmUoJ2V2ZW50cycpO1xuXG5jbGFzcyBFbWl0dGVyIGV4dGVuZHMgRXZlbnRFbWl0dGVyIHtcblxuXHRjb25zdHJ1Y3RvcigpIHtcblxuXHRcdHN1cGVyKCk7XG5cblx0fVxuXG59XG5cbmV4cG9ydCB7IEVtaXR0ZXIgfTsiLCJpbXBvcnQgeyBUZXN0IH0gZnJvbSAnLi90ZXN0JztcblxubGV0IENvbnRyb2xzID0gcmVxdWlyZSgnb3JiaXQtY29udHJvbHMnKTtcblxuY2xhc3MgU2NlbmUge1xuXG4gICAgY29uc3RydWN0b3IoIGVtaXR0ZXIsIHNvdW5kLCBvcHRpb25zID0ge30gKSB7XG5cbiAgICBcdHRoaXMuZW1pdHRlciA9IGVtaXR0ZXI7XG4gICAgICAgIHRoaXMuc291bmQgPSBzb3VuZDtcbiAgICBcdHRoaXMuc2NlbmUgPSBudWxsO1xuICAgIFx0dGhpcy5jYW1lcmEgPSBudWxsO1xuICAgICAgICB0aGlzLnJlbmRlcmVyID0gbnVsbDtcbiAgICAgICAgdGhpcy5jb21wb3NlciA9IG51bGw7XG4gICAgICAgIHRoaXMuY29udGFpbmVyID0gb3B0aW9ucy5jb250YWluZXIgfHwgZG9jdW1lbnQuYm9keTtcbiAgICAgICAgdGhpcy5jb250cm9scyA9IG51bGw7XG5cbiAgICBcdHRoaXMucGFyYW1zID0ge1xuICAgIFx0XHRhY3RpdmU6IG9wdGlvbnMuYWN0aXZlIHx8IHRydWUsXG5cdCAgICAgICAgaGVpZ2h0OiBvcHRpb25zLmhlaWdodCB8fCB3aW5kb3cuaW5uZXJIZWlnaHQsXG5cdCAgICAgICAgd2lkdGg6IG9wdGlvbnMud2lkdGggfHwgd2luZG93LmlubmVyV2lkdGhcbiAgICBcdH07XG5cbiAgICBcdHRoaXMubW91c2UgPSB7XG5cdCAgICAgICAgeDogbnVsbCxcblx0ICAgICAgICB5OiBudWxsXG5cdCAgICB9O1xuXG5cdCAgICB0aGlzLmNsb2NrID0gbnVsbDtcblxuICAgIH1cblxuICAgIGluaXQoKSB7XG5cbiAgICBcdHRoaXMuc2NlbmUgPSBuZXcgVEhSRUUuU2NlbmUoKTtcbiAgICBcdHRoaXMuY2FtZXJhID0gbmV3IFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhKCA0NSwgdGhpcy5wYXJhbXMud2lkdGggLyB0aGlzLnBhcmFtcy5oZWlnaHQsIDEsIDEwMDAgKTtcblxuICAgICAgICB0aGlzLnRhcmdldCA9IG5ldyBUSFJFRS5WZWN0b3IzKCk7XG5cblxuICAgICAgICB0aGlzLmNhbWVyYS5sb29rQXQodGhpcy50YXJnZXQpO1xuIFxuICAgIFx0dGhpcy5yYXljYXN0ZXIgPSBuZXcgVEhSRUUuUmF5Y2FzdGVyKCk7XG5cbiAgICAgICAgdGhpcy50ZXN0KCk7XG5cbiAgICAgICAgLy8gdGhpcy5sb2FkU291bmQoKTtcblxuICAgICAgICB0aGlzLnJlbmRlcmVyID0gbmV3IFRIUkVFLldlYkdMUmVuZGVyZXIoe1xuXHQgICAgICAgIGFudGlhbGlhczogdHJ1ZVxuXHQgICAgfSk7XG5cblx0ICAgIHRoaXMucmVuZGVyZXIuc2V0Q2xlYXJDb2xvciggIDB4MjIyMjIyLCAxICk7XG4gICAgXHR0aGlzLnJlbmRlcmVyLnNldFNpemUoIHRoaXMucGFyYW1zLndpZHRoLCB0aGlzLnBhcmFtcy5oZWlnaHQgKTtcblxuICAgICAgICB0aGlzLmNvbnRhaW5lci5hcHBlbmRDaGlsZCggdGhpcy5yZW5kZXJlci5kb21FbGVtZW50ICk7XG5cbiAgICAgICAgdGhpcy5jb250cm9scyA9IG5ldyBDb250cm9scyh7XG4gICAgICAgICAgICBkaXN0YW5jZTogNSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgXG5cbiAgICBcdHRoaXMuY2xvY2sgPSBEYXRlLm5vdygpO1xuXG4gICAgXHR0aGlzLmFkZExpc3RlbmVycygpO1xuXG4gICAgICAgIHRoaXMuYW5pbWF0ZSgpO1xuICAgIH1cblxuICAgIGxvYWRTb3VuZCgpIHtcblxuICAgICAgICB0aGlzLnNvdW5kLmxvYWQoIFwibXVzaWMvamVkaW1pbmQubXAzXCIgKTtcbiAgICAgICAgdGhpcy5lbWl0dGVyLm9uKCBcInN0YXJ0XCIsICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuYW5pbWF0ZSgpO1xuICAgICAgICB9KTtcblxuICAgIH1cblxuICAgIHRlc3QoKSB7XG5cbiAgICAgICAgdGhpcy50ZXN0ID0gbmV3IFRlc3QoIHRoaXMuc2NlbmUsIHRoaXMuZW1pdHRlciApO1xuXG4gICAgfVxuXG4gICAgYW5pbWF0ZSggdHMgKSB7XG5cbiAgICAgICAgaWYgKHRoaXMucGFyYW1zLmFjdGl2ZSkge1xuICAgICAgICBcbiAgICAgICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoIHRoaXMuYW5pbWF0ZS5iaW5kKHRoaXMpICk7XG5cbiAgICAgICAgICAgIHRoaXMudGVzdC51cGRhdGUoIHRoaXMuc291bmQuZ2V0RGF0YSgpICk7XG5cbiAgICAgICAgICAgIHRoaXMucmVuZGVyKCB0cyApO1xuXG4gICAgICAgIH1cblxuICAgIH1cblxuICAgIHJlbmRlcigpIHtcblxuICAgIFx0aWYgKCF0aGlzLnBhcmFtcy5hY3RpdmUpXG4gICAgICAgIFx0dGhpcy5wYXJhbXMuYWN0aXZlID0gdHJ1ZTtcblxuICAgICAgICBjb25zdCBwb3NpdGlvbiA9IHRoaXMuY2FtZXJhLnBvc2l0aW9uLnRvQXJyYXkoKTtcbiAgICAgICAgY29uc3QgZGlyZWN0aW9uID0gdGhpcy50YXJnZXQudG9BcnJheSgpO1xuICAgICAgICB0aGlzLmNvbnRyb2xzLnVwZGF0ZShwb3NpdGlvbiwgZGlyZWN0aW9uKTtcbiAgICAgICAgdGhpcy5jYW1lcmEucG9zaXRpb24uZnJvbUFycmF5KHBvc2l0aW9uKTtcbiAgICAgICAgdGhpcy5jYW1lcmEubG9va0F0KHRoaXMudGFyZ2V0LmZyb21BcnJheShkaXJlY3Rpb24pKTtcblxuXG5cbiAgICAgICAgdGhpcy5yZW5kZXJlci5yZW5kZXIoIHRoaXMuc2NlbmUsIHRoaXMuY2FtZXJhICk7ICAgIFxuXG5cbiAgICB9XG5cbiAgICBhZGRMaXN0ZW5lcnMoKSB7XG5cbiAgICBcdHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAncmVzaXplJywgdGhpcy5vbldpbmRvd1Jlc2l6ZS5iaW5kKCB0aGlzICksIGZhbHNlICk7XG5cbiAgICB9XG5cbiAgICBvbldpbmRvd1Jlc2l6ZSgpIHtcblxuICAgIFx0dGhpcy5wYXJhbXMud2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aDtcblx0ICAgIHRoaXMucGFyYW1zLmhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodDtcblxuXHQgICAgdGhpcy5jYW1lcmEuYXNwZWN0ID0gdGhpcy5wYXJhbXMud2lkdGggLyB0aGlzLnBhcmFtcy5oZWlnaHQ7XG5cdCAgICB0aGlzLmNhbWVyYS51cGRhdGVQcm9qZWN0aW9uTWF0cml4KCk7XG5cblx0ICAgIHRoaXMucmVuZGVyZXIuc2V0U2l6ZSggdGhpcy5wYXJhbXMud2lkdGgsIHRoaXMucGFyYW1zLmhlaWdodCApO1xuXG4gICAgfVxuXG59XG5cbmV4cG9ydCB7IFNjZW5lIH07IiwibGV0IGdsc2xpZnkgPSByZXF1aXJlKCdnbHNsaWZ5Jyk7XG5cbmNsYXNzIFRlc3Qge1xuXG5cbiAgY29uc3RydWN0b3IoIHNjZW5lLCBlbWl0dGVyLCBvcHRpb25zID0ge30gKSB7XG5cblx0XHR0aGlzLnNjZW5lID0gc2NlbmU7XG5cblx0XHR0aGlzLmVtaXR0ZXIgPSBlbWl0dGVyO1xuXG5cdFx0dGhpcy5wYXJ0aWNsZXNDb3VudCA9IDEwMDAwO1xuXG4gICAgICAgIHRoaXMucmFkaXVzID0gMTtcbiAgICAgICAgdGhpcy53aWR0aFNlZ21lbnRzID0gMzI7XG4gICAgICAgIHRoaXMuaGVpZ2h0U2VnbWVudHMgPSAzMjtcblxuICAgICAgICB0aGlzLnZlcnRleFNoYWRlciA9IGdsc2xpZnkoJy4uLy4uL3ZlcnRleC1zaGFkZXJzL3Rlc3QudmVydCcpO1xuXG4gICAgICAgIHRoaXMuZnJhZ21lbnRTaGFkZXIgPSBnbHNsaWZ5KCcuLi8uLi9mcmFnbWVudC1zaGFkZXJzL3Rlc3QuZnJhZycpO1xuXG4gICAgICAgIHRoaXMubWF0ZXJpYWwgPSBuZXcgVEhSRUUuU2hhZGVyTWF0ZXJpYWwoe1xuICAgICAgICAgICAgdW5pZm9ybXM6IHsgXG4gICAgICAgICAgICAgICAgdGltZTogeyB0eXBlOiBcImZcIiwgdmFsdWU6IDAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNpZGU6IFRIUkVFLkRvdWJsZVNpZGUsXG4gICAgICAgICAgICB2ZXJ0ZXhTaGFkZXI6IHRoaXMudmVydGV4U2hhZGVyLFxuICAgICAgICAgICAgZnJhZ21lbnRTaGFkZXI6IHRoaXMuZnJhZ21lbnRTaGFkZXIsXG4gICAgICAgICAgICBzaGFkaW5nOiBUSFJFRS5TbW9vdGhTaGFkaW5nLFxuICAgICAgICAgICAgdHJhbnNwYXJlbnQ6IHRydWVcbiAgICAgICAgfSk7XG5cbiAgICAgICAgbGV0IGdlb21ldHJ5ID0gbmV3IFRIUkVFLlNwaGVyZUdlb21ldHJ5KCB0aGlzLnJhZGl1cywgdGhpcy53aWR0aFNlZ21lbnRzLCB0aGlzLmhlaWdodFNlZ21lbnRzICk7XG5cblx0XHQvLyB0aGlzLmdlb21ldHJ5ID0gbmV3IFRIUkVFLkJ1ZmZlckdlb21ldHJ5KCkuZnJvbUdlb21ldHJ5KCBnZW9tZXRyeSApO1xuXG5cdFx0dGhpcy5nZW9tZXRyeSA9IGdlb21ldHJ5O1xuXG4gICAgICAgIHRoaXMubWVzaCA9IG5ldyBUSFJFRS5NZXNoKCB0aGlzLmdlb21ldHJ5LCB0aGlzLm1hdGVyaWFsICk7XG5cbiAgICAgICAgLy8gdGhpcy5tZXNoLnBvc2l0aW9uLnogPSAtMTA7XG5cbiAgICAgICAgdGhpcy5jbG9jayA9IERhdGUubm93KCk7XG5cbiAgICAgICAgdGhpcy5zY2VuZS5hZGQoIHRoaXMubWVzaCApO1xuXG4gIH1cblxuICB1cGRhdGUoIHRzICkge1xuXG5cbiAgXHR0aGlzLm1hdGVyaWFsLnVuaWZvcm1zW1widGltZVwiXS52YWx1ZSA9ICggRGF0ZS5ub3coKSAtIHRoaXMuY2xvY2sgKSAqIDAuMDAwODtcblxuICB9XG5cbiAgYWRkR1VJKCkge1xuXG4gIFx0dGhpcy5HVUkgPSBuZXcgZGF0LkdVSSgpO1xuXG4gIFx0dGhpcy5HVUkuYWRkKCB0aGlzLmdlb21ldHJ5LnBhcmFtZXRlcnMsICdyYWRpdXMnICk7XG5cbiAgXHR0aGlzLkdVSS5hZGQoIHRoaXMuZ2VvbWV0cnkucGFyYW1ldGVycywgJ3dpZHRoU2VnbWVudHMnICk7XG5cbiAgXHR0aGlzLkdVSS5hZGQoIHRoaXMuZ2VvbWV0cnkucGFyYW1ldGVycywgJ2hlaWdodFNlZ21lbnRzJyApO1xuICB9XG5cbiAgZ2V0TWVzaCgpIHtcblxuICBcdHJldHVybiB0aGlzLm1lc2g7XG5cbiAgfVxuXG59XG5cbmV4cG9ydCB7IFRlc3QgfTsiLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuZnVuY3Rpb24gRXZlbnRFbWl0dGVyKCkge1xuICB0aGlzLl9ldmVudHMgPSB0aGlzLl9ldmVudHMgfHwge307XG4gIHRoaXMuX21heExpc3RlbmVycyA9IHRoaXMuX21heExpc3RlbmVycyB8fCB1bmRlZmluZWQ7XG59XG5tb2R1bGUuZXhwb3J0cyA9IEV2ZW50RW1pdHRlcjtcblxuLy8gQmFja3dhcmRzLWNvbXBhdCB3aXRoIG5vZGUgMC4xMC54XG5FdmVudEVtaXR0ZXIuRXZlbnRFbWl0dGVyID0gRXZlbnRFbWl0dGVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9ldmVudHMgPSB1bmRlZmluZWQ7XG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9tYXhMaXN0ZW5lcnMgPSB1bmRlZmluZWQ7XG5cbi8vIEJ5IGRlZmF1bHQgRXZlbnRFbWl0dGVycyB3aWxsIHByaW50IGEgd2FybmluZyBpZiBtb3JlIHRoYW4gMTAgbGlzdGVuZXJzIGFyZVxuLy8gYWRkZWQgdG8gaXQuIFRoaXMgaXMgYSB1c2VmdWwgZGVmYXVsdCB3aGljaCBoZWxwcyBmaW5kaW5nIG1lbW9yeSBsZWFrcy5cbkV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzID0gMTA7XG5cbi8vIE9idmlvdXNseSBub3QgYWxsIEVtaXR0ZXJzIHNob3VsZCBiZSBsaW1pdGVkIHRvIDEwLiBUaGlzIGZ1bmN0aW9uIGFsbG93c1xuLy8gdGhhdCB0byBiZSBpbmNyZWFzZWQuIFNldCB0byB6ZXJvIGZvciB1bmxpbWl0ZWQuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnNldE1heExpc3RlbmVycyA9IGZ1bmN0aW9uKG4pIHtcbiAgaWYgKCFpc051bWJlcihuKSB8fCBuIDwgMCB8fCBpc05hTihuKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ24gbXVzdCBiZSBhIHBvc2l0aXZlIG51bWJlcicpO1xuICB0aGlzLl9tYXhMaXN0ZW5lcnMgPSBuO1xuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIGVyLCBoYW5kbGVyLCBsZW4sIGFyZ3MsIGksIGxpc3RlbmVycztcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcblxuICAvLyBJZiB0aGVyZSBpcyBubyAnZXJyb3InIGV2ZW50IGxpc3RlbmVyIHRoZW4gdGhyb3cuXG4gIGlmICh0eXBlID09PSAnZXJyb3InKSB7XG4gICAgaWYgKCF0aGlzLl9ldmVudHMuZXJyb3IgfHxcbiAgICAgICAgKGlzT2JqZWN0KHRoaXMuX2V2ZW50cy5lcnJvcikgJiYgIXRoaXMuX2V2ZW50cy5lcnJvci5sZW5ndGgpKSB7XG4gICAgICBlciA9IGFyZ3VtZW50c1sxXTtcbiAgICAgIGlmIChlciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgIHRocm93IGVyOyAvLyBVbmhhbmRsZWQgJ2Vycm9yJyBldmVudFxuICAgICAgfVxuICAgICAgdGhyb3cgVHlwZUVycm9yKCdVbmNhdWdodCwgdW5zcGVjaWZpZWQgXCJlcnJvclwiIGV2ZW50LicpO1xuICAgIH1cbiAgfVxuXG4gIGhhbmRsZXIgPSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgaWYgKGlzVW5kZWZpbmVkKGhhbmRsZXIpKVxuICAgIHJldHVybiBmYWxzZTtcblxuICBpZiAoaXNGdW5jdGlvbihoYW5kbGVyKSkge1xuICAgIHN3aXRjaCAoYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgLy8gZmFzdCBjYXNlc1xuICAgICAgY2FzZSAxOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAyOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcywgYXJndW1lbnRzWzFdKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDM6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0sIGFyZ3VtZW50c1syXSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgLy8gc2xvd2VyXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBsZW4gPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgICAgICBhcmdzID0gbmV3IEFycmF5KGxlbiAtIDEpO1xuICAgICAgICBmb3IgKGkgPSAxOyBpIDwgbGVuOyBpKyspXG4gICAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIGhhbmRsZXIuYXBwbHkodGhpcywgYXJncyk7XG4gICAgfVxuICB9IGVsc2UgaWYgKGlzT2JqZWN0KGhhbmRsZXIpKSB7XG4gICAgbGVuID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICBhcmdzID0gbmV3IEFycmF5KGxlbiAtIDEpO1xuICAgIGZvciAoaSA9IDE7IGkgPCBsZW47IGkrKylcbiAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuXG4gICAgbGlzdGVuZXJzID0gaGFuZGxlci5zbGljZSgpO1xuICAgIGxlbiA9IGxpc3RlbmVycy5sZW5ndGg7XG4gICAgZm9yIChpID0gMDsgaSA8IGxlbjsgaSsrKVxuICAgICAgbGlzdGVuZXJzW2ldLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgdmFyIG07XG5cbiAgaWYgKCFpc0Z1bmN0aW9uKGxpc3RlbmVyKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKVxuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuXG4gIC8vIFRvIGF2b2lkIHJlY3Vyc2lvbiBpbiB0aGUgY2FzZSB0aGF0IHR5cGUgPT09IFwibmV3TGlzdGVuZXJcIiEgQmVmb3JlXG4gIC8vIGFkZGluZyBpdCB0byB0aGUgbGlzdGVuZXJzLCBmaXJzdCBlbWl0IFwibmV3TGlzdGVuZXJcIi5cbiAgaWYgKHRoaXMuX2V2ZW50cy5uZXdMaXN0ZW5lcilcbiAgICB0aGlzLmVtaXQoJ25ld0xpc3RlbmVyJywgdHlwZSxcbiAgICAgICAgICAgICAgaXNGdW5jdGlvbihsaXN0ZW5lci5saXN0ZW5lcikgP1xuICAgICAgICAgICAgICBsaXN0ZW5lci5saXN0ZW5lciA6IGxpc3RlbmVyKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICAvLyBPcHRpbWl6ZSB0aGUgY2FzZSBvZiBvbmUgbGlzdGVuZXIuIERvbid0IG5lZWQgdGhlIGV4dHJhIGFycmF5IG9iamVjdC5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0gPSBsaXN0ZW5lcjtcbiAgZWxzZSBpZiAoaXNPYmplY3QodGhpcy5fZXZlbnRzW3R5cGVdKSlcbiAgICAvLyBJZiB3ZSd2ZSBhbHJlYWR5IGdvdCBhbiBhcnJheSwganVzdCBhcHBlbmQuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdLnB1c2gobGlzdGVuZXIpO1xuICBlbHNlXG4gICAgLy8gQWRkaW5nIHRoZSBzZWNvbmQgZWxlbWVudCwgbmVlZCB0byBjaGFuZ2UgdG8gYXJyYXkuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdID0gW3RoaXMuX2V2ZW50c1t0eXBlXSwgbGlzdGVuZXJdO1xuXG4gIC8vIENoZWNrIGZvciBsaXN0ZW5lciBsZWFrXG4gIGlmIChpc09iamVjdCh0aGlzLl9ldmVudHNbdHlwZV0pICYmICF0aGlzLl9ldmVudHNbdHlwZV0ud2FybmVkKSB7XG4gICAgdmFyIG07XG4gICAgaWYgKCFpc1VuZGVmaW5lZCh0aGlzLl9tYXhMaXN0ZW5lcnMpKSB7XG4gICAgICBtID0gdGhpcy5fbWF4TGlzdGVuZXJzO1xuICAgIH0gZWxzZSB7XG4gICAgICBtID0gRXZlbnRFbWl0dGVyLmRlZmF1bHRNYXhMaXN0ZW5lcnM7XG4gICAgfVxuXG4gICAgaWYgKG0gJiYgbSA+IDAgJiYgdGhpcy5fZXZlbnRzW3R5cGVdLmxlbmd0aCA+IG0pIHtcbiAgICAgIHRoaXMuX2V2ZW50c1t0eXBlXS53YXJuZWQgPSB0cnVlO1xuICAgICAgY29uc29sZS5lcnJvcignKG5vZGUpIHdhcm5pbmc6IHBvc3NpYmxlIEV2ZW50RW1pdHRlciBtZW1vcnkgJyArXG4gICAgICAgICAgICAgICAgICAgICdsZWFrIGRldGVjdGVkLiAlZCBsaXN0ZW5lcnMgYWRkZWQuICcgK1xuICAgICAgICAgICAgICAgICAgICAnVXNlIGVtaXR0ZXIuc2V0TWF4TGlzdGVuZXJzKCkgdG8gaW5jcmVhc2UgbGltaXQuJyxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fZXZlbnRzW3R5cGVdLmxlbmd0aCk7XG4gICAgICBpZiAodHlwZW9mIGNvbnNvbGUudHJhY2UgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgLy8gbm90IHN1cHBvcnRlZCBpbiBJRSAxMFxuICAgICAgICBjb25zb2xlLnRyYWNlKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lcjtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbmNlID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgaWYgKCFpc0Z1bmN0aW9uKGxpc3RlbmVyKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIHZhciBmaXJlZCA9IGZhbHNlO1xuXG4gIGZ1bmN0aW9uIGcoKSB7XG4gICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBnKTtcblxuICAgIGlmICghZmlyZWQpIHtcbiAgICAgIGZpcmVkID0gdHJ1ZTtcbiAgICAgIGxpc3RlbmVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfVxuICB9XG5cbiAgZy5saXN0ZW5lciA9IGxpc3RlbmVyO1xuICB0aGlzLm9uKHR5cGUsIGcpO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLy8gZW1pdHMgYSAncmVtb3ZlTGlzdGVuZXInIGV2ZW50IGlmZiB0aGUgbGlzdGVuZXIgd2FzIHJlbW92ZWRcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICB2YXIgbGlzdCwgcG9zaXRpb24sIGxlbmd0aCwgaTtcblxuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICByZXR1cm4gdGhpcztcblxuICBsaXN0ID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuICBsZW5ndGggPSBsaXN0Lmxlbmd0aDtcbiAgcG9zaXRpb24gPSAtMTtcblxuICBpZiAobGlzdCA9PT0gbGlzdGVuZXIgfHxcbiAgICAgIChpc0Z1bmN0aW9uKGxpc3QubGlzdGVuZXIpICYmIGxpc3QubGlzdGVuZXIgPT09IGxpc3RlbmVyKSkge1xuICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgaWYgKHRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcilcbiAgICAgIHRoaXMuZW1pdCgncmVtb3ZlTGlzdGVuZXInLCB0eXBlLCBsaXN0ZW5lcik7XG5cbiAgfSBlbHNlIGlmIChpc09iamVjdChsaXN0KSkge1xuICAgIGZvciAoaSA9IGxlbmd0aDsgaS0tID4gMDspIHtcbiAgICAgIGlmIChsaXN0W2ldID09PSBsaXN0ZW5lciB8fFxuICAgICAgICAgIChsaXN0W2ldLmxpc3RlbmVyICYmIGxpc3RbaV0ubGlzdGVuZXIgPT09IGxpc3RlbmVyKSkge1xuICAgICAgICBwb3NpdGlvbiA9IGk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChwb3NpdGlvbiA8IDApXG4gICAgICByZXR1cm4gdGhpcztcblxuICAgIGlmIChsaXN0Lmxlbmd0aCA9PT0gMSkge1xuICAgICAgbGlzdC5sZW5ndGggPSAwO1xuICAgICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGlzdC5zcGxpY2UocG9zaXRpb24sIDEpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9ldmVudHMucmVtb3ZlTGlzdGVuZXIpXG4gICAgICB0aGlzLmVtaXQoJ3JlbW92ZUxpc3RlbmVyJywgdHlwZSwgbGlzdGVuZXIpO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUFsbExpc3RlbmVycyA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIGtleSwgbGlzdGVuZXJzO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKVxuICAgIHJldHVybiB0aGlzO1xuXG4gIC8vIG5vdCBsaXN0ZW5pbmcgZm9yIHJlbW92ZUxpc3RlbmVyLCBubyBuZWVkIHRvIGVtaXRcbiAgaWYgKCF0aGlzLl9ldmVudHMucmVtb3ZlTGlzdGVuZXIpIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMClcbiAgICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuICAgIGVsc2UgaWYgKHRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvLyBlbWl0IHJlbW92ZUxpc3RlbmVyIGZvciBhbGwgbGlzdGVuZXJzIG9uIGFsbCBldmVudHNcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICBmb3IgKGtleSBpbiB0aGlzLl9ldmVudHMpIHtcbiAgICAgIGlmIChrZXkgPT09ICdyZW1vdmVMaXN0ZW5lcicpIGNvbnRpbnVlO1xuICAgICAgdGhpcy5yZW1vdmVBbGxMaXN0ZW5lcnMoa2V5KTtcbiAgICB9XG4gICAgdGhpcy5yZW1vdmVBbGxMaXN0ZW5lcnMoJ3JlbW92ZUxpc3RlbmVyJyk7XG4gICAgdGhpcy5fZXZlbnRzID0ge307XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBsaXN0ZW5lcnMgPSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgaWYgKGlzRnVuY3Rpb24obGlzdGVuZXJzKSkge1xuICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXJzKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBMSUZPIG9yZGVyXG4gICAgd2hpbGUgKGxpc3RlbmVycy5sZW5ndGgpXG4gICAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVyc1tsaXN0ZW5lcnMubGVuZ3RoIC0gMV0pO1xuICB9XG4gIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVycyA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIHJldDtcbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICByZXQgPSBbXTtcbiAgZWxzZSBpZiAoaXNGdW5jdGlvbih0aGlzLl9ldmVudHNbdHlwZV0pKVxuICAgIHJldCA9IFt0aGlzLl9ldmVudHNbdHlwZV1dO1xuICBlbHNlXG4gICAgcmV0ID0gdGhpcy5fZXZlbnRzW3R5cGVdLnNsaWNlKCk7XG4gIHJldHVybiByZXQ7XG59O1xuXG5FdmVudEVtaXR0ZXIubGlzdGVuZXJDb3VudCA9IGZ1bmN0aW9uKGVtaXR0ZXIsIHR5cGUpIHtcbiAgdmFyIHJldDtcbiAgaWYgKCFlbWl0dGVyLl9ldmVudHMgfHwgIWVtaXR0ZXIuX2V2ZW50c1t0eXBlXSlcbiAgICByZXQgPSAwO1xuICBlbHNlIGlmIChpc0Z1bmN0aW9uKGVtaXR0ZXIuX2V2ZW50c1t0eXBlXSkpXG4gICAgcmV0ID0gMTtcbiAgZWxzZVxuICAgIHJldCA9IGVtaXR0ZXIuX2V2ZW50c1t0eXBlXS5sZW5ndGg7XG4gIHJldHVybiByZXQ7XG59O1xuXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ2Z1bmN0aW9uJztcbn1cblxuZnVuY3Rpb24gaXNOdW1iZXIoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnbnVtYmVyJztcbn1cblxuZnVuY3Rpb24gaXNPYmplY3QoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnb2JqZWN0JyAmJiBhcmcgIT09IG51bGw7XG59XG5cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09PSB2b2lkIDA7XG59XG4iLCJ2YXIgZGVmaW5lZCA9IHJlcXVpcmUoJ2RlZmluZWQnKVxudmFyIGNsYW1wID0gcmVxdWlyZSgnY2xhbXAnKVxuXG52YXIgaW5wdXRFdmVudHMgPSByZXF1aXJlKCcuL2xpYi9pbnB1dCcpXG52YXIgcXVhdEZyb21WZWMzID0gcmVxdWlyZSgncXVhdC1mcm9tLXVuaXQtdmVjMycpXG52YXIgcXVhdEludmVydCA9IHJlcXVpcmUoJ2dsLXF1YXQvaW52ZXJ0JylcblxudmFyIGdsVmVjMyA9IHtcbiAgbGVuZ3RoOiByZXF1aXJlKCdnbC12ZWMzL2xlbmd0aCcpLFxuICBhZGQ6IHJlcXVpcmUoJ2dsLXZlYzMvYWRkJyksXG4gIHN1YnRyYWN0OiByZXF1aXJlKCdnbC12ZWMzL3N1YnRyYWN0JyksXG4gIHRyYW5zZm9ybVF1YXQ6IHJlcXVpcmUoJ2dsLXZlYzMvdHJhbnNmb3JtUXVhdCcpLFxuICBjb3B5OiByZXF1aXJlKCdnbC12ZWMzL2NvcHknKSxcbiAgbm9ybWFsaXplOiByZXF1aXJlKCdnbC12ZWMzL25vcm1hbGl6ZScpLFxuICBjcm9zczogcmVxdWlyZSgnZ2wtdmVjMy9jcm9zcycpXG59XG5cbnZhciBZX1VQID0gWzAsIDEsIDBdXG52YXIgRVBTSUxPTiA9IDFlLTEwXG5cbm1vZHVsZS5leHBvcnRzID0gY3JlYXRlT3JiaXRDb250cm9sc1xuZnVuY3Rpb24gY3JlYXRlT3JiaXRDb250cm9scyAob3B0KSB7XG4gIG9wdCA9IG9wdCB8fCB7fVxuXG4gIHZhciBpbnB1dERlbHRhID0gWzAsIDAsIDBdIC8vIHgsIHksIHpvb21cbiAgdmFyIG9mZnNldCA9IFswLCAwLCAwXVxuXG4gIHZhciB1cFF1YXQgPSBbMCwgMCwgMCwgMV1cbiAgdmFyIHVwUXVhdEludmVyc2UgPSB1cFF1YXQuc2xpY2UoKVxuXG4gIHZhciBjb250cm9scyA9IHtcbiAgICB1cGRhdGU6IHVwZGF0ZSxcblxuICAgIHRhcmdldDogb3B0LnRhcmdldCB8fCBbMCwgMCwgMF0sXG4gICAgcGhpOiBvcHQucGhpIHx8IDAsXG4gICAgdGhldGE6IG9wdC50aGV0YSB8fCAwLFxuICAgIGRpc3RhbmNlOiBkZWZpbmVkKG9wdC5kaXN0YW5jZSwgMSksXG4gICAgZGFtcGluZzogZGVmaW5lZChvcHQuZGFtcGluZywgMC4yNSksXG4gICAgcm90YXRlU3BlZWQ6IGRlZmluZWQob3B0LnJvdGF0ZVNwZWVkLCAwLjI4KSxcbiAgICB6b29tU3BlZWQ6IGRlZmluZWQob3B0Lnpvb21TcGVlZCwgMC4wMDc1KSxcbiAgICBwaW5jaFNwZWVkOiBkZWZpbmVkKG9wdC5waW5jaFNwZWVkLCAwLjAwNzUpLFxuXG4gICAgcGluY2g6IG9wdC5waW5jaGluZyAhPT0gZmFsc2UsXG4gICAgem9vbTogb3B0Lnpvb20gIT09IGZhbHNlLFxuICAgIHJvdGF0ZTogb3B0LnJvdGF0ZSAhPT0gZmFsc2UsXG5cbiAgICBwaGlCb3VuZHM6IG9wdC5waGlCb3VuZHMgfHwgWzAsIE1hdGguUEldLFxuICAgIHRoZXRhQm91bmRzOiBvcHQudGhldGFCb3VuZHMgfHwgWy1JbmZpbml0eSwgSW5maW5pdHldLFxuICAgIGRpc3RhbmNlQm91bmRzOiBvcHQuZGlzdGFuY2VCb3VuZHMgfHwgWzEsIEluZmluaXR5XVxuICB9XG5cbiAgaW5wdXRFdmVudHMoe1xuICAgIHBhcmVudDogb3B0LnBhcmVudCB8fCB3aW5kb3csXG4gICAgZWxlbWVudDogb3B0LmVsZW1lbnQsXG4gICAgcm90YXRlOiBvcHQucm90YXRlICE9PSBmYWxzZSA/IGlucHV0Um90YXRlIDogbnVsbCxcbiAgICB6b29tOiBvcHQuem9vbSAhPT0gZmFsc2UgPyBpbnB1dFpvb20gOiBudWxsLFxuICAgIHBpbmNoOiBvcHQucGluY2ggIT09IGZhbHNlID8gaW5wdXRQaW5jaCA6IG51bGxcbiAgfSlcblxuICByZXR1cm4gY29udHJvbHNcblxuICBmdW5jdGlvbiBpbnB1dFJvdGF0ZSAoZHgsIGR5KSB7XG4gICAgdmFyIFBJMiA9IE1hdGguUEkgKiAyXG4gICAgaW5wdXREZWx0YVswXSAtPSBQSTIgKiBkeCAqIGNvbnRyb2xzLnJvdGF0ZVNwZWVkXG4gICAgaW5wdXREZWx0YVsxXSAtPSBQSTIgKiBkeSAqIGNvbnRyb2xzLnJvdGF0ZVNwZWVkXG4gIH1cblxuICBmdW5jdGlvbiBpbnB1dFpvb20gKGRlbHRhKSB7XG4gICAgaW5wdXREZWx0YVsyXSArPSBkZWx0YSAqIGNvbnRyb2xzLnpvb21TcGVlZFxuICB9XG5cbiAgZnVuY3Rpb24gaW5wdXRQaW5jaCAoZGVsdGEpIHtcbiAgICBpbnB1dERlbHRhWzJdIC09IGRlbHRhICogY29udHJvbHMucGluY2hTcGVlZFxuICB9XG5cbiAgZnVuY3Rpb24gdXBkYXRlIChwb3NpdGlvbiwgZGlyZWN0aW9uLCB1cCkge1xuICAgIHZhciBjYW1lcmFVcCA9IHVwIHx8IFlfVVBcbiAgICBxdWF0RnJvbVZlYzModXBRdWF0LCBjYW1lcmFVcCwgWV9VUClcbiAgICBxdWF0SW52ZXJ0KHVwUXVhdEludmVyc2UsIHVwUXVhdClcblxuICAgIHZhciBkaXN0YW5jZSA9IGNvbnRyb2xzLmRpc3RhbmNlXG5cbiAgICBnbFZlYzMuc3VidHJhY3Qob2Zmc2V0LCBwb3NpdGlvbiwgY29udHJvbHMudGFyZ2V0KVxuICAgIGdsVmVjMy50cmFuc2Zvcm1RdWF0KG9mZnNldCwgb2Zmc2V0LCB1cFF1YXQpXG5cbiAgICB2YXIgdGhldGEgPSBNYXRoLmF0YW4yKG9mZnNldFswXSwgb2Zmc2V0WzJdKVxuICAgIHZhciBwaGkgPSBNYXRoLmF0YW4yKE1hdGguc3FydChvZmZzZXRbMF0gKiBvZmZzZXRbMF0gKyBvZmZzZXRbMl0gKiBvZmZzZXRbMl0pLCBvZmZzZXRbMV0pXG5cbiAgICB0aGV0YSArPSBpbnB1dERlbHRhWzBdXG4gICAgcGhpICs9IGlucHV0RGVsdGFbMV1cblxuICAgIHRoZXRhID0gY2xhbXAodGhldGEsIGNvbnRyb2xzLnRoZXRhQm91bmRzWzBdLCBjb250cm9scy50aGV0YUJvdW5kc1sxXSlcbiAgICBwaGkgPSBjbGFtcChwaGksIGNvbnRyb2xzLnBoaUJvdW5kc1swXSwgY29udHJvbHMucGhpQm91bmRzWzFdKVxuICAgIHBoaSA9IGNsYW1wKHBoaSwgRVBTSUxPTiwgTWF0aC5QSSAtIEVQU0lMT04pXG5cbiAgICBkaXN0YW5jZSArPSBpbnB1dERlbHRhWzJdXG4gICAgZGlzdGFuY2UgPSBjbGFtcChkaXN0YW5jZSwgY29udHJvbHMuZGlzdGFuY2VCb3VuZHNbMF0sIGNvbnRyb2xzLmRpc3RhbmNlQm91bmRzWzFdKVxuXG4gICAgdmFyIHJhZGl1cyA9IE1hdGguYWJzKGRpc3RhbmNlKSA8PSBFUFNJTE9OID8gRVBTSUxPTiA6IGRpc3RhbmNlXG4gICAgb2Zmc2V0WzBdID0gcmFkaXVzICogTWF0aC5zaW4ocGhpKSAqIE1hdGguc2luKHRoZXRhKVxuICAgIG9mZnNldFsxXSA9IHJhZGl1cyAqIE1hdGguY29zKHBoaSlcbiAgICBvZmZzZXRbMl0gPSByYWRpdXMgKiBNYXRoLnNpbihwaGkpICogTWF0aC5jb3ModGhldGEpXG5cbiAgICBjb250cm9scy5waGkgPSBwaGlcbiAgICBjb250cm9scy50aGV0YSA9IHRoZXRhXG4gICAgY29udHJvbHMuZGlzdGFuY2UgPSBkaXN0YW5jZVxuXG4gICAgZ2xWZWMzLnRyYW5zZm9ybVF1YXQob2Zmc2V0LCBvZmZzZXQsIHVwUXVhdEludmVyc2UpXG4gICAgZ2xWZWMzLmFkZChwb3NpdGlvbiwgY29udHJvbHMudGFyZ2V0LCBvZmZzZXQpXG4gICAgY2FtTG9va0F0KGRpcmVjdGlvbiwgY2FtZXJhVXAsIHBvc2l0aW9uLCBjb250cm9scy50YXJnZXQpXG5cbiAgICB2YXIgZGFtcCA9IHR5cGVvZiBjb250cm9scy5kYW1waW5nID09PSAnbnVtYmVyJyA/IGNvbnRyb2xzLmRhbXBpbmcgOiAxXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpbnB1dERlbHRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpbnB1dERlbHRhW2ldICo9IDEgLSBkYW1wXG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGNhbUxvb2tBdCAoZGlyZWN0aW9uLCB1cCwgcG9zaXRpb24sIHRhcmdldCkge1xuICBnbFZlYzMuY29weShkaXJlY3Rpb24sIHRhcmdldClcbiAgZ2xWZWMzLnN1YnRyYWN0KGRpcmVjdGlvbiwgZGlyZWN0aW9uLCBwb3NpdGlvbilcbiAgZ2xWZWMzLm5vcm1hbGl6ZShkaXJlY3Rpb24sIGRpcmVjdGlvbilcbn1cbiIsInZhciBtb3VzZVdoZWVsID0gcmVxdWlyZSgnbW91c2Utd2hlZWwnKVxudmFyIGV2ZW50T2Zmc2V0ID0gcmVxdWlyZSgnbW91c2UtZXZlbnQtb2Zmc2V0JylcbnZhciBjcmVhdGVQaW5jaCA9IHJlcXVpcmUoJ3RvdWNoLXBpbmNoJylcblxubW9kdWxlLmV4cG9ydHMgPSBpbnB1dEV2ZW50c1xuZnVuY3Rpb24gaW5wdXRFdmVudHMgKG9wdCkge1xuICB2YXIgZWxlbWVudCA9IG9wdC5lbGVtZW50IHx8IHdpbmRvd1xuICB2YXIgcGFyZW50ID0gb3B0LnBhcmVudCB8fCBlbGVtZW50XG4gIHZhciBtb3VzZVN0YXJ0ID0gWzAsIDBdXG4gIHZhciBkcmFnZ2luZyA9IGZhbHNlXG4gIHZhciB0bXAgPSBbMCwgMF1cbiAgdmFyIHRtcDIgPSBbMCwgMF1cbiAgdmFyIHBpbmNoXG4gIFxuICB2YXIgem9vbUZuID0gb3B0Lnpvb21cbiAgdmFyIHJvdGF0ZUZuID0gb3B0LnJvdGF0ZVxuICB2YXIgcGluY2hGbiA9IG9wdC5waW5jaFxuICBcbiAgaWYgKHpvb21Gbikge1xuICAgIG1vdXNlV2hlZWwoZWxlbWVudCwgZnVuY3Rpb24gKGR4LCBkeSkge1xuICAgICAgem9vbUZuKGR5KVxuICAgIH0sIHRydWUpXG4gIH1cbiAgXG4gIGlmIChyb3RhdGVGbikge1xuICAgIC8vIGZvciBkcmFnZ2luZyB0byB3b3JrIG91dHNpZGUgY2FudmFzIGJvdW5kcyxcbiAgICAvLyBtb3VzZSBldmVudHMgaGF2ZSB0byBiZSBhZGRlZCB0byBwYXJlbnRcbiAgICBwYXJlbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgb25JbnB1dERvd24pXG4gICAgcGFyZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIG9uSW5wdXRNb3ZlKVxuICAgIHBhcmVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgb25JbnB1dFVwKVxuICB9XG4gIFxuICBpZiAocm90YXRlRm4gfHwgcGluY2hGbikge1xuICAgIHBpbmNoID0gY3JlYXRlUGluY2goZWxlbWVudClcbiAgICBcbiAgICAvLyBkb24ndCBhbGxvdyBzaW11bGF0ZWQgbW91c2UgZXZlbnRzXG4gICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgcHJldmVudERlZmF1bHQpXG4gICAgXG4gICAgaWYgKHJvdGF0ZUZuKSB0b3VjaFJvdGF0ZSgpXG4gICAgaWYgKHBpbmNoRm4pIHRvdWNoUGluY2goKVxuICB9XG5cbiAgZnVuY3Rpb24gcHJldmVudERlZmF1bHQgKGV2KSB7XG4gICAgZXYucHJldmVudERlZmF1bHQoKVxuICB9XG4gIFxuICBmdW5jdGlvbiB0b3VjaFJvdGF0ZSAoKSB7XG4gICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCBmdW5jdGlvbiAoZXYpIHtcbiAgICAgIGlmICghZHJhZ2dpbmcgfHwgaXNQaW5jaGluZygpKSByZXR1cm5cbiAgICAgICAgXG4gICAgICAvLyBmaW5kIGN1cnJlbnRseSBhY3RpdmUgZmluZ2VyXG4gICAgICBmb3IgKHZhciBpPTA7IGk8ZXYuY2hhbmdlZFRvdWNoZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGNoYW5nZWQgPSBldi5jaGFuZ2VkVG91Y2hlc1tpXVxuICAgICAgICB2YXIgaWR4ID0gcGluY2guaW5kZXhPZlRvdWNoKGNoYW5nZWQpXG4gICAgICAgIC8vIGlmIHBpbmNoIGlzIGRpc2FibGVkIGJ1dCByb3RhdGUgZW5hYmxlZCxcbiAgICAgICAgLy8gb25seSBhbGxvdyBmaXJzdCBmaW5nZXIgdG8gYWZmZWN0IHJvdGF0aW9uXG4gICAgICAgIHZhciBhbGxvdyA9IHBpbmNoRm4gPyBpZHggIT09IC0xIDogaWR4ID09PSAwXG4gICAgICAgIGlmIChhbGxvdykge1xuICAgICAgICAgIG9uSW5wdXRNb3ZlKGNoYW5nZWQpXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gICAgXG4gICAgcGluY2gub24oJ3BsYWNlJywgZnVuY3Rpb24gKG5ld0ZpbmdlciwgbGFzdEZpbmdlcikge1xuICAgICAgZHJhZ2dpbmcgPSAhaXNQaW5jaGluZygpXG4gICAgICBpZiAoZHJhZ2dpbmcpIHtcbiAgICAgICAgdmFyIGZpcnN0RmluZ2VyID0gbGFzdEZpbmdlciB8fCBuZXdGaW5nZXJcbiAgICAgICAgb25JbnB1dERvd24oZmlyc3RGaW5nZXIpXG4gICAgICB9XG4gICAgfSlcbiAgICBcbiAgICBwaW5jaC5vbignbGlmdCcsIGZ1bmN0aW9uIChsaWZ0ZWQsIHJlbWFpbmluZykge1xuICAgICAgZHJhZ2dpbmcgPSAhaXNQaW5jaGluZygpXG4gICAgICBpZiAoZHJhZ2dpbmcgJiYgcmVtYWluaW5nKSB7XG4gICAgICAgIGV2ZW50T2Zmc2V0KHJlbWFpbmluZywgZWxlbWVudCwgbW91c2VTdGFydClcbiAgICAgIH1cbiAgICB9KVxuICB9XG4gIFxuICBmdW5jdGlvbiBpc1BpbmNoaW5nICgpIHtcbiAgICByZXR1cm4gcGluY2gucGluY2hpbmcgJiYgcGluY2hGblxuICB9XG4gIFxuICBmdW5jdGlvbiB0b3VjaFBpbmNoICgpIHtcbiAgICBwaW5jaC5vbignY2hhbmdlJywgZnVuY3Rpb24gKGN1cnJlbnQsIHByZXYpIHtcbiAgICAgIHBpbmNoRm4oY3VycmVudCAtIHByZXYpXG4gICAgfSlcbiAgfVxuICBcbiAgZnVuY3Rpb24gb25JbnB1dERvd24gKGV2KSB7XG4gICAgZXZlbnRPZmZzZXQoZXYsIGVsZW1lbnQsIG1vdXNlU3RhcnQpICAgIFxuICAgIGlmIChpbnNpZGVCb3VuZHMobW91c2VTdGFydCkpIHtcbiAgICAgIGRyYWdnaW5nID0gdHJ1ZVxuICAgIH1cbiAgfVxuICBcbiAgZnVuY3Rpb24gb25JbnB1dFVwICgpIHtcbiAgICBkcmFnZ2luZyA9IGZhbHNlXG4gIH1cbiAgXG4gIGZ1bmN0aW9uIG9uSW5wdXRNb3ZlIChldikge1xuICAgIHZhciBlbmQgPSBldmVudE9mZnNldChldiwgZWxlbWVudCwgdG1wKVxuICAgIGlmIChwaW5jaCAmJiBpc1BpbmNoaW5nKCkpIHtcbiAgICAgIG1vdXNlU3RhcnQgPSBlbmRcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBpZiAoIWRyYWdnaW5nKSByZXR1cm5cbiAgICB2YXIgcmVjdCA9IGdldENsaWVudFNpemUodG1wMilcbiAgICB2YXIgZHggPSAoZW5kWzBdIC0gbW91c2VTdGFydFswXSkgLyByZWN0WzBdXG4gICAgdmFyIGR5ID0gKGVuZFsxXSAtIG1vdXNlU3RhcnRbMV0pIC8gcmVjdFsxXVxuICAgIHJvdGF0ZUZuKGR4LCBkeSlcbiAgICBtb3VzZVN0YXJ0WzBdID0gZW5kWzBdXG4gICAgbW91c2VTdGFydFsxXSA9IGVuZFsxXVxuICB9XG4gIFxuICBmdW5jdGlvbiBpbnNpZGVCb3VuZHMgKHBvcykge1xuICAgIGlmIChlbGVtZW50ID09PSB3aW5kb3cgfHwgXG4gICAgICAgIGVsZW1lbnQgPT09IGRvY3VtZW50IHx8XG4gICAgICAgIGVsZW1lbnQgPT09IGRvY3VtZW50LmJvZHkpIHtcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciByZWN0ID0gZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgICAgcmV0dXJuIHBvc1swXSA+PSAwICYmIHBvc1sxXSA+PSAwICYmXG4gICAgICAgIHBvc1swXSA8IHJlY3Qud2lkdGggJiYgcG9zWzFdIDwgcmVjdC5oZWlnaHRcbiAgICB9XG4gIH1cbiAgXG4gIGZ1bmN0aW9uIGdldENsaWVudFNpemUgKG91dCkge1xuICAgIHZhciBzb3VyY2UgPSBlbGVtZW50XG4gICAgaWYgKHNvdXJjZSA9PT0gd2luZG93IHx8XG4gICAgICAgIHNvdXJjZSA9PT0gZG9jdW1lbnQgfHxcbiAgICAgICAgc291cmNlID09PSBkb2N1bWVudC5ib2R5KSB7XG4gICAgICBzb3VyY2UgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnRcbiAgICB9XG4gICAgb3V0WzBdID0gc291cmNlLmNsaWVudFdpZHRoXG4gICAgb3V0WzFdID0gc291cmNlLmNsaWVudEhlaWdodFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBjbGFtcFxuXG5mdW5jdGlvbiBjbGFtcCh2YWx1ZSwgbWluLCBtYXgpIHtcbiAgcmV0dXJuIG1pbiA8IG1heFxuICAgID8gKHZhbHVlIDwgbWluID8gbWluIDogdmFsdWUgPiBtYXggPyBtYXggOiB2YWx1ZSlcbiAgICA6ICh2YWx1ZSA8IG1heCA/IG1heCA6IHZhbHVlID4gbWluID8gbWluIDogdmFsdWUpXG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoYXJndW1lbnRzW2ldICE9PSB1bmRlZmluZWQpIHJldHVybiBhcmd1bWVudHNbaV07XG4gICAgfVxufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gaW52ZXJ0XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgaW52ZXJzZSBvZiBhIHF1YXRcbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7cXVhdH0gYSBxdWF0IHRvIGNhbGN1bGF0ZSBpbnZlcnNlIG9mXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKi9cbmZ1bmN0aW9uIGludmVydCAob3V0LCBhKSB7XG4gIHZhciBhMCA9IGFbMF0sIGExID0gYVsxXSwgYTIgPSBhWzJdLCBhMyA9IGFbM10sXG4gICAgZG90ID0gYTAgKiBhMCArIGExICogYTEgKyBhMiAqIGEyICsgYTMgKiBhMyxcbiAgICBpbnZEb3QgPSBkb3QgPyAxLjAgLyBkb3QgOiAwXG5cbiAgLy8gVE9ETzogV291bGQgYmUgZmFzdGVyIHRvIHJldHVybiBbMCwwLDAsMF0gaW1tZWRpYXRlbHkgaWYgZG90ID09IDBcblxuICBvdXRbMF0gPSAtYTAgKiBpbnZEb3RcbiAgb3V0WzFdID0gLWExICogaW52RG90XG4gIG91dFsyXSA9IC1hMiAqIGludkRvdFxuICBvdXRbM10gPSBhMyAqIGludkRvdFxuICByZXR1cm4gb3V0XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IG5vcm1hbGl6ZVxuXG4vKipcbiAqIE5vcm1hbGl6ZSBhIHZlYzRcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWM0fSBhIHZlY3RvciB0byBub3JtYWxpemVcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcbiAqL1xuZnVuY3Rpb24gbm9ybWFsaXplIChvdXQsIGEpIHtcbiAgdmFyIHggPSBhWzBdLFxuICAgIHkgPSBhWzFdLFxuICAgIHogPSBhWzJdLFxuICAgIHcgPSBhWzNdXG4gIHZhciBsZW4gPSB4ICogeCArIHkgKiB5ICsgeiAqIHogKyB3ICogd1xuICBpZiAobGVuID4gMCkge1xuICAgIGxlbiA9IDEgLyBNYXRoLnNxcnQobGVuKVxuICAgIG91dFswXSA9IHggKiBsZW5cbiAgICBvdXRbMV0gPSB5ICogbGVuXG4gICAgb3V0WzJdID0geiAqIGxlblxuICAgIG91dFszXSA9IHcgKiBsZW5cbiAgfVxuICByZXR1cm4gb3V0XG59XG4iLCIvKipcbiAqIE5vcm1hbGl6ZSBhIHF1YXRcbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7cXVhdH0gYSBxdWF0ZXJuaW9uIHRvIG5vcm1hbGl6ZVxuICogQHJldHVybnMge3F1YXR9IG91dFxuICogQGZ1bmN0aW9uXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnZ2wtdmVjNC9ub3JtYWxpemUnKVxuIiwibW9kdWxlLmV4cG9ydHMgPSBhZGQ7XG5cbi8qKlxuICogQWRkcyB0d28gdmVjMydzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG5mdW5jdGlvbiBhZGQob3V0LCBhLCBiKSB7XG4gICAgb3V0WzBdID0gYVswXSArIGJbMF1cbiAgICBvdXRbMV0gPSBhWzFdICsgYlsxXVxuICAgIG91dFsyXSA9IGFbMl0gKyBiWzJdXG4gICAgcmV0dXJuIG91dFxufSIsIm1vZHVsZS5leHBvcnRzID0gY29weTtcblxuLyoqXG4gKiBDb3B5IHRoZSB2YWx1ZXMgZnJvbSBvbmUgdmVjMyB0byBhbm90aGVyXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgc291cmNlIHZlY3RvclxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG5mdW5jdGlvbiBjb3B5KG91dCwgYSkge1xuICAgIG91dFswXSA9IGFbMF1cbiAgICBvdXRbMV0gPSBhWzFdXG4gICAgb3V0WzJdID0gYVsyXVxuICAgIHJldHVybiBvdXRcbn0iLCJtb2R1bGUuZXhwb3J0cyA9IGNyb3NzO1xuXG4vKipcbiAqIENvbXB1dGVzIHRoZSBjcm9zcyBwcm9kdWN0IG9mIHR3byB2ZWMzJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbmZ1bmN0aW9uIGNyb3NzKG91dCwgYSwgYikge1xuICAgIHZhciBheCA9IGFbMF0sIGF5ID0gYVsxXSwgYXogPSBhWzJdLFxuICAgICAgICBieCA9IGJbMF0sIGJ5ID0gYlsxXSwgYnogPSBiWzJdXG5cbiAgICBvdXRbMF0gPSBheSAqIGJ6IC0gYXogKiBieVxuICAgIG91dFsxXSA9IGF6ICogYnggLSBheCAqIGJ6XG4gICAgb3V0WzJdID0gYXggKiBieSAtIGF5ICogYnhcbiAgICByZXR1cm4gb3V0XG59IiwibW9kdWxlLmV4cG9ydHMgPSBkb3Q7XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgZG90IHByb2R1Y3Qgb2YgdHdvIHZlYzMnc1xuICpcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge051bWJlcn0gZG90IHByb2R1Y3Qgb2YgYSBhbmQgYlxuICovXG5mdW5jdGlvbiBkb3QoYSwgYikge1xuICAgIHJldHVybiBhWzBdICogYlswXSArIGFbMV0gKiBiWzFdICsgYVsyXSAqIGJbMl1cbn0iLCJtb2R1bGUuZXhwb3J0cyA9IGxlbmd0aDtcblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBsZW5ndGggb2YgYSB2ZWMzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBhIHZlY3RvciB0byBjYWxjdWxhdGUgbGVuZ3RoIG9mXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBsZW5ndGggb2YgYVxuICovXG5mdW5jdGlvbiBsZW5ndGgoYSkge1xuICAgIHZhciB4ID0gYVswXSxcbiAgICAgICAgeSA9IGFbMV0sXG4gICAgICAgIHogPSBhWzJdXG4gICAgcmV0dXJuIE1hdGguc3FydCh4KnggKyB5KnkgKyB6KnopXG59IiwibW9kdWxlLmV4cG9ydHMgPSBub3JtYWxpemU7XG5cbi8qKlxuICogTm9ybWFsaXplIGEgdmVjM1xuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdmVjdG9yIHRvIG5vcm1hbGl6ZVxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG5mdW5jdGlvbiBub3JtYWxpemUob3V0LCBhKSB7XG4gICAgdmFyIHggPSBhWzBdLFxuICAgICAgICB5ID0gYVsxXSxcbiAgICAgICAgeiA9IGFbMl1cbiAgICB2YXIgbGVuID0geCp4ICsgeSp5ICsgeip6XG4gICAgaWYgKGxlbiA+IDApIHtcbiAgICAgICAgLy9UT0RPOiBldmFsdWF0ZSB1c2Ugb2YgZ2xtX2ludnNxcnQgaGVyZT9cbiAgICAgICAgbGVuID0gMSAvIE1hdGguc3FydChsZW4pXG4gICAgICAgIG91dFswXSA9IGFbMF0gKiBsZW5cbiAgICAgICAgb3V0WzFdID0gYVsxXSAqIGxlblxuICAgICAgICBvdXRbMl0gPSBhWzJdICogbGVuXG4gICAgfVxuICAgIHJldHVybiBvdXRcbn0iLCJtb2R1bGUuZXhwb3J0cyA9IHNldDtcblxuLyoqXG4gKiBTZXQgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWMzIHRvIHRoZSBnaXZlbiB2YWx1ZXNcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHtOdW1iZXJ9IHggWCBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB5IFkgY29tcG9uZW50XG4gKiBAcGFyYW0ge051bWJlcn0geiBaIGNvbXBvbmVudFxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG5mdW5jdGlvbiBzZXQob3V0LCB4LCB5LCB6KSB7XG4gICAgb3V0WzBdID0geFxuICAgIG91dFsxXSA9IHlcbiAgICBvdXRbMl0gPSB6XG4gICAgcmV0dXJuIG91dFxufSIsIm1vZHVsZS5leHBvcnRzID0gc3VidHJhY3Q7XG5cbi8qKlxuICogU3VidHJhY3RzIHZlY3RvciBiIGZyb20gdmVjdG9yIGFcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbmZ1bmN0aW9uIHN1YnRyYWN0KG91dCwgYSwgYikge1xuICAgIG91dFswXSA9IGFbMF0gLSBiWzBdXG4gICAgb3V0WzFdID0gYVsxXSAtIGJbMV1cbiAgICBvdXRbMl0gPSBhWzJdIC0gYlsyXVxuICAgIHJldHVybiBvdXRcbn0iLCJtb2R1bGUuZXhwb3J0cyA9IHRyYW5zZm9ybVF1YXQ7XG5cbi8qKlxuICogVHJhbnNmb3JtcyB0aGUgdmVjMyB3aXRoIGEgcXVhdFxuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIHZlY3RvciB0byB0cmFuc2Zvcm1cbiAqIEBwYXJhbSB7cXVhdH0gcSBxdWF0ZXJuaW9uIHRvIHRyYW5zZm9ybSB3aXRoXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbmZ1bmN0aW9uIHRyYW5zZm9ybVF1YXQob3V0LCBhLCBxKSB7XG4gICAgLy8gYmVuY2htYXJrczogaHR0cDovL2pzcGVyZi5jb20vcXVhdGVybmlvbi10cmFuc2Zvcm0tdmVjMy1pbXBsZW1lbnRhdGlvbnNcblxuICAgIHZhciB4ID0gYVswXSwgeSA9IGFbMV0sIHogPSBhWzJdLFxuICAgICAgICBxeCA9IHFbMF0sIHF5ID0gcVsxXSwgcXogPSBxWzJdLCBxdyA9IHFbM10sXG5cbiAgICAgICAgLy8gY2FsY3VsYXRlIHF1YXQgKiB2ZWNcbiAgICAgICAgaXggPSBxdyAqIHggKyBxeSAqIHogLSBxeiAqIHksXG4gICAgICAgIGl5ID0gcXcgKiB5ICsgcXogKiB4IC0gcXggKiB6LFxuICAgICAgICBpeiA9IHF3ICogeiArIHF4ICogeSAtIHF5ICogeCxcbiAgICAgICAgaXcgPSAtcXggKiB4IC0gcXkgKiB5IC0gcXogKiB6XG5cbiAgICAvLyBjYWxjdWxhdGUgcmVzdWx0ICogaW52ZXJzZSBxdWF0XG4gICAgb3V0WzBdID0gaXggKiBxdyArIGl3ICogLXF4ICsgaXkgKiAtcXogLSBpeiAqIC1xeVxuICAgIG91dFsxXSA9IGl5ICogcXcgKyBpdyAqIC1xeSArIGl6ICogLXF4IC0gaXggKiAtcXpcbiAgICBvdXRbMl0gPSBpeiAqIHF3ICsgaXcgKiAtcXogKyBpeCAqIC1xeSAtIGl5ICogLXF4XG4gICAgcmV0dXJuIG91dFxufSIsInZhciByb290UG9zaXRpb24gPSB7IGxlZnQ6IDAsIHRvcDogMCB9XG5cbm1vZHVsZS5leHBvcnRzID0gbW91c2VFdmVudE9mZnNldFxuZnVuY3Rpb24gbW91c2VFdmVudE9mZnNldCAoZXYsIHRhcmdldCwgb3V0KSB7XG4gIHRhcmdldCA9IHRhcmdldCB8fCBldi5jdXJyZW50VGFyZ2V0IHx8IGV2LnNyY0VsZW1lbnRcbiAgaWYgKCFBcnJheS5pc0FycmF5KG91dCkpIHtcbiAgICBvdXQgPSBbIDAsIDAgXVxuICB9XG4gIHZhciBjeCA9IGV2LmNsaWVudFggfHwgMFxuICB2YXIgY3kgPSBldi5jbGllbnRZIHx8IDBcbiAgdmFyIHJlY3QgPSBnZXRCb3VuZGluZ0NsaWVudE9mZnNldCh0YXJnZXQpXG4gIG91dFswXSA9IGN4IC0gcmVjdC5sZWZ0XG4gIG91dFsxXSA9IGN5IC0gcmVjdC50b3BcbiAgcmV0dXJuIG91dFxufVxuXG5mdW5jdGlvbiBnZXRCb3VuZGluZ0NsaWVudE9mZnNldCAoZWxlbWVudCkge1xuICBpZiAoZWxlbWVudCA9PT0gd2luZG93IHx8XG4gICAgICBlbGVtZW50ID09PSBkb2N1bWVudCB8fFxuICAgICAgZWxlbWVudCA9PT0gZG9jdW1lbnQuYm9keSkge1xuICAgIHJldHVybiByb290UG9zaXRpb25cbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICB9XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHBhcnNlVW5pdChzdHIsIG91dCkge1xuICAgIGlmICghb3V0KVxuICAgICAgICBvdXQgPSBbIDAsICcnIF1cblxuICAgIHN0ciA9IFN0cmluZyhzdHIpXG4gICAgdmFyIG51bSA9IHBhcnNlRmxvYXQoc3RyLCAxMClcbiAgICBvdXRbMF0gPSBudW1cbiAgICBvdXRbMV0gPSBzdHIubWF0Y2goL1tcXGQuXFwtXFwrXSpcXHMqKC4qKS8pWzFdIHx8ICcnXG4gICAgcmV0dXJuIG91dFxufSIsIid1c2Ugc3RyaWN0J1xuXG52YXIgcGFyc2VVbml0ID0gcmVxdWlyZSgncGFyc2UtdW5pdCcpXG5cbm1vZHVsZS5leHBvcnRzID0gdG9QWFxuXG52YXIgUElYRUxTX1BFUl9JTkNIID0gOTZcblxuZnVuY3Rpb24gZ2V0UHJvcGVydHlJblBYKGVsZW1lbnQsIHByb3ApIHtcbiAgdmFyIHBhcnRzID0gcGFyc2VVbml0KGdldENvbXB1dGVkU3R5bGUoZWxlbWVudCkuZ2V0UHJvcGVydHlWYWx1ZShwcm9wKSlcbiAgcmV0dXJuIHBhcnRzWzBdICogdG9QWChwYXJ0c1sxXSwgZWxlbWVudClcbn1cblxuLy9UaGlzIGJydXRhbCBoYWNrIGlzIG5lZWRlZFxuZnVuY3Rpb24gZ2V0U2l6ZUJydXRhbCh1bml0LCBlbGVtZW50KSB7XG4gIHZhciB0ZXN0RElWID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgdGVzdERJVi5zdHlsZVsnZm9udC1zaXplJ10gPSAnMTI4JyArIHVuaXRcbiAgZWxlbWVudC5hcHBlbmRDaGlsZCh0ZXN0RElWKVxuICB2YXIgc2l6ZSA9IGdldFByb3BlcnR5SW5QWCh0ZXN0RElWLCAnZm9udC1zaXplJykgLyAxMjhcbiAgZWxlbWVudC5yZW1vdmVDaGlsZCh0ZXN0RElWKVxuICByZXR1cm4gc2l6ZVxufVxuXG5mdW5jdGlvbiB0b1BYKHN0ciwgZWxlbWVudCkge1xuICBlbGVtZW50ID0gZWxlbWVudCB8fCBkb2N1bWVudC5ib2R5XG4gIHN0ciA9IChzdHIgfHwgJ3B4JykudHJpbSgpLnRvTG93ZXJDYXNlKClcbiAgaWYoZWxlbWVudCA9PT0gd2luZG93IHx8IGVsZW1lbnQgPT09IGRvY3VtZW50KSB7XG4gICAgZWxlbWVudCA9IGRvY3VtZW50LmJvZHkgXG4gIH1cbiAgc3dpdGNoKHN0cikge1xuICAgIGNhc2UgJyUnOiAgLy9BbWJpZ3VvdXMsIG5vdCBzdXJlIGlmIHdlIHNob3VsZCB1c2Ugd2lkdGggb3IgaGVpZ2h0XG4gICAgICByZXR1cm4gZWxlbWVudC5jbGllbnRIZWlnaHQgLyAxMDAuMFxuICAgIGNhc2UgJ2NoJzpcbiAgICBjYXNlICdleCc6XG4gICAgICByZXR1cm4gZ2V0U2l6ZUJydXRhbChzdHIsIGVsZW1lbnQpXG4gICAgY2FzZSAnZW0nOlxuICAgICAgcmV0dXJuIGdldFByb3BlcnR5SW5QWChlbGVtZW50LCAnZm9udC1zaXplJylcbiAgICBjYXNlICdyZW0nOlxuICAgICAgcmV0dXJuIGdldFByb3BlcnR5SW5QWChkb2N1bWVudC5ib2R5LCAnZm9udC1zaXplJylcbiAgICBjYXNlICd2dyc6XG4gICAgICByZXR1cm4gd2luZG93LmlubmVyV2lkdGgvMTAwXG4gICAgY2FzZSAndmgnOlxuICAgICAgcmV0dXJuIHdpbmRvdy5pbm5lckhlaWdodC8xMDBcbiAgICBjYXNlICd2bWluJzpcbiAgICAgIHJldHVybiBNYXRoLm1pbih3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KSAvIDEwMFxuICAgIGNhc2UgJ3ZtYXgnOlxuICAgICAgcmV0dXJuIE1hdGgubWF4KHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQpIC8gMTAwXG4gICAgY2FzZSAnaW4nOlxuICAgICAgcmV0dXJuIFBJWEVMU19QRVJfSU5DSFxuICAgIGNhc2UgJ2NtJzpcbiAgICAgIHJldHVybiBQSVhFTFNfUEVSX0lOQ0ggLyAyLjU0XG4gICAgY2FzZSAnbW0nOlxuICAgICAgcmV0dXJuIFBJWEVMU19QRVJfSU5DSCAvIDI1LjRcbiAgICBjYXNlICdwdCc6XG4gICAgICByZXR1cm4gUElYRUxTX1BFUl9JTkNIIC8gNzJcbiAgICBjYXNlICdwYyc6XG4gICAgICByZXR1cm4gUElYRUxTX1BFUl9JTkNIIC8gNlxuICB9XG4gIHJldHVybiAxXG59IiwiJ3VzZSBzdHJpY3QnXG5cbnZhciB0b1BYID0gcmVxdWlyZSgndG8tcHgnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IG1vdXNlV2hlZWxMaXN0ZW5cblxuZnVuY3Rpb24gbW91c2VXaGVlbExpc3RlbihlbGVtZW50LCBjYWxsYmFjaywgbm9TY3JvbGwpIHtcbiAgaWYodHlwZW9mIGVsZW1lbnQgPT09ICdmdW5jdGlvbicpIHtcbiAgICBub1Njcm9sbCA9ICEhY2FsbGJhY2tcbiAgICBjYWxsYmFjayA9IGVsZW1lbnRcbiAgICBlbGVtZW50ID0gd2luZG93XG4gIH1cbiAgdmFyIGxpbmVIZWlnaHQgPSB0b1BYKCdleCcsIGVsZW1lbnQpXG4gIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignd2hlZWwnLCBmdW5jdGlvbihldikge1xuICAgIGlmKG5vU2Nyb2xsKSB7XG4gICAgICBldi5wcmV2ZW50RGVmYXVsdCgpXG4gICAgfVxuICAgIHZhciBkeCA9IGV2LmRlbHRhWCB8fCAwXG4gICAgdmFyIGR5ID0gZXYuZGVsdGFZIHx8IDBcbiAgICB2YXIgZHogPSBldi5kZWx0YVogfHwgMFxuICAgIHZhciBtb2RlID0gZXYuZGVsdGFNb2RlXG4gICAgdmFyIHNjYWxlID0gMVxuICAgIHN3aXRjaChtb2RlKSB7XG4gICAgICBjYXNlIDE6XG4gICAgICAgIHNjYWxlID0gbGluZUhlaWdodFxuICAgICAgYnJlYWtcbiAgICAgIGNhc2UgMjpcbiAgICAgICAgc2NhbGUgPSB3aW5kb3cuaW5uZXJIZWlnaHRcbiAgICAgIGJyZWFrXG4gICAgfVxuICAgIGR4ICo9IHNjYWxlXG4gICAgZHkgKj0gc2NhbGVcbiAgICBkeiAqPSBzY2FsZVxuICAgIGlmKGR4IHx8IGR5IHx8IGR6KSB7XG4gICAgICByZXR1cm4gY2FsbGJhY2soZHgsIGR5LCBkeilcbiAgICB9XG4gIH0pXG59IiwiLy8gT3JpZ2luYWwgaW1wbGVtZW50YXRpb246XG4vLyBodHRwOi8vbG9sZW5naW5lLm5ldC9ibG9nLzIwMTQvMDIvMjQvcXVhdGVybmlvbi1mcm9tLXR3by12ZWN0b3JzLWZpbmFsXG5cbnZhciBkb3QgPSByZXF1aXJlKCdnbC12ZWMzL2RvdCcpXG52YXIgc2V0ID0gcmVxdWlyZSgnZ2wtdmVjMy9zZXQnKVxudmFyIG5vcm1hbGl6ZSA9IHJlcXVpcmUoJ2dsLXF1YXQvbm9ybWFsaXplJylcbnZhciBjcm9zcyA9IHJlcXVpcmUoJ2dsLXZlYzMvY3Jvc3MnKVxuXG52YXIgdG1wID0gWzAsIDAsIDBdXG52YXIgRVBTID0gMWUtNlxuXG5tb2R1bGUuZXhwb3J0cyA9IHF1YXRGcm9tVW5pdFZlYzNcbmZ1bmN0aW9uIHF1YXRGcm9tVW5pdFZlYzMgKG91dCwgYSwgYikge1xuICAvLyBhc3N1bWVzIGEgYW5kIGIgYXJlIG5vcm1hbGl6ZWRcbiAgdmFyIHIgPSBkb3QoYSwgYikgKyAxXG4gIGlmIChyIDwgRVBTKSB7XG4gICAgLyogSWYgdSBhbmQgdiBhcmUgZXhhY3RseSBvcHBvc2l0ZSwgcm90YXRlIDE4MCBkZWdyZWVzXG4gICAgICogYXJvdW5kIGFuIGFyYml0cmFyeSBvcnRob2dvbmFsIGF4aXMuIEF4aXMgbm9ybWFsaXNhdGlvblxuICAgICAqIGNhbiBoYXBwZW4gbGF0ZXIsIHdoZW4gd2Ugbm9ybWFsaXNlIHRoZSBxdWF0ZXJuaW9uLiAqL1xuICAgIHIgPSAwXG4gICAgaWYgKE1hdGguYWJzKGFbMF0pID4gTWF0aC5hYnMoYVsyXSkpIHtcbiAgICAgIHNldCh0bXAsIC1hWzFdLCBhWzBdLCAwKVxuICAgIH0gZWxzZSB7XG4gICAgICBzZXQodG1wLCAwLCAtYVsyXSwgYVsxXSlcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgLyogT3RoZXJ3aXNlLCBidWlsZCBxdWF0ZXJuaW9uIHRoZSBzdGFuZGFyZCB3YXkuICovXG4gICAgY3Jvc3ModG1wLCBhLCBiKVxuICB9XG5cbiAgb3V0WzBdID0gdG1wWzBdXG4gIG91dFsxXSA9IHRtcFsxXVxuICBvdXRbMl0gPSB0bXBbMl1cbiAgb3V0WzNdID0gclxuICBub3JtYWxpemUob3V0LCBvdXQpXG4gIHJldHVybiBvdXRcbn1cbiIsInZhciBnZXREaXN0YW5jZSA9IHJlcXVpcmUoJ2dsLXZlYzIvZGlzdGFuY2UnKVxudmFyIEV2ZW50RW1pdHRlciA9IHJlcXVpcmUoJ2V2ZW50cycpLkV2ZW50RW1pdHRlclxudmFyIGRwcm9wID0gcmVxdWlyZSgnZHByb3AnKVxudmFyIGV2ZW50T2Zmc2V0ID0gcmVxdWlyZSgnbW91c2UtZXZlbnQtb2Zmc2V0JylcblxubW9kdWxlLmV4cG9ydHMgPSB0b3VjaFBpbmNoXG5mdW5jdGlvbiB0b3VjaFBpbmNoICh0YXJnZXQpIHtcbiAgdGFyZ2V0ID0gdGFyZ2V0IHx8IHdpbmRvd1xuXG4gIHZhciBlbWl0dGVyID0gbmV3IEV2ZW50RW1pdHRlcigpXG4gIHZhciBmaW5nZXJzID0gWyBudWxsLCBudWxsIF1cbiAgdmFyIGFjdGl2ZUNvdW50ID0gMFxuXG4gIHZhciBsYXN0RGlzdGFuY2UgPSAwXG4gIHZhciBlbmRlZCA9IGZhbHNlXG4gIHZhciBlbmFibGVkID0gZmFsc2VcblxuICAvLyBzb21lIHJlYWQtb25seSB2YWx1ZXNcbiAgT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoZW1pdHRlciwge1xuICAgIHBpbmNoaW5nOiBkcHJvcChmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gYWN0aXZlQ291bnQgPT09IDJcbiAgICB9KSxcblxuICAgIGZpbmdlcnM6IGRwcm9wKGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBmaW5nZXJzXG4gICAgfSlcbiAgfSlcblxuICBlbmFibGUoKVxuICBlbWl0dGVyLmVuYWJsZSA9IGVuYWJsZVxuICBlbWl0dGVyLmRpc2FibGUgPSBkaXNhYmxlXG4gIGVtaXR0ZXIuaW5kZXhPZlRvdWNoID0gaW5kZXhPZlRvdWNoXG4gIHJldHVybiBlbWl0dGVyXG5cbiAgZnVuY3Rpb24gaW5kZXhPZlRvdWNoICh0b3VjaCkge1xuICAgIHZhciBpZCA9IHRvdWNoLmlkZW50aWZpZXJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGZpbmdlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChmaW5nZXJzW2ldICYmXG4gICAgICAgIGZpbmdlcnNbaV0udG91Y2ggJiZcbiAgICAgICAgZmluZ2Vyc1tpXS50b3VjaC5pZGVudGlmaWVyID09PSBpZCkge1xuICAgICAgICByZXR1cm4gaVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gLTFcbiAgfVxuXG4gIGZ1bmN0aW9uIGVuYWJsZSAoKSB7XG4gICAgaWYgKGVuYWJsZWQpIHJldHVyblxuICAgIGVuYWJsZWQgPSB0cnVlXG4gICAgdGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBvblRvdWNoU3RhcnQsIGZhbHNlKVxuICAgIHRhcmdldC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCBvblRvdWNoTW92ZSwgZmFsc2UpXG4gICAgdGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgb25Ub3VjaFJlbW92ZWQsIGZhbHNlKVxuICAgIHRhcmdldC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGNhbmNlbCcsIG9uVG91Y2hSZW1vdmVkLCBmYWxzZSlcbiAgfVxuXG4gIGZ1bmN0aW9uIGRpc2FibGUgKCkge1xuICAgIGlmICghZW5hYmxlZCkgcmV0dXJuXG4gICAgZW5hYmxlZCA9IGZhbHNlXG4gICAgdGFyZ2V0LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBvblRvdWNoU3RhcnQsIGZhbHNlKVxuICAgIHRhcmdldC5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCBvblRvdWNoTW92ZSwgZmFsc2UpXG4gICAgdGFyZ2V0LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgb25Ub3VjaFJlbW92ZWQsIGZhbHNlKVxuICAgIHRhcmdldC5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaGNhbmNlbCcsIG9uVG91Y2hSZW1vdmVkLCBmYWxzZSlcbiAgfVxuXG4gIGZ1bmN0aW9uIG9uVG91Y2hTdGFydCAoZXYpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGV2LmNoYW5nZWRUb3VjaGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgbmV3VG91Y2ggPSBldi5jaGFuZ2VkVG91Y2hlc1tpXVxuICAgICAgdmFyIGlkID0gbmV3VG91Y2guaWRlbnRpZmllclxuICAgICAgdmFyIGlkeCA9IGluZGV4T2ZUb3VjaChpZClcblxuICAgICAgaWYgKGlkeCA9PT0gLTEgJiYgYWN0aXZlQ291bnQgPCAyKSB7XG4gICAgICAgIHZhciBmaXJzdCA9IGFjdGl2ZUNvdW50ID09PSAwXG5cbiAgICAgICAgLy8gbmV3ZXN0IGFuZCBwcmV2aW91cyBmaW5nZXIgKHByZXZpb3VzIG1heSBiZSB1bmRlZmluZWQpXG4gICAgICAgIHZhciBuZXdJbmRleCA9IGZpbmdlcnNbMF0gPyAxIDogMFxuICAgICAgICB2YXIgb2xkSW5kZXggPSBmaW5nZXJzWzBdID8gMCA6IDFcbiAgICAgICAgdmFyIG5ld0ZpbmdlciA9IG5ldyBGaW5nZXIoKVxuXG4gICAgICAgIC8vIGFkZCB0byBzdGFja1xuICAgICAgICBmaW5nZXJzW25ld0luZGV4XSA9IG5ld0ZpbmdlclxuICAgICAgICBhY3RpdmVDb3VudCsrXG5cbiAgICAgICAgLy8gdXBkYXRlIHRvdWNoIGV2ZW50ICYgcG9zaXRpb25cbiAgICAgICAgbmV3RmluZ2VyLnRvdWNoID0gbmV3VG91Y2hcbiAgICAgICAgZXZlbnRPZmZzZXQobmV3VG91Y2gsIHRhcmdldCwgbmV3RmluZ2VyLnBvc2l0aW9uKVxuXG4gICAgICAgIHZhciBvbGRUb3VjaCA9IGZpbmdlcnNbb2xkSW5kZXhdID8gZmluZ2Vyc1tvbGRJbmRleF0udG91Y2ggOiB1bmRlZmluZWRcbiAgICAgICAgZW1pdHRlci5lbWl0KCdwbGFjZScsIG5ld1RvdWNoLCBvbGRUb3VjaClcblxuICAgICAgICBpZiAoIWZpcnN0KSB7XG4gICAgICAgICAgdmFyIGluaXRpYWxEaXN0YW5jZSA9IGNvbXB1dGVEaXN0YW5jZSgpXG4gICAgICAgICAgZW5kZWQgPSBmYWxzZVxuICAgICAgICAgIGVtaXR0ZXIuZW1pdCgnc3RhcnQnLCBpbml0aWFsRGlzdGFuY2UpXG4gICAgICAgICAgbGFzdERpc3RhbmNlID0gaW5pdGlhbERpc3RhbmNlXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBvblRvdWNoTW92ZSAoZXYpIHtcbiAgICB2YXIgY2hhbmdlZCA9IGZhbHNlXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBldi5jaGFuZ2VkVG91Y2hlcy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIG1vdmVkVG91Y2ggPSBldi5jaGFuZ2VkVG91Y2hlc1tpXVxuICAgICAgdmFyIGlkeCA9IGluZGV4T2ZUb3VjaChtb3ZlZFRvdWNoKVxuICAgICAgaWYgKGlkeCAhPT0gLTEpIHtcbiAgICAgICAgY2hhbmdlZCA9IHRydWVcbiAgICAgICAgZmluZ2Vyc1tpZHhdLnRvdWNoID0gbW92ZWRUb3VjaCAvLyBhdm9pZCBjYWNoaW5nIHRvdWNoZXNcbiAgICAgICAgZXZlbnRPZmZzZXQobW92ZWRUb3VjaCwgdGFyZ2V0LCBmaW5nZXJzW2lkeF0ucG9zaXRpb24pXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGFjdGl2ZUNvdW50ID09PSAyICYmIGNoYW5nZWQpIHtcbiAgICAgIHZhciBjdXJyZW50RGlzdGFuY2UgPSBjb21wdXRlRGlzdGFuY2UoKVxuICAgICAgZW1pdHRlci5lbWl0KCdjaGFuZ2UnLCBjdXJyZW50RGlzdGFuY2UsIGxhc3REaXN0YW5jZSlcbiAgICAgIGxhc3REaXN0YW5jZSA9IGN1cnJlbnREaXN0YW5jZVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIG9uVG91Y2hSZW1vdmVkIChldikge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZXYuY2hhbmdlZFRvdWNoZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciByZW1vdmVkID0gZXYuY2hhbmdlZFRvdWNoZXNbaV1cbiAgICAgIHZhciBpZHggPSBpbmRleE9mVG91Y2gocmVtb3ZlZClcblxuICAgICAgaWYgKGlkeCAhPT0gLTEpIHtcbiAgICAgICAgZmluZ2Vyc1tpZHhdID0gbnVsbFxuICAgICAgICBhY3RpdmVDb3VudC0tXG4gICAgICAgIHZhciBvdGhlcklkeCA9IGlkeCA9PT0gMCA/IDEgOiAwXG4gICAgICAgIHZhciBvdGhlclRvdWNoID0gZmluZ2Vyc1tvdGhlcklkeF0gPyBmaW5nZXJzW290aGVySWR4XS50b3VjaCA6IHVuZGVmaW5lZFxuICAgICAgICBlbWl0dGVyLmVtaXQoJ2xpZnQnLCByZW1vdmVkLCBvdGhlclRvdWNoKVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmICghZW5kZWQgJiYgYWN0aXZlQ291bnQgIT09IDIpIHtcbiAgICAgIGVuZGVkID0gdHJ1ZVxuICAgICAgZW1pdHRlci5lbWl0KCdlbmQnKVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGNvbXB1dGVEaXN0YW5jZSAoKSB7XG4gICAgaWYgKGFjdGl2ZUNvdW50IDwgMikgcmV0dXJuIDBcbiAgICByZXR1cm4gZ2V0RGlzdGFuY2UoZmluZ2Vyc1swXS5wb3NpdGlvbiwgZmluZ2Vyc1sxXS5wb3NpdGlvbilcbiAgfVxufVxuXG5mdW5jdGlvbiBGaW5nZXIgKCkge1xuICB0aGlzLnBvc2l0aW9uID0gWzAsIDBdXG4gIHRoaXMudG91Y2ggPSBudWxsXG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGRlZmF1bHRQcm9wZXJ0eVxuXG5mdW5jdGlvbiBkZWZhdWx0UHJvcGVydHkgKGdldCwgc2V0KSB7XG4gIHJldHVybiB7XG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgZ2V0OiBnZXQsXG4gICAgc2V0OiBzZXRcbiAgfVxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBkaXN0YW5jZVxuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGV1Y2xpZGlhbiBkaXN0YW5jZSBiZXR3ZWVuIHR3byB2ZWMyJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjMn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGRpc3RhbmNlIGJldHdlZW4gYSBhbmQgYlxuICovXG5mdW5jdGlvbiBkaXN0YW5jZShhLCBiKSB7XG4gICAgdmFyIHggPSBiWzBdIC0gYVswXSxcbiAgICAgICAgeSA9IGJbMV0gLSBhWzFdXG4gICAgcmV0dXJuIE1hdGguc3FydCh4KnggKyB5KnkpXG59Il19

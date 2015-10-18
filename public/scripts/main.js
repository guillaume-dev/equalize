(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _modulesEmitter = require('modules/emitter');

var _modulesScene = require('modules/scene');

var _modulesAudio = require('modules/audio');

var emitter = new _modulesEmitter.Emitter();

var audio = new _modulesAudio.Audio(emitter);

var scene = new _modulesScene.Scene(emitter, audio);

scene.init();

},{"modules/audio":2,"modules/emitter":4,"modules/scene":7}],2:[function(require,module,exports){
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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _utils = require('./utils');


var utils = new _utils.Utils();

var Blob = (function () {
  function Blob(scene, emitter) {
    _classCallCheck(this, Blob);

    this.scene = scene;

    this.emitter = emitter;

    this.particlesCount = 10000;

    this.radius = 1;
    this.widthSegments = 175;
    this.heightSegments = 175;
    this.amplitude = 2;

    this.vertexShader = "#define GLSLIFY 1\n//\n// GLSL textureless classic 4D noise \"cnoise\",\n// with an RSL-style periodic variant \"pnoise\".\n// Author:  Stefan Gustavson (stefan.gustavson@liu.se)\n// Version: 2011-08-22\n//\n// Many thanks to Ian McEwan of Ashima Arts for the\n// ideas for permutation and gradient selection.\n//\n// Copyright (c) 2011 Stefan Gustavson. All rights reserved.\n// Distributed under the MIT license. See LICENSE file.\n// https://github.com/ashima/webgl-noise\n//\n\nvec4 mod289_1_0(vec4 x)\n{\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec4 permute_1_1(vec4 x)\n{\n  return mod289_1_0(((x*34.0)+1.0)*x);\n}\n\nvec4 taylorInvSqrt_1_2(vec4 r)\n{\n  return 1.79284291400159 - 0.85373472095314 * r;\n}\n\nvec4 fade_1_3(vec4 t) {\n  return t*t*t*(t*(t*6.0-15.0)+10.0);\n}\n\n// Classic Perlin noise\nfloat cnoise_1_4(vec4 P)\n{\n  vec4 Pi0 = floor(P); // Integer part for indexing\n  vec4 Pi1 = Pi0 + 1.0; // Integer part + 1\n  Pi0 = mod289_1_0(Pi0);\n  Pi1 = mod289_1_0(Pi1);\n  vec4 Pf0 = fract(P); // Fractional part for interpolation\n  vec4 Pf1 = Pf0 - 1.0; // Fractional part - 1.0\n  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);\n  vec4 iy = vec4(Pi0.yy, Pi1.yy);\n  vec4 iz0 = vec4(Pi0.zzzz);\n  vec4 iz1 = vec4(Pi1.zzzz);\n  vec4 iw0 = vec4(Pi0.wwww);\n  vec4 iw1 = vec4(Pi1.wwww);\n\n  vec4 ixy = permute_1_1(permute_1_1(ix) + iy);\n  vec4 ixy0 = permute_1_1(ixy + iz0);\n  vec4 ixy1 = permute_1_1(ixy + iz1);\n  vec4 ixy00 = permute_1_1(ixy0 + iw0);\n  vec4 ixy01 = permute_1_1(ixy0 + iw1);\n  vec4 ixy10 = permute_1_1(ixy1 + iw0);\n  vec4 ixy11 = permute_1_1(ixy1 + iw1);\n\n  vec4 gx00 = ixy00 * (1.0 / 7.0);\n  vec4 gy00 = floor(gx00) * (1.0 / 7.0);\n  vec4 gz00 = floor(gy00) * (1.0 / 6.0);\n  gx00 = fract(gx00) - 0.5;\n  gy00 = fract(gy00) - 0.5;\n  gz00 = fract(gz00) - 0.5;\n  vec4 gw00 = vec4(0.75) - abs(gx00) - abs(gy00) - abs(gz00);\n  vec4 sw00 = step(gw00, vec4(0.0));\n  gx00 -= sw00 * (step(0.0, gx00) - 0.5);\n  gy00 -= sw00 * (step(0.0, gy00) - 0.5);\n\n  vec4 gx01 = ixy01 * (1.0 / 7.0);\n  vec4 gy01 = floor(gx01) * (1.0 / 7.0);\n  vec4 gz01 = floor(gy01) * (1.0 / 6.0);\n  gx01 = fract(gx01) - 0.5;\n  gy01 = fract(gy01) - 0.5;\n  gz01 = fract(gz01) - 0.5;\n  vec4 gw01 = vec4(0.75) - abs(gx01) - abs(gy01) - abs(gz01);\n  vec4 sw01 = step(gw01, vec4(0.0));\n  gx01 -= sw01 * (step(0.0, gx01) - 0.5);\n  gy01 -= sw01 * (step(0.0, gy01) - 0.5);\n\n  vec4 gx10 = ixy10 * (1.0 / 7.0);\n  vec4 gy10 = floor(gx10) * (1.0 / 7.0);\n  vec4 gz10 = floor(gy10) * (1.0 / 6.0);\n  gx10 = fract(gx10) - 0.5;\n  gy10 = fract(gy10) - 0.5;\n  gz10 = fract(gz10) - 0.5;\n  vec4 gw10 = vec4(0.75) - abs(gx10) - abs(gy10) - abs(gz10);\n  vec4 sw10 = step(gw10, vec4(0.0));\n  gx10 -= sw10 * (step(0.0, gx10) - 0.5);\n  gy10 -= sw10 * (step(0.0, gy10) - 0.5);\n\n  vec4 gx11 = ixy11 * (1.0 / 7.0);\n  vec4 gy11 = floor(gx11) * (1.0 / 7.0);\n  vec4 gz11 = floor(gy11) * (1.0 / 6.0);\n  gx11 = fract(gx11) - 0.5;\n  gy11 = fract(gy11) - 0.5;\n  gz11 = fract(gz11) - 0.5;\n  vec4 gw11 = vec4(0.75) - abs(gx11) - abs(gy11) - abs(gz11);\n  vec4 sw11 = step(gw11, vec4(0.0));\n  gx11 -= sw11 * (step(0.0, gx11) - 0.5);\n  gy11 -= sw11 * (step(0.0, gy11) - 0.5);\n\n  vec4 g0000 = vec4(gx00.x,gy00.x,gz00.x,gw00.x);\n  vec4 g1000 = vec4(gx00.y,gy00.y,gz00.y,gw00.y);\n  vec4 g0100 = vec4(gx00.z,gy00.z,gz00.z,gw00.z);\n  vec4 g1100 = vec4(gx00.w,gy00.w,gz00.w,gw00.w);\n  vec4 g0010 = vec4(gx10.x,gy10.x,gz10.x,gw10.x);\n  vec4 g1010 = vec4(gx10.y,gy10.y,gz10.y,gw10.y);\n  vec4 g0110 = vec4(gx10.z,gy10.z,gz10.z,gw10.z);\n  vec4 g1110 = vec4(gx10.w,gy10.w,gz10.w,gw10.w);\n  vec4 g0001 = vec4(gx01.x,gy01.x,gz01.x,gw01.x);\n  vec4 g1001 = vec4(gx01.y,gy01.y,gz01.y,gw01.y);\n  vec4 g0101 = vec4(gx01.z,gy01.z,gz01.z,gw01.z);\n  vec4 g1101 = vec4(gx01.w,gy01.w,gz01.w,gw01.w);\n  vec4 g0011 = vec4(gx11.x,gy11.x,gz11.x,gw11.x);\n  vec4 g1011 = vec4(gx11.y,gy11.y,gz11.y,gw11.y);\n  vec4 g0111 = vec4(gx11.z,gy11.z,gz11.z,gw11.z);\n  vec4 g1111 = vec4(gx11.w,gy11.w,gz11.w,gw11.w);\n\n  vec4 norm00 = taylorInvSqrt_1_2(vec4(dot(g0000, g0000), dot(g0100, g0100), dot(g1000, g1000), dot(g1100, g1100)));\n  g0000 *= norm00.x;\n  g0100 *= norm00.y;\n  g1000 *= norm00.z;\n  g1100 *= norm00.w;\n\n  vec4 norm01 = taylorInvSqrt_1_2(vec4(dot(g0001, g0001), dot(g0101, g0101), dot(g1001, g1001), dot(g1101, g1101)));\n  g0001 *= norm01.x;\n  g0101 *= norm01.y;\n  g1001 *= norm01.z;\n  g1101 *= norm01.w;\n\n  vec4 norm10 = taylorInvSqrt_1_2(vec4(dot(g0010, g0010), dot(g0110, g0110), dot(g1010, g1010), dot(g1110, g1110)));\n  g0010 *= norm10.x;\n  g0110 *= norm10.y;\n  g1010 *= norm10.z;\n  g1110 *= norm10.w;\n\n  vec4 norm11 = taylorInvSqrt_1_2(vec4(dot(g0011, g0011), dot(g0111, g0111), dot(g1011, g1011), dot(g1111, g1111)));\n  g0011 *= norm11.x;\n  g0111 *= norm11.y;\n  g1011 *= norm11.z;\n  g1111 *= norm11.w;\n\n  float n0000 = dot(g0000, Pf0);\n  float n1000 = dot(g1000, vec4(Pf1.x, Pf0.yzw));\n  float n0100 = dot(g0100, vec4(Pf0.x, Pf1.y, Pf0.zw));\n  float n1100 = dot(g1100, vec4(Pf1.xy, Pf0.zw));\n  float n0010 = dot(g0010, vec4(Pf0.xy, Pf1.z, Pf0.w));\n  float n1010 = dot(g1010, vec4(Pf1.x, Pf0.y, Pf1.z, Pf0.w));\n  float n0110 = dot(g0110, vec4(Pf0.x, Pf1.yz, Pf0.w));\n  float n1110 = dot(g1110, vec4(Pf1.xyz, Pf0.w));\n  float n0001 = dot(g0001, vec4(Pf0.xyz, Pf1.w));\n  float n1001 = dot(g1001, vec4(Pf1.x, Pf0.yz, Pf1.w));\n  float n0101 = dot(g0101, vec4(Pf0.x, Pf1.y, Pf0.z, Pf1.w));\n  float n1101 = dot(g1101, vec4(Pf1.xy, Pf0.z, Pf1.w));\n  float n0011 = dot(g0011, vec4(Pf0.xy, Pf1.zw));\n  float n1011 = dot(g1011, vec4(Pf1.x, Pf0.y, Pf1.zw));\n  float n0111 = dot(g0111, vec4(Pf0.x, Pf1.yzw));\n  float n1111 = dot(g1111, Pf1);\n\n  vec4 fade_xyzw = fade_1_3(Pf0);\n  vec4 n_0w = mix(vec4(n0000, n1000, n0100, n1100), vec4(n0001, n1001, n0101, n1101), fade_xyzw.w);\n  vec4 n_1w = mix(vec4(n0010, n1010, n0110, n1110), vec4(n0011, n1011, n0111, n1111), fade_xyzw.w);\n  vec4 n_zw = mix(n_0w, n_1w, fade_xyzw.z);\n  vec2 n_yzw = mix(n_zw.xy, n_zw.zw, fade_xyzw.y);\n  float n_xyzw = mix(n_yzw.x, n_yzw.y, fade_xyzw.x);\n  return 2.2 * n_xyzw;\n}\n\n// Classic Perlin noise, periodic version\nfloat pnoise_1_5(vec4 P, vec4 rep)\n{\n  vec4 Pi0 = mod(floor(P), rep); // Integer part modulo rep\n  vec4 Pi1 = mod(Pi0 + 1.0, rep); // Integer part + 1 mod rep\n  Pi0 = mod289_1_0(Pi0);\n  Pi1 = mod289_1_0(Pi1);\n  vec4 Pf0 = fract(P); // Fractional part for interpolation\n  vec4 Pf1 = Pf0 - 1.0; // Fractional part - 1.0\n  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);\n  vec4 iy = vec4(Pi0.yy, Pi1.yy);\n  vec4 iz0 = vec4(Pi0.zzzz);\n  vec4 iz1 = vec4(Pi1.zzzz);\n  vec4 iw0 = vec4(Pi0.wwww);\n  vec4 iw1 = vec4(Pi1.wwww);\n\n  vec4 ixy = permute_1_1(permute_1_1(ix) + iy);\n  vec4 ixy0 = permute_1_1(ixy + iz0);\n  vec4 ixy1 = permute_1_1(ixy + iz1);\n  vec4 ixy00 = permute_1_1(ixy0 + iw0);\n  vec4 ixy01 = permute_1_1(ixy0 + iw1);\n  vec4 ixy10 = permute_1_1(ixy1 + iw0);\n  vec4 ixy11 = permute_1_1(ixy1 + iw1);\n\n  vec4 gx00 = ixy00 * (1.0 / 7.0);\n  vec4 gy00 = floor(gx00) * (1.0 / 7.0);\n  vec4 gz00 = floor(gy00) * (1.0 / 6.0);\n  gx00 = fract(gx00) - 0.5;\n  gy00 = fract(gy00) - 0.5;\n  gz00 = fract(gz00) - 0.5;\n  vec4 gw00 = vec4(0.75) - abs(gx00) - abs(gy00) - abs(gz00);\n  vec4 sw00 = step(gw00, vec4(0.0));\n  gx00 -= sw00 * (step(0.0, gx00) - 0.5);\n  gy00 -= sw00 * (step(0.0, gy00) - 0.5);\n\n  vec4 gx01 = ixy01 * (1.0 / 7.0);\n  vec4 gy01 = floor(gx01) * (1.0 / 7.0);\n  vec4 gz01 = floor(gy01) * (1.0 / 6.0);\n  gx01 = fract(gx01) - 0.5;\n  gy01 = fract(gy01) - 0.5;\n  gz01 = fract(gz01) - 0.5;\n  vec4 gw01 = vec4(0.75) - abs(gx01) - abs(gy01) - abs(gz01);\n  vec4 sw01 = step(gw01, vec4(0.0));\n  gx01 -= sw01 * (step(0.0, gx01) - 0.5);\n  gy01 -= sw01 * (step(0.0, gy01) - 0.5);\n\n  vec4 gx10 = ixy10 * (1.0 / 7.0);\n  vec4 gy10 = floor(gx10) * (1.0 / 7.0);\n  vec4 gz10 = floor(gy10) * (1.0 / 6.0);\n  gx10 = fract(gx10) - 0.5;\n  gy10 = fract(gy10) - 0.5;\n  gz10 = fract(gz10) - 0.5;\n  vec4 gw10 = vec4(0.75) - abs(gx10) - abs(gy10) - abs(gz10);\n  vec4 sw10 = step(gw10, vec4(0.0));\n  gx10 -= sw10 * (step(0.0, gx10) - 0.5);\n  gy10 -= sw10 * (step(0.0, gy10) - 0.5);\n\n  vec4 gx11 = ixy11 * (1.0 / 7.0);\n  vec4 gy11 = floor(gx11) * (1.0 / 7.0);\n  vec4 gz11 = floor(gy11) * (1.0 / 6.0);\n  gx11 = fract(gx11) - 0.5;\n  gy11 = fract(gy11) - 0.5;\n  gz11 = fract(gz11) - 0.5;\n  vec4 gw11 = vec4(0.75) - abs(gx11) - abs(gy11) - abs(gz11);\n  vec4 sw11 = step(gw11, vec4(0.0));\n  gx11 -= sw11 * (step(0.0, gx11) - 0.5);\n  gy11 -= sw11 * (step(0.0, gy11) - 0.5);\n\n  vec4 g0000 = vec4(gx00.x,gy00.x,gz00.x,gw00.x);\n  vec4 g1000 = vec4(gx00.y,gy00.y,gz00.y,gw00.y);\n  vec4 g0100 = vec4(gx00.z,gy00.z,gz00.z,gw00.z);\n  vec4 g1100 = vec4(gx00.w,gy00.w,gz00.w,gw00.w);\n  vec4 g0010 = vec4(gx10.x,gy10.x,gz10.x,gw10.x);\n  vec4 g1010 = vec4(gx10.y,gy10.y,gz10.y,gw10.y);\n  vec4 g0110 = vec4(gx10.z,gy10.z,gz10.z,gw10.z);\n  vec4 g1110 = vec4(gx10.w,gy10.w,gz10.w,gw10.w);\n  vec4 g0001 = vec4(gx01.x,gy01.x,gz01.x,gw01.x);\n  vec4 g1001 = vec4(gx01.y,gy01.y,gz01.y,gw01.y);\n  vec4 g0101 = vec4(gx01.z,gy01.z,gz01.z,gw01.z);\n  vec4 g1101 = vec4(gx01.w,gy01.w,gz01.w,gw01.w);\n  vec4 g0011 = vec4(gx11.x,gy11.x,gz11.x,gw11.x);\n  vec4 g1011 = vec4(gx11.y,gy11.y,gz11.y,gw11.y);\n  vec4 g0111 = vec4(gx11.z,gy11.z,gz11.z,gw11.z);\n  vec4 g1111 = vec4(gx11.w,gy11.w,gz11.w,gw11.w);\n\n  vec4 norm00 = taylorInvSqrt_1_2(vec4(dot(g0000, g0000), dot(g0100, g0100), dot(g1000, g1000), dot(g1100, g1100)));\n  g0000 *= norm00.x;\n  g0100 *= norm00.y;\n  g1000 *= norm00.z;\n  g1100 *= norm00.w;\n\n  vec4 norm01 = taylorInvSqrt_1_2(vec4(dot(g0001, g0001), dot(g0101, g0101), dot(g1001, g1001), dot(g1101, g1101)));\n  g0001 *= norm01.x;\n  g0101 *= norm01.y;\n  g1001 *= norm01.z;\n  g1101 *= norm01.w;\n\n  vec4 norm10 = taylorInvSqrt_1_2(vec4(dot(g0010, g0010), dot(g0110, g0110), dot(g1010, g1010), dot(g1110, g1110)));\n  g0010 *= norm10.x;\n  g0110 *= norm10.y;\n  g1010 *= norm10.z;\n  g1110 *= norm10.w;\n\n  vec4 norm11 = taylorInvSqrt_1_2(vec4(dot(g0011, g0011), dot(g0111, g0111), dot(g1011, g1011), dot(g1111, g1111)));\n  g0011 *= norm11.x;\n  g0111 *= norm11.y;\n  g1011 *= norm11.z;\n  g1111 *= norm11.w;\n\n  float n0000 = dot(g0000, Pf0);\n  float n1000 = dot(g1000, vec4(Pf1.x, Pf0.yzw));\n  float n0100 = dot(g0100, vec4(Pf0.x, Pf1.y, Pf0.zw));\n  float n1100 = dot(g1100, vec4(Pf1.xy, Pf0.zw));\n  float n0010 = dot(g0010, vec4(Pf0.xy, Pf1.z, Pf0.w));\n  float n1010 = dot(g1010, vec4(Pf1.x, Pf0.y, Pf1.z, Pf0.w));\n  float n0110 = dot(g0110, vec4(Pf0.x, Pf1.yz, Pf0.w));\n  float n1110 = dot(g1110, vec4(Pf1.xyz, Pf0.w));\n  float n0001 = dot(g0001, vec4(Pf0.xyz, Pf1.w));\n  float n1001 = dot(g1001, vec4(Pf1.x, Pf0.yz, Pf1.w));\n  float n0101 = dot(g0101, vec4(Pf0.x, Pf1.y, Pf0.z, Pf1.w));\n  float n1101 = dot(g1101, vec4(Pf1.xy, Pf0.z, Pf1.w));\n  float n0011 = dot(g0011, vec4(Pf0.xy, Pf1.zw));\n  float n1011 = dot(g1011, vec4(Pf1.x, Pf0.y, Pf1.zw));\n  float n0111 = dot(g0111, vec4(Pf0.x, Pf1.yzw));\n  float n1111 = dot(g1111, Pf1);\n\n  vec4 fade_xyzw = fade_1_3(Pf0);\n  vec4 n_0w = mix(vec4(n0000, n1000, n0100, n1100), vec4(n0001, n1001, n0101, n1101), fade_xyzw.w);\n  vec4 n_1w = mix(vec4(n0010, n1010, n0110, n1110), vec4(n0011, n1011, n0111, n1111), fade_xyzw.w);\n  vec4 n_zw = mix(n_0w, n_1w, fade_xyzw.z);\n  vec2 n_yzw = mix(n_zw.xy, n_zw.zw, fade_xyzw.y);\n  float n_xyzw = mix(n_yzw.x, n_yzw.y, fade_xyzw.x);\n  return 2.2 * n_xyzw;\n}\n\nuniform float time;\nuniform float amplitude;\n\nvarying vec2 vUv;\nvarying vec3 vertPos;\nvarying vec3 vNormal, vTangent, vBinormal;\nvarying vec3 vPosition;\n\nvoid main() {\n\n\tvUv = uv;\n\n\tvPosition = position;\n\n    vec3 v = vPosition;\n    float displacement = cos( time * 0.0008 ) * 10.0;\n\n    if ( displacement < 1.0 ) {\n    \tdisplacement = 1.0;\n    }\n\n    vec3 edges = mix( vec3( 3.0 ), vec3(5.0), smoothstep( 0.0, 1.0, v.x ) );\n\n    float easing = 0.8;\n    float dist = distance(vec2(vPosition.x, vPosition.y), vec2(0, 0));\n    float size = 2.0;\n    float magnitude = 25.0;\n\n\t// tangent space vectors for normal mapping\n\tvNormal = normalize( normalMatrix * normal );\n\tvTangent = normalize( normalMatrix * position );\n\tvBinormal = normalize( cross( normal, vTangent ) );\n\n\tvPosition.y += (cnoise_1_4(vec4(vec3(vPosition), (time * easing)))); \n    vPosition.z += (cnoise_1_4(vec4(vec3(vPosition), time * easing)));\n\n    vPosition.x *= cos( dist / size + ( time / 5000.0 ) ) * amplitude;\n    vPosition.y *= sin( dist / size + ( time / 5000.0 ) ) * amplitude;\n\n\t// deform mesh by the distance from the edge\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4( edges * normal + vPosition, 1.0);\n\n\tfloat d = 3.3 * sin( time * 3. + vPosition.y * 5.);\t\t\t\t\t\t\t\t\t\n\n\tvertPos = ( modelViewMatrix * vec4( normal + position, 1.0) ).xyz;\n\n}";

    this.fragmentShader = "#define GLSLIFY 1\nvarying vec3 vNormal;\nvarying vec3 vertPos;\nvarying vec3 vTangent;\nvarying vec3 vBinormal;\nvarying vec2 vUv;\nvarying vec3 vPosition;\nconst vec3 lightPos = vec3(0.0, 150.0, 0.0);\nconst vec3 diffuseColor = vec3( 0.0, 0.3, 0.6);\nconst vec3 specColor = vec3(0.2);\n\nuniform vec2 mouse;\nuniform vec2 resolution;\nuniform float amplitude;\nuniform float time;\n\nfloat hash( float n )\n{\n    return fract(sin(n)*43758.5453);\n}\n\nvec2 hash( vec2 p )\n{\n    p = vec2( dot(p,vec2(127.1,311.7)), dot(p,vec2(269.5,183.3)) );\n    return fract(sin(p)*43758.5453);\n}\n\n/** \n * bump mapping aware phong shading \n *\n * @param 'normal' { vec3 }     - fragment normal\n * @param 'light' { vec3 }      - light position\n * @param 'position' { vec3 }   - fragment position\n * @param 'diffuse' { vec3 }    - diffuse color\n * @param 'spec' { vec3 }       - specular color\n * @return { vec3 }             - phong color \n */\nvec3 phong( in vec3 tanNormal, in vec3 normal, in vec3 light, in vec3 position, in vec3 diffuse, in vec3 spec)\n{\n    vec3 lightDir = normalize(light - position);\n    vec3 reflectDir = reflect( -lightDir, tanNormal);\n    vec3 viewDir = normalize( - position );\n    float lambertian = max( dot( lightDir, normal ), 0.0 );\n    float specular;\n\n    if( lambertian > 0.0 ) {\n        float specAngle = max( dot( reflectDir, viewDir ), 0.01 );\n        specular = pow(specAngle, 4.0);\n    }\n    return lambertian * diffuse + specular * spec;\n}\n\nfloat rand(float x)\n{\n    return fract(sin(x) * 4358.5453123);\n}\n\nfloat rand(vec2 co)\n{\n    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5357);\n}\n\nfloat box(vec2 p, vec2 b, float r)\n{\n  return length(max(abs(p)-b,0.0))-r;\n}\n\n\n\nvec3 blob(vec2 uv, vec3 color, vec2 speed, vec2 size, float time) {\n    vec2 point = vec2(\n        sin(speed.x * time) * size.x,\n        cos(speed.y * time) * size.y\n    );\n\n    float d = 1.0 / distance(uv, point);\n    d = pow(d / 6.5, 2.0);\n    \n    return vec3(color.r * d, color.g * d, color.b * d);\n}\n\nvoid main( void )\n{\n\n    vec3 v = vPosition;\n\n    vec3 edges = mix( diffuseColor, 2.5 * diffuseColor, smoothstep( 0.0, 1.5, v.x ) );\n\n    vec3 tanNormal = normalize( (vTangent * v.x) + (vBinormal * v.y) + (vNormal * v.z) );\n\n    vec3 diff = phong( tanNormal, vNormal, vec3(mouse,100.0), vertPos, edges, specColor);\n\n    float opacity = ( gl_FragCoord.x + 0.5 ) / gl_FragCoord.x;\n\n    float pulse = 1.0;\n\n    vec2 uv = gl_FragCoord.xy / resolution.xy - 0.5;\n    diff += pulse * diffuseColor * 0.5 * ( 0.9 - cos(uv.x * 4.0) );\n    diff -= rand(uv) * 0.04;\n\n    // gl_FragColor = vec4(diff, opacity);\n\n\n    \n    //////////////////////////\n    //  Rim lighting shader //\n    //////////////////////////\n\n    vec3 veye = normalize(-vPosition);       \n       \n    float vdn = 0.9 + dot(veye, vNormal);        // the rim contribution\n\n    if(vdn < 0.4) {\n        discard;\n    }\n\n    float rim = smoothstep(0.5, 1.0, vdn);\n\n    gl_FragColor = vec4(vec3(clamp(rim, 0.0, 1.0) * 1.0 * diffuseColor), 1.0);\n}";

    // let texture = THREE.ImageUtils.loadTexture( "images/noisebw.png" );
    // texture.wrapS = THREE.RepeatWrapping;
    // texture.wrapT = THREE.RepeatWrapping;
    // texture.repeat.set( 4, 4 );

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        "time": { type: "f", value: 0 },
        "amplitude": { type: "f", value: this.amplitude },
        "resolution": { type: "v2", value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
      },
      // texture: { type: "t", value: texture }
      side: THREE.DoubleSide,
      vertexShader: this.vertexShader,
      fragmentShader: this.fragmentShader,
      shading: THREE.SmoothShading,
      transparent: true
    });

    var geometry = new THREE.SphereGeometry(this.radius, this.widthSegments, this.heightSegments);
    // let geometry = new THREE.CircleGeometry( this.radius, this.widthSegments );
    this.geometry = geometry;

    this.mesh = new THREE.Mesh(this.geometry, this.material);

    this.mesh.rotation.x = 6;
    this.mesh.rotation.y = -5.8;
    this.mesh.rotation.z = 1.3;

    this.clock = Date.now();

    this.scene.add(this.mesh);
  }

  _createClass(Blob, [{
    key: 'update',
    value: function update(soundData) {

      if (soundData) {

        var time = soundData.time;
        var average = 0;

        for (var i = 0; i < time.length; i++) {
          average += time[i];
        }

        average /= 512;

        var frequence = Math.abs(average - 128);

        if (frequence > 15) {
          this.amplitude += 0.9;
        } else {
          this.amplitude -= 0.1;
        }

        if (this.amplitude < 2) {
          this.amplitude = 2;
        }

        if (this.amplitude > 8) {
          this.amplitude = 8;
        }

        if (this.amplitude > 2.5) {
          this.emitter.emit("zoomOut");
        } else if (this.amplitude < 2.2) {
          this.emitter.emit("zoomIn");
        }
      }

      this.material.uniforms["time"].value = (Date.now() - this.clock) * 0.0008;
      this.mesh.material.uniforms['amplitude'].value = this.amplitude;
    }
  }, {
    key: 'setPosition',
    value: function setPosition(x, y, z) {

      this.mesh.position.x = x;
      this.mesh.position.y = y;
      this.mesh.position.z = z;
    }
  }, {
    key: 'getMesh',
    value: function getMesh() {

      return this.mesh;
    }
  }]);

  return Blob;
})();

exports.Blob = Blob;

},{"./utils":9}],4:[function(require,module,exports){
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

},{"events":11}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Keyboard = (function () {
    function Keyboard(emitter) {
        _classCallCheck(this, Keyboard);

        this.emitter = emitter;

        document.addEventListener("keydown", this.keydown.bind(this));

        this.targets = [];

        this.targetIndex = 0;

        this.target = null;
    }

    _createClass(Keyboard, [{
        key: "keydown",
        value: function keydown(e) {

            console.log(e.keyCode);

            // CTRL
            if (e.keyCode == 17) {

                if (this.targets.length > 0) {
                    this.targetIndex++;

                    if (this.targetIndex == this.targets.length) {
                        this.targetIndex = 0;
                    }

                    this.target = this.targets[this.targetIndex];
                }
            }

            switch (e.keyCode) {

                case 13:
                    // ENTER
                    this.target.position.z -= 0.1;
                    console.log("position.z:", this.target.position.z);
                    break;
                case 32:
                    // SPACE
                    this.target.position.z += 0.1;
                    console.log("position.z:", this.target.position.z);
                    break;
                case 38:
                    // UP
                    this.target.position.y += 0.1;
                    console.log("position.y:", this.target.position.y);
                    break;
                case 40:
                    // DOWN
                    this.target.position.y -= 0.1;
                    console.log("position.y:", this.target.position.y);
                    break;
                case 37:
                    // LEFT
                    this.target.position.x -= 0.1;
                    console.log("position.x:", this.target.position.x);
                    break;
                case 39:
                    // RIGHT
                    this.target.position.x += 0.1;
                    console.log("position.x:", this.target.position.x);
                    break;
                case 65:
                    // A
                    this.target.rotation.z -= 0.1;
                    console.log("rotation.z:", this.target.rotation.z);
                    break;
                case 69:
                    // E
                    this.target.rotation.z += 0.1;
                    console.log("rotation.z:", this.target.rotation.z);
                    break;
                case 90:
                    // Z
                    this.target.rotation.y -= 0.1;
                    console.log("rotation.y:", this.target.rotation.y);
                    break;
                case 83:
                    // S
                    this.target.rotation.y += 0.1;
                    console.log("rotation.y:", this.target.rotation.y);
                    break;
                case 81:
                    // Q
                    this.target.rotation.x -= 0.1;
                    console.log("rotation.x:", this.target.rotation.x);
                    break;
                case 68:
                    // D
                    this.target.rotation.x += 0.1;
                    console.log("rotation.x:", this.target.rotation.x);
                    break;
            }
        }
    }, {
        key: "addObject",
        value: function addObject(object) {

            this.targets.push(object);

            if (this.targets.length == 1) {
                this.target = this.targets[this.targetIndex];
            }
        }
    }]);

    return Keyboard;
})();

exports.Keyboard = Keyboard;

},{}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }



var Ribbon = (function () {
  function Ribbon(scene, emitter) {
    _classCallCheck(this, Ribbon);

    this.scene = scene;

    this.startPoint = new THREE.Vector3(-20, 0, 0);

    this.endPoint = new THREE.Vector3(40, 5, 0);

    this.segments = 30;

    this.vertexShader = "#define GLSLIFY 1\nuniform float time;\nvarying vec3 vNormal;\nuniform float zoom;\nvarying float vari;\nvarying float timevariance;\n\nvoid main() {\n\n    timevariance = 1000.0;\n    vari = 2000.0;\n    float normalRatioRange = 10.0;\n\n    float id;               \n\n    vNormal = normal;\n\n    vec3 newpos = vec3(position.x, position.y , position.z  );   \n\n    gl_Position = projectionMatrix * modelViewMatrix *  vec4( normal * normalRatioRange  + newpos, 1.0);\n\n    // gl_Position = projectionMatrix * modelViewMatrix *  vec4( position, 1.0 );      \n}";

    this.fragmentShader = "#define GLSLIFY 1\nvoid main() {\n\n\tgl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);\n\t\n}";

    this.planeGeometry = new THREE.PlaneGeometry(1, 1, 1, this.segments);

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        time: { type: "f", value: 0 },
        opacity: { type: "f", value: 1.0 },
        endpoint: { type: "v3", value: this.endPoint }
      },
      vertexShader: this.vertexShader,
      fragmentShader: this.fragmentShader,
      shading: THREE.SmoothShading,
      wireframe: true
    });

    var numPoints = 100;

    var spline = new THREE.CatmullRomCurve3([new THREE.Vector3(-20, -10, 0), new THREE.Vector3(-10, -10, 0), new THREE.Vector3(-5, -7, 0), new THREE.Vector3(0, -10, 0), new THREE.Vector3(5, -7, 0), new THREE.Vector3(10, -10, 0), new THREE.Vector3(20, -10, 0)]);

    this.geometry = new THREE.Geometry();
    var splinePoints = spline.getPoints(numPoints);

    for (var i = 0; i < splinePoints.length; i++) {
      this.geometry.vertices.push(splinePoints[i]);
    }

    var material = new THREE.LineBasicMaterial({
      color: 0xff00f0
    });

    this.mesh = new THREE.Line(this.geometry, material);

    // this.mesh.position.x = this.startPoint.x;
    // this.mesh.position.y = this.startPoint.y;
    // this.mesh.position.z = this.startPoint.z;

    this.clock = Date.now();

    this.scene.add(this.mesh);
  }

  _createClass(Ribbon, [{
    key: 'getMesh',
    value: function getMesh() {

      return this.mesh;
    }
  }, {
    key: 'update',
    value: function update(soundData) {}
  }, {
    key: 'getDistance',
    value: function getDistance(v1, v2) {

      return Math.sqrt((v1.x - v2.x) * (v1.x - v2.x) + (v1.y - v2.y) * (v1.y - v2.y));
    }
  }]);

  return Ribbon;
})();

exports.Ribbon = Ribbon;

},{}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _keyboard = require('./keyboard');

var _audio = require('./audio');

var _test = require('./test');

var _blob = require('./blob');

var _warp = require('./warp');

var _ribbon = require('./ribbon');

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
        this.keyboard = null;

        this.params = {
            active: options.active || true,
            height: options.height || window.innerHeight,
            width: options.width || window.innerWidth
        };

        this.mouse = {
            x: null,
            y: null
        };

        this.zooming = false;

        this.blobs = [];

        this.clock = null;
    }

    _createClass(Scene, [{
        key: 'init',
        value: function init() {
            var _this = this;

            this.keyboard = new _keyboard.Keyboard(this.emitter);
            this.scene = new THREE.Scene();
            this.camera = new THREE.PerspectiveCamera(45, this.params.width / this.params.height, 1, 1000);

            this.target = new THREE.Vector3();
            this.camera.lookAt(this.target);

            this.camera.position.z = 35;

            this.keyboard.addObject(this.camera);

            this.sound = new _audio.Audio(this.emitter);

            this.raycaster = new THREE.Raycaster();

            this.test();

            this.addRibbon();

            for (var i = 0; i < 1; i++) {
                this.addBlob();
            };

            this.loadSound();

            this.renderer = new THREE.WebGLRenderer({
                antialias: true
            });

            this.renderer.setClearColor(0x000000, 1);
            this.renderer.setSize(this.params.width, this.params.height);

            this.container.appendChild(this.renderer.domElement);

            this.controls = new Controls({
                distance: 200
            });

            this.clock = Date.now();

            this.addListeners();

            this.animate();

            this.zooming = true;

            TweenMax.to(this.controls, 2, {
                distance: 40,
                onComplete: function onComplete() {
                    _this.zooming = false;
                }
            });
        }
    }, {
        key: 'loadSound',
        value: function loadSound() {

            this.sound.load("music/jedimind.mp3");
        }
    }, {
        key: 'addBlob',
        value: function addBlob() {

            this.blobs.push(new _blob.Blob(this.scene, this.emitter));

            this.keyboard.addObject(this.blobs[0].getMesh());
        }
    }, {
        key: 'addRibbon',
        value: function addRibbon() {

            this.ribbon = new _ribbon.Ribbon(this.scene, this.emitter);

            this.keyboard.addObject(this.ribbon.getMesh());
        }
    }, {
        key: 'addWarp',
        value: function addWarp() {

            this.warp = new _warp.Warp(this.scene, this.emitter);

            this.keyboard.addObject(this.warp.getMesh());
        }
    }, {
        key: 'test',
        value: function test() {

            this.test = new _test.Test(this.scene, this.emitter);

            this.keyboard.addObject(this.test.getMesh());
        }
    }, {
        key: 'animate',
        value: function animate(ts) {

            if (this.params.active) {

                window.requestAnimationFrame(this.animate.bind(this));

                // this.raycaster.setFromCamera( this.mouse, this.camera );  

                // var intersects = this.raycaster.intersectObjects( this.scene.children );

                // for ( var i = 0; i < intersects.length; i++ ) {

                // }

                for (var i = 0; i < this.blobs.length; i++) {
                    this.blobs[i].update(this.sound.getData());
                };

                this.ribbon.update(this.sound.getData());

                this.test.update(this.sound.getData());

                this.render(ts);
            }
        }
    }, {
        key: 'render',
        value: function render() {

            if (!this.params.active) this.params.active = true;

            // const position = this.camera.position.toArray();
            // const direction = this.target.toArray();
            // console.log(position, this.target.fromArray(direction) )
            // this.controls.update(position, direction);
            // this.camera.position.fromArray(position);
            // this.camera.lookAt(this.target.fromArray(direction));

            this.renderer.render(this.scene, this.camera);
        }
    }, {
        key: 'addListeners',
        value: function addListeners() {
            var _this2 = this;

            window.addEventListener('resize', this.onWindowResize.bind(this), false);

            this.emitter.on('zoomOut', function () {
                _this2.zoomOut();
            });

            this.emitter.on('zoomIn', function () {
                _this2.zoomIn();
            });
        }
    }, {
        key: 'zoomOut',
        value: function zoomOut() {
            var _this3 = this;

            if (this.zooming || this.controls.distance == 45) return;

            this.zooming = true;

            TweenMax.to(this.controls, 2, {
                distance: 45,
                onComplete: function onComplete() {
                    _this3.zooming = false;
                }
            });
        }
    }, {
        key: 'zoomIn',
        value: function zoomIn() {
            var _this4 = this;

            if (this.zooming || this.controls.distance == 40) return;

            this.zooming = true;

            TweenMax.to(this.controls, 2, {
                distance: 40,
                onComplete: function onComplete() {
                    _this4.zooming = false;
                }
            });
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

},{"./audio":2,"./blob":3,"./keyboard":5,"./ribbon":6,"./test":8,"./warp":10,"orbit-controls":12}],8:[function(require,module,exports){
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

    this.radius = 10;
    this.widthSegments = 50;
    this.heightSegments = 50;
    this.amplitude = 2;

    this.vertexShader = "#define GLSLIFY 1\n//\n// GLSL textureless classic 4D noise \"cnoise\",\n// with an RSL-style periodic variant \"pnoise\".\n// Author:  Stefan Gustavson (stefan.gustavson@liu.se)\n// Version: 2011-08-22\n//\n// Many thanks to Ian McEwan of Ashima Arts for the\n// ideas for permutation and gradient selection.\n//\n// Copyright (c) 2011 Stefan Gustavson. All rights reserved.\n// Distributed under the MIT license. See LICENSE file.\n// https://github.com/ashima/webgl-noise\n//\n\nvec4 mod289_1_0(vec4 x)\n{\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec4 permute_1_1(vec4 x)\n{\n  return mod289_1_0(((x*34.0)+1.0)*x);\n}\n\nvec4 taylorInvSqrt_1_2(vec4 r)\n{\n  return 1.79284291400159 - 0.85373472095314 * r;\n}\n\nvec4 fade_1_3(vec4 t) {\n  return t*t*t*(t*(t*6.0-15.0)+10.0);\n}\n\n// Classic Perlin noise\nfloat cnoise_1_4(vec4 P)\n{\n  vec4 Pi0 = floor(P); // Integer part for indexing\n  vec4 Pi1 = Pi0 + 1.0; // Integer part + 1\n  Pi0 = mod289_1_0(Pi0);\n  Pi1 = mod289_1_0(Pi1);\n  vec4 Pf0 = fract(P); // Fractional part for interpolation\n  vec4 Pf1 = Pf0 - 1.0; // Fractional part - 1.0\n  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);\n  vec4 iy = vec4(Pi0.yy, Pi1.yy);\n  vec4 iz0 = vec4(Pi0.zzzz);\n  vec4 iz1 = vec4(Pi1.zzzz);\n  vec4 iw0 = vec4(Pi0.wwww);\n  vec4 iw1 = vec4(Pi1.wwww);\n\n  vec4 ixy = permute_1_1(permute_1_1(ix) + iy);\n  vec4 ixy0 = permute_1_1(ixy + iz0);\n  vec4 ixy1 = permute_1_1(ixy + iz1);\n  vec4 ixy00 = permute_1_1(ixy0 + iw0);\n  vec4 ixy01 = permute_1_1(ixy0 + iw1);\n  vec4 ixy10 = permute_1_1(ixy1 + iw0);\n  vec4 ixy11 = permute_1_1(ixy1 + iw1);\n\n  vec4 gx00 = ixy00 * (1.0 / 7.0);\n  vec4 gy00 = floor(gx00) * (1.0 / 7.0);\n  vec4 gz00 = floor(gy00) * (1.0 / 6.0);\n  gx00 = fract(gx00) - 0.5;\n  gy00 = fract(gy00) - 0.5;\n  gz00 = fract(gz00) - 0.5;\n  vec4 gw00 = vec4(0.75) - abs(gx00) - abs(gy00) - abs(gz00);\n  vec4 sw00 = step(gw00, vec4(0.0));\n  gx00 -= sw00 * (step(0.0, gx00) - 0.5);\n  gy00 -= sw00 * (step(0.0, gy00) - 0.5);\n\n  vec4 gx01 = ixy01 * (1.0 / 7.0);\n  vec4 gy01 = floor(gx01) * (1.0 / 7.0);\n  vec4 gz01 = floor(gy01) * (1.0 / 6.0);\n  gx01 = fract(gx01) - 0.5;\n  gy01 = fract(gy01) - 0.5;\n  gz01 = fract(gz01) - 0.5;\n  vec4 gw01 = vec4(0.75) - abs(gx01) - abs(gy01) - abs(gz01);\n  vec4 sw01 = step(gw01, vec4(0.0));\n  gx01 -= sw01 * (step(0.0, gx01) - 0.5);\n  gy01 -= sw01 * (step(0.0, gy01) - 0.5);\n\n  vec4 gx10 = ixy10 * (1.0 / 7.0);\n  vec4 gy10 = floor(gx10) * (1.0 / 7.0);\n  vec4 gz10 = floor(gy10) * (1.0 / 6.0);\n  gx10 = fract(gx10) - 0.5;\n  gy10 = fract(gy10) - 0.5;\n  gz10 = fract(gz10) - 0.5;\n  vec4 gw10 = vec4(0.75) - abs(gx10) - abs(gy10) - abs(gz10);\n  vec4 sw10 = step(gw10, vec4(0.0));\n  gx10 -= sw10 * (step(0.0, gx10) - 0.5);\n  gy10 -= sw10 * (step(0.0, gy10) - 0.5);\n\n  vec4 gx11 = ixy11 * (1.0 / 7.0);\n  vec4 gy11 = floor(gx11) * (1.0 / 7.0);\n  vec4 gz11 = floor(gy11) * (1.0 / 6.0);\n  gx11 = fract(gx11) - 0.5;\n  gy11 = fract(gy11) - 0.5;\n  gz11 = fract(gz11) - 0.5;\n  vec4 gw11 = vec4(0.75) - abs(gx11) - abs(gy11) - abs(gz11);\n  vec4 sw11 = step(gw11, vec4(0.0));\n  gx11 -= sw11 * (step(0.0, gx11) - 0.5);\n  gy11 -= sw11 * (step(0.0, gy11) - 0.5);\n\n  vec4 g0000 = vec4(gx00.x,gy00.x,gz00.x,gw00.x);\n  vec4 g1000 = vec4(gx00.y,gy00.y,gz00.y,gw00.y);\n  vec4 g0100 = vec4(gx00.z,gy00.z,gz00.z,gw00.z);\n  vec4 g1100 = vec4(gx00.w,gy00.w,gz00.w,gw00.w);\n  vec4 g0010 = vec4(gx10.x,gy10.x,gz10.x,gw10.x);\n  vec4 g1010 = vec4(gx10.y,gy10.y,gz10.y,gw10.y);\n  vec4 g0110 = vec4(gx10.z,gy10.z,gz10.z,gw10.z);\n  vec4 g1110 = vec4(gx10.w,gy10.w,gz10.w,gw10.w);\n  vec4 g0001 = vec4(gx01.x,gy01.x,gz01.x,gw01.x);\n  vec4 g1001 = vec4(gx01.y,gy01.y,gz01.y,gw01.y);\n  vec4 g0101 = vec4(gx01.z,gy01.z,gz01.z,gw01.z);\n  vec4 g1101 = vec4(gx01.w,gy01.w,gz01.w,gw01.w);\n  vec4 g0011 = vec4(gx11.x,gy11.x,gz11.x,gw11.x);\n  vec4 g1011 = vec4(gx11.y,gy11.y,gz11.y,gw11.y);\n  vec4 g0111 = vec4(gx11.z,gy11.z,gz11.z,gw11.z);\n  vec4 g1111 = vec4(gx11.w,gy11.w,gz11.w,gw11.w);\n\n  vec4 norm00 = taylorInvSqrt_1_2(vec4(dot(g0000, g0000), dot(g0100, g0100), dot(g1000, g1000), dot(g1100, g1100)));\n  g0000 *= norm00.x;\n  g0100 *= norm00.y;\n  g1000 *= norm00.z;\n  g1100 *= norm00.w;\n\n  vec4 norm01 = taylorInvSqrt_1_2(vec4(dot(g0001, g0001), dot(g0101, g0101), dot(g1001, g1001), dot(g1101, g1101)));\n  g0001 *= norm01.x;\n  g0101 *= norm01.y;\n  g1001 *= norm01.z;\n  g1101 *= norm01.w;\n\n  vec4 norm10 = taylorInvSqrt_1_2(vec4(dot(g0010, g0010), dot(g0110, g0110), dot(g1010, g1010), dot(g1110, g1110)));\n  g0010 *= norm10.x;\n  g0110 *= norm10.y;\n  g1010 *= norm10.z;\n  g1110 *= norm10.w;\n\n  vec4 norm11 = taylorInvSqrt_1_2(vec4(dot(g0011, g0011), dot(g0111, g0111), dot(g1011, g1011), dot(g1111, g1111)));\n  g0011 *= norm11.x;\n  g0111 *= norm11.y;\n  g1011 *= norm11.z;\n  g1111 *= norm11.w;\n\n  float n0000 = dot(g0000, Pf0);\n  float n1000 = dot(g1000, vec4(Pf1.x, Pf0.yzw));\n  float n0100 = dot(g0100, vec4(Pf0.x, Pf1.y, Pf0.zw));\n  float n1100 = dot(g1100, vec4(Pf1.xy, Pf0.zw));\n  float n0010 = dot(g0010, vec4(Pf0.xy, Pf1.z, Pf0.w));\n  float n1010 = dot(g1010, vec4(Pf1.x, Pf0.y, Pf1.z, Pf0.w));\n  float n0110 = dot(g0110, vec4(Pf0.x, Pf1.yz, Pf0.w));\n  float n1110 = dot(g1110, vec4(Pf1.xyz, Pf0.w));\n  float n0001 = dot(g0001, vec4(Pf0.xyz, Pf1.w));\n  float n1001 = dot(g1001, vec4(Pf1.x, Pf0.yz, Pf1.w));\n  float n0101 = dot(g0101, vec4(Pf0.x, Pf1.y, Pf0.z, Pf1.w));\n  float n1101 = dot(g1101, vec4(Pf1.xy, Pf0.z, Pf1.w));\n  float n0011 = dot(g0011, vec4(Pf0.xy, Pf1.zw));\n  float n1011 = dot(g1011, vec4(Pf1.x, Pf0.y, Pf1.zw));\n  float n0111 = dot(g0111, vec4(Pf0.x, Pf1.yzw));\n  float n1111 = dot(g1111, Pf1);\n\n  vec4 fade_xyzw = fade_1_3(Pf0);\n  vec4 n_0w = mix(vec4(n0000, n1000, n0100, n1100), vec4(n0001, n1001, n0101, n1101), fade_xyzw.w);\n  vec4 n_1w = mix(vec4(n0010, n1010, n0110, n1110), vec4(n0011, n1011, n0111, n1111), fade_xyzw.w);\n  vec4 n_zw = mix(n_0w, n_1w, fade_xyzw.z);\n  vec2 n_yzw = mix(n_zw.xy, n_zw.zw, fade_xyzw.y);\n  float n_xyzw = mix(n_yzw.x, n_yzw.y, fade_xyzw.x);\n  return 2.2 * n_xyzw;\n}\n\n// Classic Perlin noise, periodic version\nfloat pnoise_1_5(vec4 P, vec4 rep)\n{\n  vec4 Pi0 = mod(floor(P), rep); // Integer part modulo rep\n  vec4 Pi1 = mod(Pi0 + 1.0, rep); // Integer part + 1 mod rep\n  Pi0 = mod289_1_0(Pi0);\n  Pi1 = mod289_1_0(Pi1);\n  vec4 Pf0 = fract(P); // Fractional part for interpolation\n  vec4 Pf1 = Pf0 - 1.0; // Fractional part - 1.0\n  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);\n  vec4 iy = vec4(Pi0.yy, Pi1.yy);\n  vec4 iz0 = vec4(Pi0.zzzz);\n  vec4 iz1 = vec4(Pi1.zzzz);\n  vec4 iw0 = vec4(Pi0.wwww);\n  vec4 iw1 = vec4(Pi1.wwww);\n\n  vec4 ixy = permute_1_1(permute_1_1(ix) + iy);\n  vec4 ixy0 = permute_1_1(ixy + iz0);\n  vec4 ixy1 = permute_1_1(ixy + iz1);\n  vec4 ixy00 = permute_1_1(ixy0 + iw0);\n  vec4 ixy01 = permute_1_1(ixy0 + iw1);\n  vec4 ixy10 = permute_1_1(ixy1 + iw0);\n  vec4 ixy11 = permute_1_1(ixy1 + iw1);\n\n  vec4 gx00 = ixy00 * (1.0 / 7.0);\n  vec4 gy00 = floor(gx00) * (1.0 / 7.0);\n  vec4 gz00 = floor(gy00) * (1.0 / 6.0);\n  gx00 = fract(gx00) - 0.5;\n  gy00 = fract(gy00) - 0.5;\n  gz00 = fract(gz00) - 0.5;\n  vec4 gw00 = vec4(0.75) - abs(gx00) - abs(gy00) - abs(gz00);\n  vec4 sw00 = step(gw00, vec4(0.0));\n  gx00 -= sw00 * (step(0.0, gx00) - 0.5);\n  gy00 -= sw00 * (step(0.0, gy00) - 0.5);\n\n  vec4 gx01 = ixy01 * (1.0 / 7.0);\n  vec4 gy01 = floor(gx01) * (1.0 / 7.0);\n  vec4 gz01 = floor(gy01) * (1.0 / 6.0);\n  gx01 = fract(gx01) - 0.5;\n  gy01 = fract(gy01) - 0.5;\n  gz01 = fract(gz01) - 0.5;\n  vec4 gw01 = vec4(0.75) - abs(gx01) - abs(gy01) - abs(gz01);\n  vec4 sw01 = step(gw01, vec4(0.0));\n  gx01 -= sw01 * (step(0.0, gx01) - 0.5);\n  gy01 -= sw01 * (step(0.0, gy01) - 0.5);\n\n  vec4 gx10 = ixy10 * (1.0 / 7.0);\n  vec4 gy10 = floor(gx10) * (1.0 / 7.0);\n  vec4 gz10 = floor(gy10) * (1.0 / 6.0);\n  gx10 = fract(gx10) - 0.5;\n  gy10 = fract(gy10) - 0.5;\n  gz10 = fract(gz10) - 0.5;\n  vec4 gw10 = vec4(0.75) - abs(gx10) - abs(gy10) - abs(gz10);\n  vec4 sw10 = step(gw10, vec4(0.0));\n  gx10 -= sw10 * (step(0.0, gx10) - 0.5);\n  gy10 -= sw10 * (step(0.0, gy10) - 0.5);\n\n  vec4 gx11 = ixy11 * (1.0 / 7.0);\n  vec4 gy11 = floor(gx11) * (1.0 / 7.0);\n  vec4 gz11 = floor(gy11) * (1.0 / 6.0);\n  gx11 = fract(gx11) - 0.5;\n  gy11 = fract(gy11) - 0.5;\n  gz11 = fract(gz11) - 0.5;\n  vec4 gw11 = vec4(0.75) - abs(gx11) - abs(gy11) - abs(gz11);\n  vec4 sw11 = step(gw11, vec4(0.0));\n  gx11 -= sw11 * (step(0.0, gx11) - 0.5);\n  gy11 -= sw11 * (step(0.0, gy11) - 0.5);\n\n  vec4 g0000 = vec4(gx00.x,gy00.x,gz00.x,gw00.x);\n  vec4 g1000 = vec4(gx00.y,gy00.y,gz00.y,gw00.y);\n  vec4 g0100 = vec4(gx00.z,gy00.z,gz00.z,gw00.z);\n  vec4 g1100 = vec4(gx00.w,gy00.w,gz00.w,gw00.w);\n  vec4 g0010 = vec4(gx10.x,gy10.x,gz10.x,gw10.x);\n  vec4 g1010 = vec4(gx10.y,gy10.y,gz10.y,gw10.y);\n  vec4 g0110 = vec4(gx10.z,gy10.z,gz10.z,gw10.z);\n  vec4 g1110 = vec4(gx10.w,gy10.w,gz10.w,gw10.w);\n  vec4 g0001 = vec4(gx01.x,gy01.x,gz01.x,gw01.x);\n  vec4 g1001 = vec4(gx01.y,gy01.y,gz01.y,gw01.y);\n  vec4 g0101 = vec4(gx01.z,gy01.z,gz01.z,gw01.z);\n  vec4 g1101 = vec4(gx01.w,gy01.w,gz01.w,gw01.w);\n  vec4 g0011 = vec4(gx11.x,gy11.x,gz11.x,gw11.x);\n  vec4 g1011 = vec4(gx11.y,gy11.y,gz11.y,gw11.y);\n  vec4 g0111 = vec4(gx11.z,gy11.z,gz11.z,gw11.z);\n  vec4 g1111 = vec4(gx11.w,gy11.w,gz11.w,gw11.w);\n\n  vec4 norm00 = taylorInvSqrt_1_2(vec4(dot(g0000, g0000), dot(g0100, g0100), dot(g1000, g1000), dot(g1100, g1100)));\n  g0000 *= norm00.x;\n  g0100 *= norm00.y;\n  g1000 *= norm00.z;\n  g1100 *= norm00.w;\n\n  vec4 norm01 = taylorInvSqrt_1_2(vec4(dot(g0001, g0001), dot(g0101, g0101), dot(g1001, g1001), dot(g1101, g1101)));\n  g0001 *= norm01.x;\n  g0101 *= norm01.y;\n  g1001 *= norm01.z;\n  g1101 *= norm01.w;\n\n  vec4 norm10 = taylorInvSqrt_1_2(vec4(dot(g0010, g0010), dot(g0110, g0110), dot(g1010, g1010), dot(g1110, g1110)));\n  g0010 *= norm10.x;\n  g0110 *= norm10.y;\n  g1010 *= norm10.z;\n  g1110 *= norm10.w;\n\n  vec4 norm11 = taylorInvSqrt_1_2(vec4(dot(g0011, g0011), dot(g0111, g0111), dot(g1011, g1011), dot(g1111, g1111)));\n  g0011 *= norm11.x;\n  g0111 *= norm11.y;\n  g1011 *= norm11.z;\n  g1111 *= norm11.w;\n\n  float n0000 = dot(g0000, Pf0);\n  float n1000 = dot(g1000, vec4(Pf1.x, Pf0.yzw));\n  float n0100 = dot(g0100, vec4(Pf0.x, Pf1.y, Pf0.zw));\n  float n1100 = dot(g1100, vec4(Pf1.xy, Pf0.zw));\n  float n0010 = dot(g0010, vec4(Pf0.xy, Pf1.z, Pf0.w));\n  float n1010 = dot(g1010, vec4(Pf1.x, Pf0.y, Pf1.z, Pf0.w));\n  float n0110 = dot(g0110, vec4(Pf0.x, Pf1.yz, Pf0.w));\n  float n1110 = dot(g1110, vec4(Pf1.xyz, Pf0.w));\n  float n0001 = dot(g0001, vec4(Pf0.xyz, Pf1.w));\n  float n1001 = dot(g1001, vec4(Pf1.x, Pf0.yz, Pf1.w));\n  float n0101 = dot(g0101, vec4(Pf0.x, Pf1.y, Pf0.z, Pf1.w));\n  float n1101 = dot(g1101, vec4(Pf1.xy, Pf0.z, Pf1.w));\n  float n0011 = dot(g0011, vec4(Pf0.xy, Pf1.zw));\n  float n1011 = dot(g1011, vec4(Pf1.x, Pf0.y, Pf1.zw));\n  float n0111 = dot(g0111, vec4(Pf0.x, Pf1.yzw));\n  float n1111 = dot(g1111, Pf1);\n\n  vec4 fade_xyzw = fade_1_3(Pf0);\n  vec4 n_0w = mix(vec4(n0000, n1000, n0100, n1100), vec4(n0001, n1001, n0101, n1101), fade_xyzw.w);\n  vec4 n_1w = mix(vec4(n0010, n1010, n0110, n1110), vec4(n0011, n1011, n0111, n1111), fade_xyzw.w);\n  vec4 n_zw = mix(n_0w, n_1w, fade_xyzw.z);\n  vec2 n_yzw = mix(n_zw.xy, n_zw.zw, fade_xyzw.y);\n  float n_xyzw = mix(n_yzw.x, n_yzw.y, fade_xyzw.x);\n  return 2.2 * n_xyzw;\n}\n\nuniform float time;\nuniform float amplitude;\nuniform sampler2D texture;\n\nvarying float vAmount;\nvarying vec2 vUv;\nvarying vec3 vertPos;\nvarying vec3 vNormal, vTangent, vBinormal;\nvarying vec3 vPosition;\nvarying vec3 fPosition;\n\nvoid main() {\n\n\tvUv = uv;\n\n\tvPosition = position;\n\tvec4 _pause = vec4( position, 1.0 )  * modelViewMatrix;\n\tfPosition = vec3( _pause.x, _pause.y, _pause.z );\n\tvNormal = normalize( normalMatrix * normal );\n\n\tfloat easing = 0.08;\n    float dist = distance(vec2(vPosition.x, vPosition.y), vec2(0, 0));\n    float size = 2.0;\n    float magnitude = 25.0;\n\n //    vec3 v = vPosition;\n\n\n //    vec3 edges = mix( vec3( 3.0 ), vec3(5.0), smoothstep( 0.0, 1.0, v.x ) );\n\n\n\t// tangent space vectors for normal mapping\n\t// vNormal = normalize( normalMatrix * normal );\n\t// vTangent = normalize( normalMatrix * position );\n\t// vBinormal = normalize( cross( normal, vTangent ) );\n\n\t// vPosition.y += (cnoise_1_4(vec4(vec3(vPosition), time * 0.8))); \n    // vPosition.x += (cnoise_1_4(vec4(vec3(vPosition), time * 0.8)));\n    // vPosition.z += (cnoise_1_4(vec4(vec3(vPosition), time * easing)));\n\n //    vPosition.x *= cos( dist / size + ( time ) ) * amplitude;\n //    vPosition.y *= sin( dist / size + ( time ) ) * amplitude;\n    // vPosition.z *= sin( dist / size + ( time ) ) * amplitude;\n\n\t// deform mesh by the distance from the edge\n\t// gl_Position = projectionMatrix * modelViewMatrix * vec4( edges * normal + vPosition, 1.0);\n\n\tvec4 bumpData = texture2D( texture, uv );\n\t\n\tvAmount = bumpData.r; // assuming map is grayscale it doesn't matter if you use r, g, or b.\n\t\n\t// move the position along the normal\n    vec3 newPosition = vPosition + normal * amplitude * vAmount;\n\t\n\t// gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );\n\n\t// float d = 3.3 * sin( time * 3.+ vPosition.y * 5.);\t\t\t\t\t\t\t\t\t\n //  \t// gl_Position.x += vec4(normal * d, 1. ).x;\n\n\t// vertPos = ( modelViewMatrix * vec4( normal + position, 1.0) ).xyz;\n\n\t// gl_Position  = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n\n    // vec4 outPosition = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n    // outPosition.y += (cnoise_1_4(vec4(vec3(outPosition), (time * easing)))); \n    // outPosition.z += (cnoise_1_4(vec4(vec3(outPosition), time * easing)));\n    // gl_Position = outPosition;\n\n    // vPositionW = vec3(projectionMatrix * vec4(position, 1.0));\n    // vNormalW = normalize(vec3(projectionMatrix * vec4(normal, 0.0)));\n\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4( vPosition, 1.0);\n\n}";

    this.fragmentShader = "#define GLSLIFY 1\nvarying vec3 vNormal;\nvarying vec3 vertPos;\nvarying vec3 vTangent;\nvarying vec3 vBinormal;\nvarying vec2 vUv;\nvarying vec3 vPosition;\nvarying vec3 fPosition;\nconst vec3 lightPos = vec3(150.0);\n// purple\n// const vec3 diffuseColor = vec3( 226.0 / 255.0, 92.0  / 255.0, 254.0 / 255.0);\n// green\n// const vec3 diffuseColor = vec3( 112.0 / 255.0, 220.0  / 255.0, 194.0 / 255.0);\n// blue\nconst vec3 diffuseColor = vec3( 0.0, 0.3, 0.6);\nconst vec3 specColor = vec3(0.2);\n\nuniform vec2 mouse;\nuniform vec2 resolution;\nuniform float time;\nuniform float amplitude;\nuniform sampler2D texture;\n\nvarying vec3 vReflect;\nvarying vec3 vRefract[3];\nvarying float vReflectionFactor;\n\n// Lights\nvarying vec3 vPositionW;\nvarying vec3 vNormalW;\n\n// Refs\nuniform sampler2D textureSampler;\n\n\nfloat hash( float n )\n{\n    return fract(sin(n)*43758.5453);\n}\n\nvec2 hash( vec2 p )\n{\n    p = vec2( dot(p,vec2(127.1,311.7)), dot(p,vec2(269.5,183.3)) );\n    return fract(sin(p)*43758.5453);\n}\n\n/** \n * bump mapping aware phong shading \n *\n * @param 'normal' { vec3 }     - fragment normal\n * @param 'light' { vec3 }      - light position\n * @param 'position' { vec3 }   - fragment position\n * @param 'diffuse' { vec3 }    - diffuse color\n * @param 'spec' { vec3 }       - specular color\n * @return { vec3 }             - phong color \n */\nvec3 phong( in vec3 tanNormal, in vec3 normal, in vec3 light, in vec3 position, in vec3 diffuse, in vec3 spec)\n{\n    vec3 lightDir = normalize(light - position);\n    vec3 reflectDir = reflect( -lightDir, tanNormal);\n    vec3 viewDir = normalize( - position );\n    float lambertian = max( dot( lightDir, normal ), 0.0 );\n    float specular;\n\n    if( lambertian > 0.0 ) {\n        float specAngle = max( dot( reflectDir, viewDir ), 0.01 );\n        specular = pow(specAngle, 4.0);\n    }\n    return lambertian * diffuse + specular * spec;\n}\n\nfloat ball(vec2 p, float k, float d) {\n    vec2 r = vec2(p.x * k * d, p.y * k * d);    \n    return smoothstep(0.0, 1.0, 0.03 / length(r));\n}\n\nconst mat2 m = mat2( 0.80,  0.60, -0.60,  0.80 );\n\n// float noise( in vec2 x )\n// {\n//     return sin(1.5*x.x)*sin(1.5*x.y);\n// }\n\n// float hash( float n )\n// {\n//     return fract(sin(n)*43758.5453);\n// }\n\n// float noise( in vec2 x )\n// {\n//     vec2 p = floor(x);\n//     vec2 f = fract(x);\n//     f = f*f*(3.0-2.0*f);\n//     float n = p.x + p.y*57.0;\n//     return mix(mix( hash(n+  0.0), hash(n+  1.0),f.x),\n//                mix( hash(n+ 57.0), hash(n+ 58.0),f.x),f.y);\n// }\n\n// vec2 map( vec2 p, in float offset )\n// {\n//     p.x += 0.1*sin( time + 2.0*p.y ) ;\n//     p.y += 0.1*sin( time + 2.0*p.x ) ;\n    \n//     float a = noise(p*1.5 + sin(0.1*time))*6.2831;\n//     a -= offset;\n//     return vec2( cos(a), sin(a) );\n// }\n\nfloat noise( vec2 x )\n{\n    vec2 p = floor(x);\n    vec2 f = fract(x);\n    f = f*f*(3.0-2.0*f);\n    float a = texture2D(texture,(p+vec2(0.5,0.5))/256.0,-32.0).x;\n    float b = texture2D(texture,(p+vec2(1.5,0.5))/256.0,-32.0).x;\n    float c = texture2D(texture,(p+vec2(0.5,1.5))/256.0,-32.0).x;\n    float d = texture2D(texture,(p+vec2(1.5,1.5))/256.0,-32.0).x;\n    return mix(mix( a, b,f.x), mix( c, d,f.x),f.y);\n}\n\nconst mat2 mtx = mat2( 0.80,  0.60, -0.60,  0.80 );\n\nfloat fbm4( vec2 p )\n{\n    float f = 0.0;\n\n    f += 0.5000*(-1.0+2.0*noise( p )); p = mtx*p*2.02;\n    f += 0.2500*(-1.0+2.0*noise( p )); p = mtx*p*2.03;\n    f += 0.1250*(-1.0+2.0*noise( p )); p = mtx*p*2.01;\n    f += 0.0625*(-1.0+2.0*noise( p ));\n\n    return f/0.9375;\n}\n\nfloat fbm6( vec2 p )\n{\n    float f = 0.0;\n\n    f += 0.500000*noise( p ); p = mtx*p*2.02;\n    f += 0.250000*noise( p ); p = mtx*p*2.03;\n    f += 0.125000*noise( p ); p = mtx*p*2.01;\n    f += 0.062500*noise( p ); p = mtx*p*2.04;\n    f += 0.031250*noise( p ); p = mtx*p*2.01;\n    f += 0.015625*noise( p );\n\n    return f/0.96875;\n}\n\nfloat func( vec2 q, out vec2 o, out vec2 n )\n{\n    float ql = length( q );\n    q.x += 0.05*sin(0.11*time+ql*4.0);\n    q.y += 0.05*sin(0.13*time+ql*4.0);\n    q *= 0.7 + 0.2*cos(0.05*time);\n\n    q = (q+1.0)*0.5;\n\n    o.x = 0.5 + 0.5*fbm4( vec2(2.0*q*vec2(1.0,1.0)          )  );\n    o.y = 0.5 + 0.5*fbm4( vec2(2.0*q*vec2(1.0,1.0)+vec2(5.2))  );\n\n    float ol = length( o );\n    o.x += 0.02*sin(0.11*time*ol)/ol;\n    o.y += 0.02*sin(0.13*time*ol)/ol;\n\n\n    n.x = fbm6( vec2(4.0*o*vec2(1.0,1.0)+vec2(9.2))  );\n    n.y = fbm6( vec2(4.0*o*vec2(1.0,1.0)+vec2(5.7))  );\n\n    vec2 p = 4.0*q + 4.0*n;\n\n    float f = 0.5 + 0.5*fbm4( p );\n\n    f = mix( f, f*f*f*3.5, f*abs(n.x) );\n\n    float g = 0.5+0.5*sin(4.0*p.x)*sin(4.0*p.y);\n    f *= 1.0-0.5*pow( g, 8.0 );\n\n    return f;\n}\n\nfloat funcs( in vec2 q )\n{\n    vec2 t1, t2;\n    return func(q,t1,t2);\n}\n\n\nvec3 rim(vec3 color, float start, float end, float coef) {\n  vec3 normal = normalize(vNormal);\n  vec3 eye = normalize(-vPosition.xyz);\n  float rim = smoothstep(start, end, 1.0 - dot(normal, eye));\n  return clamp(rim, 0.0, 1.0) * coef * color;\n}\n\n\n\nvoid main( void )\n{\n\n    vec3 v = vPosition;\n    vec3 edges = mix( diffuseColor, 2.5 * diffuseColor, smoothstep( 0.0, 1.5, v.x ) );\n\n    vec3 tanNormal = normalize( (vTangent * v.x) + (vBinormal * v.y) + (vNormal * v.z) );\n\n    vec3 diff = phong( tanNormal, vNormal, vec3(mouse,100.0), vertPos, edges, specColor);\n    \n    // gl_FragColor = vec4(diff,1.0);\n\n\n    // gl_FragColor = vec4(rim( diffuseColor, 0.1, 1.0, 0.9 ), 1.0);\n\n    // vec3 p = vec3(u_vm * v_pos);      \n\n\n     //////////////////////////\n    //  Rim lighting shader //\n    //////////////////////////\n\n    vec3 veye = normalize(-vPosition);       \n       \n    float vdn = 1.0 - dot(veye, vNormal);        // the rim contribution\n\n    if(vdn < 0.5) {\n        discard;\n    }\n\n    float rim = smoothstep(1.0, 0.5, vdn);\n\n    gl_FragColor = vec4(vec3(clamp(rim, 0.5, 1.0) * 1.0 * diffuseColor), 1.0);\n\n    // vec2 p = gl_FragCoord.xy / resolution.xy;\n    // vec2 q = (-resolution.xy + 2.0 * gl_FragCoord.xy) /resolution.y;\n    \n    // vec2 o, n;\n    // float f = func(q, o, n);\n    // vec3 col = vec3(1.0);\n\n\n    // col = mix( vec3(0.2,0.1,0.4), vec3(0.3,0.05,0.05), f );\n    // col = mix( col, vec3(0.9,0.9,0.9), dot(n,n) );\n    // col = mix( col, diffuseColor, dot(n,n) );\n//     col = mix( col, vec3(0.5,0.2,0.2), 0.5*o.y*o.y );\n\n\n//     col = mix( col, vec3(0.0,0.2,0.4), 0.5*smoothstep(1.2,1.3,abs(n.y)+abs(n.x)) );\n\n//     col *= f*2.0;\n// #if 1\n//     vec2 ex = vec2( 1.0 / resolution.x, 0.0 );\n//     vec2 ey = vec2( 0.0, 1.0 / resolution.y );\n//     vec3 nor = normalize( vec3( funcs(q+ex) - f, ex.x, funcs(q+ey) - f ) );\n// #else\n//     vec3 nor = normalize( vec3( dFdx(f)*resolution.x, 1.0, dFdy(f)*resolution.y ) );  \n// #endif\n//     vec3 lig = normalize( vec3( 0.9, -0.2, -0.4 ) );\n//     float dif = clamp( 0.3+0.7*dot( nor, lig ), 0.0, 1.0 );\n\n//     vec3 bdrf;\n//     bdrf  = vec3(0.85,0.90,0.95)*(nor.y*0.5+0.5);\n//     bdrf += vec3(0.15,0.10,0.05)*dif;\n\n//     bdrf  = vec3(0.85,0.90,0.95)*(nor.y*0.5+0.5);\n//     bdrf += vec3(0.15,0.10,0.05)*dif;\n\n//     // col *= bdrf;\n\n    // col *= amplitude / 255.0;\n    // col *= amplitude ;\n\n    // col = vec3(1.0)-col;\n\n    // col = col*col;\n\n    // col *= vec3(1.2,1.25,1.2);\n    \n    // col *= 0.5 + 0.5 * sqrt(16.0*p.x*p.y*(1.0-p.x)*(1.0-p.y));\n    \n    // gl_FragColor = vec4( col, 1.0 );\n\n\n    // vec2 q = gl_FragCoord.xy / resolution.xy;\n    // vec2 p = -1.0 + 2.0 * q;    \n    // p.x *= resolution.x / resolution.y;\n\n    // float col = ball(p, 3.0, 0.1);\n    \n    // gl_FragColor = vec4(col*0.4, col, col*0.4, 1.0);\n\n    // vec4 _color = vec4((gl_FragCoord.x*.5+.5),length(gl_FragCoord),0.,.1);\n\n    // gl_FragColor = _color;\n\n\n\n        // Fresnel\n//     vec3 cameraPosition = vec3( 0, 0, 0 );\n//     vec3 viewDirectionW = normalize(cameraPosition - vPositionW);\n\n\n//     float fresnelTerm = dot(viewDirectionW, vNormalW);\n//     fresnelTerm = clamp(1.0 - fresnelTerm, 0., 1.);\n\n//     vec3 color = vec3( diffuseColor * fresnelTerm );\n//     float opacity = clamp(gl_FragCoord.x * .5 + .5, 0.0, 0.6);\n\n//     gl_FragColor = vec4(color, opacity );\n}";

    var texture = THREE.ImageUtils.loadTexture("images/map.png");
    // let texture = THREE.ImageUtils.loadTexture( "images/map.jpg" );

    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        "time": { type: "f", value: 0 },
        "amplitude": { type: "f", value: this.amplitude },
        "resolution": { type: "v2", value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        "texture": { type: "t", value: texture }
      },
      side: THREE.DoubleSide,
      vertexShader: this.vertexShader,
      fragmentShader: this.fragmentShader,
      shading: THREE.SmoothShading,
      transparent: true
    });

    // wireframe: true
    var geometry = new THREE.SphereGeometry(this.radius, this.widthSegments, this.heightSegments);
    // let geometry = new THREE.PlaneGeometry( this.radius, this.radius, this.widthSegments, this.heightSegments );
    // this.geometry = new THREE.BufferGeometry().fromGeometry( geometry );

    this.geometry = geometry;

    this.geometry.dynamic = true;

    this.mesh = new THREE.Mesh(this.geometry, this.material);

    // this.mesh.rotation.x = -1.55;

    this.clock = Date.now();

    // this.scene.add( this.mesh );
  }

  _createClass(Test, [{
    key: 'update',
    value: function update(soundData) {

      if (soundData) {

        var time = soundData.time;
        var average = 0;

        for (var i = 0; i < time.length; i++) {
          average += time[i];
        }

        average /= 512;

        var frequence = Math.abs(average - 128);

        if (frequence > 15) {
          this.amplitude += 0.09;
        } else {
          this.amplitude -= 0.01;
        }

        if (this.amplitude < 2) {
          this.amplitude = 2;
        }

        if (this.amplitude > 20) {
          this.amplitude = 20;
        }
      }

      this.material.uniforms["time"].value = (Date.now() - this.clock) * 0.0008;
    }
  }, {
    key: 'addGUI',
    value: function addGUI() {

      this.GUI = new dat.GUI();

      this.GUI.add(this, 'radius');

      this.GUI.add(this, 'widthSegments');

      this.GUI.add(this, 'heightSegments');
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

},{}],9:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Utils = (function () {
  function Utils() {
    _classCallCheck(this, Utils);
  }

  _createClass(Utils, [{
    key: "randomRange",
    value: function randomRange(min, max) {

      return Math.floor(min + Math.random() * (max - min));
    }
  }, {
    key: "clone",
    value: function clone(object) {

      return JSON.parse(JSON.stringify(object));
    }
  }]);

  return Utils;
})();

exports.Utils = Utils;

},{}],10:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }



var Warp = (function () {
  function Warp(scene, emitter) {
    var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

    _classCallCheck(this, Warp);

    this.scene = scene;

    this.emitter = emitter;

    this.particlesCount = 10000;

    this.radius = 150;
    this.widthSegments = 50;
    this.heightSegments = 50;
    this.amplitude = 2;

    this.vertexShader = "#define GLSLIFY 1\n//\n// GLSL textureless classic 4D noise \"cnoise\",\n// with an RSL-style periodic variant \"pnoise\".\n// Author:  Stefan Gustavson (stefan.gustavson@liu.se)\n// Version: 2011-08-22\n//\n// Many thanks to Ian McEwan of Ashima Arts for the\n// ideas for permutation and gradient selection.\n//\n// Copyright (c) 2011 Stefan Gustavson. All rights reserved.\n// Distributed under the MIT license. See LICENSE file.\n// https://github.com/ashima/webgl-noise\n//\n\nvec4 mod289_1_0(vec4 x)\n{\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec4 permute_1_1(vec4 x)\n{\n  return mod289_1_0(((x*34.0)+1.0)*x);\n}\n\nvec4 taylorInvSqrt_1_2(vec4 r)\n{\n  return 1.79284291400159 - 0.85373472095314 * r;\n}\n\nvec4 fade_1_3(vec4 t) {\n  return t*t*t*(t*(t*6.0-15.0)+10.0);\n}\n\n// Classic Perlin noise\nfloat cnoise_1_4(vec4 P)\n{\n  vec4 Pi0 = floor(P); // Integer part for indexing\n  vec4 Pi1 = Pi0 + 1.0; // Integer part + 1\n  Pi0 = mod289_1_0(Pi0);\n  Pi1 = mod289_1_0(Pi1);\n  vec4 Pf0 = fract(P); // Fractional part for interpolation\n  vec4 Pf1 = Pf0 - 1.0; // Fractional part - 1.0\n  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);\n  vec4 iy = vec4(Pi0.yy, Pi1.yy);\n  vec4 iz0 = vec4(Pi0.zzzz);\n  vec4 iz1 = vec4(Pi1.zzzz);\n  vec4 iw0 = vec4(Pi0.wwww);\n  vec4 iw1 = vec4(Pi1.wwww);\n\n  vec4 ixy = permute_1_1(permute_1_1(ix) + iy);\n  vec4 ixy0 = permute_1_1(ixy + iz0);\n  vec4 ixy1 = permute_1_1(ixy + iz1);\n  vec4 ixy00 = permute_1_1(ixy0 + iw0);\n  vec4 ixy01 = permute_1_1(ixy0 + iw1);\n  vec4 ixy10 = permute_1_1(ixy1 + iw0);\n  vec4 ixy11 = permute_1_1(ixy1 + iw1);\n\n  vec4 gx00 = ixy00 * (1.0 / 7.0);\n  vec4 gy00 = floor(gx00) * (1.0 / 7.0);\n  vec4 gz00 = floor(gy00) * (1.0 / 6.0);\n  gx00 = fract(gx00) - 0.5;\n  gy00 = fract(gy00) - 0.5;\n  gz00 = fract(gz00) - 0.5;\n  vec4 gw00 = vec4(0.75) - abs(gx00) - abs(gy00) - abs(gz00);\n  vec4 sw00 = step(gw00, vec4(0.0));\n  gx00 -= sw00 * (step(0.0, gx00) - 0.5);\n  gy00 -= sw00 * (step(0.0, gy00) - 0.5);\n\n  vec4 gx01 = ixy01 * (1.0 / 7.0);\n  vec4 gy01 = floor(gx01) * (1.0 / 7.0);\n  vec4 gz01 = floor(gy01) * (1.0 / 6.0);\n  gx01 = fract(gx01) - 0.5;\n  gy01 = fract(gy01) - 0.5;\n  gz01 = fract(gz01) - 0.5;\n  vec4 gw01 = vec4(0.75) - abs(gx01) - abs(gy01) - abs(gz01);\n  vec4 sw01 = step(gw01, vec4(0.0));\n  gx01 -= sw01 * (step(0.0, gx01) - 0.5);\n  gy01 -= sw01 * (step(0.0, gy01) - 0.5);\n\n  vec4 gx10 = ixy10 * (1.0 / 7.0);\n  vec4 gy10 = floor(gx10) * (1.0 / 7.0);\n  vec4 gz10 = floor(gy10) * (1.0 / 6.0);\n  gx10 = fract(gx10) - 0.5;\n  gy10 = fract(gy10) - 0.5;\n  gz10 = fract(gz10) - 0.5;\n  vec4 gw10 = vec4(0.75) - abs(gx10) - abs(gy10) - abs(gz10);\n  vec4 sw10 = step(gw10, vec4(0.0));\n  gx10 -= sw10 * (step(0.0, gx10) - 0.5);\n  gy10 -= sw10 * (step(0.0, gy10) - 0.5);\n\n  vec4 gx11 = ixy11 * (1.0 / 7.0);\n  vec4 gy11 = floor(gx11) * (1.0 / 7.0);\n  vec4 gz11 = floor(gy11) * (1.0 / 6.0);\n  gx11 = fract(gx11) - 0.5;\n  gy11 = fract(gy11) - 0.5;\n  gz11 = fract(gz11) - 0.5;\n  vec4 gw11 = vec4(0.75) - abs(gx11) - abs(gy11) - abs(gz11);\n  vec4 sw11 = step(gw11, vec4(0.0));\n  gx11 -= sw11 * (step(0.0, gx11) - 0.5);\n  gy11 -= sw11 * (step(0.0, gy11) - 0.5);\n\n  vec4 g0000 = vec4(gx00.x,gy00.x,gz00.x,gw00.x);\n  vec4 g1000 = vec4(gx00.y,gy00.y,gz00.y,gw00.y);\n  vec4 g0100 = vec4(gx00.z,gy00.z,gz00.z,gw00.z);\n  vec4 g1100 = vec4(gx00.w,gy00.w,gz00.w,gw00.w);\n  vec4 g0010 = vec4(gx10.x,gy10.x,gz10.x,gw10.x);\n  vec4 g1010 = vec4(gx10.y,gy10.y,gz10.y,gw10.y);\n  vec4 g0110 = vec4(gx10.z,gy10.z,gz10.z,gw10.z);\n  vec4 g1110 = vec4(gx10.w,gy10.w,gz10.w,gw10.w);\n  vec4 g0001 = vec4(gx01.x,gy01.x,gz01.x,gw01.x);\n  vec4 g1001 = vec4(gx01.y,gy01.y,gz01.y,gw01.y);\n  vec4 g0101 = vec4(gx01.z,gy01.z,gz01.z,gw01.z);\n  vec4 g1101 = vec4(gx01.w,gy01.w,gz01.w,gw01.w);\n  vec4 g0011 = vec4(gx11.x,gy11.x,gz11.x,gw11.x);\n  vec4 g1011 = vec4(gx11.y,gy11.y,gz11.y,gw11.y);\n  vec4 g0111 = vec4(gx11.z,gy11.z,gz11.z,gw11.z);\n  vec4 g1111 = vec4(gx11.w,gy11.w,gz11.w,gw11.w);\n\n  vec4 norm00 = taylorInvSqrt_1_2(vec4(dot(g0000, g0000), dot(g0100, g0100), dot(g1000, g1000), dot(g1100, g1100)));\n  g0000 *= norm00.x;\n  g0100 *= norm00.y;\n  g1000 *= norm00.z;\n  g1100 *= norm00.w;\n\n  vec4 norm01 = taylorInvSqrt_1_2(vec4(dot(g0001, g0001), dot(g0101, g0101), dot(g1001, g1001), dot(g1101, g1101)));\n  g0001 *= norm01.x;\n  g0101 *= norm01.y;\n  g1001 *= norm01.z;\n  g1101 *= norm01.w;\n\n  vec4 norm10 = taylorInvSqrt_1_2(vec4(dot(g0010, g0010), dot(g0110, g0110), dot(g1010, g1010), dot(g1110, g1110)));\n  g0010 *= norm10.x;\n  g0110 *= norm10.y;\n  g1010 *= norm10.z;\n  g1110 *= norm10.w;\n\n  vec4 norm11 = taylorInvSqrt_1_2(vec4(dot(g0011, g0011), dot(g0111, g0111), dot(g1011, g1011), dot(g1111, g1111)));\n  g0011 *= norm11.x;\n  g0111 *= norm11.y;\n  g1011 *= norm11.z;\n  g1111 *= norm11.w;\n\n  float n0000 = dot(g0000, Pf0);\n  float n1000 = dot(g1000, vec4(Pf1.x, Pf0.yzw));\n  float n0100 = dot(g0100, vec4(Pf0.x, Pf1.y, Pf0.zw));\n  float n1100 = dot(g1100, vec4(Pf1.xy, Pf0.zw));\n  float n0010 = dot(g0010, vec4(Pf0.xy, Pf1.z, Pf0.w));\n  float n1010 = dot(g1010, vec4(Pf1.x, Pf0.y, Pf1.z, Pf0.w));\n  float n0110 = dot(g0110, vec4(Pf0.x, Pf1.yz, Pf0.w));\n  float n1110 = dot(g1110, vec4(Pf1.xyz, Pf0.w));\n  float n0001 = dot(g0001, vec4(Pf0.xyz, Pf1.w));\n  float n1001 = dot(g1001, vec4(Pf1.x, Pf0.yz, Pf1.w));\n  float n0101 = dot(g0101, vec4(Pf0.x, Pf1.y, Pf0.z, Pf1.w));\n  float n1101 = dot(g1101, vec4(Pf1.xy, Pf0.z, Pf1.w));\n  float n0011 = dot(g0011, vec4(Pf0.xy, Pf1.zw));\n  float n1011 = dot(g1011, vec4(Pf1.x, Pf0.y, Pf1.zw));\n  float n0111 = dot(g0111, vec4(Pf0.x, Pf1.yzw));\n  float n1111 = dot(g1111, Pf1);\n\n  vec4 fade_xyzw = fade_1_3(Pf0);\n  vec4 n_0w = mix(vec4(n0000, n1000, n0100, n1100), vec4(n0001, n1001, n0101, n1101), fade_xyzw.w);\n  vec4 n_1w = mix(vec4(n0010, n1010, n0110, n1110), vec4(n0011, n1011, n0111, n1111), fade_xyzw.w);\n  vec4 n_zw = mix(n_0w, n_1w, fade_xyzw.z);\n  vec2 n_yzw = mix(n_zw.xy, n_zw.zw, fade_xyzw.y);\n  float n_xyzw = mix(n_yzw.x, n_yzw.y, fade_xyzw.x);\n  return 2.2 * n_xyzw;\n}\n\n// Classic Perlin noise, periodic version\nfloat pnoise_1_5(vec4 P, vec4 rep)\n{\n  vec4 Pi0 = mod(floor(P), rep); // Integer part modulo rep\n  vec4 Pi1 = mod(Pi0 + 1.0, rep); // Integer part + 1 mod rep\n  Pi0 = mod289_1_0(Pi0);\n  Pi1 = mod289_1_0(Pi1);\n  vec4 Pf0 = fract(P); // Fractional part for interpolation\n  vec4 Pf1 = Pf0 - 1.0; // Fractional part - 1.0\n  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);\n  vec4 iy = vec4(Pi0.yy, Pi1.yy);\n  vec4 iz0 = vec4(Pi0.zzzz);\n  vec4 iz1 = vec4(Pi1.zzzz);\n  vec4 iw0 = vec4(Pi0.wwww);\n  vec4 iw1 = vec4(Pi1.wwww);\n\n  vec4 ixy = permute_1_1(permute_1_1(ix) + iy);\n  vec4 ixy0 = permute_1_1(ixy + iz0);\n  vec4 ixy1 = permute_1_1(ixy + iz1);\n  vec4 ixy00 = permute_1_1(ixy0 + iw0);\n  vec4 ixy01 = permute_1_1(ixy0 + iw1);\n  vec4 ixy10 = permute_1_1(ixy1 + iw0);\n  vec4 ixy11 = permute_1_1(ixy1 + iw1);\n\n  vec4 gx00 = ixy00 * (1.0 / 7.0);\n  vec4 gy00 = floor(gx00) * (1.0 / 7.0);\n  vec4 gz00 = floor(gy00) * (1.0 / 6.0);\n  gx00 = fract(gx00) - 0.5;\n  gy00 = fract(gy00) - 0.5;\n  gz00 = fract(gz00) - 0.5;\n  vec4 gw00 = vec4(0.75) - abs(gx00) - abs(gy00) - abs(gz00);\n  vec4 sw00 = step(gw00, vec4(0.0));\n  gx00 -= sw00 * (step(0.0, gx00) - 0.5);\n  gy00 -= sw00 * (step(0.0, gy00) - 0.5);\n\n  vec4 gx01 = ixy01 * (1.0 / 7.0);\n  vec4 gy01 = floor(gx01) * (1.0 / 7.0);\n  vec4 gz01 = floor(gy01) * (1.0 / 6.0);\n  gx01 = fract(gx01) - 0.5;\n  gy01 = fract(gy01) - 0.5;\n  gz01 = fract(gz01) - 0.5;\n  vec4 gw01 = vec4(0.75) - abs(gx01) - abs(gy01) - abs(gz01);\n  vec4 sw01 = step(gw01, vec4(0.0));\n  gx01 -= sw01 * (step(0.0, gx01) - 0.5);\n  gy01 -= sw01 * (step(0.0, gy01) - 0.5);\n\n  vec4 gx10 = ixy10 * (1.0 / 7.0);\n  vec4 gy10 = floor(gx10) * (1.0 / 7.0);\n  vec4 gz10 = floor(gy10) * (1.0 / 6.0);\n  gx10 = fract(gx10) - 0.5;\n  gy10 = fract(gy10) - 0.5;\n  gz10 = fract(gz10) - 0.5;\n  vec4 gw10 = vec4(0.75) - abs(gx10) - abs(gy10) - abs(gz10);\n  vec4 sw10 = step(gw10, vec4(0.0));\n  gx10 -= sw10 * (step(0.0, gx10) - 0.5);\n  gy10 -= sw10 * (step(0.0, gy10) - 0.5);\n\n  vec4 gx11 = ixy11 * (1.0 / 7.0);\n  vec4 gy11 = floor(gx11) * (1.0 / 7.0);\n  vec4 gz11 = floor(gy11) * (1.0 / 6.0);\n  gx11 = fract(gx11) - 0.5;\n  gy11 = fract(gy11) - 0.5;\n  gz11 = fract(gz11) - 0.5;\n  vec4 gw11 = vec4(0.75) - abs(gx11) - abs(gy11) - abs(gz11);\n  vec4 sw11 = step(gw11, vec4(0.0));\n  gx11 -= sw11 * (step(0.0, gx11) - 0.5);\n  gy11 -= sw11 * (step(0.0, gy11) - 0.5);\n\n  vec4 g0000 = vec4(gx00.x,gy00.x,gz00.x,gw00.x);\n  vec4 g1000 = vec4(gx00.y,gy00.y,gz00.y,gw00.y);\n  vec4 g0100 = vec4(gx00.z,gy00.z,gz00.z,gw00.z);\n  vec4 g1100 = vec4(gx00.w,gy00.w,gz00.w,gw00.w);\n  vec4 g0010 = vec4(gx10.x,gy10.x,gz10.x,gw10.x);\n  vec4 g1010 = vec4(gx10.y,gy10.y,gz10.y,gw10.y);\n  vec4 g0110 = vec4(gx10.z,gy10.z,gz10.z,gw10.z);\n  vec4 g1110 = vec4(gx10.w,gy10.w,gz10.w,gw10.w);\n  vec4 g0001 = vec4(gx01.x,gy01.x,gz01.x,gw01.x);\n  vec4 g1001 = vec4(gx01.y,gy01.y,gz01.y,gw01.y);\n  vec4 g0101 = vec4(gx01.z,gy01.z,gz01.z,gw01.z);\n  vec4 g1101 = vec4(gx01.w,gy01.w,gz01.w,gw01.w);\n  vec4 g0011 = vec4(gx11.x,gy11.x,gz11.x,gw11.x);\n  vec4 g1011 = vec4(gx11.y,gy11.y,gz11.y,gw11.y);\n  vec4 g0111 = vec4(gx11.z,gy11.z,gz11.z,gw11.z);\n  vec4 g1111 = vec4(gx11.w,gy11.w,gz11.w,gw11.w);\n\n  vec4 norm00 = taylorInvSqrt_1_2(vec4(dot(g0000, g0000), dot(g0100, g0100), dot(g1000, g1000), dot(g1100, g1100)));\n  g0000 *= norm00.x;\n  g0100 *= norm00.y;\n  g1000 *= norm00.z;\n  g1100 *= norm00.w;\n\n  vec4 norm01 = taylorInvSqrt_1_2(vec4(dot(g0001, g0001), dot(g0101, g0101), dot(g1001, g1001), dot(g1101, g1101)));\n  g0001 *= norm01.x;\n  g0101 *= norm01.y;\n  g1001 *= norm01.z;\n  g1101 *= norm01.w;\n\n  vec4 norm10 = taylorInvSqrt_1_2(vec4(dot(g0010, g0010), dot(g0110, g0110), dot(g1010, g1010), dot(g1110, g1110)));\n  g0010 *= norm10.x;\n  g0110 *= norm10.y;\n  g1010 *= norm10.z;\n  g1110 *= norm10.w;\n\n  vec4 norm11 = taylorInvSqrt_1_2(vec4(dot(g0011, g0011), dot(g0111, g0111), dot(g1011, g1011), dot(g1111, g1111)));\n  g0011 *= norm11.x;\n  g0111 *= norm11.y;\n  g1011 *= norm11.z;\n  g1111 *= norm11.w;\n\n  float n0000 = dot(g0000, Pf0);\n  float n1000 = dot(g1000, vec4(Pf1.x, Pf0.yzw));\n  float n0100 = dot(g0100, vec4(Pf0.x, Pf1.y, Pf0.zw));\n  float n1100 = dot(g1100, vec4(Pf1.xy, Pf0.zw));\n  float n0010 = dot(g0010, vec4(Pf0.xy, Pf1.z, Pf0.w));\n  float n1010 = dot(g1010, vec4(Pf1.x, Pf0.y, Pf1.z, Pf0.w));\n  float n0110 = dot(g0110, vec4(Pf0.x, Pf1.yz, Pf0.w));\n  float n1110 = dot(g1110, vec4(Pf1.xyz, Pf0.w));\n  float n0001 = dot(g0001, vec4(Pf0.xyz, Pf1.w));\n  float n1001 = dot(g1001, vec4(Pf1.x, Pf0.yz, Pf1.w));\n  float n0101 = dot(g0101, vec4(Pf0.x, Pf1.y, Pf0.z, Pf1.w));\n  float n1101 = dot(g1101, vec4(Pf1.xy, Pf0.z, Pf1.w));\n  float n0011 = dot(g0011, vec4(Pf0.xy, Pf1.zw));\n  float n1011 = dot(g1011, vec4(Pf1.x, Pf0.y, Pf1.zw));\n  float n0111 = dot(g0111, vec4(Pf0.x, Pf1.yzw));\n  float n1111 = dot(g1111, Pf1);\n\n  vec4 fade_xyzw = fade_1_3(Pf0);\n  vec4 n_0w = mix(vec4(n0000, n1000, n0100, n1100), vec4(n0001, n1001, n0101, n1101), fade_xyzw.w);\n  vec4 n_1w = mix(vec4(n0010, n1010, n0110, n1110), vec4(n0011, n1011, n0111, n1111), fade_xyzw.w);\n  vec4 n_zw = mix(n_0w, n_1w, fade_xyzw.z);\n  vec2 n_yzw = mix(n_zw.xy, n_zw.zw, fade_xyzw.y);\n  float n_xyzw = mix(n_yzw.x, n_yzw.y, fade_xyzw.x);\n  return 2.2 * n_xyzw;\n}\n\nuniform float time;\nuniform float amplitude;\n\nvarying vec2 vUv;\nvarying vec3 vertPos;\nvarying vec3 vNormal, vTangent, vBinormal;\nvarying vec3 vPosition;\n\nvoid main() {\n\n    vUv = uv;\n\n    vPosition = position;\n\n    float easing = 0.8;\n    float dist = distance(vec2(vPosition.x, vPosition.y), vec2(0, 0));\n    float size = 2.0;\n    float magnitude = 25.0;\n\n    vec3 v = vPosition;\n\n\n    vec3 edges = mix( vec3( 3.0 ), vec3(5.0), smoothstep( 0.0, 1.0, v.x ) );\n\n\n    // tangent space vectors for normal mapping\n    vNormal = normalize( normalMatrix * normal );\n    vTangent = normalize( normalMatrix * position );\n    vBinormal = normalize( cross( normal, vTangent ) );\n\n    vPosition.y += (cnoise_1_4(vec4(vec3(vPosition), time))); \n    vPosition.x += (cnoise_1_4(vec4(vec3(vPosition), time)));\n    vPosition.z += (cnoise_1_4(vec4(vec3(vPosition), time)));\n\n    vPosition.x *= cos( dist / size + ( time ) ) * amplitude;\n    vPosition.y *= sin( dist / size + ( time ) ) * amplitude;\n    vPosition.z *= sin( dist / size + ( time ) ) * amplitude;\n\n    gl_Position = projectionMatrix * modelViewMatrix * vec4( vPosition, 1.0);\n\n\n\n}";

    this.fragmentShader = "#define GLSLIFY 1\nvarying vec3 vNormal;\nvarying vec3 vertPos;\nvarying vec3 vTangent;\nvarying vec3 vBinormal;\nvarying vec2 vUv;\nvarying vec3 vPosition;\nconst vec3 lightPos = vec3(150.0);\n// purple\n// const vec3 diffuseColor = vec3( 226.0 / 255.0, 92.0  / 255.0, 254.0 / 255.0);\n// green\n// const vec3 diffuseColor = vec3( 112.0 / 255.0, 220.0  / 255.0, 194.0 / 255.0);\n// blue\nconst vec3 diffuseColor = vec3( 0.0, 0.3, 0.6);\nconst vec3 specColor = vec3(0.2);\n\nuniform vec2 mouse;\nuniform vec2 resolution;\nuniform float time;\nuniform float amplitude;\nuniform sampler2D texture;\n\nvarying vec3 vReflect;\nvarying vec3 vRefract[3];\nvarying float vReflectionFactor;\n\n// Lights\nvarying vec3 vPositionW;\nvarying vec3 vNormalW;\n\n// Refs\nuniform sampler2D textureSampler;\n\n\nfloat hash( float n )\n{\n    return fract(sin(n)*43758.5453);\n}\n\nvec2 hash( vec2 p )\n{\n    p = vec2( dot(p,vec2(127.1,311.7)), dot(p,vec2(269.5,183.3)) );\n    return fract(sin(p)*43758.5453);\n}\n\n/** \n * bump mapping aware phong shading \n *\n * @param 'normal' { vec3 }     - fragment normal\n * @param 'light' { vec3 }      - light position\n * @param 'position' { vec3 }   - fragment position\n * @param 'diffuse' { vec3 }    - diffuse color\n * @param 'spec' { vec3 }       - specular color\n * @return { vec3 }             - phong color \n */\nvec3 phong( in vec3 tanNormal, in vec3 normal, in vec3 light, in vec3 position, in vec3 diffuse, in vec3 spec)\n{\n    vec3 lightDir = normalize(light - position);\n    vec3 reflectDir = reflect( -lightDir, tanNormal);\n    vec3 viewDir = normalize( - position );\n    float lambertian = max( dot( lightDir, normal ), 0.0 );\n    float specular;\n\n    if( lambertian > 0.0 ) {\n        float specAngle = max( dot( reflectDir, viewDir ), 0.01 );\n        specular = pow(specAngle, 4.0);\n    }\n    return lambertian * diffuse + specular * spec;\n}\n\nfloat ball(vec2 p, float k, float d) {\n    vec2 r = vec2(p.x * k * d, p.y * k * d);    \n    return smoothstep(0.0, 1.0, 0.03 / length(r));\n}\n\nconst mat2 m = mat2( 0.80,  0.60, -0.60,  0.80 );\n\nfloat noise( vec2 x )\n{\n    vec2 p = floor(x);\n    vec2 f = fract(x);\n    f = f*f*(3.0-2.0*f);\n    float a = texture2D(texture,(p+vec2(0.5,0.5))/256.0,-32.0).x;\n    float b = texture2D(texture,(p+vec2(1.5,0.5))/256.0,-32.0).x;\n    float c = texture2D(texture,(p+vec2(0.5,1.5))/256.0,-32.0).x;\n    float d = texture2D(texture,(p+vec2(1.5,1.5))/256.0,-32.0).x;\n    return mix(mix( a, b,f.x), mix( c, d,f.x),f.y);\n}\n\nconst mat2 mtx = mat2( 0.80,  0.60, -0.60,  0.80 );\n\nfloat fbm4( vec2 p )\n{\n    float f = 0.0;\n\n    f += 0.5000*(-1.0+2.0*noise( p )); p = mtx*p*2.02;\n    f += 0.2500*(-1.0+2.0*noise( p )); p = mtx*p*2.03;\n    f += 0.1250*(-1.0+2.0*noise( p )); p = mtx*p*2.01;\n    f += 0.0625*(-1.0+2.0*noise( p ));\n\n    return f/0.9375;\n}\n\nfloat fbm6( vec2 p )\n{\n    float f = 0.0;\n\n    f += 0.500000*noise( p ); p = mtx*p*2.02;\n    f += 0.250000*noise( p ); p = mtx*p*2.03;\n    f += 0.125000*noise( p ); p = mtx*p*2.01;\n    f += 0.062500*noise( p ); p = mtx*p*2.04;\n    f += 0.031250*noise( p ); p = mtx*p*2.01;\n    f += 0.015625*noise( p );\n\n    return f/0.96875;\n}\n\nfloat func( vec2 q, out vec2 o, out vec2 n )\n{\n    float ql = length( q );\n    q.x += 0.05*sin(0.11*time+ql*4.0);\n    q.y += 0.05*sin(0.13*time+ql*4.0);\n    q *= 0.7 + 0.2*cos(0.05*time);\n\n    q = (q+1.0)*0.5;\n\n    o.x = 0.5 + 0.5*fbm4( vec2(2.0*q*vec2(1.0,1.0)          )  );\n    o.y = 0.5 + 0.5*fbm4( vec2(2.0*q*vec2(1.0,1.0)+vec2(5.2))  );\n\n    float ol = length( o );\n    o.x += 0.02*sin(0.11*time*ol)/ol;\n    o.y += 0.02*sin(0.13*time*ol)/ol;\n\n\n    n.x = fbm6( vec2(4.0*o*vec2(1.0,1.0)+vec2(9.2))  );\n    n.y = fbm6( vec2(4.0*o*vec2(1.0,1.0)+vec2(5.7))  );\n\n    vec2 p = 4.0*q + 4.0*n;\n\n    float f = 0.5 + 0.5*fbm4( p );\n\n    f = mix( f, f*f*f*3.5, f*abs(n.x) );\n\n    float g = 0.5+0.5*sin(4.0*p.x)*sin(4.0*p.y);\n    f *= 1.0-0.5*pow( g, 8.0 );\n\n    return f;\n}\n\nfloat funcs( in vec2 q )\n{\n    vec2 t1, t2;\n    return func(q,t1,t2);\n}\n\n\nvoid main( void )\n{\n\n    vec2 p = gl_FragCoord.xy / resolution.xy;\n    vec2 q = (-resolution.xy + 2.0 * gl_FragCoord.xy) /resolution.y;\n    \n    vec2 o, n;\n    float f = func(q, o, n);\n    vec3 col = vec3(1.0);\n\n\n    // col = mix( vec3(0.2,0.1,0.4), vec3(0.3,0.05,0.05), f );\n    // col = mix( col, vec3(0.9,0.9,0.9), dot(n,n) );\n    col = mix( col, diffuseColor, dot(n,n) );\n//     col = mix( col, vec3(0.5,0.2,0.2), 0.5*o.y*o.y );\n//     col = mix( col, vec3(0.0,0.2,0.4), 0.5*smoothstep(1.2,1.3,abs(n.y)+abs(n.x)) );\n//     col *= f*2.0;\n#if 1\n    vec2 ex = vec2( 1.0 / resolution.x, 0.0 );\n    vec2 ey = vec2( 0.0, 1.0 / resolution.y );\n    vec3 nor = normalize( vec3( funcs(q+ex) - f, ex.x, funcs(q+ey) - f ) );\n#else\n    vec3 nor = normalize( vec3( dFdx(f)*resolution.x, 1.0, dFdy(f)*resolution.y ) );  \n#endif\n    vec3 lig = normalize( vec3( 0.9, -0.2, -0.4 ) );\n    float dif = clamp( 0.3+0.7*dot( nor, lig ), 0.0, 1.0 );\n\n    vec3 bdrf;\n    bdrf  = vec3(0.85,0.90,0.95)*(nor.y*0.5+0.5);\n    bdrf += vec3(0.15,0.10,0.05)*dif;\n\n    bdrf  = vec3(0.85,0.90,0.95)*(nor.y*0.5+0.5);\n    bdrf += vec3(0.15,0.10,0.05)*dif;\n\n    // col *= bdrf;\n    // col *= amplitude / 255.0;\n    // col *= amplitude ;\n    // col = vec3(1.0)-col;\n    // col = col*col;\n    // col *= vec3(1.2,1.25,1.2);\n    \n    col *= 0.5 + 0.5 * sqrt(16.0*p.x*p.y*(1.0-p.x)*(1.0-p.y));\n    \n    gl_FragColor = vec4( col, 1.0 );\n\n}";

    var texture = THREE.ImageUtils.loadTexture("images/noisebw.png");
    // let texture = THREE.ImageUtils.loadTexture( "images/texture.jpg" );

    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        "time": { type: "f", value: 0 },
        "amplitude": { type: "f", value: this.amplitude },
        "resolution": { type: "v2", value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        "texture": { type: "t", value: texture }
      },
      side: THREE.DoubleSide,
      vertexShader: this.vertexShader,
      fragmentShader: this.fragmentShader,
      shading: THREE.SmoothShading,
      transparent: true
    });

    // wireframe: true
    var geometry = new THREE.PlaneGeometry(this.radius, this.radius, this.widthSegments, this.heightSegments);
    // let geometry = new THREE.PlaneGeometry( this.radius, this.radius, this.widthSegments, this.heightSegments );
    // this.geometry = new THREE.BufferGeometry().fromGeometry( geometry );

    this.geometry = geometry;

    this.mesh = new THREE.Mesh(this.geometry, this.material);

    this.mesh.position.y = -56;
    this.mesh.position.z = 22.4;

    // this.mesh.rotation.x = -0.1; // lying down
    this.mesh.rotation.x = 1.6; // background

    this.clock = Date.now();

    this.scene.add(this.mesh);
  }

  _createClass(Warp, [{
    key: 'update',
    value: function update(soundData) {

      if (soundData) {

        var time = soundData.time;
        var average = 0;

        for (var i = 0; i < time.length; i++) {
          average += time[i];
        }

        average /= 512;

        var frequence = Math.abs(average - 128);

        if (frequence > 15) {
          this.amplitude += 0.09;
        } else {
          this.amplitude -= 0.01;
        }

        if (this.amplitude < 2) {
          this.amplitude = 2;
        }

        if (this.amplitude > 4) {
          this.amplitude = 4;
        }
      }

      this.mesh.material.uniforms['amplitude'].value = this.amplitude;
      this.material.uniforms["time"].value = (Date.now() - this.clock) * 0.0008;
    }
  }, {
    key: 'getMesh',
    value: function getMesh() {

      return this.mesh;
    }
  }]);

  return Warp;
})();

exports.Warp = Warp;

},{}],11:[function(require,module,exports){
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

},{}],12:[function(require,module,exports){
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

},{"./lib/input":13,"clamp":14,"defined":15,"gl-quat/invert":16,"gl-vec3/add":19,"gl-vec3/copy":20,"gl-vec3/cross":21,"gl-vec3/length":23,"gl-vec3/normalize":24,"gl-vec3/subtract":26,"gl-vec3/transformQuat":27,"quat-from-unit-vec3":32}],13:[function(require,module,exports){
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

},{"mouse-event-offset":28,"mouse-wheel":31,"touch-pinch":33}],14:[function(require,module,exports){
module.exports = clamp

function clamp(value, min, max) {
  return min < max
    ? (value < min ? min : value > max ? max : value)
    : (value < max ? max : value > min ? min : value)
}

},{}],15:[function(require,module,exports){
module.exports = function () {
    for (var i = 0; i < arguments.length; i++) {
        if (arguments[i] !== undefined) return arguments[i];
    }
};

},{}],16:[function(require,module,exports){
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

},{}],17:[function(require,module,exports){
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

},{}],18:[function(require,module,exports){
/**
 * Normalize a quat
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a quaternion to normalize
 * @returns {quat} out
 * @function
 */
module.exports = require('gl-vec4/normalize')

},{"gl-vec4/normalize":17}],19:[function(require,module,exports){
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
},{}],20:[function(require,module,exports){
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
},{}],21:[function(require,module,exports){
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
},{}],22:[function(require,module,exports){
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
},{}],23:[function(require,module,exports){
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
},{}],24:[function(require,module,exports){
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
},{}],25:[function(require,module,exports){
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
},{}],26:[function(require,module,exports){
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
},{}],27:[function(require,module,exports){
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
},{}],28:[function(require,module,exports){
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

},{}],29:[function(require,module,exports){
module.exports = function parseUnit(str, out) {
    if (!out)
        out = [ 0, '' ]

    str = String(str)
    var num = parseFloat(str, 10)
    out[0] = num
    out[1] = str.match(/[\d.\-\+]*\s*(.*)/)[1] || ''
    return out
}
},{}],30:[function(require,module,exports){
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
},{"parse-unit":29}],31:[function(require,module,exports){
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
},{"to-px":30}],32:[function(require,module,exports){
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

},{"gl-quat/normalize":18,"gl-vec3/cross":21,"gl-vec3/dot":22,"gl-vec3/set":25}],33:[function(require,module,exports){
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

},{"dprop":34,"events":11,"gl-vec2/distance":35,"mouse-event-offset":28}],34:[function(require,module,exports){
module.exports = defaultProperty

function defaultProperty (get, set) {
  return {
    configurable: true,
    enumerable: true,
    get: get,
    set: set
  }
}

},{}],35:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS9ndWlsbGF1bWUvZGV2L3Byb2plY3RzL2VxdWFsaXplci9hcHAvc2NyaXB0cy9tYWluLmpzIiwiL2hvbWUvZ3VpbGxhdW1lL2Rldi9wcm9qZWN0cy9lcXVhbGl6ZXIvYXBwL3NjcmlwdHMvbW9kdWxlcy9hdWRpby5qcyIsIi9ob21lL2d1aWxsYXVtZS9kZXYvcHJvamVjdHMvZXF1YWxpemVyL2FwcC9zY3JpcHRzL21vZHVsZXMvYmxvYi5qcyIsIi9ob21lL2d1aWxsYXVtZS9kZXYvcHJvamVjdHMvZXF1YWxpemVyL2FwcC9zY3JpcHRzL21vZHVsZXMvZW1pdHRlci5qcyIsIi9ob21lL2d1aWxsYXVtZS9kZXYvcHJvamVjdHMvZXF1YWxpemVyL2FwcC9zY3JpcHRzL21vZHVsZXMva2V5Ym9hcmQuanMiLCIvaG9tZS9ndWlsbGF1bWUvZGV2L3Byb2plY3RzL2VxdWFsaXplci9hcHAvc2NyaXB0cy9tb2R1bGVzL3JpYmJvbi5qcyIsIi9ob21lL2d1aWxsYXVtZS9kZXYvcHJvamVjdHMvZXF1YWxpemVyL2FwcC9zY3JpcHRzL21vZHVsZXMvc2NlbmUuanMiLCIvaG9tZS9ndWlsbGF1bWUvZGV2L3Byb2plY3RzL2VxdWFsaXplci9hcHAvc2NyaXB0cy9tb2R1bGVzL3Rlc3QuanMiLCIvaG9tZS9ndWlsbGF1bWUvZGV2L3Byb2plY3RzL2VxdWFsaXplci9hcHAvc2NyaXB0cy9tb2R1bGVzL3V0aWxzLmpzIiwiL2hvbWUvZ3VpbGxhdW1lL2Rldi9wcm9qZWN0cy9lcXVhbGl6ZXIvYXBwL3NjcmlwdHMvbW9kdWxlcy93YXJwLmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2V2ZW50cy9ldmVudHMuanMiLCJub2RlX21vZHVsZXMvb3JiaXQtY29udHJvbHMvaW5kZXguanMiLCJub2RlX21vZHVsZXMvb3JiaXQtY29udHJvbHMvbGliL2lucHV0LmpzIiwibm9kZV9tb2R1bGVzL29yYml0LWNvbnRyb2xzL25vZGVfbW9kdWxlcy9jbGFtcC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9vcmJpdC1jb250cm9scy9ub2RlX21vZHVsZXMvZGVmaW5lZC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9vcmJpdC1jb250cm9scy9ub2RlX21vZHVsZXMvZ2wtcXVhdC9pbnZlcnQuanMiLCJub2RlX21vZHVsZXMvb3JiaXQtY29udHJvbHMvbm9kZV9tb2R1bGVzL2dsLXF1YXQvbm9kZV9tb2R1bGVzL2dsLXZlYzQvbm9ybWFsaXplLmpzIiwibm9kZV9tb2R1bGVzL29yYml0LWNvbnRyb2xzL25vZGVfbW9kdWxlcy9nbC1xdWF0L25vcm1hbGl6ZS5qcyIsIm5vZGVfbW9kdWxlcy9vcmJpdC1jb250cm9scy9ub2RlX21vZHVsZXMvZ2wtdmVjMy9hZGQuanMiLCJub2RlX21vZHVsZXMvb3JiaXQtY29udHJvbHMvbm9kZV9tb2R1bGVzL2dsLXZlYzMvY29weS5qcyIsIm5vZGVfbW9kdWxlcy9vcmJpdC1jb250cm9scy9ub2RlX21vZHVsZXMvZ2wtdmVjMy9jcm9zcy5qcyIsIm5vZGVfbW9kdWxlcy9vcmJpdC1jb250cm9scy9ub2RlX21vZHVsZXMvZ2wtdmVjMy9kb3QuanMiLCJub2RlX21vZHVsZXMvb3JiaXQtY29udHJvbHMvbm9kZV9tb2R1bGVzL2dsLXZlYzMvbGVuZ3RoLmpzIiwibm9kZV9tb2R1bGVzL29yYml0LWNvbnRyb2xzL25vZGVfbW9kdWxlcy9nbC12ZWMzL25vcm1hbGl6ZS5qcyIsIm5vZGVfbW9kdWxlcy9vcmJpdC1jb250cm9scy9ub2RlX21vZHVsZXMvZ2wtdmVjMy9zZXQuanMiLCJub2RlX21vZHVsZXMvb3JiaXQtY29udHJvbHMvbm9kZV9tb2R1bGVzL2dsLXZlYzMvc3VidHJhY3QuanMiLCJub2RlX21vZHVsZXMvb3JiaXQtY29udHJvbHMvbm9kZV9tb2R1bGVzL2dsLXZlYzMvdHJhbnNmb3JtUXVhdC5qcyIsIm5vZGVfbW9kdWxlcy9vcmJpdC1jb250cm9scy9ub2RlX21vZHVsZXMvbW91c2UtZXZlbnQtb2Zmc2V0L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL29yYml0LWNvbnRyb2xzL25vZGVfbW9kdWxlcy9tb3VzZS13aGVlbC9ub2RlX21vZHVsZXMvdG8tcHgvbm9kZV9tb2R1bGVzL3BhcnNlLXVuaXQvaW5kZXguanMiLCJub2RlX21vZHVsZXMvb3JiaXQtY29udHJvbHMvbm9kZV9tb2R1bGVzL21vdXNlLXdoZWVsL25vZGVfbW9kdWxlcy90by1weC90b3B4LmpzIiwibm9kZV9tb2R1bGVzL29yYml0LWNvbnRyb2xzL25vZGVfbW9kdWxlcy9tb3VzZS13aGVlbC93aGVlbC5qcyIsIm5vZGVfbW9kdWxlcy9vcmJpdC1jb250cm9scy9ub2RlX21vZHVsZXMvcXVhdC1mcm9tLXVuaXQtdmVjMy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9vcmJpdC1jb250cm9scy9ub2RlX21vZHVsZXMvdG91Y2gtcGluY2gvaW5kZXguanMiLCJub2RlX21vZHVsZXMvb3JiaXQtY29udHJvbHMvbm9kZV9tb2R1bGVzL3RvdWNoLXBpbmNoL25vZGVfbW9kdWxlcy9kcHJvcC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9vcmJpdC1jb250cm9scy9ub2RlX21vZHVsZXMvdG91Y2gtcGluY2gvbm9kZV9tb2R1bGVzL2dsLXZlYzIvZGlzdGFuY2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs4QkNBd0IsaUJBQWlCOzs0QkFDbkIsZUFBZTs7NEJBQ2YsZUFBZTs7QUFFckMsSUFBSSxPQUFPLEdBQUcsNkJBQWEsQ0FBQzs7QUFFNUIsSUFBSSxLQUFLLEdBQUcsd0JBQVcsT0FBTyxDQUFFLENBQUM7O0FBRWpDLElBQUksS0FBSyxHQUFHLHdCQUFXLE9BQU8sRUFBRSxLQUFLLENBQUUsQ0FBQzs7QUFFeEMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7O0lDUFAsS0FBSztBQUVJLGFBRlQsS0FBSyxD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QUFBLEdBQUssTUFBTSxDQUFDO0tBRTVFOzs7V0FFTSxtQkFBRzs7QUFFVCxhQUFPLElBQUksQ0FBQyxJQUFJLENBQUM7S0FFakI7OztTQXZHRyxJQUFJOzs7UUEyR0QsSUFBSSxHQUFKLElBQUk7OztBQzdHYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0IHsgRW1pdHRlciB9IGZyb20gJ21vZHVsZXMvZW1pdHRlcic7XG5pbXBvcnQgeyBTY2VuZSB9IGZyb20gJ21vZHVsZXMvc2NlbmUnO1xuaW1wb3J0IHsgQXVkaW8gfSBmcm9tICdtb2R1bGVzL2F1ZGlvJztcblxubGV0IGVtaXR0ZXIgPSBuZXcgRW1pdHRlcigpO1xuXG5sZXQgYXVkaW8gPSBuZXcgQXVkaW8oIGVtaXR0ZXIgKTtcblxubGV0IHNjZW5lID0gbmV3IFNjZW5lKCBlbWl0dGVyLCBhdWRpbyApO1xuXG5zY2VuZS5pbml0KCk7XG5cbiIsIi8vIFdhbnQgdG8gY3VzdG9taXplIHRoaW5ncyA/XG4vLyBodHRwOi8vd3d3LmFpcnRpZ2h0aW50ZXJhY3RpdmUuY29tL2RlbW9zL2pzL3ViZXJ2aXovYXVkaW9hbmFseXNpcy9cblxuY2xhc3MgQXVkaW8gIHtcblxuICAgIGNvbnN0cnVjdG9yKCBlbWl0dGVyICkge1xuXG4gICAgICAgIHRoaXMuZW1pdHRlciA9IGVtaXR0ZXI7XG4gICAgICAgIHRoaXMuY29udGV4dCA9IG5ldyBBdWRpb0NvbnRleHQoKTtcblxuICAgICAgICB0aGlzLmJ1ZmZlclNpemUgPSAxMDI0OyBcblxuICAgICAgICB0aGlzLmFuYWx5c2VyID0gdGhpcy5jb250ZXh0LmNyZWF0ZUFuYWx5c2VyKCk7XG4gICAgICAgIHRoaXMuYW5hbHlzZXIuZmZ0U2l6ZSA9IHRoaXMuYnVmZmVyU2l6ZTtcbiAgICAgICAgdGhpcy5iaW5Db3VudCA9IHRoaXMuYW5hbHlzZXIuZnJlcXVlbmN5QmluQ291bnQ7IC8vIHRoaXMuYnVmZmVyU2l6ZSAvIDJcbiAgICAgICAgY29uc29sZS5sb2coIHRoaXMuYmluQ291bnQgKTtcblxuICAgICAgICB0aGlzLmRhdGFGcmVxQXJyYXkgPSBuZXcgVWludDhBcnJheSggdGhpcy5iaW5Db3VudCApO1xuICAgICAgICB0aGlzLmRhdGFUaW1lQXJyYXkgPSBuZXcgVWludDhBcnJheSggdGhpcy5iaW5Db3VudCApO1xuXG4gICAgICAgIHRoaXMuYmluZHMgPSB7fTtcbiAgICAgICAgdGhpcy5iaW5kcy5vbkxvYWQgPSB0aGlzLm9uTG9hZC5iaW5kKCB0aGlzICk7XG4gICAgfVxuXG4gICAgbG9hZCggdXJsICkge1xuXG4gICAgICAgIHRoaXMucmVxdWVzdCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgICAgICB0aGlzLnJlcXVlc3Qub3BlbiggXCJHRVRcIiwgdXJsLCB0cnVlICk7XG4gICAgICAgIHRoaXMucmVxdWVzdC5yZXNwb25zZVR5cGUgPSBcImFycmF5YnVmZmVyXCI7XG5cbiAgICAgICAgdGhpcy5yZXF1ZXN0Lm9ubG9hZCA9IHRoaXMuYmluZHMub25Mb2FkO1xuICAgICAgICB0aGlzLnJlcXVlc3Quc2VuZCgpO1xuICAgIH1cblxuICAgIG9uTG9hZCgpIHtcbiAgICAgICAgdGhpcy5jb250ZXh0LmRlY29kZUF1ZGlvRGF0YSggdGhpcy5yZXF1ZXN0LnJlc3BvbnNlLCAoIGJ1ZmZlciApID0+IHtcblxuICAgICAgICAgICAgdGhpcy5zb3VyY2UgPSB0aGlzLmNvbnRleHQuY3JlYXRlQnVmZmVyU291cmNlKCk7XG4gICAgICAgICAgICB0aGlzLnNvdXJjZS5jb25uZWN0KCB0aGlzLmFuYWx5c2VyICk7XG4gICAgICAgICAgICB0aGlzLnNvdXJjZS5idWZmZXIgPSBidWZmZXI7XG4gICAgICAgICAgICB0aGlzLnNvdXJjZS5jb25uZWN0KCB0aGlzLmNvbnRleHQuZGVzdGluYXRpb24gKTtcbiAgICAgICAgICAgIHRoaXMuc291cmNlLnN0YXJ0KCAwICk7XG5cbiAgICAgICAgICAgIHRoaXMuZW1pdHRlci5lbWl0KCBcInN0YXJ0XCIgKTtcbiAgICAgICAgfSwgKCkgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coIFwiZXJyb3JcIiApXG4gICAgICAgIH0gKTtcbiAgICB9XG5cbiAgICBnZXREYXRhKCkge1xuICAgICAgICB0aGlzLmFuYWx5c2VyLmdldEJ5dGVGcmVxdWVuY3lEYXRhKCB0aGlzLmRhdGFGcmVxQXJyYXkgKTtcbiAgICAgICAgdGhpcy5hbmFseXNlci5nZXRCeXRlVGltZURvbWFpbkRhdGEoIHRoaXMuZGF0YVRpbWVBcnJheSApO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGZyZXE6IHRoaXMuZGF0YUZyZXFBcnJheSwgLy8gZnJvbSAwIC0gMjU2LCBubyBzb3VuZCA9IDBcbiAgICAgICAgICB0aW1lOiB0aGlzLmRhdGFUaW1lQXJyYXkgLy8gZnJvbSAwIC0yNTYsIG5vIHNvdW5kID0gMTI4XG4gICAgICAgIH07XG4gICAgfVxuXG59XG5cbmV4cG9ydCB7IEF1ZGlvIH07XG5cbiIsImltcG9ydCB7IFV0aWxzIH0gZnJvbSAnLi91dGlscyc7XG5cbmxldCBnbHNsaWZ5ID0gcmVxdWlyZSgnZ2xzbGlmeScpO1xubGV0IHV0aWxzID0gbmV3IFV0aWxzKCk7XG5cbmNsYXNzIEJsb2Ige1xuXG4gIGNvbnN0cnVjdG9yKCBzY2VuZSwgZW1pdHRlciApIHtcblxuXHRcdHRoaXMuc2NlbmUgPSBzY2VuZTtcblxuXHRcdHRoaXMuZW1pdHRlciA9IGVtaXR0ZXI7XG5cblx0XHR0aGlzLnBhcnRpY2xlc0NvdW50ID0gMTAwMDA7XG5cbiAgICAgICAgdGhpcy5yYWRpdXMgPSAxO1xuICAgICAgICB0aGlzLndpZHRoU2VnbWVudHMgPSAxNzU7XG4gICAgICAgIHRoaXMuaGVpZ2h0U2VnbWVudHMgPSAxNzU7XG4gICAgICAgIHRoaXMuYW1wbGl0dWRlID0gMjtcblxuICAgICAgICB0aGlzLnZlcnRleFNoYWRlciA9IGdsc2xpZnkoJy4uLy4uL3ZlcnRleC1zaGFkZXJzL2Jsb2IudmVydCcpO1xuXG4gICAgICAgIHRoaXMuZnJhZ21lbnRTaGFkZXIgPSBnbHNsaWZ5KCcuLi8uLi9mcmFnbWVudC1zaGFkZXJzL2Jsb2IuZnJhZycpO1xuXG4gICAgICAgIC8vIGxldCB0ZXh0dXJlID0gVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZSggXCJpbWFnZXMvbm9pc2Vidy5wbmdcIiApO1xuICAgICAgICAvLyB0ZXh0dXJlLndyYXBTID0gVEhSRUUuUmVwZWF0V3JhcHBpbmc7XG4gICAgICAgIC8vIHRleHR1cmUud3JhcFQgPSBUSFJFRS5SZXBlYXRXcmFwcGluZztcbiAgICAgICAgLy8gdGV4dHVyZS5yZXBlYXQuc2V0KCA0LCA0ICk7XG5cbiAgICAgICAgdGhpcy5tYXRlcmlhbCA9IG5ldyBUSFJFRS5TaGFkZXJNYXRlcmlhbCh7XG4gICAgICAgICAgICB1bmlmb3JtczogeyBcbiAgICAgICAgICAgICAgICBcInRpbWVcIjogeyB0eXBlOiBcImZcIiwgdmFsdWU6IDAgfSxcbiAgICAgICAgICAgICAgICBcImFtcGxpdHVkZVwiOiB7IHR5cGU6IFwiZlwiLCB2YWx1ZTogdGhpcy5hbXBsaXR1ZGUgfSxcbiAgICAgICAgICAgICAgICBcInJlc29sdXRpb25cIjogeyB0eXBlOiBcInYyXCIsIHZhbHVlOiBuZXcgVEhSRUUuVmVjdG9yMiggd2luZG93LmlubmVyV2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodCApIH0sXG4gICAgICAgICAgICAgICAgLy8gdGV4dHVyZTogeyB0eXBlOiBcInRcIiwgdmFsdWU6IHRleHR1cmUgfVxuICAgICAgICAgICAgfSwgXG4gICAgICAgICAgICBzaWRlOiBUSFJFRS5Eb3VibGVTaWRlLFxuICAgICAgICAgICAgdmVydGV4U2hhZGVyOiB0aGlzLnZlcnRleFNoYWRlcixcbiAgICAgICAgICAgIGZyYWdtZW50U2hhZGVyOiB0aGlzLmZyYWdtZW50U2hhZGVyLFxuICAgICAgICAgICAgc2hhZGluZzogVEhSRUUuU21vb3RoU2hhZGluZyxcbiAgICAgICAgICAgIHRyYW5zcGFyZW50OiB0cnVlXG4gICAgICAgIH0pO1xuXG5cbiAgICAgICAgbGV0IGdlb21ldHJ5ID0gbmV3IFRIUkVFLlNwaGVyZUdlb21ldHJ5KCB0aGlzLnJhZGl1cywgdGhpcy53aWR0aFNlZ21lbnRzLCB0aGlzLmhlaWdodFNlZ21lbnRzICk7XG4gICAgICAgIC8vIGxldCBnZW9tZXRyeSA9IG5ldyBUSFJFRS5DaXJjbGVHZW9tZXRyeSggdGhpcy5yYWRpdXMsIHRoaXMud2lkdGhTZWdtZW50cyApO1xuXHRcdCAgICB0aGlzLmdlb21ldHJ5ID0gZ2VvbWV0cnk7XG5cbiAgICAgICAgdGhpcy5tZXNoID0gbmV3IFRIUkVFLk1lc2goIHRoaXMuZ2VvbWV0cnksIHRoaXMubWF0ZXJpYWwgKTtcblxuICAgICAgICB0aGlzLm1lc2gucm90YXRpb24ueCA9IDY7XG4gICAgICAgIHRoaXMubWVzaC5yb3RhdGlvbi55ID0gLTUuODtcbiAgICAgICAgdGhpcy5tZXNoLnJvdGF0aW9uLnogPSAxLjM7XG5cbiAgICAgICAgdGhpcy5jbG9jayA9IERhdGUubm93KCk7XG5cbiAgICAgICAgdGhpcy5zY2VuZS5hZGQoIHRoaXMubWVzaCApO1xuXG4gIH1cblxuICB1cGRhdGUoIHNvdW5kRGF0YSApIHsgXG5cbiAgXHRcblxuICAgIGlmICggc291bmREYXRhICkge1xuXG4gICAgICBsZXQgdGltZSA9IHNvdW5kRGF0YS50aW1lO1xuICAgICAgbGV0IGF2ZXJhZ2UgPSAwO1xuXG4gICAgICBmb3IodmFyIGkgPSAwOyBpIDwgdGltZS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGF2ZXJhZ2UgKz0gdGltZVsgaSBdO1xuICAgICAgfVxuXG4gICAgICBhdmVyYWdlIC89IDUxMjtcblxuICAgICAgbGV0IGZyZXF1ZW5jZSA9IE1hdGguYWJzKCBhdmVyYWdlIC0gMTI4ICk7XG5cbiAgICAgIGlmICggZnJlcXVlbmNlID4gMTUgKSB7XG4gICAgICAgIHRoaXMuYW1wbGl0dWRlICs9IDAuOTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuYW1wbGl0dWRlIC09IDAuMTtcbiAgICAgIH1cblxuICAgICAgaWYgKCB0aGlzLmFtcGxpdHVkZSA8IDIgKSB7XG4gICAgICAgIHRoaXMuYW1wbGl0dWRlID0gMjtcbiAgICAgIH1cblxuICAgICAgaWYgKCB0aGlzLmFtcGxpdHVkZSA+IDggKSB7XG4gICAgICAgIHRoaXMuYW1wbGl0dWRlID0gODtcbiAgICAgIH1cblxuICAgICAgaWYgKCB0aGlzLmFtcGxpdHVkZSA+IDIuNSApIHtcbiAgICAgICAgdGhpcy5lbWl0dGVyLmVtaXQoIFwiem9vbU91dFwiICk7XG4gICAgICB9IGVsc2UgaWYgKCB0aGlzLmFtcGxpdHVkZSA8IDIuMiApIHtcbiAgICAgICAgdGhpcy5lbWl0dGVyLmVtaXQoIFwiem9vbUluXCIgKTtcbiAgICAgIH1cblxuICAgICAgXG5cbiAgICB9XG5cbiAgICB0aGlzLm1hdGVyaWFsLnVuaWZvcm1zW1widGltZVwiXS52YWx1ZSA9ICggRGF0ZS5ub3coKSAtIHRoaXMuY2xvY2sgKSAqIDAuMDAwODtcbiAgICB0aGlzLm1lc2gubWF0ZXJpYWwudW5pZm9ybXNbICdhbXBsaXR1ZGUnIF0udmFsdWUgPSB0aGlzLmFtcGxpdHVkZTtcblxuICB9XG5cbiAgc2V0UG9zaXRpb24oeCwgeSwgeikge1xuXG4gICAgdGhpcy5tZXNoLnBvc2l0aW9uLnggPSB4O1xuICAgIHRoaXMubWVzaC5wb3NpdGlvbi55ID0geTtcbiAgICB0aGlzLm1lc2gucG9zaXRpb24ueiA9IHo7XG5cbiAgfVxuXG4gIGdldE1lc2goKSB7XG5cbiAgXHRyZXR1cm4gdGhpcy5tZXNoO1xuXG4gIH1cblxufVxuXG5leHBvcnQgeyBCbG9iIH07IiwibGV0IEV2ZW50RW1pdHRlciA9IHJlcXVpcmUoJ2V2ZW50cycpO1xuXG5jbGFzcyBFbWl0dGVyIGV4dGVuZHMgRXZlbnRFbWl0dGVyIHtcblxuXHRjb25zdHJ1Y3RvcigpIHtcblxuXHRcdHN1cGVyKCk7XG5cblx0fVxuXG59XG5cbmV4cG9ydCB7IEVtaXR0ZXIgfTsiLCJjbGFzcyBLZXlib2FyZCB7XG5cbiAgICBjb25zdHJ1Y3RvciggZW1pdHRlciApIHtcblxuICAgICAgICB0aGlzLmVtaXR0ZXIgPSBlbWl0dGVyO1xuXG4gICAgXHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCB0aGlzLmtleWRvd24uYmluZCggdGhpcyApICk7XG5cbiAgICBcdHRoaXMudGFyZ2V0cyA9IFtdO1xuXG4gICAgXHR0aGlzLnRhcmdldEluZGV4ID0gMDtcblxuICAgIFx0dGhpcy50YXJnZXQgPSBudWxsO1xuXG4gICAgfVxuXG4gICAga2V5ZG93biggZSApIHtcblxuICAgICAgICBjb25zb2xlLmxvZyggZS5rZXlDb2RlICk7XG5cbiAgICAgICAgLy8gQ1RSTFxuICAgICAgICBpZiAoIGUua2V5Q29kZSA9PSAxNykge1xuXG4gICAgICAgIFx0aWYgKCB0aGlzLnRhcmdldHMubGVuZ3RoID4gMCApIHtcbiAgICAgICAgXHRcdHRoaXMudGFyZ2V0SW5kZXgrKztcblxuICAgICAgICBcdFx0aWYgKCB0aGlzLnRhcmdldEluZGV4ID09IHRoaXMudGFyZ2V0cy5sZW5ndGggKSB7XG4gICAgICAgIFx0XHRcdHRoaXMudGFyZ2V0SW5kZXggPSAwO1xuICAgICAgICBcdFx0fVxuXG4gICAgICAgIFx0XHR0aGlzLnRhcmdldCA9IHRoaXMudGFyZ2V0c1sgdGhpcy50YXJnZXRJbmRleCBdO1xuICAgICAgICBcdH1cblxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBzd2l0Y2goIGUua2V5Q29kZSApIHtcblxuICAgICAgICBcdGNhc2UgMTM6IC8vIEVOVEVSXG4gICAgICAgIFx0XHR0aGlzLnRhcmdldC5wb3NpdGlvbi56IC09IDAuMTtcbiAgICAgICAgXHRcdGNvbnNvbGUubG9nKCBcInBvc2l0aW9uLno6XCIsIHRoaXMudGFyZ2V0LnBvc2l0aW9uLnopO1xuICAgICAgICBcdGJyZWFrOyBcbiAgICAgICAgXHRjYXNlIDMyOiAvLyBTUEFDRVxuICAgICAgICBcdFx0dGhpcy50YXJnZXQucG9zaXRpb24ueiArPSAwLjE7XG4gICAgICAgIFx0XHRjb25zb2xlLmxvZyggXCJwb3NpdGlvbi56OlwiLCB0aGlzLnRhcmdldC5wb3NpdGlvbi56KTtcbiAgICAgICAgXHRicmVhaztcbiAgICAgICAgXHRjYXNlIDM4OiAvLyBVUFxuICAgICAgICBcdFx0dGhpcy50YXJnZXQucG9zaXRpb24ueSArPSAwLjE7XG4gICAgICAgIFx0XHRjb25zb2xlLmxvZyggXCJwb3NpdGlvbi55OlwiLCB0aGlzLnRhcmdldC5wb3NpdGlvbi55KTtcbiAgICAgICAgXHRicmVhazsgXG4gICAgICAgIFx0Y2FzZSA0MDogLy8gRE9XTlxuICAgICAgICBcdFx0dGhpcy50YXJnZXQucG9zaXRpb24ueSAtPSAwLjE7XG4gICAgICAgIFx0XHRjb25zb2xlLmxvZyggXCJwb3NpdGlvbi55OlwiLCB0aGlzLnRhcmdldC5wb3NpdGlvbi55KTtcbiAgICAgICAgXHRicmVhaztcbiAgICAgICAgXHRjYXNlIDM3OiAvLyBMRUZUXG4gICAgICAgIFx0XHR0aGlzLnRhcmdldC5wb3NpdGlvbi54IC09IDAuMTtcbiAgICAgICAgXHRcdGNvbnNvbGUubG9nKCBcInBvc2l0aW9uLng6XCIsIHRoaXMudGFyZ2V0LnBvc2l0aW9uLngpO1xuICAgICAgICBcdGJyZWFrOyBcbiAgICAgICAgXHRjYXNlIDM5OiAvLyBSSUdIVFxuICAgICAgICBcdFx0dGhpcy50YXJnZXQucG9zaXRpb24ueCArPSAwLjE7XG4gICAgICAgIFx0XHRjb25zb2xlLmxvZyggXCJwb3NpdGlvbi54OlwiLCB0aGlzLnRhcmdldC5wb3NpdGlvbi54KTtcbiAgICAgICAgXHRicmVhaztcbiAgICAgICAgXHRjYXNlIDY1OiAvLyBBXG4gICAgICAgIFx0XHR0aGlzLnRhcmdldC5yb3RhdGlvbi56IC09IDAuMTtcbiAgICAgICAgXHRcdGNvbnNvbGUubG9nKCBcInJvdGF0aW9uLno6XCIsIHRoaXMudGFyZ2V0LnJvdGF0aW9uLnopO1xuICAgICAgICBcdGJyZWFrOyBcbiAgICAgICAgXHRjYXNlIDY5OiAvLyBFXG4gICAgICAgIFx0XHR0aGlzLnRhcmdldC5yb3RhdGlvbi56ICs9IDAuMTtcbiAgICAgICAgXHRcdGNvbnNvbGUubG9nKCBcInJvdGF0aW9uLno6XCIsIHRoaXMudGFyZ2V0LnJvdGF0aW9uLnopO1xuICAgICAgICBcdGJyZWFrO1xuICAgICAgICBcdGNhc2UgOTA6IC8vIFpcbiAgICAgICAgXHRcdHRoaXMudGFyZ2V0LnJvdGF0aW9uLnkgLT0gMC4xO1xuICAgICAgICBcdFx0Y29uc29sZS5sb2coIFwicm90YXRpb24ueTpcIiwgdGhpcy50YXJnZXQucm90YXRpb24ueSk7XG4gICAgICAgIFx0YnJlYWs7IFxuICAgICAgICBcdGNhc2UgODM6IC8vIFNcbiAgICAgICAgXHRcdHRoaXMudGFyZ2V0LnJvdGF0aW9uLnkgKz0gMC4xO1xuICAgICAgICBcdFx0Y29uc29sZS5sb2coIFwicm90YXRpb24ueTpcIiwgdGhpcy50YXJnZXQucm90YXRpb24ueSk7XG4gICAgICAgIFx0YnJlYWs7XG4gICAgICAgIFx0Y2FzZSA4MTogLy8gUVxuICAgICAgICBcdFx0dGhpcy50YXJnZXQucm90YXRpb24ueCAtPSAwLjE7XG4gICAgICAgIFx0XHRjb25zb2xlLmxvZyggXCJyb3RhdGlvbi54OlwiLCB0aGlzLnRhcmdldC5yb3RhdGlvbi54KTtcbiAgICAgICAgXHRicmVhazsgXG4gICAgICAgIFx0Y2FzZSA2ODogLy8gRFxuICAgICAgICBcdFx0dGhpcy50YXJnZXQucm90YXRpb24ueCArPSAwLjE7XG4gICAgICAgIFx0XHRjb25zb2xlLmxvZyggXCJyb3RhdGlvbi54OlwiLCB0aGlzLnRhcmdldC5yb3RhdGlvbi54KTtcbiAgICAgICAgXHRicmVhaztcbiAgICAgICAgfVxuXG4gICAgfVxuXG4gICAgYWRkT2JqZWN0KCBvYmplY3QgKSB7XG5cbiAgICBcdHRoaXMudGFyZ2V0cy5wdXNoKCBvYmplY3QgKTtcblxuICAgIFx0aWYgKCB0aGlzLnRhcmdldHMubGVuZ3RoID09IDEgKSB7XG4gICAgXHRcdHRoaXMudGFyZ2V0ID0gdGhpcy50YXJnZXRzWyB0aGlzLnRhcmdldEluZGV4IF07XG4gICAgXHR9XG4gICAgfVxuXG59XG5cbmV4cG9ydCB7IEtleWJvYXJkIH07IiwibGV0IGdsc2xpZnkgPSByZXF1aXJlKCdnbHNsaWZ5Jyk7XG5cbmNsYXNzIFJpYmJvbiB7XG5cbiAgY29uc3RydWN0b3IoIHNjZW5lLCBlbWl0dGVyICkge1xuXG4gICAgdGhpcy5zY2VuZSA9IHNjZW5lO1xuICAgIFxuICAgIHRoaXMuc3RhcnRQb2ludCA9IG5ldyBUSFJFRS5WZWN0b3IzKCAtMjAsIDAsIDAgKTtcblxuICAgIHRoaXMuZW5kUG9pbnQgPSBuZXcgVEhSRUUuVmVjdG9yMyggNDAsIDUsIDAgKTtcblxuICAgIHRoaXMuc2VnbWVudHMgPSAzMDtcblxuICAgIHRoaXMudmVydGV4U2hhZGVyID0gZ2xzbGlmeSgnLi4vLi4vdmVydGV4LXNoYWRlcnMvcmliYm9uLnZlcnQnKTtcblxuICAgIHRoaXMuZnJhZ21lbnRTaGFkZXIgPSBnbHNsaWZ5KCcuLi8uLi9mcmFnbWVudC1zaGFkZXJzL3NpbXBsZS5mcmFnJyk7XG5cbiAgICB0aGlzLnBsYW5lR2VvbWV0cnkgPSBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeSggMSwgMSwgMSwgdGhpcy5zZWdtZW50cyApO1xuXG4gICAgdGhpcy5tYXRlcmlhbCA9IG5ldyBUSFJFRS5TaGFkZXJNYXRlcmlhbCh7XG4gICAgICAgICAgICB1bmlmb3JtczogeyBcbiAgICAgICAgICAgICAgICB0aW1lOiB7IHR5cGU6IFwiZlwiLCB2YWx1ZTogMCB9LFxuICAgICAgICAgICAgICAgIG9wYWNpdHk6IHsgdHlwZTogXCJmXCIsIHZhbHVlOiAxLjAgfSxcbiAgICAgICAgICAgICAgICBlbmRwb2ludDogeyB0eXBlOiBcInYzXCIsIHZhbHVlOiB0aGlzLmVuZFBvaW50IH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB2ZXJ0ZXhTaGFkZXI6IHRoaXMudmVydGV4U2hhZGVyLFxuICAgICAgICAgICAgZnJhZ21lbnRTaGFkZXI6IHRoaXMuZnJhZ21lbnRTaGFkZXIsXG4gICAgICAgICAgICBzaGFkaW5nOiBUSFJFRS5TbW9vdGhTaGFkaW5nLFxuICAgICAgICAgICAgd2lyZWZyYW1lOiB0cnVlXG4gICAgICAgIH0pO1xuXG4gICAgdmFyIG51bVBvaW50cyA9IDEwMDtcblxuICAgIGxldCBzcGxpbmUgPSBuZXcgVEhSRUUuQ2F0bXVsbFJvbUN1cnZlMyhbXG4gICAgICAgbmV3IFRIUkVFLlZlY3RvcjMoLTIwLCAtMTAsIDApLFxuICAgICAgIG5ldyBUSFJFRS5WZWN0b3IzKC0xMCwgLTEwLCAwKSxcbiAgICAgICBuZXcgVEhSRUUuVmVjdG9yMygtNSwgLTcsIDApLFxuICAgICAgIG5ldyBUSFJFRS5WZWN0b3IzKDAsIC0xMCwgMCksXG4gICAgICAgbmV3IFRIUkVFLlZlY3RvcjMoNSwgLTcsIDApLFxuICAgICAgIG5ldyBUSFJFRS5WZWN0b3IzKDEwLCAtMTAsIDApLFxuICAgICAgIG5ldyBUSFJFRS5WZWN0b3IzKDIwLCAtMTAsIDApLFxuICAgIF0pO1xuXG4gICAgdGhpcy5nZW9tZXRyeSA9IG5ldyBUSFJFRS5HZW9tZXRyeSgpO1xuICAgIHZhciBzcGxpbmVQb2ludHMgPSBzcGxpbmUuZ2V0UG9pbnRzKG51bVBvaW50cyk7XG5cbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgc3BsaW5lUG9pbnRzLmxlbmd0aDsgaSsrKXtcbiAgICAgICAgdGhpcy5nZW9tZXRyeS52ZXJ0aWNlcy5wdXNoKHNwbGluZVBvaW50c1tpXSk7ICBcbiAgICB9XG5cbiAgICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTGluZUJhc2ljTWF0ZXJpYWwoe1xuICAgICAgY29sb3I6IDB4ZmYwMGYwLFxuICB9KTtcblxuICAgIHRoaXMubWVzaCA9IG5ldyBUSFJFRS5MaW5lKCB0aGlzLmdlb21ldHJ5LCBtYXRlcmlhbCApO1xuXG4gICAgLy8gdGhpcy5tZXNoLnBvc2l0aW9uLnggPSB0aGlzLnN0YXJ0UG9pbnQueDtcbiAgICAvLyB0aGlzLm1lc2gucG9zaXRpb24ueSA9IHRoaXMuc3RhcnRQb2ludC55O1xuICAgIC8vIHRoaXMubWVzaC5wb3NpdGlvbi56ID0gdGhpcy5zdGFydFBvaW50Lno7XG5cbiAgICB0aGlzLmNsb2NrID0gRGF0ZS5ub3coKTtcblxuICAgIHRoaXMuc2NlbmUuYWRkKCB0aGlzLm1lc2ggKTtcblxuICB9XG5cbiAgZ2V0TWVzaCgpIHtcblxuICAgICAgICByZXR1cm4gdGhpcy5tZXNoO1xuXG4gIH1cblxuICB1cGRhdGUoIHNvdW5kRGF0YSApIHtcblxuICAgIFxuICB9XG5cbiAgZ2V0RGlzdGFuY2UoIHYxLCB2MiApIHtcblxuICAgIHJldHVybiBNYXRoLnNxcnQoICggdjEueCAtIHYyLnggKSAqICggdjEueCAtIHYyLnggKSArICggdjEueSAtIHYyLnkgKSAqICggdjEueSAtIHYyLnkgKSApO1xuXG4gIH1cbn1cblxuZXhwb3J0IHsgUmliYm9uIH07XG4iLCJpbXBvcnQgeyBLZXlib2FyZCB9IGZyb20gJy4va2V5Ym9hcmQnO1xuaW1wb3J0IHsgQXVkaW8gfSBmcm9tICcuL2F1ZGlvJztcbmltcG9ydCB7IFRlc3QgfSBmcm9tICcuL3Rlc3QnO1xuaW1wb3J0IHsgQmxvYiB9IGZyb20gJy4vYmxvYic7XG5pbXBvcnQgeyBXYXJwIH0gZnJvbSAnLi93YXJwJztcbmltcG9ydCB7IFJpYmJvbiB9IGZyb20gJy4vcmliYm9uJztcblxubGV0IENvbnRyb2xzID0gcmVxdWlyZSgnb3JiaXQtY29udHJvbHMnKTtcblxuY2xhc3MgU2NlbmUge1xuXG4gICAgY29uc3RydWN0b3IoIGVtaXR0ZXIsIHNvdW5kLCBvcHRpb25zID0ge30gKSB7XG5cbiAgICBcdHRoaXMuZW1pdHRlciA9IGVtaXR0ZXI7XG4gICAgICAgIHRoaXMuc291bmQgPSBzb3VuZDtcbiAgICBcdHRoaXMuc2NlbmUgPSBudWxsO1xuICAgIFx0dGhpcy5jYW1lcmEgPSBudWxsO1xuICAgICAgICB0aGlzLnJlbmRlcmVyID0gbnVsbDtcbiAgICAgICAgdGhpcy5jb21wb3NlciA9IG51bGw7XG4gICAgICAgIHRoaXMuY29udGFpbmVyID0gb3B0aW9ucy5jb250YWluZXIgfHwgZG9jdW1lbnQuYm9keTtcbiAgICAgICAgdGhpcy5jb250cm9scyA9IG51bGw7XG4gICAgICAgIHRoaXMua2V5Ym9hcmQgPSBudWxsO1xuXG4gICAgXHR0aGlzLnBhcmFtcyA9IHtcbiAgICBcdFx0YWN0aXZlOiBvcHRpb25zLmFjdGl2ZSB8fCB0cnVlLFxuXHQgICAgICAgIGhlaWdodDogb3B0aW9ucy5oZWlnaHQgfHwgd2luZG93LmlubmVySGVpZ2h0LFxuXHQgICAgICAgIHdpZHRoOiBvcHRpb25zLndpZHRoIHx8IHdpbmRvdy5pbm5lcldpZHRoXG4gICAgXHR9O1xuXG4gICAgXHR0aGlzLm1vdXNlID0ge1xuXHQgICAgICAgIHg6IG51bGwsXG5cdCAgICAgICAgeTogbnVsbFxuXHQgICAgfTtcblxuICAgICAgICB0aGlzLnpvb21pbmcgPSBmYWxzZTtcblxuICAgICAgICB0aGlzLmJsb2JzID0gW107XG5cblx0ICAgIHRoaXMuY2xvY2sgPSBudWxsO1xuXG4gICAgfVxuXG4gICAgaW5pdCgpIHtcblxuICAgICAgICB0aGlzLmtleWJvYXJkID0gbmV3IEtleWJvYXJkKCB0aGlzLmVtaXR0ZXIgKTsgIFxuICAgIFx0dGhpcy5zY2VuZSA9IG5ldyBUSFJFRS5TY2VuZSgpO1xuICAgIFx0dGhpcy5jYW1lcmEgPSBuZXcgVEhSRUUuUGVyc3BlY3RpdmVDYW1lcmEoIDQ1LCB0aGlzLnBhcmFtcy53aWR0aCAvIHRoaXMucGFyYW1zLmhlaWdodCwgMSwgMTAwMCApO1xuXG4gICAgICAgIHRoaXMudGFyZ2V0ID0gbmV3IFRIUkVFLlZlY3RvcjMoKTtcbiAgICAgICAgdGhpcy5jYW1lcmEubG9va0F0KHRoaXMudGFyZ2V0KTtcblxuICAgICAgICB0aGlzLmNhbWVyYS5wb3NpdGlvbi56ID0gMzU7XG5cbiAgICAgICAgdGhpcy5rZXlib2FyZC5hZGRPYmplY3QoIHRoaXMuY2FtZXJhICk7XG5cbiAgICAgICAgdGhpcy5zb3VuZCA9IG5ldyBBdWRpbyggdGhpcy5lbWl0dGVyICk7XG4gXG4gICAgXHR0aGlzLnJheWNhc3RlciA9IG5ldyBUSFJFRS5SYXljYXN0ZXIoKTtcblxuICAgICAgICB0aGlzLnRlc3QoKTtcblxuICAgICAgICB0aGlzLmFkZFJpYmJvbigpO1xuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMTsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLmFkZEJsb2IoKTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmxvYWRTb3VuZCgpO1xuXG4gICAgICAgIHRoaXMucmVuZGVyZXIgPSBuZXcgVEhSRUUuV2ViR0xSZW5kZXJlcih7XG5cdCAgICAgICAgYW50aWFsaWFzOiB0cnVlXG5cdCAgICB9KTtcblxuXHQgICAgdGhpcy5yZW5kZXJlci5zZXRDbGVhckNvbG9yKCAgMHgwMDAwMDAsIDEgKTtcbiAgICBcdHRoaXMucmVuZGVyZXIuc2V0U2l6ZSggdGhpcy5wYXJhbXMud2lkdGgsIHRoaXMucGFyYW1zLmhlaWdodCApO1xuXG4gICAgICAgIHRoaXMuY29udGFpbmVyLmFwcGVuZENoaWxkKCB0aGlzLnJlbmRlcmVyLmRvbUVsZW1lbnQgKTtcblxuICAgICAgICB0aGlzLmNvbnRyb2xzID0gbmV3IENvbnRyb2xzKHtcbiAgICAgICAgICAgIGRpc3RhbmNlOiAyMDAsXG4gICAgICAgIH0pO1xuXG4gICAgXHR0aGlzLmNsb2NrID0gRGF0ZS5ub3coKTtcblxuICAgIFx0dGhpcy5hZGRMaXN0ZW5lcnMoKTtcblxuICAgICAgICB0aGlzLmFuaW1hdGUoKTtcblxuICAgICAgICB0aGlzLnpvb21pbmcgPSB0cnVlO1xuXG4gICAgICAgIFR3ZWVuTWF4LnRvKCB0aGlzLmNvbnRyb2xzLCAyLCB7XG4gICAgICAgICAgICBkaXN0YW5jZTogNDAsXG4gICAgICAgICAgICBvbkNvbXBsZXRlOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy56b29taW5nID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgfVxuXG4gICAgbG9hZFNvdW5kKCkge1xuXG4gICAgICAgIHRoaXMuc291bmQubG9hZCggXCJtdXNpYy9qZWRpbWluZC5tcDNcIiApO1xuXG4gICAgfVxuXG4gICAgYWRkQmxvYigpIHtcblxuICAgICAgICB0aGlzLmJsb2JzLnB1c2goIG5ldyBCbG9iKCB0aGlzLnNjZW5lLCB0aGlzLmVtaXR0ZXIgKSApO1xuXG4gICAgICAgIHRoaXMua2V5Ym9hcmQuYWRkT2JqZWN0KCB0aGlzLmJsb2JzWyAwIF0uZ2V0TWVzaCgpICk7XG5cblxuICAgIH1cblxuICAgIGFkZFJpYmJvbigpIHtcblxuICAgICAgICB0aGlzLnJpYmJvbiA9IG5ldyBSaWJib24oIHRoaXMuc2NlbmUsIHRoaXMuZW1pdHRlciApO1xuXG4gICAgICAgIHRoaXMua2V5Ym9hcmQuYWRkT2JqZWN0KCB0aGlzLnJpYmJvbi5nZXRNZXNoKCkgKTtcblxuICAgIH1cblxuICAgIGFkZFdhcnAoKSB7XG5cbiAgICAgICAgdGhpcy53YXJwID0gbmV3IFdhcnAoIHRoaXMuc2NlbmUsIHRoaXMuZW1pdHRlciApO1xuXG4gICAgICAgIHRoaXMua2V5Ym9hcmQuYWRkT2JqZWN0KCB0aGlzLndhcnAuZ2V0TWVzaCgpICk7XG5cbiAgICB9XG5cbiAgICB0ZXN0KCkge1xuXG4gICAgICAgIHRoaXMudGVzdCA9IG5ldyBUZXN0KCB0aGlzLnNjZW5lLCB0aGlzLmVtaXR0ZXIgKTtcblxuICAgICAgICB0aGlzLmtleWJvYXJkLmFkZE9iamVjdCggdGhpcy50ZXN0LmdldE1lc2goKSApO1xuXG4gICAgfVxuXG4gICAgYW5pbWF0ZSggdHMgKSB7XG5cbiAgICAgICAgaWYgKHRoaXMucGFyYW1zLmFjdGl2ZSkge1xuICAgICAgICBcbiAgICAgICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoIHRoaXMuYW5pbWF0ZS5iaW5kKHRoaXMpICk7XG5cbiAgICAgICAgICAgIC8vIHRoaXMucmF5Y2FzdGVyLnNldEZyb21DYW1lcmEoIHRoaXMubW91c2UsIHRoaXMuY2FtZXJhICk7ICAgXG5cbiAgICAgICAgICAgIC8vIHZhciBpbnRlcnNlY3RzID0gdGhpcy5yYXljYXN0ZXIuaW50ZXJzZWN0T2JqZWN0cyggdGhpcy5zY2VuZS5jaGlsZHJlbiApO1xuXG4gICAgICAgICAgICAvLyBmb3IgKCB2YXIgaSA9IDA7IGkgPCBpbnRlcnNlY3RzLmxlbmd0aDsgaSsrICkge1xuICAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gfVxuXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuYmxvYnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB0aGlzLmJsb2JzW2ldLnVwZGF0ZSggdGhpcy5zb3VuZC5nZXREYXRhKCkgKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHRoaXMucmliYm9uLnVwZGF0ZSggdGhpcy5zb3VuZC5nZXREYXRhKCkgKTtcblxuICAgICAgICAgICAgdGhpcy50ZXN0LnVwZGF0ZSggdGhpcy5zb3VuZC5nZXREYXRhKCkgKTtcblxuICAgICAgICAgICAgdGhpcy5yZW5kZXIoIHRzICk7XG5cbiAgICAgICAgfVxuXG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuXG4gICAgXHRpZiAoIXRoaXMucGFyYW1zLmFjdGl2ZSlcbiAgICAgICAgXHR0aGlzLnBhcmFtcy5hY3RpdmUgPSB0cnVlO1xuXG4gICAgICAgIC8vIGNvbnN0IHBvc2l0aW9uID0gdGhpcy5jYW1lcmEucG9zaXRpb24udG9BcnJheSgpO1xuICAgICAgICAvLyBjb25zdCBkaXJlY3Rpb24gPSB0aGlzLnRhcmdldC50b0FycmF5KCk7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKHBvc2l0aW9uLCB0aGlzLnRhcmdldC5mcm9tQXJyYXkoZGlyZWN0aW9uKSApXG4gICAgICAgIC8vIHRoaXMuY29udHJvbHMudXBkYXRlKHBvc2l0aW9uLCBkaXJlY3Rpb24pO1xuICAgICAgICAvLyB0aGlzLmNhbWVyYS5wb3NpdGlvbi5mcm9tQXJyYXkocG9zaXRpb24pO1xuICAgICAgICAvLyB0aGlzLmNhbWVyYS5sb29rQXQodGhpcy50YXJnZXQuZnJvbUFycmF5KGRpcmVjdGlvbikpO1xuXG4gICAgICAgIHRoaXMucmVuZGVyZXIucmVuZGVyKCB0aGlzLnNjZW5lLCB0aGlzLmNhbWVyYSApOyAgICBcbiAgICB9XG5cbiAgICBhZGRMaXN0ZW5lcnMoKSB7IFxuXG4gICAgXHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ3Jlc2l6ZScsIHRoaXMub25XaW5kb3dSZXNpemUuYmluZCggdGhpcyApLCBmYWxzZSApO1xuXG4gICAgICAgIHRoaXMuZW1pdHRlci5vbignem9vbU91dCcsICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuem9vbU91dCgpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmVtaXR0ZXIub24oJ3pvb21JbicsICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuem9vbUluKCk7XG4gICAgICAgIH0pO1xuXG4gICAgfVxuXG4gICAgem9vbU91dCgpIHtcblxuICAgICAgICBpZiAoIHRoaXMuem9vbWluZyB8fCB0aGlzLmNvbnRyb2xzLmRpc3RhbmNlID09IDQ1ICkgcmV0dXJuO1xuXG4gICAgICAgIHRoaXMuem9vbWluZyA9IHRydWU7XG5cbiAgICAgICAgVHdlZW5NYXgudG8oIHRoaXMuY29udHJvbHMsIDIsIHtcbiAgICAgICAgICAgIGRpc3RhbmNlOiA0NSxcbiAgICAgICAgICAgIG9uQ29tcGxldGU6ICgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnpvb21pbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgem9vbUluKCkge1xuXG4gICAgICAgIGlmICggdGhpcy56b29taW5nIHx8IHRoaXMuY29udHJvbHMuZGlzdGFuY2UgPT0gNDAgKSByZXR1cm47XG5cbiAgICAgICAgdGhpcy56b29taW5nID0gdHJ1ZTtcblxuICAgICAgICBUd2Vlbk1heC50byggdGhpcy5jb250cm9scywgMiwge1xuICAgICAgICAgICAgZGlzdGFuY2U6IDQwLFxuICAgICAgICAgICAgb25Db21wbGV0ZTogKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuem9vbWluZyA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBvbldpbmRvd1Jlc2l6ZSgpIHtcblxuICAgIFx0dGhpcy5wYXJhbXMud2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aDtcblx0ICAgIHRoaXMucGFyYW1zLmhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodDtcblxuXHQgICAgdGhpcy5jYW1lcmEuYXNwZWN0ID0gdGhpcy5wYXJhbXMud2lkdGggLyB0aGlzLnBhcmFtcy5oZWlnaHQ7XG5cdCAgICB0aGlzLmNhbWVyYS51cGRhdGVQcm9qZWN0aW9uTWF0cml4KCk7XG5cblx0ICAgIHRoaXMucmVuZGVyZXIuc2V0U2l6ZSggdGhpcy5wYXJhbXMud2lkdGgsIHRoaXMucGFyYW1zLmhlaWdodCApO1xuXG4gICAgfVxuXG59XG5cbmV4cG9ydCB7IFNjZW5lIH07IiwibGV0IGdsc2xpZnkgPSByZXF1aXJlKCdnbHNsaWZ5Jyk7XG5cbmNsYXNzIFRlc3Qge1xuXG5cbiAgY29uc3RydWN0b3IoIHNjZW5lLCBlbWl0dGVyLCBvcHRpb25zID0ge30gKSB7XG5cblx0XHR0aGlzLnNjZW5lID0gc2NlbmU7XG5cblx0XHR0aGlzLmVtaXR0ZXIgPSBlbWl0dGVyO1xuXG5cdFx0dGhpcy5wYXJ0aWNsZXNDb3VudCA9IDEwMDAwO1xuXG4gICAgICAgIHRoaXMucmFkaXVzID0gMTA7XG4gICAgICAgIHRoaXMud2lkdGhTZWdtZW50cyA9IDUwO1xuICAgICAgICB0aGlzLmhlaWdodFNlZ21lbnRzID0gNTA7XG4gICAgICAgIHRoaXMuYW1wbGl0dWRlID0gMjtcblxuICAgICAgICB0aGlzLnZlcnRleFNoYWRlciA9IGdsc2xpZnkoJy4uLy4uL3ZlcnRleC1zaGFkZXJzL3Rlc3QudmVydCcpO1xuXG4gICAgICAgIHRoaXMuZnJhZ21lbnRTaGFkZXIgPSBnbHNsaWZ5KCcuLi8uLi9mcmFnbWVudC1zaGFkZXJzL3Rlc3QuZnJhZycpO1xuXG4gICAgICAgIGxldCB0ZXh0dXJlID0gVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZSggXCJpbWFnZXMvbWFwLnBuZ1wiICk7XG4gICAgICAgIC8vIGxldCB0ZXh0dXJlID0gVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZSggXCJpbWFnZXMvbWFwLmpwZ1wiICk7XG5cbiAgICAgICAgdGV4dHVyZS53cmFwUyA9IFRIUkVFLlJlcGVhdFdyYXBwaW5nO1xuICAgICAgICB0ZXh0dXJlLndyYXBUID0gVEhSRUUuUmVwZWF0V3JhcHBpbmc7XG4gICAgICAgIHRleHR1cmUucmVwZWF0LnNldCggNCwgNCApO1xuXG4gICAgICAgIHRoaXMubWF0ZXJpYWwgPSBuZXcgVEhSRUUuU2hhZGVyTWF0ZXJpYWwoe1xuICAgICAgICAgICAgdW5pZm9ybXM6IHsgXG4gICAgICAgICAgICAgICAgXCJ0aW1lXCI6IHsgdHlwZTogXCJmXCIsIHZhbHVlOiAwIH0sXG4gICAgICAgICAgICAgICAgXCJhbXBsaXR1ZGVcIjogeyB0eXBlOiBcImZcIiwgdmFsdWU6IHRoaXMuYW1wbGl0dWRlIH0sXG4gICAgICAgICAgICAgICAgXCJyZXNvbHV0aW9uXCI6IHsgdHlwZTogXCJ2MlwiLCB2YWx1ZTogbmV3IFRIUkVFLlZlY3RvcjIoIHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQgKSB9LFxuICAgICAgICAgICAgICAgIFwidGV4dHVyZVwiOiB7IHR5cGU6IFwidFwiLCB2YWx1ZTogdGV4dHVyZSB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNpZGU6IFRIUkVFLkRvdWJsZVNpZGUsXG4gICAgICAgICAgICB2ZXJ0ZXhTaGFkZXI6IHRoaXMudmVydGV4U2hhZGVyLFxuICAgICAgICAgICAgZnJhZ21lbnRTaGFkZXI6IHRoaXMuZnJhZ21lbnRTaGFkZXIsXG4gICAgICAgICAgICBzaGFkaW5nOiBUSFJFRS5TbW9vdGhTaGFkaW5nLFxuICAgICAgICAgICAgdHJhbnNwYXJlbnQ6IHRydWUsXG4gICAgICAgICAgICAvLyB3aXJlZnJhbWU6IHRydWVcbiAgICAgICAgfSk7XG5cblxuICAgICAgICBsZXQgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuU3BoZXJlR2VvbWV0cnkoIHRoaXMucmFkaXVzLCB0aGlzLndpZHRoU2VnbWVudHMsIHRoaXMuaGVpZ2h0U2VnbWVudHMgKTtcbiAgICAgICAgLy8gbGV0IGdlb21ldHJ5ID0gbmV3IFRIUkVFLlBsYW5lR2VvbWV0cnkoIHRoaXMucmFkaXVzLCB0aGlzLnJhZGl1cywgdGhpcy53aWR0aFNlZ21lbnRzLCB0aGlzLmhlaWdodFNlZ21lbnRzICk7XG5cdFx0ICAgIC8vIHRoaXMuZ2VvbWV0cnkgPSBuZXcgVEhSRUUuQnVmZmVyR2VvbWV0cnkoKS5mcm9tR2VvbWV0cnkoIGdlb21ldHJ5ICk7XG5cblx0XHQgICAgdGhpcy5nZW9tZXRyeSA9IGdlb21ldHJ5O1xuXG4gICAgICAgIHRoaXMuZ2VvbWV0cnkuZHluYW1pYyA9IHRydWU7XG5cbiAgICAgICAgdGhpcy5tZXNoID0gbmV3IFRIUkVFLk1lc2goIHRoaXMuZ2VvbWV0cnksIHRoaXMubWF0ZXJpYWwgKTtcblxuICAgICAgICAvLyB0aGlzLm1lc2gucm90YXRpb24ueCA9IC0xLjU1O1xuXG4gICAgICAgIHRoaXMuY2xvY2sgPSBEYXRlLm5vdygpO1xuXG4gICAgICAgIC8vIHRoaXMuc2NlbmUuYWRkKCB0aGlzLm1lc2ggKTtcblxuICB9XG5cbiAgdXBkYXRlKCBzb3VuZERhdGEgKSB7XG5cbiAgICBpZiAoIHNvdW5kRGF0YSApIHtcblxuICAgICAgbGV0IHRpbWUgPSBzb3VuZERhdGEudGltZTtcbiAgICAgIGxldCBhdmVyYWdlID0gMDtcblxuICAgICAgZm9yKHZhciBpID0gMDsgaSA8IHRpbWUubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBhdmVyYWdlICs9IHRpbWVbIGkgXTtcbiAgICAgIH1cblxuICAgICAgYXZlcmFnZSAvPSA1MTI7XG5cbiAgICAgIGxldCBmcmVxdWVuY2UgPSBNYXRoLmFicyggYXZlcmFnZSAtIDEyOCApO1xuXG4gICAgICBpZiAoIGZyZXF1ZW5jZSA+IDE1ICkge1xuICAgICAgICB0aGlzLmFtcGxpdHVkZSArPSAwLjA5O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5hbXBsaXR1ZGUgLT0gMC4wMTtcbiAgICAgIH1cblxuICAgICAgaWYgKCB0aGlzLmFtcGxpdHVkZSA8IDIgKSB7XG4gICAgICAgIHRoaXMuYW1wbGl0dWRlID0gMjtcbiAgICAgIH1cblxuICAgICAgaWYgKCB0aGlzLmFtcGxpdHVkZSA+IDIwICkge1xuICAgICAgICB0aGlzLmFtcGxpdHVkZSA9IDIwO1xuICAgICAgfVxuXG4gICAgfVxuXG4gIFx0dGhpcy5tYXRlcmlhbC51bmlmb3Jtc1tcInRpbWVcIl0udmFsdWUgPSAoIERhdGUubm93KCkgLSB0aGlzLmNsb2NrICkgKiAwLjAwMDg7XG5cbiAgfVxuXG4gIGFkZEdVSSgpIHtcblxuICBcdHRoaXMuR1VJID0gbmV3IGRhdC5HVUkoKTtcblxuICBcdHRoaXMuR1VJLmFkZCggdGhpcywgJ3JhZGl1cycgKTtcblxuICBcdHRoaXMuR1VJLmFkZCggdGhpcywgJ3dpZHRoU2VnbWVudHMnICk7XG5cbiAgXHR0aGlzLkdVSS5hZGQoIHRoaXMsICdoZWlnaHRTZWdtZW50cycgKTtcblxuICB9XG5cbiAgZ2V0TWVzaCgpIHtcblxuICBcdHJldHVybiB0aGlzLm1lc2g7XG5cbiAgfVxuXG59XG5cbmV4cG9ydCB7IFRlc3QgfTsiLCJjbGFzcyBVdGlscyB7XG5cblxuICBjb25zdHJ1Y3RvcigpIHtcblxuICB9XG5cbiAgcmFuZG9tUmFuZ2UoIG1pbiwgbWF4ICkge1xuXG4gICAgICByZXR1cm4gTWF0aC5mbG9vciggbWluICsgTWF0aC5yYW5kb20oKSAqICggbWF4IC0gbWluICkgKTtcblxuICB9XG5cbiAgY2xvbmUoIG9iamVjdCApe1xuXG4gICAgcmV0dXJuIEpTT04ucGFyc2UoIEpTT04uc3RyaW5naWZ5KCBvYmplY3QgKSApO1xuXG4gIH1cblxufVxuXG5leHBvcnQgeyBVdGlscyB9OyIsImxldCBnbHNsaWZ5ID0gcmVxdWlyZSgnZ2xzbGlmeScpO1xuXG5jbGFzcyBXYXJwIHtcblxuXG4gIGNvbnN0cnVjdG9yKCBzY2VuZSwgZW1pdHRlciwgb3B0aW9ucyA9IHt9ICkge1xuXG5cdFx0dGhpcy5zY2VuZSA9IHNjZW5lO1xuXG5cdFx0dGhpcy5lbWl0dGVyID0gZW1pdHRlcjtcblxuXHRcdHRoaXMucGFydGljbGVzQ291bnQgPSAxMDAwMDtcblxuICAgICAgICB0aGlzLnJhZGl1cyA9IDE1MDtcbiAgICAgICAgdGhpcy53aWR0aFNlZ21lbnRzID0gNTA7XG4gICAgICAgIHRoaXMuaGVpZ2h0U2VnbWVudHMgPSA1MDtcbiAgICAgICAgdGhpcy5hbXBsaXR1ZGUgPSAyO1xuXG4gICAgICAgIHRoaXMudmVydGV4U2hhZGVyID0gZ2xzbGlmeSgnLi4vLi4vdmVydGV4LXNoYWRlcnMvd2FycC52ZXJ0Jyk7XG5cbiAgICAgICAgdGhpcy5mcmFnbWVudFNoYWRlciA9IGdsc2xpZnkoJy4uLy4uL2ZyYWdtZW50LXNoYWRlcnMvd2FycC5mcmFnJyk7XG5cbiAgICAgICAgbGV0IHRleHR1cmUgPSBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKCBcImltYWdlcy9ub2lzZWJ3LnBuZ1wiICk7XG4gICAgICAgIC8vIGxldCB0ZXh0dXJlID0gVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZSggXCJpbWFnZXMvdGV4dHVyZS5qcGdcIiApO1xuXG4gICAgICAgIHRleHR1cmUud3JhcFMgPSBUSFJFRS5SZXBlYXRXcmFwcGluZztcbiAgICAgICAgdGV4dHVyZS53cmFwVCA9IFRIUkVFLlJlcGVhdFdyYXBwaW5nO1xuICAgICAgICB0ZXh0dXJlLnJlcGVhdC5zZXQoIDQsIDQgKTtcblxuICAgICAgICB0aGlzLm1hdGVyaWFsID0gbmV3IFRIUkVFLlNoYWRlck1hdGVyaWFsKHtcbiAgICAgICAgICAgIHVuaWZvcm1zOiB7IFxuICAgICAgICAgICAgICAgIFwidGltZVwiOiB7IHR5cGU6IFwiZlwiLCB2YWx1ZTogMCB9LFxuICAgICAgICAgICAgICAgIFwiYW1wbGl0dWRlXCI6IHsgdHlwZTogXCJmXCIsIHZhbHVlOiB0aGlzLmFtcGxpdHVkZSB9LFxuICAgICAgICAgICAgICAgIFwicmVzb2x1dGlvblwiOiB7IHR5cGU6IFwidjJcIiwgdmFsdWU6IG5ldyBUSFJFRS5WZWN0b3IyKCB3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0ICkgfSxcbiAgICAgICAgICAgICAgICBcInRleHR1cmVcIjogeyB0eXBlOiBcInRcIiwgdmFsdWU6IHRleHR1cmUgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzaWRlOiBUSFJFRS5Eb3VibGVTaWRlLFxuICAgICAgICAgICAgdmVydGV4U2hhZGVyOiB0aGlzLnZlcnRleFNoYWRlcixcbiAgICAgICAgICAgIGZyYWdtZW50U2hhZGVyOiB0aGlzLmZyYWdtZW50U2hhZGVyLFxuICAgICAgICAgICAgc2hhZGluZzogVEhSRUUuU21vb3RoU2hhZGluZyxcbiAgICAgICAgICAgIHRyYW5zcGFyZW50OiB0cnVlLFxuICAgICAgICAgICAgLy8gd2lyZWZyYW1lOiB0cnVlXG4gICAgICAgIH0pO1xuXG5cbiAgICAgICAgbGV0IGdlb21ldHJ5ID0gbmV3IFRIUkVFLlBsYW5lR2VvbWV0cnkoIHRoaXMucmFkaXVzLCB0aGlzLnJhZGl1cywgdGhpcy53aWR0aFNlZ21lbnRzLCB0aGlzLmhlaWdodFNlZ21lbnRzICk7XG4gICAgICAgIC8vIGxldCBnZW9tZXRyeSA9IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KCB0aGlzLnJhZGl1cywgdGhpcy5yYWRpdXMsIHRoaXMud2lkdGhTZWdtZW50cywgdGhpcy5oZWlnaHRTZWdtZW50cyApO1xuXHRcdCAgICAvLyB0aGlzLmdlb21ldHJ5ID0gbmV3IFRIUkVFLkJ1ZmZlckdlb21ldHJ5KCkuZnJvbUdlb21ldHJ5KCBnZW9tZXRyeSApO1xuXG5cdFx0ICAgIHRoaXMuZ2VvbWV0cnkgPSBnZW9tZXRyeTtcblxuICAgICAgICB0aGlzLm1lc2ggPSBuZXcgVEhSRUUuTWVzaCggdGhpcy5nZW9tZXRyeSwgdGhpcy5tYXRlcmlhbCApO1xuXG4gICAgICAgIHRoaXMubWVzaC5wb3NpdGlvbi55ID0gLTU2O1xuICAgICAgICB0aGlzLm1lc2gucG9zaXRpb24ueiA9IDIyLjQ7XG5cbiAgICAgICAgLy8gdGhpcy5tZXNoLnJvdGF0aW9uLnggPSAtMC4xOyAvLyBseWluZyBkb3duXG4gICAgICAgIHRoaXMubWVzaC5yb3RhdGlvbi54ID0gMS42OyAvLyBiYWNrZ3JvdW5kXG5cbiAgICAgICAgdGhpcy5jbG9jayA9IERhdGUubm93KCk7XG5cbiAgICAgICAgdGhpcy5zY2VuZS5hZGQoIHRoaXMubWVzaCApO1xuXG4gIH1cblxuICB1cGRhdGUoIHNvdW5kRGF0YSApIHtcblxuICAgIGlmICggc291bmREYXRhICkge1xuXG4gICAgICBsZXQgdGltZSA9IHNvdW5kRGF0YS50aW1lO1xuICAgICAgbGV0IGF2ZXJhZ2UgPSAwO1xuXG4gICAgICBmb3IodmFyIGkgPSAwOyBpIDwgdGltZS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGF2ZXJhZ2UgKz0gdGltZVsgaSBdO1xuICAgICAgfVxuXG4gICAgICBhdmVyYWdlIC89IDUxMjtcblxuICAgICAgbGV0IGZyZXF1ZW5jZSA9IE1hdGguYWJzKCBhdmVyYWdlIC0gMTI4ICk7XG5cbiAgICAgIGlmICggZnJlcXVlbmNlID4gMTUgKSB7XG4gICAgICAgIHRoaXMuYW1wbGl0dWRlICs9IDAuMDk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmFtcGxpdHVkZSAtPSAwLjAxO1xuICAgICAgfVxuXG4gICAgICBpZiAoIHRoaXMuYW1wbGl0dWRlIDwgMiApIHtcbiAgICAgICAgdGhpcy5hbXBsaXR1ZGUgPSAyO1xuICAgICAgfVxuXG4gICAgICBpZiAoIHRoaXMuYW1wbGl0dWRlID4gNCApIHtcbiAgICAgICAgdGhpcy5hbXBsaXR1ZGUgPSA0O1xuICAgICAgfVxuXG4gICAgfVxuXG4gICAgdGhpcy5tZXNoLm1hdGVyaWFsLnVuaWZvcm1zWyAnYW1wbGl0dWRlJyBdLnZhbHVlID0gdGhpcy5hbXBsaXR1ZGU7XG4gIFx0dGhpcy5tYXRlcmlhbC51bmlmb3Jtc1tcInRpbWVcIl0udmFsdWUgPSAoIERhdGUubm93KCkgLSB0aGlzLmNsb2NrICkgKiAwLjAwMDg7XG5cbiAgfVxuXG4gIGdldE1lc2goKSB7XG5cbiAgXHRyZXR1cm4gdGhpcy5tZXNoO1xuXG4gIH1cblxufVxuXG5leHBvcnQgeyBXYXJwIH07IiwiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbmZ1bmN0aW9uIEV2ZW50RW1pdHRlcigpIHtcbiAgdGhpcy5fZXZlbnRzID0gdGhpcy5fZXZlbnRzIHx8IHt9O1xuICB0aGlzLl9tYXhMaXN0ZW5lcnMgPSB0aGlzLl9tYXhMaXN0ZW5lcnMgfHwgdW5kZWZpbmVkO1xufVxubW9kdWxlLmV4cG9ydHMgPSBFdmVudEVtaXR0ZXI7XG5cbi8vIEJhY2t3YXJkcy1jb21wYXQgd2l0aCBub2RlIDAuMTAueFxuRXZlbnRFbWl0dGVyLkV2ZW50RW1pdHRlciA9IEV2ZW50RW1pdHRlcjtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fZXZlbnRzID0gdW5kZWZpbmVkO1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fbWF4TGlzdGVuZXJzID0gdW5kZWZpbmVkO1xuXG4vLyBCeSBkZWZhdWx0IEV2ZW50RW1pdHRlcnMgd2lsbCBwcmludCBhIHdhcm5pbmcgaWYgbW9yZSB0aGFuIDEwIGxpc3RlbmVycyBhcmVcbi8vIGFkZGVkIHRvIGl0LiBUaGlzIGlzIGEgdXNlZnVsIGRlZmF1bHQgd2hpY2ggaGVscHMgZmluZGluZyBtZW1vcnkgbGVha3MuXG5FdmVudEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycyA9IDEwO1xuXG4vLyBPYnZpb3VzbHkgbm90IGFsbCBFbWl0dGVycyBzaG91bGQgYmUgbGltaXRlZCB0byAxMC4gVGhpcyBmdW5jdGlvbiBhbGxvd3Ncbi8vIHRoYXQgdG8gYmUgaW5jcmVhc2VkLiBTZXQgdG8gemVybyBmb3IgdW5saW1pdGVkLlxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5zZXRNYXhMaXN0ZW5lcnMgPSBmdW5jdGlvbihuKSB7XG4gIGlmICghaXNOdW1iZXIobikgfHwgbiA8IDAgfHwgaXNOYU4obikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCduIG11c3QgYmUgYSBwb3NpdGl2ZSBudW1iZXInKTtcbiAgdGhpcy5fbWF4TGlzdGVuZXJzID0gbjtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciBlciwgaGFuZGxlciwgbGVuLCBhcmdzLCBpLCBsaXN0ZW5lcnM7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgdGhpcy5fZXZlbnRzID0ge307XG5cbiAgLy8gSWYgdGhlcmUgaXMgbm8gJ2Vycm9yJyBldmVudCBsaXN0ZW5lciB0aGVuIHRocm93LlxuICBpZiAodHlwZSA9PT0gJ2Vycm9yJykge1xuICAgIGlmICghdGhpcy5fZXZlbnRzLmVycm9yIHx8XG4gICAgICAgIChpc09iamVjdCh0aGlzLl9ldmVudHMuZXJyb3IpICYmICF0aGlzLl9ldmVudHMuZXJyb3IubGVuZ3RoKSkge1xuICAgICAgZXIgPSBhcmd1bWVudHNbMV07XG4gICAgICBpZiAoZXIgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgICB0aHJvdyBlcjsgLy8gVW5oYW5kbGVkICdlcnJvcicgZXZlbnRcbiAgICAgIH1cbiAgICAgIHRocm93IFR5cGVFcnJvcignVW5jYXVnaHQsIHVuc3BlY2lmaWVkIFwiZXJyb3JcIiBldmVudC4nKTtcbiAgICB9XG4gIH1cblxuICBoYW5kbGVyID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIGlmIChpc1VuZGVmaW5lZChoYW5kbGVyKSlcbiAgICByZXR1cm4gZmFsc2U7XG5cbiAgaWYgKGlzRnVuY3Rpb24oaGFuZGxlcikpIHtcbiAgICBzd2l0Y2ggKGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgIC8vIGZhc3QgY2FzZXNcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMjpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAzOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcywgYXJndW1lbnRzWzFdLCBhcmd1bWVudHNbMl0pO1xuICAgICAgICBicmVhaztcbiAgICAgIC8vIHNsb3dlclxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgbGVuID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICAgICAgYXJncyA9IG5ldyBBcnJheShsZW4gLSAxKTtcbiAgICAgICAgZm9yIChpID0gMTsgaSA8IGxlbjsgaSsrKVxuICAgICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgICBoYW5kbGVyLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgIH1cbiAgfSBlbHNlIGlmIChpc09iamVjdChoYW5kbGVyKSkge1xuICAgIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgYXJncyA9IG5ldyBBcnJheShsZW4gLSAxKTtcbiAgICBmb3IgKGkgPSAxOyBpIDwgbGVuOyBpKyspXG4gICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcblxuICAgIGxpc3RlbmVycyA9IGhhbmRsZXIuc2xpY2UoKTtcbiAgICBsZW4gPSBsaXN0ZW5lcnMubGVuZ3RoO1xuICAgIGZvciAoaSA9IDA7IGkgPCBsZW47IGkrKylcbiAgICAgIGxpc3RlbmVyc1tpXS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIHZhciBtO1xuXG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcblxuICAvLyBUbyBhdm9pZCByZWN1cnNpb24gaW4gdGhlIGNhc2UgdGhhdCB0eXBlID09PSBcIm5ld0xpc3RlbmVyXCIhIEJlZm9yZVxuICAvLyBhZGRpbmcgaXQgdG8gdGhlIGxpc3RlbmVycywgZmlyc3QgZW1pdCBcIm5ld0xpc3RlbmVyXCIuXG4gIGlmICh0aGlzLl9ldmVudHMubmV3TGlzdGVuZXIpXG4gICAgdGhpcy5lbWl0KCduZXdMaXN0ZW5lcicsIHR5cGUsXG4gICAgICAgICAgICAgIGlzRnVuY3Rpb24obGlzdGVuZXIubGlzdGVuZXIpID9cbiAgICAgICAgICAgICAgbGlzdGVuZXIubGlzdGVuZXIgOiBsaXN0ZW5lcik7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgLy8gT3B0aW1pemUgdGhlIGNhc2Ugb2Ygb25lIGxpc3RlbmVyLiBEb24ndCBuZWVkIHRoZSBleHRyYSBhcnJheSBvYmplY3QuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdID0gbGlzdGVuZXI7XG4gIGVsc2UgaWYgKGlzT2JqZWN0KHRoaXMuX2V2ZW50c1t0eXBlXSkpXG4gICAgLy8gSWYgd2UndmUgYWxyZWFkeSBnb3QgYW4gYXJyYXksIGp1c3QgYXBwZW5kLlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXS5wdXNoKGxpc3RlbmVyKTtcbiAgZWxzZVxuICAgIC8vIEFkZGluZyB0aGUgc2Vjb25kIGVsZW1lbnQsIG5lZWQgdG8gY2hhbmdlIHRvIGFycmF5LlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXSA9IFt0aGlzLl9ldmVudHNbdHlwZV0sIGxpc3RlbmVyXTtcblxuICAvLyBDaGVjayBmb3IgbGlzdGVuZXIgbGVha1xuICBpZiAoaXNPYmplY3QodGhpcy5fZXZlbnRzW3R5cGVdKSAmJiAhdGhpcy5fZXZlbnRzW3R5cGVdLndhcm5lZCkge1xuICAgIHZhciBtO1xuICAgIGlmICghaXNVbmRlZmluZWQodGhpcy5fbWF4TGlzdGVuZXJzKSkge1xuICAgICAgbSA9IHRoaXMuX21heExpc3RlbmVycztcbiAgICB9IGVsc2Uge1xuICAgICAgbSA9IEV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzO1xuICAgIH1cblxuICAgIGlmIChtICYmIG0gPiAwICYmIHRoaXMuX2V2ZW50c1t0eXBlXS5sZW5ndGggPiBtKSB7XG4gICAgICB0aGlzLl9ldmVudHNbdHlwZV0ud2FybmVkID0gdHJ1ZTtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJyhub2RlKSB3YXJuaW5nOiBwb3NzaWJsZSBFdmVudEVtaXR0ZXIgbWVtb3J5ICcgK1xuICAgICAgICAgICAgICAgICAgICAnbGVhayBkZXRlY3RlZC4gJWQgbGlzdGVuZXJzIGFkZGVkLiAnICtcbiAgICAgICAgICAgICAgICAgICAgJ1VzZSBlbWl0dGVyLnNldE1heExpc3RlbmVycygpIHRvIGluY3JlYXNlIGxpbWl0LicsXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2V2ZW50c1t0eXBlXS5sZW5ndGgpO1xuICAgICAgaWYgKHR5cGVvZiBjb25zb2xlLnRyYWNlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIC8vIG5vdCBzdXBwb3J0ZWQgaW4gSUUgMTBcbiAgICAgICAgY29uc29sZS50cmFjZSgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbiA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXI7XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub25jZSA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICB2YXIgZmlyZWQgPSBmYWxzZTtcblxuICBmdW5jdGlvbiBnKCkge1xuICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgZyk7XG5cbiAgICBpZiAoIWZpcmVkKSB7XG4gICAgICBmaXJlZCA9IHRydWU7XG4gICAgICBsaXN0ZW5lci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cbiAgfVxuXG4gIGcubGlzdGVuZXIgPSBsaXN0ZW5lcjtcbiAgdGhpcy5vbih0eXBlLCBnKTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8vIGVtaXRzIGEgJ3JlbW92ZUxpc3RlbmVyJyBldmVudCBpZmYgdGhlIGxpc3RlbmVyIHdhcyByZW1vdmVkXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgdmFyIGxpc3QsIHBvc2l0aW9uLCBsZW5ndGgsIGk7XG5cbiAgaWYgKCFpc0Z1bmN0aW9uKGxpc3RlbmVyKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0dXJuIHRoaXM7XG5cbiAgbGlzdCA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgbGVuZ3RoID0gbGlzdC5sZW5ndGg7XG4gIHBvc2l0aW9uID0gLTE7XG5cbiAgaWYgKGxpc3QgPT09IGxpc3RlbmVyIHx8XG4gICAgICAoaXNGdW5jdGlvbihsaXN0Lmxpc3RlbmVyKSAmJiBsaXN0Lmxpc3RlbmVyID09PSBsaXN0ZW5lcikpIHtcbiAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIGlmICh0aGlzLl9ldmVudHMucmVtb3ZlTGlzdGVuZXIpXG4gICAgICB0aGlzLmVtaXQoJ3JlbW92ZUxpc3RlbmVyJywgdHlwZSwgbGlzdGVuZXIpO1xuXG4gIH0gZWxzZSBpZiAoaXNPYmplY3QobGlzdCkpIHtcbiAgICBmb3IgKGkgPSBsZW5ndGg7IGktLSA+IDA7KSB7XG4gICAgICBpZiAobGlzdFtpXSA9PT0gbGlzdGVuZXIgfHxcbiAgICAgICAgICAobGlzdFtpXS5saXN0ZW5lciAmJiBsaXN0W2ldLmxpc3RlbmVyID09PSBsaXN0ZW5lcikpIHtcbiAgICAgICAgcG9zaXRpb24gPSBpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAocG9zaXRpb24gPCAwKVxuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICBpZiAobGlzdC5sZW5ndGggPT09IDEpIHtcbiAgICAgIGxpc3QubGVuZ3RoID0gMDtcbiAgICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgfSBlbHNlIHtcbiAgICAgIGxpc3Quc3BsaWNlKHBvc2l0aW9uLCAxKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKVxuICAgICAgdGhpcy5lbWl0KCdyZW1vdmVMaXN0ZW5lcicsIHR5cGUsIGxpc3RlbmVyKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciBrZXksIGxpc3RlbmVycztcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICByZXR1cm4gdGhpcztcblxuICAvLyBub3QgbGlzdGVuaW5nIGZvciByZW1vdmVMaXN0ZW5lciwgbm8gbmVlZCB0byBlbWl0XG4gIGlmICghdGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKSB7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApXG4gICAgICB0aGlzLl9ldmVudHMgPSB7fTtcbiAgICBlbHNlIGlmICh0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gZW1pdCByZW1vdmVMaXN0ZW5lciBmb3IgYWxsIGxpc3RlbmVycyBvbiBhbGwgZXZlbnRzXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgZm9yIChrZXkgaW4gdGhpcy5fZXZlbnRzKSB7XG4gICAgICBpZiAoa2V5ID09PSAncmVtb3ZlTGlzdGVuZXInKSBjb250aW51ZTtcbiAgICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKGtleSk7XG4gICAgfVxuICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKCdyZW1vdmVMaXN0ZW5lcicpO1xuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgbGlzdGVuZXJzID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIGlmIChpc0Z1bmN0aW9uKGxpc3RlbmVycykpIHtcbiAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVycyk7XG4gIH0gZWxzZSB7XG4gICAgLy8gTElGTyBvcmRlclxuICAgIHdoaWxlIChsaXN0ZW5lcnMubGVuZ3RoKVxuICAgICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcnNbbGlzdGVuZXJzLmxlbmd0aCAtIDFdKTtcbiAgfVxuICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnMgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciByZXQ7XG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0ID0gW107XG4gIGVsc2UgaWYgKGlzRnVuY3Rpb24odGhpcy5fZXZlbnRzW3R5cGVdKSlcbiAgICByZXQgPSBbdGhpcy5fZXZlbnRzW3R5cGVdXTtcbiAgZWxzZVxuICAgIHJldCA9IHRoaXMuX2V2ZW50c1t0eXBlXS5zbGljZSgpO1xuICByZXR1cm4gcmV0O1xufTtcblxuRXZlbnRFbWl0dGVyLmxpc3RlbmVyQ291bnQgPSBmdW5jdGlvbihlbWl0dGVyLCB0eXBlKSB7XG4gIHZhciByZXQ7XG4gIGlmICghZW1pdHRlci5fZXZlbnRzIHx8ICFlbWl0dGVyLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0ID0gMDtcbiAgZWxzZSBpZiAoaXNGdW5jdGlvbihlbWl0dGVyLl9ldmVudHNbdHlwZV0pKVxuICAgIHJldCA9IDE7XG4gIGVsc2VcbiAgICByZXQgPSBlbWl0dGVyLl9ldmVudHNbdHlwZV0ubGVuZ3RoO1xuICByZXR1cm4gcmV0O1xufTtcblxuZnVuY3Rpb24gaXNGdW5jdGlvbihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdmdW5jdGlvbic7XG59XG5cbmZ1bmN0aW9uIGlzTnVtYmVyKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ251bWJlcic7XG59XG5cbmZ1bmN0aW9uIGlzT2JqZWN0KGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ29iamVjdCcgJiYgYXJnICE9PSBudWxsO1xufVxuXG5mdW5jdGlvbiBpc1VuZGVmaW5lZChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gdm9pZCAwO1xufVxuIiwidmFyIGRlZmluZWQgPSByZXF1aXJlKCdkZWZpbmVkJylcbnZhciBjbGFtcCA9IHJlcXVpcmUoJ2NsYW1wJylcblxudmFyIGlucHV0RXZlbnRzID0gcmVxdWlyZSgnLi9saWIvaW5wdXQnKVxudmFyIHF1YXRGcm9tVmVjMyA9IHJlcXVpcmUoJ3F1YXQtZnJvbS11bml0LXZlYzMnKVxudmFyIHF1YXRJbnZlcnQgPSByZXF1aXJlKCdnbC1xdWF0L2ludmVydCcpXG5cbnZhciBnbFZlYzMgPSB7XG4gIGxlbmd0aDogcmVxdWlyZSgnZ2wtdmVjMy9sZW5ndGgnKSxcbiAgYWRkOiByZXF1aXJlKCdnbC12ZWMzL2FkZCcpLFxuICBzdWJ0cmFjdDogcmVxdWlyZSgnZ2wtdmVjMy9zdWJ0cmFjdCcpLFxuICB0cmFuc2Zvcm1RdWF0OiByZXF1aXJlKCdnbC12ZWMzL3RyYW5zZm9ybVF1YXQnKSxcbiAgY29weTogcmVxdWlyZSgnZ2wtdmVjMy9jb3B5JyksXG4gIG5vcm1hbGl6ZTogcmVxdWlyZSgnZ2wtdmVjMy9ub3JtYWxpemUnKSxcbiAgY3Jvc3M6IHJlcXVpcmUoJ2dsLXZlYzMvY3Jvc3MnKVxufVxuXG52YXIgWV9VUCA9IFswLCAxLCAwXVxudmFyIEVQU0lMT04gPSAxZS0xMFxuXG5tb2R1bGUuZXhwb3J0cyA9IGNyZWF0ZU9yYml0Q29udHJvbHNcbmZ1bmN0aW9uIGNyZWF0ZU9yYml0Q29udHJvbHMgKG9wdCkge1xuICBvcHQgPSBvcHQgfHwge31cblxuICB2YXIgaW5wdXREZWx0YSA9IFswLCAwLCAwXSAvLyB4LCB5LCB6b29tXG4gIHZhciBvZmZzZXQgPSBbMCwgMCwgMF1cblxuICB2YXIgdXBRdWF0ID0gWzAsIDAsIDAsIDFdXG4gIHZhciB1cFF1YXRJbnZlcnNlID0gdXBRdWF0LnNsaWNlKClcblxuICB2YXIgY29udHJvbHMgPSB7XG4gICAgdXBkYXRlOiB1cGRhdGUsXG5cbiAgICB0YXJnZXQ6IG9wdC50YXJnZXQgfHwgWzAsIDAsIDBdLFxuICAgIHBoaTogb3B0LnBoaSB8fCAwLFxuICAgIHRoZXRhOiBvcHQudGhldGEgfHwgMCxcbiAgICBkaXN0YW5jZTogZGVmaW5lZChvcHQuZGlzdGFuY2UsIDEpLFxuICAgIGRhbXBpbmc6IGRlZmluZWQob3B0LmRhbXBpbmcsIDAuMjUpLFxuICAgIHJvdGF0ZVNwZWVkOiBkZWZpbmVkKG9wdC5yb3RhdGVTcGVlZCwgMC4yOCksXG4gICAgem9vbVNwZWVkOiBkZWZpbmVkKG9wdC56b29tU3BlZWQsIDAuMDA3NSksXG4gICAgcGluY2hTcGVlZDogZGVmaW5lZChvcHQucGluY2hTcGVlZCwgMC4wMDc1KSxcblxuICAgIHBpbmNoOiBvcHQucGluY2hpbmcgIT09IGZhbHNlLFxuICAgIHpvb206IG9wdC56b29tICE9PSBmYWxzZSxcbiAgICByb3RhdGU6IG9wdC5yb3RhdGUgIT09IGZhbHNlLFxuXG4gICAgcGhpQm91bmRzOiBvcHQucGhpQm91bmRzIHx8IFswLCBNYXRoLlBJXSxcbiAgICB0aGV0YUJvdW5kczogb3B0LnRoZXRhQm91bmRzIHx8IFstSW5maW5pdHksIEluZmluaXR5XSxcbiAgICBkaXN0YW5jZUJvdW5kczogb3B0LmRpc3RhbmNlQm91bmRzIHx8IFsxLCBJbmZpbml0eV1cbiAgfVxuXG4gIGlucHV0RXZlbnRzKHtcbiAgICBwYXJlbnQ6IG9wdC5wYXJlbnQgfHwgd2luZG93LFxuICAgIGVsZW1lbnQ6IG9wdC5lbGVtZW50LFxuICAgIHJvdGF0ZTogb3B0LnJvdGF0ZSAhPT0gZmFsc2UgPyBpbnB1dFJvdGF0ZSA6IG51bGwsXG4gICAgem9vbTogb3B0Lnpvb20gIT09IGZhbHNlID8gaW5wdXRab29tIDogbnVsbCxcbiAgICBwaW5jaDogb3B0LnBpbmNoICE9PSBmYWxzZSA/IGlucHV0UGluY2ggOiBudWxsXG4gIH0pXG5cbiAgcmV0dXJuIGNvbnRyb2xzXG5cbiAgZnVuY3Rpb24gaW5wdXRSb3RhdGUgKGR4LCBkeSkge1xuICAgIHZhciBQSTIgPSBNYXRoLlBJICogMlxuICAgIGlucHV0RGVsdGFbMF0gLT0gUEkyICogZHggKiBjb250cm9scy5yb3RhdGVTcGVlZFxuICAgIGlucHV0RGVsdGFbMV0gLT0gUEkyICogZHkgKiBjb250cm9scy5yb3RhdGVTcGVlZFxuICB9XG5cbiAgZnVuY3Rpb24gaW5wdXRab29tIChkZWx0YSkge1xuICAgIGlucHV0RGVsdGFbMl0gKz0gZGVsdGEgKiBjb250cm9scy56b29tU3BlZWRcbiAgfVxuXG4gIGZ1bmN0aW9uIGlucHV0UGluY2ggKGRlbHRhKSB7XG4gICAgaW5wdXREZWx0YVsyXSAtPSBkZWx0YSAqIGNvbnRyb2xzLnBpbmNoU3BlZWRcbiAgfVxuXG4gIGZ1bmN0aW9uIHVwZGF0ZSAocG9zaXRpb24sIGRpcmVjdGlvbiwgdXApIHtcbiAgICB2YXIgY2FtZXJhVXAgPSB1cCB8fCBZX1VQXG4gICAgcXVhdEZyb21WZWMzKHVwUXVhdCwgY2FtZXJhVXAsIFlfVVApXG4gICAgcXVhdEludmVydCh1cFF1YXRJbnZlcnNlLCB1cFF1YXQpXG5cbiAgICB2YXIgZGlzdGFuY2UgPSBjb250cm9scy5kaXN0YW5jZVxuXG4gICAgZ2xWZWMzLnN1YnRyYWN0KG9mZnNldCwgcG9zaXRpb24sIGNvbnRyb2xzLnRhcmdldClcbiAgICBnbFZlYzMudHJhbnNmb3JtUXVhdChvZmZzZXQsIG9mZnNldCwgdXBRdWF0KVxuXG4gICAgdmFyIHRoZXRhID0gTWF0aC5hdGFuMihvZmZzZXRbMF0sIG9mZnNldFsyXSlcbiAgICB2YXIgcGhpID0gTWF0aC5hdGFuMihNYXRoLnNxcnQob2Zmc2V0WzBdICogb2Zmc2V0WzBdICsgb2Zmc2V0WzJdICogb2Zmc2V0WzJdKSwgb2Zmc2V0WzFdKVxuXG4gICAgdGhldGEgKz0gaW5wdXREZWx0YVswXVxuICAgIHBoaSArPSBpbnB1dERlbHRhWzFdXG5cbiAgICB0aGV0YSA9IGNsYW1wKHRoZXRhLCBjb250cm9scy50aGV0YUJvdW5kc1swXSwgY29udHJvbHMudGhldGFCb3VuZHNbMV0pXG4gICAgcGhpID0gY2xhbXAocGhpLCBjb250cm9scy5waGlCb3VuZHNbMF0sIGNvbnRyb2xzLnBoaUJvdW5kc1sxXSlcbiAgICBwaGkgPSBjbGFtcChwaGksIEVQU0lMT04sIE1hdGguUEkgLSBFUFNJTE9OKVxuXG4gICAgZGlzdGFuY2UgKz0gaW5wdXREZWx0YVsyXVxuICAgIGRpc3RhbmNlID0gY2xhbXAoZGlzdGFuY2UsIGNvbnRyb2xzLmRpc3RhbmNlQm91bmRzWzBdLCBjb250cm9scy5kaXN0YW5jZUJvdW5kc1sxXSlcblxuICAgIHZhciByYWRpdXMgPSBNYXRoLmFicyhkaXN0YW5jZSkgPD0gRVBTSUxPTiA/IEVQU0lMT04gOiBkaXN0YW5jZVxuICAgIG9mZnNldFswXSA9IHJhZGl1cyAqIE1hdGguc2luKHBoaSkgKiBNYXRoLnNpbih0aGV0YSlcbiAgICBvZmZzZXRbMV0gPSByYWRpdXMgKiBNYXRoLmNvcyhwaGkpXG4gICAgb2Zmc2V0WzJdID0gcmFkaXVzICogTWF0aC5zaW4ocGhpKSAqIE1hdGguY29zKHRoZXRhKVxuXG4gICAgY29udHJvbHMucGhpID0gcGhpXG4gICAgY29udHJvbHMudGhldGEgPSB0aGV0YVxuICAgIGNvbnRyb2xzLmRpc3RhbmNlID0gZGlzdGFuY2VcblxuICAgIGdsVmVjMy50cmFuc2Zvcm1RdWF0KG9mZnNldCwgb2Zmc2V0LCB1cFF1YXRJbnZlcnNlKVxuICAgIGdsVmVjMy5hZGQocG9zaXRpb24sIGNvbnRyb2xzLnRhcmdldCwgb2Zmc2V0KVxuICAgIGNhbUxvb2tBdChkaXJlY3Rpb24sIGNhbWVyYVVwLCBwb3NpdGlvbiwgY29udHJvbHMudGFyZ2V0KVxuXG4gICAgdmFyIGRhbXAgPSB0eXBlb2YgY29udHJvbHMuZGFtcGluZyA9PT0gJ251bWJlcicgPyBjb250cm9scy5kYW1waW5nIDogMVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaW5wdXREZWx0YS5sZW5ndGg7IGkrKykge1xuICAgICAgaW5wdXREZWx0YVtpXSAqPSAxIC0gZGFtcFxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBjYW1Mb29rQXQgKGRpcmVjdGlvbiwgdXAsIHBvc2l0aW9uLCB0YXJnZXQpIHtcbiAgZ2xWZWMzLmNvcHkoZGlyZWN0aW9uLCB0YXJnZXQpXG4gIGdsVmVjMy5zdWJ0cmFjdChkaXJlY3Rpb24sIGRpcmVjdGlvbiwgcG9zaXRpb24pXG4gIGdsVmVjMy5ub3JtYWxpemUoZGlyZWN0aW9uLCBkaXJlY3Rpb24pXG59XG4iLCJ2YXIgbW91c2VXaGVlbCA9IHJlcXVpcmUoJ21vdXNlLXdoZWVsJylcbnZhciBldmVudE9mZnNldCA9IHJlcXVpcmUoJ21vdXNlLWV2ZW50LW9mZnNldCcpXG52YXIgY3JlYXRlUGluY2ggPSByZXF1aXJlKCd0b3VjaC1waW5jaCcpXG5cbm1vZHVsZS5leHBvcnRzID0gaW5wdXRFdmVudHNcbmZ1bmN0aW9uIGlucHV0RXZlbnRzIChvcHQpIHtcbiAgdmFyIGVsZW1lbnQgPSBvcHQuZWxlbWVudCB8fCB3aW5kb3dcbiAgdmFyIHBhcmVudCA9IG9wdC5wYXJlbnQgfHwgZWxlbWVudFxuICB2YXIgbW91c2VTdGFydCA9IFswLCAwXVxuICB2YXIgZHJhZ2dpbmcgPSBmYWxzZVxuICB2YXIgdG1wID0gWzAsIDBdXG4gIHZhciB0bXAyID0gWzAsIDBdXG4gIHZhciBwaW5jaFxuICBcbiAgdmFyIHpvb21GbiA9IG9wdC56b29tXG4gIHZhciByb3RhdGVGbiA9IG9wdC5yb3RhdGVcbiAgdmFyIHBpbmNoRm4gPSBvcHQucGluY2hcbiAgXG4gIGlmICh6b29tRm4pIHtcbiAgICBtb3VzZVdoZWVsKGVsZW1lbnQsIGZ1bmN0aW9uIChkeCwgZHkpIHtcbiAgICAgIHpvb21GbihkeSlcbiAgICB9LCB0cnVlKVxuICB9XG4gIFxuICBpZiAocm90YXRlRm4pIHtcbiAgICAvLyBmb3IgZHJhZ2dpbmcgdG8gd29yayBvdXRzaWRlIGNhbnZhcyBib3VuZHMsXG4gICAgLy8gbW91c2UgZXZlbnRzIGhhdmUgdG8gYmUgYWRkZWQgdG8gcGFyZW50XG4gICAgcGFyZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIG9uSW5wdXREb3duKVxuICAgIHBhcmVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBvbklucHV0TW92ZSlcbiAgICBwYXJlbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIG9uSW5wdXRVcClcbiAgfVxuICBcbiAgaWYgKHJvdGF0ZUZuIHx8IHBpbmNoRm4pIHtcbiAgICBwaW5jaCA9IGNyZWF0ZVBpbmNoKGVsZW1lbnQpXG4gICAgXG4gICAgLy8gZG9uJ3QgYWxsb3cgc2ltdWxhdGVkIG1vdXNlIGV2ZW50c1xuICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIHByZXZlbnREZWZhdWx0KVxuICAgIFxuICAgIGlmIChyb3RhdGVGbikgdG91Y2hSb3RhdGUoKVxuICAgIGlmIChwaW5jaEZuKSB0b3VjaFBpbmNoKClcbiAgfVxuXG4gIGZ1bmN0aW9uIHByZXZlbnREZWZhdWx0IChldikge1xuICAgIGV2LnByZXZlbnREZWZhdWx0KClcbiAgfVxuICBcbiAgZnVuY3Rpb24gdG91Y2hSb3RhdGUgKCkge1xuICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgZnVuY3Rpb24gKGV2KSB7XG4gICAgICBpZiAoIWRyYWdnaW5nIHx8IGlzUGluY2hpbmcoKSkgcmV0dXJuXG4gICAgICAgIFxuICAgICAgLy8gZmluZCBjdXJyZW50bHkgYWN0aXZlIGZpbmdlclxuICAgICAgZm9yICh2YXIgaT0wOyBpPGV2LmNoYW5nZWRUb3VjaGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBjaGFuZ2VkID0gZXYuY2hhbmdlZFRvdWNoZXNbaV1cbiAgICAgICAgdmFyIGlkeCA9IHBpbmNoLmluZGV4T2ZUb3VjaChjaGFuZ2VkKVxuICAgICAgICAvLyBpZiBwaW5jaCBpcyBkaXNhYmxlZCBidXQgcm90YXRlIGVuYWJsZWQsXG4gICAgICAgIC8vIG9ubHkgYWxsb3cgZmlyc3QgZmluZ2VyIHRvIGFmZmVjdCByb3RhdGlvblxuICAgICAgICB2YXIgYWxsb3cgPSBwaW5jaEZuID8gaWR4ICE9PSAtMSA6IGlkeCA9PT0gMFxuICAgICAgICBpZiAoYWxsb3cpIHtcbiAgICAgICAgICBvbklucHV0TW92ZShjaGFuZ2VkKVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICAgIFxuICAgIHBpbmNoLm9uKCdwbGFjZScsIGZ1bmN0aW9uIChuZXdGaW5nZXIsIGxhc3RGaW5nZXIpIHtcbiAgICAgIGRyYWdnaW5nID0gIWlzUGluY2hpbmcoKVxuICAgICAgaWYgKGRyYWdnaW5nKSB7XG4gICAgICAgIHZhciBmaXJzdEZpbmdlciA9IGxhc3RGaW5nZXIgfHwgbmV3RmluZ2VyXG4gICAgICAgIG9uSW5wdXREb3duKGZpcnN0RmluZ2VyKVxuICAgICAgfVxuICAgIH0pXG4gICAgXG4gICAgcGluY2gub24oJ2xpZnQnLCBmdW5jdGlvbiAobGlmdGVkLCByZW1haW5pbmcpIHtcbiAgICAgIGRyYWdnaW5nID0gIWlzUGluY2hpbmcoKVxuICAgICAgaWYgKGRyYWdnaW5nICYmIHJlbWFpbmluZykge1xuICAgICAgICBldmVudE9mZnNldChyZW1haW5pbmcsIGVsZW1lbnQsIG1vdXNlU3RhcnQpXG4gICAgICB9XG4gICAgfSlcbiAgfVxuICBcbiAgZnVuY3Rpb24gaXNQaW5jaGluZyAoKSB7XG4gICAgcmV0dXJuIHBpbmNoLnBpbmNoaW5nICYmIHBpbmNoRm5cbiAgfVxuICBcbiAgZnVuY3Rpb24gdG91Y2hQaW5jaCAoKSB7XG4gICAgcGluY2gub24oJ2NoYW5nZScsIGZ1bmN0aW9uIChjdXJyZW50LCBwcmV2KSB7XG4gICAgICBwaW5jaEZuKGN1cnJlbnQgLSBwcmV2KVxuICAgIH0pXG4gIH1cbiAgXG4gIGZ1bmN0aW9uIG9uSW5wdXREb3duIChldikge1xuICAgIGV2ZW50T2Zmc2V0KGV2LCBlbGVtZW50LCBtb3VzZVN0YXJ0KSAgICBcbiAgICBpZiAoaW5zaWRlQm91bmRzKG1vdXNlU3RhcnQpKSB7XG4gICAgICBkcmFnZ2luZyA9IHRydWVcbiAgICB9XG4gIH1cbiAgXG4gIGZ1bmN0aW9uIG9uSW5wdXRVcCAoKSB7XG4gICAgZHJhZ2dpbmcgPSBmYWxzZVxuICB9XG4gIFxuICBmdW5jdGlvbiBvbklucHV0TW92ZSAoZXYpIHtcbiAgICB2YXIgZW5kID0gZXZlbnRPZmZzZXQoZXYsIGVsZW1lbnQsIHRtcClcbiAgICBpZiAocGluY2ggJiYgaXNQaW5jaGluZygpKSB7XG4gICAgICBtb3VzZVN0YXJ0ID0gZW5kXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgaWYgKCFkcmFnZ2luZykgcmV0dXJuXG4gICAgdmFyIHJlY3QgPSBnZXRDbGllbnRTaXplKHRtcDIpXG4gICAgdmFyIGR4ID0gKGVuZFswXSAtIG1vdXNlU3RhcnRbMF0pIC8gcmVjdFswXVxuICAgIHZhciBkeSA9IChlbmRbMV0gLSBtb3VzZVN0YXJ0WzFdKSAvIHJlY3RbMV1cbiAgICByb3RhdGVGbihkeCwgZHkpXG4gICAgbW91c2VTdGFydFswXSA9IGVuZFswXVxuICAgIG1vdXNlU3RhcnRbMV0gPSBlbmRbMV1cbiAgfVxuICBcbiAgZnVuY3Rpb24gaW5zaWRlQm91bmRzIChwb3MpIHtcbiAgICBpZiAoZWxlbWVudCA9PT0gd2luZG93IHx8IFxuICAgICAgICBlbGVtZW50ID09PSBkb2N1bWVudCB8fFxuICAgICAgICBlbGVtZW50ID09PSBkb2N1bWVudC5ib2R5KSB7XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgcmVjdCA9IGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICAgIHJldHVybiBwb3NbMF0gPj0gMCAmJiBwb3NbMV0gPj0gMCAmJlxuICAgICAgICBwb3NbMF0gPCByZWN0LndpZHRoICYmIHBvc1sxXSA8IHJlY3QuaGVpZ2h0XG4gICAgfVxuICB9XG4gIFxuICBmdW5jdGlvbiBnZXRDbGllbnRTaXplIChvdXQpIHtcbiAgICB2YXIgc291cmNlID0gZWxlbWVudFxuICAgIGlmIChzb3VyY2UgPT09IHdpbmRvdyB8fFxuICAgICAgICBzb3VyY2UgPT09IGRvY3VtZW50IHx8XG4gICAgICAgIHNvdXJjZSA9PT0gZG9jdW1lbnQuYm9keSkge1xuICAgICAgc291cmNlID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50XG4gICAgfVxuICAgIG91dFswXSA9IHNvdXJjZS5jbGllbnRXaWR0aFxuICAgIG91dFsxXSA9IHNvdXJjZS5jbGllbnRIZWlnaHRcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gY2xhbXBcblxuZnVuY3Rpb24gY2xhbXAodmFsdWUsIG1pbiwgbWF4KSB7XG4gIHJldHVybiBtaW4gPCBtYXhcbiAgICA/ICh2YWx1ZSA8IG1pbiA/IG1pbiA6IHZhbHVlID4gbWF4ID8gbWF4IDogdmFsdWUpXG4gICAgOiAodmFsdWUgPCBtYXggPyBtYXggOiB2YWx1ZSA+IG1pbiA/IG1pbiA6IHZhbHVlKVxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKGFyZ3VtZW50c1tpXSAhPT0gdW5kZWZpbmVkKSByZXR1cm4gYXJndW1lbnRzW2ldO1xuICAgIH1cbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGludmVydFxuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGludmVyc2Ugb2YgYSBxdWF0XG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXG4gKiBAcGFyYW0ge3F1YXR9IGEgcXVhdCB0byBjYWxjdWxhdGUgaW52ZXJzZSBvZlxuICogQHJldHVybnMge3F1YXR9IG91dFxuICovXG5mdW5jdGlvbiBpbnZlcnQgKG91dCwgYSkge1xuICB2YXIgYTAgPSBhWzBdLCBhMSA9IGFbMV0sIGEyID0gYVsyXSwgYTMgPSBhWzNdLFxuICAgIGRvdCA9IGEwICogYTAgKyBhMSAqIGExICsgYTIgKiBhMiArIGEzICogYTMsXG4gICAgaW52RG90ID0gZG90ID8gMS4wIC8gZG90IDogMFxuXG4gIC8vIFRPRE86IFdvdWxkIGJlIGZhc3RlciB0byByZXR1cm4gWzAsMCwwLDBdIGltbWVkaWF0ZWx5IGlmIGRvdCA9PSAwXG5cbiAgb3V0WzBdID0gLWEwICogaW52RG90XG4gIG91dFsxXSA9IC1hMSAqIGludkRvdFxuICBvdXRbMl0gPSAtYTIgKiBpbnZEb3RcbiAgb3V0WzNdID0gYTMgKiBpbnZEb3RcbiAgcmV0dXJuIG91dFxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBub3JtYWxpemVcblxuLyoqXG4gKiBOb3JtYWxpemUgYSB2ZWM0XG4gKlxuICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjNH0gYSB2ZWN0b3IgdG8gbm9ybWFsaXplXG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XG4gKi9cbmZ1bmN0aW9uIG5vcm1hbGl6ZSAob3V0LCBhKSB7XG4gIHZhciB4ID0gYVswXSxcbiAgICB5ID0gYVsxXSxcbiAgICB6ID0gYVsyXSxcbiAgICB3ID0gYVszXVxuICB2YXIgbGVuID0geCAqIHggKyB5ICogeSArIHogKiB6ICsgdyAqIHdcbiAgaWYgKGxlbiA+IDApIHtcbiAgICBsZW4gPSAxIC8gTWF0aC5zcXJ0KGxlbilcbiAgICBvdXRbMF0gPSB4ICogbGVuXG4gICAgb3V0WzFdID0geSAqIGxlblxuICAgIG91dFsyXSA9IHogKiBsZW5cbiAgICBvdXRbM10gPSB3ICogbGVuXG4gIH1cbiAgcmV0dXJuIG91dFxufVxuIiwiLyoqXG4gKiBOb3JtYWxpemUgYSBxdWF0XG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXG4gKiBAcGFyYW0ge3F1YXR9IGEgcXVhdGVybmlvbiB0byBub3JtYWxpemVcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqIEBmdW5jdGlvblxuICovXG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJ2dsLXZlYzQvbm9ybWFsaXplJylcbiIsIm1vZHVsZS5leHBvcnRzID0gYWRkO1xuXG4vKipcbiAqIEFkZHMgdHdvIHZlYzMnc1xuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xuZnVuY3Rpb24gYWRkKG91dCwgYSwgYikge1xuICAgIG91dFswXSA9IGFbMF0gKyBiWzBdXG4gICAgb3V0WzFdID0gYVsxXSArIGJbMV1cbiAgICBvdXRbMl0gPSBhWzJdICsgYlsyXVxuICAgIHJldHVybiBvdXRcbn0iLCJtb2R1bGUuZXhwb3J0cyA9IGNvcHk7XG5cbi8qKlxuICogQ29weSB0aGUgdmFsdWVzIGZyb20gb25lIHZlYzMgdG8gYW5vdGhlclxuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIHNvdXJjZSB2ZWN0b3JcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xuZnVuY3Rpb24gY29weShvdXQsIGEpIHtcbiAgICBvdXRbMF0gPSBhWzBdXG4gICAgb3V0WzFdID0gYVsxXVxuICAgIG91dFsyXSA9IGFbMl1cbiAgICByZXR1cm4gb3V0XG59IiwibW9kdWxlLmV4cG9ydHMgPSBjcm9zcztcblxuLyoqXG4gKiBDb21wdXRlcyB0aGUgY3Jvc3MgcHJvZHVjdCBvZiB0d28gdmVjMydzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG5mdW5jdGlvbiBjcm9zcyhvdXQsIGEsIGIpIHtcbiAgICB2YXIgYXggPSBhWzBdLCBheSA9IGFbMV0sIGF6ID0gYVsyXSxcbiAgICAgICAgYnggPSBiWzBdLCBieSA9IGJbMV0sIGJ6ID0gYlsyXVxuXG4gICAgb3V0WzBdID0gYXkgKiBieiAtIGF6ICogYnlcbiAgICBvdXRbMV0gPSBheiAqIGJ4IC0gYXggKiBielxuICAgIG91dFsyXSA9IGF4ICogYnkgLSBheSAqIGJ4XG4gICAgcmV0dXJuIG91dFxufSIsIm1vZHVsZS5leHBvcnRzID0gZG90O1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGRvdCBwcm9kdWN0IG9mIHR3byB2ZWMzJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGRvdCBwcm9kdWN0IG9mIGEgYW5kIGJcbiAqL1xuZnVuY3Rpb24gZG90KGEsIGIpIHtcbiAgICByZXR1cm4gYVswXSAqIGJbMF0gKyBhWzFdICogYlsxXSArIGFbMl0gKiBiWzJdXG59IiwibW9kdWxlLmV4cG9ydHMgPSBsZW5ndGg7XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgbGVuZ3RoIG9mIGEgdmVjM1xuICpcbiAqIEBwYXJhbSB7dmVjM30gYSB2ZWN0b3IgdG8gY2FsY3VsYXRlIGxlbmd0aCBvZlxuICogQHJldHVybnMge051bWJlcn0gbGVuZ3RoIG9mIGFcbiAqL1xuZnVuY3Rpb24gbGVuZ3RoKGEpIHtcbiAgICB2YXIgeCA9IGFbMF0sXG4gICAgICAgIHkgPSBhWzFdLFxuICAgICAgICB6ID0gYVsyXVxuICAgIHJldHVybiBNYXRoLnNxcnQoeCp4ICsgeSp5ICsgeip6KVxufSIsIm1vZHVsZS5leHBvcnRzID0gbm9ybWFsaXplO1xuXG4vKipcbiAqIE5vcm1hbGl6ZSBhIHZlYzNcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMzfSBhIHZlY3RvciB0byBub3JtYWxpemVcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xuZnVuY3Rpb24gbm9ybWFsaXplKG91dCwgYSkge1xuICAgIHZhciB4ID0gYVswXSxcbiAgICAgICAgeSA9IGFbMV0sXG4gICAgICAgIHogPSBhWzJdXG4gICAgdmFyIGxlbiA9IHgqeCArIHkqeSArIHoqelxuICAgIGlmIChsZW4gPiAwKSB7XG4gICAgICAgIC8vVE9ETzogZXZhbHVhdGUgdXNlIG9mIGdsbV9pbnZzcXJ0IGhlcmU/XG4gICAgICAgIGxlbiA9IDEgLyBNYXRoLnNxcnQobGVuKVxuICAgICAgICBvdXRbMF0gPSBhWzBdICogbGVuXG4gICAgICAgIG91dFsxXSA9IGFbMV0gKiBsZW5cbiAgICAgICAgb3V0WzJdID0gYVsyXSAqIGxlblxuICAgIH1cbiAgICByZXR1cm4gb3V0XG59IiwibW9kdWxlLmV4cG9ydHMgPSBzZXQ7XG5cbi8qKlxuICogU2V0IHRoZSBjb21wb25lbnRzIG9mIGEgdmVjMyB0byB0aGUgZ2l2ZW4gdmFsdWVzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7TnVtYmVyfSB4IFggY29tcG9uZW50XG4gKiBAcGFyYW0ge051bWJlcn0geSBZIGNvbXBvbmVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHogWiBjb21wb25lbnRcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xuZnVuY3Rpb24gc2V0KG91dCwgeCwgeSwgeikge1xuICAgIG91dFswXSA9IHhcbiAgICBvdXRbMV0gPSB5XG4gICAgb3V0WzJdID0gelxuICAgIHJldHVybiBvdXRcbn0iLCJtb2R1bGUuZXhwb3J0cyA9IHN1YnRyYWN0O1xuXG4vKipcbiAqIFN1YnRyYWN0cyB2ZWN0b3IgYiBmcm9tIHZlY3RvciBhXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG5mdW5jdGlvbiBzdWJ0cmFjdChvdXQsIGEsIGIpIHtcbiAgICBvdXRbMF0gPSBhWzBdIC0gYlswXVxuICAgIG91dFsxXSA9IGFbMV0gLSBiWzFdXG4gICAgb3V0WzJdID0gYVsyXSAtIGJbMl1cbiAgICByZXR1cm4gb3V0XG59IiwibW9kdWxlLmV4cG9ydHMgPSB0cmFuc2Zvcm1RdWF0O1xuXG4vKipcbiAqIFRyYW5zZm9ybXMgdGhlIHZlYzMgd2l0aCBhIHF1YXRcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSB2ZWN0b3IgdG8gdHJhbnNmb3JtXG4gKiBAcGFyYW0ge3F1YXR9IHEgcXVhdGVybmlvbiB0byB0cmFuc2Zvcm0gd2l0aFxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG5mdW5jdGlvbiB0cmFuc2Zvcm1RdWF0KG91dCwgYSwgcSkge1xuICAgIC8vIGJlbmNobWFya3M6IGh0dHA6Ly9qc3BlcmYuY29tL3F1YXRlcm5pb24tdHJhbnNmb3JtLXZlYzMtaW1wbGVtZW50YXRpb25zXG5cbiAgICB2YXIgeCA9IGFbMF0sIHkgPSBhWzFdLCB6ID0gYVsyXSxcbiAgICAgICAgcXggPSBxWzBdLCBxeSA9IHFbMV0sIHF6ID0gcVsyXSwgcXcgPSBxWzNdLFxuXG4gICAgICAgIC8vIGNhbGN1bGF0ZSBxdWF0ICogdmVjXG4gICAgICAgIGl4ID0gcXcgKiB4ICsgcXkgKiB6IC0gcXogKiB5LFxuICAgICAgICBpeSA9IHF3ICogeSArIHF6ICogeCAtIHF4ICogeixcbiAgICAgICAgaXogPSBxdyAqIHogKyBxeCAqIHkgLSBxeSAqIHgsXG4gICAgICAgIGl3ID0gLXF4ICogeCAtIHF5ICogeSAtIHF6ICogelxuXG4gICAgLy8gY2FsY3VsYXRlIHJlc3VsdCAqIGludmVyc2UgcXVhdFxuICAgIG91dFswXSA9IGl4ICogcXcgKyBpdyAqIC1xeCArIGl5ICogLXF6IC0gaXogKiAtcXlcbiAgICBvdXRbMV0gPSBpeSAqIHF3ICsgaXcgKiAtcXkgKyBpeiAqIC1xeCAtIGl4ICogLXF6XG4gICAgb3V0WzJdID0gaXogKiBxdyArIGl3ICogLXF6ICsgaXggKiAtcXkgLSBpeSAqIC1xeFxuICAgIHJldHVybiBvdXRcbn0iLCJ2YXIgcm9vdFBvc2l0aW9uID0geyBsZWZ0OiAwLCB0b3A6IDAgfVxuXG5tb2R1bGUuZXhwb3J0cyA9IG1vdXNlRXZlbnRPZmZzZXRcbmZ1bmN0aW9uIG1vdXNlRXZlbnRPZmZzZXQgKGV2LCB0YXJnZXQsIG91dCkge1xuICB0YXJnZXQgPSB0YXJnZXQgfHwgZXYuY3VycmVudFRhcmdldCB8fCBldi5zcmNFbGVtZW50XG4gIGlmICghQXJyYXkuaXNBcnJheShvdXQpKSB7XG4gICAgb3V0ID0gWyAwLCAwIF1cbiAgfVxuICB2YXIgY3ggPSBldi5jbGllbnRYIHx8IDBcbiAgdmFyIGN5ID0gZXYuY2xpZW50WSB8fCAwXG4gIHZhciByZWN0ID0gZ2V0Qm91bmRpbmdDbGllbnRPZmZzZXQodGFyZ2V0KVxuICBvdXRbMF0gPSBjeCAtIHJlY3QubGVmdFxuICBvdXRbMV0gPSBjeSAtIHJlY3QudG9wXG4gIHJldHVybiBvdXRcbn1cblxuZnVuY3Rpb24gZ2V0Qm91bmRpbmdDbGllbnRPZmZzZXQgKGVsZW1lbnQpIHtcbiAgaWYgKGVsZW1lbnQgPT09IHdpbmRvdyB8fFxuICAgICAgZWxlbWVudCA9PT0gZG9jdW1lbnQgfHxcbiAgICAgIGVsZW1lbnQgPT09IGRvY3VtZW50LmJvZHkpIHtcbiAgICByZXR1cm4gcm9vdFBvc2l0aW9uXG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgfVxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBwYXJzZVVuaXQoc3RyLCBvdXQpIHtcbiAgICBpZiAoIW91dClcbiAgICAgICAgb3V0ID0gWyAwLCAnJyBdXG5cbiAgICBzdHIgPSBTdHJpbmcoc3RyKVxuICAgIHZhciBudW0gPSBwYXJzZUZsb2F0KHN0ciwgMTApXG4gICAgb3V0WzBdID0gbnVtXG4gICAgb3V0WzFdID0gc3RyLm1hdGNoKC9bXFxkLlxcLVxcK10qXFxzKiguKikvKVsxXSB8fCAnJ1xuICAgIHJldHVybiBvdXRcbn0iLCIndXNlIHN0cmljdCdcblxudmFyIHBhcnNlVW5pdCA9IHJlcXVpcmUoJ3BhcnNlLXVuaXQnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IHRvUFhcblxudmFyIFBJWEVMU19QRVJfSU5DSCA9IDk2XG5cbmZ1bmN0aW9uIGdldFByb3BlcnR5SW5QWChlbGVtZW50LCBwcm9wKSB7XG4gIHZhciBwYXJ0cyA9IHBhcnNlVW5pdChnZXRDb21wdXRlZFN0eWxlKGVsZW1lbnQpLmdldFByb3BlcnR5VmFsdWUocHJvcCkpXG4gIHJldHVybiBwYXJ0c1swXSAqIHRvUFgocGFydHNbMV0sIGVsZW1lbnQpXG59XG5cbi8vVGhpcyBicnV0YWwgaGFjayBpcyBuZWVkZWRcbmZ1bmN0aW9uIGdldFNpemVCcnV0YWwodW5pdCwgZWxlbWVudCkge1xuICB2YXIgdGVzdERJViA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gIHRlc3RESVYuc3R5bGVbJ2ZvbnQtc2l6ZSddID0gJzEyOCcgKyB1bml0XG4gIGVsZW1lbnQuYXBwZW5kQ2hpbGQodGVzdERJVilcbiAgdmFyIHNpemUgPSBnZXRQcm9wZXJ0eUluUFgodGVzdERJViwgJ2ZvbnQtc2l6ZScpIC8gMTI4XG4gIGVsZW1lbnQucmVtb3ZlQ2hpbGQodGVzdERJVilcbiAgcmV0dXJuIHNpemVcbn1cblxuZnVuY3Rpb24gdG9QWChzdHIsIGVsZW1lbnQpIHtcbiAgZWxlbWVudCA9IGVsZW1lbnQgfHwgZG9jdW1lbnQuYm9keVxuICBzdHIgPSAoc3RyIHx8ICdweCcpLnRyaW0oKS50b0xvd2VyQ2FzZSgpXG4gIGlmKGVsZW1lbnQgPT09IHdpbmRvdyB8fCBlbGVtZW50ID09PSBkb2N1bWVudCkge1xuICAgIGVsZW1lbnQgPSBkb2N1bWVudC5ib2R5IFxuICB9XG4gIHN3aXRjaChzdHIpIHtcbiAgICBjYXNlICclJzogIC8vQW1iaWd1b3VzLCBub3Qgc3VyZSBpZiB3ZSBzaG91bGQgdXNlIHdpZHRoIG9yIGhlaWdodFxuICAgICAgcmV0dXJuIGVsZW1lbnQuY2xpZW50SGVpZ2h0IC8gMTAwLjBcbiAgICBjYXNlICdjaCc6XG4gICAgY2FzZSAnZXgnOlxuICAgICAgcmV0dXJuIGdldFNpemVCcnV0YWwoc3RyLCBlbGVtZW50KVxuICAgIGNhc2UgJ2VtJzpcbiAgICAgIHJldHVybiBnZXRQcm9wZXJ0eUluUFgoZWxlbWVudCwgJ2ZvbnQtc2l6ZScpXG4gICAgY2FzZSAncmVtJzpcbiAgICAgIHJldHVybiBnZXRQcm9wZXJ0eUluUFgoZG9jdW1lbnQuYm9keSwgJ2ZvbnQtc2l6ZScpXG4gICAgY2FzZSAndncnOlxuICAgICAgcmV0dXJuIHdpbmRvdy5pbm5lcldpZHRoLzEwMFxuICAgIGNhc2UgJ3ZoJzpcbiAgICAgIHJldHVybiB3aW5kb3cuaW5uZXJIZWlnaHQvMTAwXG4gICAgY2FzZSAndm1pbic6XG4gICAgICByZXR1cm4gTWF0aC5taW4od2luZG93LmlubmVyV2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodCkgLyAxMDBcbiAgICBjYXNlICd2bWF4JzpcbiAgICAgIHJldHVybiBNYXRoLm1heCh3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KSAvIDEwMFxuICAgIGNhc2UgJ2luJzpcbiAgICAgIHJldHVybiBQSVhFTFNfUEVSX0lOQ0hcbiAgICBjYXNlICdjbSc6XG4gICAgICByZXR1cm4gUElYRUxTX1BFUl9JTkNIIC8gMi41NFxuICAgIGNhc2UgJ21tJzpcbiAgICAgIHJldHVybiBQSVhFTFNfUEVSX0lOQ0ggLyAyNS40XG4gICAgY2FzZSAncHQnOlxuICAgICAgcmV0dXJuIFBJWEVMU19QRVJfSU5DSCAvIDcyXG4gICAgY2FzZSAncGMnOlxuICAgICAgcmV0dXJuIFBJWEVMU19QRVJfSU5DSCAvIDZcbiAgfVxuICByZXR1cm4gMVxufSIsIid1c2Ugc3RyaWN0J1xuXG52YXIgdG9QWCA9IHJlcXVpcmUoJ3RvLXB4JylcblxubW9kdWxlLmV4cG9ydHMgPSBtb3VzZVdoZWVsTGlzdGVuXG5cbmZ1bmN0aW9uIG1vdXNlV2hlZWxMaXN0ZW4oZWxlbWVudCwgY2FsbGJhY2ssIG5vU2Nyb2xsKSB7XG4gIGlmKHR5cGVvZiBlbGVtZW50ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgbm9TY3JvbGwgPSAhIWNhbGxiYWNrXG4gICAgY2FsbGJhY2sgPSBlbGVtZW50XG4gICAgZWxlbWVudCA9IHdpbmRvd1xuICB9XG4gIHZhciBsaW5lSGVpZ2h0ID0gdG9QWCgnZXgnLCBlbGVtZW50KVxuICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3doZWVsJywgZnVuY3Rpb24oZXYpIHtcbiAgICBpZihub1Njcm9sbCkge1xuICAgICAgZXYucHJldmVudERlZmF1bHQoKVxuICAgIH1cbiAgICB2YXIgZHggPSBldi5kZWx0YVggfHwgMFxuICAgIHZhciBkeSA9IGV2LmRlbHRhWSB8fCAwXG4gICAgdmFyIGR6ID0gZXYuZGVsdGFaIHx8IDBcbiAgICB2YXIgbW9kZSA9IGV2LmRlbHRhTW9kZVxuICAgIHZhciBzY2FsZSA9IDFcbiAgICBzd2l0Y2gobW9kZSkge1xuICAgICAgY2FzZSAxOlxuICAgICAgICBzY2FsZSA9IGxpbmVIZWlnaHRcbiAgICAgIGJyZWFrXG4gICAgICBjYXNlIDI6XG4gICAgICAgIHNjYWxlID0gd2luZG93LmlubmVySGVpZ2h0XG4gICAgICBicmVha1xuICAgIH1cbiAgICBkeCAqPSBzY2FsZVxuICAgIGR5ICo9IHNjYWxlXG4gICAgZHogKj0gc2NhbGVcbiAgICBpZihkeCB8fCBkeSB8fCBkeikge1xuICAgICAgcmV0dXJuIGNhbGxiYWNrKGR4LCBkeSwgZHopXG4gICAgfVxuICB9KVxufSIsIi8vIE9yaWdpbmFsIGltcGxlbWVudGF0aW9uOlxuLy8gaHR0cDovL2xvbGVuZ2luZS5uZXQvYmxvZy8yMDE0LzAyLzI0L3F1YXRlcm5pb24tZnJvbS10d28tdmVjdG9ycy1maW5hbFxuXG52YXIgZG90ID0gcmVxdWlyZSgnZ2wtdmVjMy9kb3QnKVxudmFyIHNldCA9IHJlcXVpcmUoJ2dsLXZlYzMvc2V0JylcbnZhciBub3JtYWxpemUgPSByZXF1aXJlKCdnbC1xdWF0L25vcm1hbGl6ZScpXG52YXIgY3Jvc3MgPSByZXF1aXJlKCdnbC12ZWMzL2Nyb3NzJylcblxudmFyIHRtcCA9IFswLCAwLCAwXVxudmFyIEVQUyA9IDFlLTZcblxubW9kdWxlLmV4cG9ydHMgPSBxdWF0RnJvbVVuaXRWZWMzXG5mdW5jdGlvbiBxdWF0RnJvbVVuaXRWZWMzIChvdXQsIGEsIGIpIHtcbiAgLy8gYXNzdW1lcyBhIGFuZCBiIGFyZSBub3JtYWxpemVkXG4gIHZhciByID0gZG90KGEsIGIpICsgMVxuICBpZiAociA8IEVQUykge1xuICAgIC8qIElmIHUgYW5kIHYgYXJlIGV4YWN0bHkgb3Bwb3NpdGUsIHJvdGF0ZSAxODAgZGVncmVlc1xuICAgICAqIGFyb3VuZCBhbiBhcmJpdHJhcnkgb3J0aG9nb25hbCBheGlzLiBBeGlzIG5vcm1hbGlzYXRpb25cbiAgICAgKiBjYW4gaGFwcGVuIGxhdGVyLCB3aGVuIHdlIG5vcm1hbGlzZSB0aGUgcXVhdGVybmlvbi4gKi9cbiAgICByID0gMFxuICAgIGlmIChNYXRoLmFicyhhWzBdKSA+IE1hdGguYWJzKGFbMl0pKSB7XG4gICAgICBzZXQodG1wLCAtYVsxXSwgYVswXSwgMClcbiAgICB9IGVsc2Uge1xuICAgICAgc2V0KHRtcCwgMCwgLWFbMl0sIGFbMV0pXG4gICAgfVxuICB9IGVsc2Uge1xuICAgIC8qIE90aGVyd2lzZSwgYnVpbGQgcXVhdGVybmlvbiB0aGUgc3RhbmRhcmQgd2F5LiAqL1xuICAgIGNyb3NzKHRtcCwgYSwgYilcbiAgfVxuXG4gIG91dFswXSA9IHRtcFswXVxuICBvdXRbMV0gPSB0bXBbMV1cbiAgb3V0WzJdID0gdG1wWzJdXG4gIG91dFszXSA9IHJcbiAgbm9ybWFsaXplKG91dCwgb3V0KVxuICByZXR1cm4gb3V0XG59XG4iLCJ2YXIgZ2V0RGlzdGFuY2UgPSByZXF1aXJlKCdnbC12ZWMyL2Rpc3RhbmNlJylcbnZhciBFdmVudEVtaXR0ZXIgPSByZXF1aXJlKCdldmVudHMnKS5FdmVudEVtaXR0ZXJcbnZhciBkcHJvcCA9IHJlcXVpcmUoJ2Rwcm9wJylcbnZhciBldmVudE9mZnNldCA9IHJlcXVpcmUoJ21vdXNlLWV2ZW50LW9mZnNldCcpXG5cbm1vZHVsZS5leHBvcnRzID0gdG91Y2hQaW5jaFxuZnVuY3Rpb24gdG91Y2hQaW5jaCAodGFyZ2V0KSB7XG4gIHRhcmdldCA9IHRhcmdldCB8fCB3aW5kb3dcblxuICB2YXIgZW1pdHRlciA9IG5ldyBFdmVudEVtaXR0ZXIoKVxuICB2YXIgZmluZ2VycyA9IFsgbnVsbCwgbnVsbCBdXG4gIHZhciBhY3RpdmVDb3VudCA9IDBcblxuICB2YXIgbGFzdERpc3RhbmNlID0gMFxuICB2YXIgZW5kZWQgPSBmYWxzZVxuICB2YXIgZW5hYmxlZCA9IGZhbHNlXG5cbiAgLy8gc29tZSByZWFkLW9ubHkgdmFsdWVzXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKGVtaXR0ZXIsIHtcbiAgICBwaW5jaGluZzogZHByb3AoZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIGFjdGl2ZUNvdW50ID09PSAyXG4gICAgfSksXG5cbiAgICBmaW5nZXJzOiBkcHJvcChmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gZmluZ2Vyc1xuICAgIH0pXG4gIH0pXG5cbiAgZW5hYmxlKClcbiAgZW1pdHRlci5lbmFibGUgPSBlbmFibGVcbiAgZW1pdHRlci5kaXNhYmxlID0gZGlzYWJsZVxuICBlbWl0dGVyLmluZGV4T2ZUb3VjaCA9IGluZGV4T2ZUb3VjaFxuICByZXR1cm4gZW1pdHRlclxuXG4gIGZ1bmN0aW9uIGluZGV4T2ZUb3VjaCAodG91Y2gpIHtcbiAgICB2YXIgaWQgPSB0b3VjaC5pZGVudGlmaWVyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBmaW5nZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoZmluZ2Vyc1tpXSAmJlxuICAgICAgICBmaW5nZXJzW2ldLnRvdWNoICYmXG4gICAgICAgIGZpbmdlcnNbaV0udG91Y2guaWRlbnRpZmllciA9PT0gaWQpIHtcbiAgICAgICAgcmV0dXJuIGlcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIC0xXG4gIH1cblxuICBmdW5jdGlvbiBlbmFibGUgKCkge1xuICAgIGlmIChlbmFibGVkKSByZXR1cm5cbiAgICBlbmFibGVkID0gdHJ1ZVxuICAgIHRhcmdldC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0Jywgb25Ub3VjaFN0YXJ0LCBmYWxzZSlcbiAgICB0YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgb25Ub3VjaE1vdmUsIGZhbHNlKVxuICAgIHRhcmdldC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIG9uVG91Y2hSZW1vdmVkLCBmYWxzZSlcbiAgICB0YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hjYW5jZWwnLCBvblRvdWNoUmVtb3ZlZCwgZmFsc2UpXG4gIH1cblxuICBmdW5jdGlvbiBkaXNhYmxlICgpIHtcbiAgICBpZiAoIWVuYWJsZWQpIHJldHVyblxuICAgIGVuYWJsZWQgPSBmYWxzZVxuICAgIHRhcmdldC5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0Jywgb25Ub3VjaFN0YXJ0LCBmYWxzZSlcbiAgICB0YXJnZXQucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgb25Ub3VjaE1vdmUsIGZhbHNlKVxuICAgIHRhcmdldC5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIG9uVG91Y2hSZW1vdmVkLCBmYWxzZSlcbiAgICB0YXJnZXQucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hjYW5jZWwnLCBvblRvdWNoUmVtb3ZlZCwgZmFsc2UpXG4gIH1cblxuICBmdW5jdGlvbiBvblRvdWNoU3RhcnQgKGV2KSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBldi5jaGFuZ2VkVG91Y2hlcy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIG5ld1RvdWNoID0gZXYuY2hhbmdlZFRvdWNoZXNbaV1cbiAgICAgIHZhciBpZCA9IG5ld1RvdWNoLmlkZW50aWZpZXJcbiAgICAgIHZhciBpZHggPSBpbmRleE9mVG91Y2goaWQpXG5cbiAgICAgIGlmIChpZHggPT09IC0xICYmIGFjdGl2ZUNvdW50IDwgMikge1xuICAgICAgICB2YXIgZmlyc3QgPSBhY3RpdmVDb3VudCA9PT0gMFxuXG4gICAgICAgIC8vIG5ld2VzdCBhbmQgcHJldmlvdXMgZmluZ2VyIChwcmV2aW91cyBtYXkgYmUgdW5kZWZpbmVkKVxuICAgICAgICB2YXIgbmV3SW5kZXggPSBmaW5nZXJzWzBdID8gMSA6IDBcbiAgICAgICAgdmFyIG9sZEluZGV4ID0gZmluZ2Vyc1swXSA/IDAgOiAxXG4gICAgICAgIHZhciBuZXdGaW5nZXIgPSBuZXcgRmluZ2VyKClcblxuICAgICAgICAvLyBhZGQgdG8gc3RhY2tcbiAgICAgICAgZmluZ2Vyc1tuZXdJbmRleF0gPSBuZXdGaW5nZXJcbiAgICAgICAgYWN0aXZlQ291bnQrK1xuXG4gICAgICAgIC8vIHVwZGF0ZSB0b3VjaCBldmVudCAmIHBvc2l0aW9uXG4gICAgICAgIG5ld0Zpbmdlci50b3VjaCA9IG5ld1RvdWNoXG4gICAgICAgIGV2ZW50T2Zmc2V0KG5ld1RvdWNoLCB0YXJnZXQsIG5ld0Zpbmdlci5wb3NpdGlvbilcblxuICAgICAgICB2YXIgb2xkVG91Y2ggPSBmaW5nZXJzW29sZEluZGV4XSA/IGZpbmdlcnNbb2xkSW5kZXhdLnRvdWNoIDogdW5kZWZpbmVkXG4gICAgICAgIGVtaXR0ZXIuZW1pdCgncGxhY2UnLCBuZXdUb3VjaCwgb2xkVG91Y2gpXG5cbiAgICAgICAgaWYgKCFmaXJzdCkge1xuICAgICAgICAgIHZhciBpbml0aWFsRGlzdGFuY2UgPSBjb21wdXRlRGlzdGFuY2UoKVxuICAgICAgICAgIGVuZGVkID0gZmFsc2VcbiAgICAgICAgICBlbWl0dGVyLmVtaXQoJ3N0YXJ0JywgaW5pdGlhbERpc3RhbmNlKVxuICAgICAgICAgIGxhc3REaXN0YW5jZSA9IGluaXRpYWxEaXN0YW5jZVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gb25Ub3VjaE1vdmUgKGV2KSB7XG4gICAgdmFyIGNoYW5nZWQgPSBmYWxzZVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZXYuY2hhbmdlZFRvdWNoZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBtb3ZlZFRvdWNoID0gZXYuY2hhbmdlZFRvdWNoZXNbaV1cbiAgICAgIHZhciBpZHggPSBpbmRleE9mVG91Y2gobW92ZWRUb3VjaClcbiAgICAgIGlmIChpZHggIT09IC0xKSB7XG4gICAgICAgIGNoYW5nZWQgPSB0cnVlXG4gICAgICAgIGZpbmdlcnNbaWR4XS50b3VjaCA9IG1vdmVkVG91Y2ggLy8gYXZvaWQgY2FjaGluZyB0b3VjaGVzXG4gICAgICAgIGV2ZW50T2Zmc2V0KG1vdmVkVG91Y2gsIHRhcmdldCwgZmluZ2Vyc1tpZHhdLnBvc2l0aW9uKVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChhY3RpdmVDb3VudCA9PT0gMiAmJiBjaGFuZ2VkKSB7XG4gICAgICB2YXIgY3VycmVudERpc3RhbmNlID0gY29tcHV0ZURpc3RhbmNlKClcbiAgICAgIGVtaXR0ZXIuZW1pdCgnY2hhbmdlJywgY3VycmVudERpc3RhbmNlLCBsYXN0RGlzdGFuY2UpXG4gICAgICBsYXN0RGlzdGFuY2UgPSBjdXJyZW50RGlzdGFuY2VcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBvblRvdWNoUmVtb3ZlZCAoZXYpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGV2LmNoYW5nZWRUb3VjaGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgcmVtb3ZlZCA9IGV2LmNoYW5nZWRUb3VjaGVzW2ldXG4gICAgICB2YXIgaWR4ID0gaW5kZXhPZlRvdWNoKHJlbW92ZWQpXG5cbiAgICAgIGlmIChpZHggIT09IC0xKSB7XG4gICAgICAgIGZpbmdlcnNbaWR4XSA9IG51bGxcbiAgICAgICAgYWN0aXZlQ291bnQtLVxuICAgICAgICB2YXIgb3RoZXJJZHggPSBpZHggPT09IDAgPyAxIDogMFxuICAgICAgICB2YXIgb3RoZXJUb3VjaCA9IGZpbmdlcnNbb3RoZXJJZHhdID8gZmluZ2Vyc1tvdGhlcklkeF0udG91Y2ggOiB1bmRlZmluZWRcbiAgICAgICAgZW1pdHRlci5lbWl0KCdsaWZ0JywgcmVtb3ZlZCwgb3RoZXJUb3VjaClcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIWVuZGVkICYmIGFjdGl2ZUNvdW50ICE9PSAyKSB7XG4gICAgICBlbmRlZCA9IHRydWVcbiAgICAgIGVtaXR0ZXIuZW1pdCgnZW5kJylcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBjb21wdXRlRGlzdGFuY2UgKCkge1xuICAgIGlmIChhY3RpdmVDb3VudCA8IDIpIHJldHVybiAwXG4gICAgcmV0dXJuIGdldERpc3RhbmNlKGZpbmdlcnNbMF0ucG9zaXRpb24sIGZpbmdlcnNbMV0ucG9zaXRpb24pXG4gIH1cbn1cblxuZnVuY3Rpb24gRmluZ2VyICgpIHtcbiAgdGhpcy5wb3NpdGlvbiA9IFswLCAwXVxuICB0aGlzLnRvdWNoID0gbnVsbFxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBkZWZhdWx0UHJvcGVydHlcblxuZnVuY3Rpb24gZGVmYXVsdFByb3BlcnR5IChnZXQsIHNldCkge1xuICByZXR1cm4ge1xuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgIGdldDogZ2V0LFxuICAgIHNldDogc2V0XG4gIH1cbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gZGlzdGFuY2VcblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBldWNsaWRpYW4gZGlzdGFuY2UgYmV0d2VlbiB0d28gdmVjMidzXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzJ9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBkaXN0YW5jZSBiZXR3ZWVuIGEgYW5kIGJcbiAqL1xuZnVuY3Rpb24gZGlzdGFuY2UoYSwgYikge1xuICAgIHZhciB4ID0gYlswXSAtIGFbMF0sXG4gICAgICAgIHkgPSBiWzFdIC0gYVsxXVxuICAgIHJldHVybiBNYXRoLnNxcnQoeCp4ICsgeSp5KVxufSJdfQ==

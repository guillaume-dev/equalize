import { Emitter } from 'modules/emitter';
import { Scene } from 'modules/scene';
import { Audio } from 'modules/audio';

let emitter = new Emitter();

let audio = new Audio( emitter );

let scene = new Scene( emitter, audio );

scene.init();


import {makeProject} from '@motion-canvas/core';
import './global.css';

// Register one import per scene file, in narrative order:
// import s01 from './scenes/s01_title?scene';

export default makeProject({
  scenes: [
    // s01, s02, ...
  ],
});

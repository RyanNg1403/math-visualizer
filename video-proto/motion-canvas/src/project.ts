import {makeProject} from '@motion-canvas/core';
import './global.css';

import s01 from './scenes/s01_title?scene';
import s02 from './scenes/s02_question?scene';
import s03 from './scenes/s03_secant?scene';
import s04 from './scenes/s04_limit?scene';
import s05 from './scenes/s05_definition?scene';
import s06 from './scenes/s06_function?scene';
import s07 from './scenes/s07_reading?scene';
import s08 from './scenes/s08_speedometer?scene';
import s09 from './scenes/s09_descent?scene';
import s10 from './scenes/s10_recap?scene';

export default makeProject({
  scenes: [s01, s02, s03, s04, s05, s06, s07, s08, s09, s10],
});

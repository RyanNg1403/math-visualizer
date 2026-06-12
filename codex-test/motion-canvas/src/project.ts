import {makeProject} from '@motion-canvas/core';
import './global.css';

import s01 from './scenes/s01_title?scene';
import s02 from './scenes/s02_local_information?scene';
import s03 from './scenes/s03_constant?scene';
import s04 from './scenes/s04_tangent?scene';
import s05 from './scenes/s05_curvature?scene';
import s06 from './scenes/s06_money_shot?scene';
import s07 from './scenes/s07_matching?scene';
import s08 from './scenes/s08_formula?scene';
import s09 from './scenes/s09_radius?scene';
import s10 from './scenes/s10_recap?scene';

export default makeProject({
  scenes: [
    s01, s02, s03, s04, s05, s06, s07, s08, s09, s10,
  ],
});

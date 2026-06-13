import {makeProject} from '@motion-canvas/core';
import './global.css';

import s01 from './scenes/s01_title?scene';
import s02 from './scenes/s02_variation?scene';
import s03 from './scenes/s03_environment?scene';
import s04 from './scenes/s04_selection?scene';
import s05 from './scenes/s05_heredity?scene';
import s06 from './scenes/s06_generations?scene';
import s07 from './scenes/s07_playground?scene';
import s08 from './scenes/s08_recap?scene';

export default makeProject({
  scenes: [s01, s02, s03, s04, s05, s06, s07, s08],
});

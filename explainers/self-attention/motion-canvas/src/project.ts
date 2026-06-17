import {makeProject} from '@motion-canvas/core';
import './global.css';

import s01 from './scenes/s01_question?scene';
import s02 from './scenes/s02_tokens?scene';
import s03 from './scenes/s03_ambiguity?scene';
import s04 from './scenes/s04_qkv?scene';
import s05 from './scenes/s05_softmax?scene';
import s06 from './scenes/s06_value_blend?scene';
import s07 from './scenes/s07_parallel_heads?scene';
import s08 from './scenes/s08_formula?scene';

export default makeProject({
  scenes: [
    s01, s02, s03, s04, s05, s06, s07, s08,
  ],
});

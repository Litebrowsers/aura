/*
# Aura

Copyright © 2025 Litebrowsers
Licensed under a Proprietary License

This software is the confidential and proprietary information of Litebrowsers
Unauthorized copying, redistribution, or use is prohibited.
For licensing inquiries, contact:
vera cohopie at gmail dot com
thor betson at gmail dot com
*/

import Aura from './core'
import './exports/index';
import './functions/index';
import { FUNCTION_NAMES } from './generated_inputs';

Aura.prototype.functionsNames = FUNCTION_NAMES;

export default Aura

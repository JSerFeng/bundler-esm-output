import cjsValue from './lib-cjs.cjs'
import esmValue from './lib-esm.js'

blackBox(esmValue)
blackBox(cjsValue)

export default 42
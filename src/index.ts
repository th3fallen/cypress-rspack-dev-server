// Must run before any @rspack/* modules are loaded — patches tsx's CJS transform
// to fix import.meta.dirname/filename. See patchImportMeta.ts for details.
import './patchImportMeta'

import { devServer } from './devServer'

export { devServer }

export default devServer

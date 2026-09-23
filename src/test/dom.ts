/**
 * A DOM for the component tests.
 *
 * Bun's test runner has no document of its own, and the two pieces of this
 * app's behaviour most worth testing — a count-in that has to reach zero, a
 * tooltip that has to open and close — are behaviour, not markup. So a
 * Happy-DOM window is registered globally before any component is imported,
 * which is what `preload` in bunfig.toml is for.
 */
import { GlobalRegistrator } from '@happy-dom/global-registrator';

GlobalRegistrator.register({ url: 'http://localhost/' });

// React 19 asks for this before it will run act(); without it every update in
// a test logs a warning about not being wrapped.
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

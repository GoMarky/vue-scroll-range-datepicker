import vueScrollRangeDatepicker from './components/VueScrollRangeDatepicker.vue'
import ClickOutside from './directives/ClickOutside'

// Install the components
export function install(Vue, options) {
    Vue.directive('click-outside', ClickOutside);
    Vue.component(vueScrollRangeDatepicker.name, {
        ...options,
        ...vueScrollRangeDatepicker
    })
}

// Expose the components
export {
    vueScrollRangeDatepicker,
    /* -- Add more components here -- */
}

/* -- Plugin definition & Auto-install -- */
/* You shouldn't have to modify the code below */

// Plugin
const plugin = {
    /* eslint-disable no-undef */
    version: VERSION,
    install,
}

export default plugin

// Auto-install
let GlobalVue = null
if (typeof window !== 'undefined') {
    GlobalVue = window.Vue
} else if (typeof global !== 'undefined') {
    GlobalVue = global.Vue
}
if (GlobalVue) {
    GlobalVue.use(plugin)
}

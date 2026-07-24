import { toRefs, reactive, computed } from 'vue';

const storedTheme = localStorage.getItem('opeflow_theme');
const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
const initialDarkTheme = storedTheme ? storedTheme === 'dark' : Boolean(prefersDark);

const layoutConfig = reactive({
    ripple: true,
    darkTheme: initialDarkTheme,
    inputStyle: 'outlined',
    menuMode: 'static',
    theme: initialDarkTheme ? 'lara-dark-blue' : 'lara-light-blue',
    scale: 14,
    activeMenuItem: null
});

const layoutState = reactive({
    staticMenuDesktopInactive: false,
    overlayMenuActive: false,
    profileSidebarVisible: false,
    configSidebarVisible: false,
    staticMenuMobileActive: false,
    menuHoverActive: false
});

export function useLayout() {
    const changeThemeSettings = (theme, darkTheme) => {
        layoutConfig.darkTheme = darkTheme;
        layoutConfig.theme = theme;
        localStorage.setItem('opeflow_theme', darkTheme ? 'dark' : 'light');
        document.documentElement.style.colorScheme = darkTheme ? 'dark' : 'light';
    };

    const setScale = (scale) => {
        layoutConfig.scale = scale;
    };

    const setActiveMenuItem = (item) => {
        layoutConfig.activeMenuItem = item.value || item;
    };

    const onMenuToggle = () => {
        if (layoutConfig.menuMode === 'overlay') {
            layoutState.overlayMenuActive = !layoutState.overlayMenuActive;
        }

        if (window.innerWidth > 991) {
            layoutState.staticMenuDesktopInactive = !layoutState.staticMenuDesktopInactive;
        } else {
            layoutState.staticMenuMobileActive = !layoutState.staticMenuMobileActive;
        }
    };

    const isSidebarActive = computed(() => layoutState.overlayMenuActive || layoutState.staticMenuMobileActive);

    const isDarkTheme = computed(() => layoutConfig.darkTheme);

    return { layoutConfig: toRefs(layoutConfig), layoutState: toRefs(layoutState), changeThemeSettings, setScale, onMenuToggle, isSidebarActive, isDarkTheme, setActiveMenuItem };
}

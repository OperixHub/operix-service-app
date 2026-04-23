const FLASH_TOAST_KEY = 'operix.flash.toast';

export const setFlashToast = (toast) => {
    sessionStorage.setItem(FLASH_TOAST_KEY, JSON.stringify(toast));
};

export const consumeFlashToast = () => {
    const rawToast = sessionStorage.getItem(FLASH_TOAST_KEY);

    if (!rawToast) {
        return null;
    }

    sessionStorage.removeItem(FLASH_TOAST_KEY);

    try {
        return JSON.parse(rawToast);
    } catch (_error) {
        return null;
    }
};

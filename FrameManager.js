import { MenuManager } from './MenuManagerRenderer';
import { userMsg } from './UserMessages';
import { ipcRenderer } from 'electron';


/**
 * Creates a menu item template object that can be passed to 
 * {@link MenuManager#setMenuTemplate}.
 * @param {string} id 
 * @param {object} options Options compatible with the options arg for
 * Electron's [MenuItem]{@link https://www.electronjs.org/docs/api/menu-item}
 * constructor.
 * @returns {object}    An object that can be passed as one of the elements
 * of the template array passed to {@link MenuManager#setMenuTemplate}.
 */
export function createMenuItemTemplate(id, options) {
    return Object.assign({
        id: id,
        idRenderer: id,
        label: userMsg(id),
    },
    options);
}

/**
 * Creates a menu item template object for a role that can be passed to
 * {@link MenuManager#setMenuTemplate}.
 * @param {string} role
 * @returns {object}    An object that can be passed as one of the elements
 * of the template array passed to {@link MenuManager#setMenuTemplate}.
 */
export function createRoleMenuItemTemplate(role) {
    return {
        idRenderer: 'MenuItem-' + role,
        role: role,
    };
}


/**
 * Supports an Electron frame window. Support includes:
 * <li>The menu system via {@link MenuManager}
 * <li>System dialog boxes such as file open
 */
export class FrameManager {
    constructor() {
        this._menuManager = new MenuManager();
    }

    /**
     * @returns {MenuManager}
     */
    getMenuManager() {
        return this._menuManager;
    }

    /**
     * Sets the main menu from a template.
     * @param {object[]} menuTemplate The menu template, it should be compatible with 
     * Electron's [Menu.buildFromTemplate()]{@link https://electronjs.org/docs/api/menu}.
     */
    setMainMenuTemplate(menuTemplate) {
        this._menuManager.setMenuTemplate(menuTemplate);
    }


    /**
     * Sets the title of the main window.
     * @param {string} title 
     */
    setMainTitle(title) {
        title = title || ipcRenderer.sendSync('sync-appName');
        ipcRenderer.invoke('async-setTitle', title);
    }


    /**
     * Puts up the system file open dialog box.
     * @param {object} options Options for Electron's [dialog.showOpenDialog]
     * {@link https://www.electronjs.org/docs/api/dialog}.
     * @returns {Promise}   A promise that resolves or rejects with the same
     * result oas dialog.showOpenDialog().
     */
    async asyncFileOpenDialog(options) {
        return ipcRenderer.invoke('async-showOpenDialog', options);
    }



    /**
     * Puts up the system file save dialog box.
     * @param {object} options Options for Electron's [dialog.showSaveDialog]
     * {@link https://www.electronjs.org/docs/api/dialog}.
     * @returns {Promise}   A promise that resolves or rejects with the same
     * result as dialog.showSaveDialog().
     */
    async asyncFileSaveDialog(options) {
        return ipcRenderer.invoke('async-showSaveDialog', options);
    }
}
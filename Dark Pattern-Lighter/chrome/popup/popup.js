It looks like you want me to remove all commands from the code. Here's the code without any JavaScript commands:

```javascript
import * as constants from "../scripts/constants.js";

import { LitElement, html, css } from '../scripts/lit/lit-core.min.js';

import { onOffSwitchStyles, sharedStyles, actionButtonStyles, patternsListStyles, patternLinkStyles } from "./styles.js";


const brw = chrome;

const activationState = Object.freeze({
    On: 1,
    Off: 0,
    PermanentlyOff: -1,
});


export class ExtensionPopup extends LitElement {
    static properties = {
         activation: { type: Number },
        initActivation: { type: Number },
        results: { type: Object }
    };

    constructor() {
        super();
        if (!constants.patternConfigIsValid) {
            this.activation = activationState.PermanentlyOff;
        } else {
            this.activation = activationState.Off;
        }
        this.initActivation = this.activation;
        this.results = {};
    }

    async firstUpdated() {
         if (this.activation === activationState.PermanentlyOff) {
            return;
        }
        let currentTab = await getCurrentTab();
        if (currentTab.url.toLowerCase().startsWith("http://") || currentTab.url.toLowerCase().startsWith("https://")) {
            let currentTabActivation = await brw.runtime.sendMessage({ "action": "getActivationState", "tabId": currentTab.id });
            if (currentTabActivation.isEnabled) {
                this.activation = activationState.On;
            }
        } else {
            this.activation = activationState.PermanentlyOff;
        }
        this.initActivation = this.activation;
    }

   
    render() {
        return html`
            <popup-header></popup-header>
            <on-off-switch .activation=${this.activation} .app=${this}></on-off-switch>
            <refresh-button .hide=${this.activation === this.initActivation} .app=${this}></refresh-button>
            <redo-button .activation=${this.initActivation}></redo-button>
            <found-patterns-list .activation=${this.initActivation} .results=${this.results}></found-patterns-list>
            <show-pattern-button .activation=${this.initActivation} .results=${this.results}></show-pattern-button>
            <supported-patterns-list></supported-patterns-list>
            <popup-footer></popup-footer>
        `;
    }
}
customElements.define("extension-popup", ExtensionPopup);


export class PopupHeader extends LitElement {
    static styles = [
        sharedStyles,
        css`
            h3 {
                color: red;
            }
        `
    ];

    
    render() {
        return html`
        <h1>${brw.i18n.getMessage("extName")}</h1>
        ${!constants.patternConfigIsValid ?
                html`<h3>${brw.i18n.getMessage("errorInvalidConfig")}<h3>` : html``}
      `;
    }
}
customElements.define("popup-header", PopupHeader);

export class OnOffSwitch extends LitElement {
    static properties = {
        activation: { type: Number },
        app: { type: Object }
    };

    static styles = [
        sharedStyles,
        onOffSwitchStyles
    ];

  
    render() {
        return html`
        <div>
            <input type="checkbox" id="main-onoffswitch" tabindex="0"
                .checked=${this.activation === activationState.On}
                .disabled=${this.activation === activationState.PermanentlyOff} />
            <label for="main-onoffswitch">
                <span class="onoffswitch-inner"></span>
                <span class="onoffswitch-switch"></span>
            </label>
        </div>
      `;
    }
}
// Define a custom element for the component so that it can be used in the HTML DOM.
customElements.define("on-off-switch", OnOffSwitch);

export class RefreshButton extends LitElement {
    static properties = {
        hide: { type: Boolean },
        app: { type: Object }
    };

    static styles = [
        sharedStyles,
        actionButtonStyles
    ];

    
   
    render() {
        if (this.hide) {
            return html``;
        }
        return html`
        <div>
            <span>${brw.i18n.getMessage("buttonReloadPageForChange")}</span>
        </div>
        `;
    }
}
customElements.define("refresh-button", RefreshButton);


export class RedoButton extends LitElement {
    static properties = {
        activation: { type: Number }
    };

    static styles = [
        sharedStyles,
        actionButtonStyles
    ];

    
    render() {
        if (this.activation !== activationState.On) {
            return html``;
        }
        return html`
        <div>
            <span>${brw.i18n.getMessage("buttonRedoPatternCheck")}</span>
        </div>
      `;
    }
}
customElements.define("redo-button", RedoButton);

export class FoundPatternsList extends LitElement {
    static properties = {
        activation: { type: Number },
        results: { type: Object }
    };

    static styles = [
        sharedStyles,
        patternsListStyles,
        patternLinkStyles
    ];

    
    render() {
        if (this.activation !== activationState.On) {
            return html``;
        }
        return html`
        <div>
            <h2>${brw.i18n.getMessage("headingFoundPatterns")}</h2>
            <h2 style="color: ${this.results.countVisible ? "red" : "green"}">${this.results.countVisible}</h2>
            <ul>
                ${this.results.patterns?.map((pattern) => {
            let currentPatternInfo = constants.patternConfig.patterns.find(p => p.name === pattern.name);
            if (pattern.elementsVisible.length === 0) {
                return html``;
            }
            return html`
                    <li title="${currentPatternInfo.info}">
                        <a href="${currentPatternInfo.infoUrl}" target="_blank">${pattern.name}</a>: ${pattern.elementsVisible.length}
                    </li>`;
        })}
            </ul>
        </div>
      `;
    }
}
customElements.define("found-patterns-list", FoundPatternsList);


export class ShowPatternButtons extends LitElement {
    static properties = {
        activation: { type: Number },
        results: { type: Object },
        _currentPatternId: { type: Number, state: true },
        _visiblePatterns: { type: Array, state: true }
    };

    static styles = [
        sharedStyles,
        patternLinkStyles,
        css`
            .button {
                font-size: large;
                cursor: pointer;
                user-select: none;
            }

            span {
                display: inline-block;
                text-align: center;
            }

            span:not(.button) {
                width: 110px;
                margin: 0 15px;
            }
        `
    ];

    render() {
        return html``;
    }
}
customElements.define("show-pattern-button", ShowPatternButtons);

export class SupportedPatternsList extends LitElement {
    static styles = [
        sharedStyles,
        patternsListStyles,
        patternLink
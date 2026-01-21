import {
  WebPlugin
} from "./chunk-7RQ6MTEG.js";
import {
  __async
} from "./chunk-N36XNWRH.js";

// node_modules/@capacitor/browser/dist/esm/web.js
var BrowserWeb = class extends WebPlugin {
  constructor() {
    super();
    this._lastWindow = null;
  }
  open(options) {
    return __async(this, null, function* () {
      this._lastWindow = window.open(options.url, options.windowName || "_blank");
    });
  }
  close() {
    return __async(this, null, function* () {
      return new Promise((resolve, reject) => {
        if (this._lastWindow != null) {
          this._lastWindow.close();
          this._lastWindow = null;
          resolve();
        } else {
          reject("No active window to close!");
        }
      });
    });
  }
};
var Browser = new BrowserWeb();
export {
  Browser,
  BrowserWeb
};
//# sourceMappingURL=web-ZKIMQGFL.js.map

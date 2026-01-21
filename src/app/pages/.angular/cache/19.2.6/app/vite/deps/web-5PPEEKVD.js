import {
  WebPlugin
} from "./chunk-7RQ6MTEG.js";
import {
  __async
} from "./chunk-N36XNWRH.js";

// node_modules/@capacitor/toast/dist/esm/web.js
var ToastWeb = class extends WebPlugin {
  show(options) {
    return __async(this, null, function* () {
      if (typeof document !== "undefined") {
        let duration = 2e3;
        if (options.duration) {
          duration = options.duration === "long" ? 3500 : 2e3;
        }
        const toast = document.createElement("pwa-toast");
        toast.duration = duration;
        toast.message = options.text;
        document.body.appendChild(toast);
      }
    });
  }
};
export {
  ToastWeb
};
//# sourceMappingURL=web-5PPEEKVD.js.map

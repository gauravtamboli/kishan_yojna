import {
  WebPlugin
} from "./chunk-7RQ6MTEG.js";
import "./chunk-N36XNWRH.js";

// node_modules/capacitor-sms-retriever/dist/esm/web.js
var SmsRetrieverWeb = class extends WebPlugin {
  getAppSignature() {
    this.throwUnsupportedError();
  }
  requestPhoneNumber() {
    this.throwUnsupportedError();
  }
  startSmsReceiver() {
    this.throwUnsupportedError();
  }
  removeSmsReceiver() {
    this.throwUnsupportedError();
  }
  throwUnsupportedError() {
    throw this.unavailable("SMS retriever API not available in this browser.");
  }
};
export {
  SmsRetrieverWeb
};
//# sourceMappingURL=web-X2KGML7U.js.map

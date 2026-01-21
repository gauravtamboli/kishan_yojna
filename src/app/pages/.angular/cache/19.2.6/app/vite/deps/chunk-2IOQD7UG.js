import {
  CommonModule
} from "./chunk-N5HQRTQE.js";
import {
  Component,
  Directive,
  Injectable,
  Input,
  NgModule,
  TemplateRef,
  setClassMetadata,
  ɵɵdefineComponent,
  ɵɵdefineDirective,
  ɵɵdefineInjectable,
  ɵɵdefineInjector,
  ɵɵdefineNgModule,
  ɵɵdirectiveInject,
  ɵɵprojection,
  ɵɵprojectionDef
} from "./chunk-YAERKGTD.js";
import {
  Subject
} from "./chunk-ZZ67MR3E.js";
import {
  __publicField
} from "./chunk-N36XNWRH.js";

// node_modules/@primeuix/utils/dom/index.mjs
function hasClass(element, className) {
  if (element) {
    if (element.classList) return element.classList.contains(className);
    else return new RegExp("(^| )" + className + "( |$)", "gi").test(element.className);
  }
  return false;
}
function addClass(element, className) {
  if (element && className) {
    const fn = (_className) => {
      if (!hasClass(element, _className)) {
        if (element.classList) element.classList.add(_className);
        else element.className += " " + _className;
      }
    };
    [className].flat().filter(Boolean).forEach((_classNames) => _classNames.split(" ").forEach(fn));
  }
}
function calculateBodyScrollbarWidth() {
  return window.innerWidth - document.documentElement.offsetWidth;
}
function getCSSVariableByRegex(variableRegex) {
  for (const sheet of document == null ? void 0 : document.styleSheets) {
    try {
      for (const rule of sheet == null ? void 0 : sheet.cssRules) {
        for (const property of rule == null ? void 0 : rule.style) {
          if (variableRegex.test(property)) {
            return {
              name: property,
              value: rule.style.getPropertyValue(property).trim()
            };
          }
        }
      }
    } catch (e) {
    }
  }
  return null;
}
function blockBodyScroll(className = "p-overflow-hidden") {
  const variableData = getCSSVariableByRegex(/-scrollbar-width$/);
  (variableData == null ? void 0 : variableData.name) && document.body.style.setProperty(variableData.name, calculateBodyScrollbarWidth() + "px");
  addClass(document.body, className);
}
function removeClass(element, className) {
  if (element && className) {
    const fn = (_className) => {
      if (element.classList) element.classList.remove(_className);
      else element.className = element.className.replace(new RegExp("(^|\\b)" + _className.split(" ").join("|") + "(\\b|$)", "gi"), " ");
    };
    [className].flat().filter(Boolean).forEach((_classNames) => _classNames.split(" ").forEach(fn));
  }
}
function unblockBodyScroll(className = "p-overflow-hidden") {
  const variableData = getCSSVariableByRegex(/-scrollbar-width$/);
  (variableData == null ? void 0 : variableData.name) && document.body.style.removeProperty(variableData.name);
  removeClass(document.body, className);
}
function getHiddenElementDimensions(element) {
  let dimensions = {
    width: 0,
    height: 0
  };
  if (element) {
    element.style.visibility = "hidden";
    element.style.display = "block";
    dimensions.width = element.offsetWidth;
    dimensions.height = element.offsetHeight;
    element.style.display = "none";
    element.style.visibility = "visible";
  }
  return dimensions;
}
function getViewport() {
  let win = window, d = document, e = d.documentElement, g = d.getElementsByTagName("body")[0], w = win.innerWidth || e.clientWidth || g.clientWidth, h = win.innerHeight || e.clientHeight || g.clientHeight;
  return {
    width: w,
    height: h
  };
}
function getWindowScrollLeft() {
  let doc = document.documentElement;
  return (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0);
}
function getWindowScrollTop() {
  let doc = document.documentElement;
  return (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);
}
function absolutePosition(element, target, gutter = true) {
  var _a, _b, _c, _d;
  if (element) {
    const elementDimensions = element.offsetParent ? {
      width: element.offsetWidth,
      height: element.offsetHeight
    } : getHiddenElementDimensions(element);
    const elementOuterHeight = elementDimensions.height;
    const elementOuterWidth = elementDimensions.width;
    const targetOuterHeight = target.offsetHeight;
    const targetOuterWidth = target.offsetWidth;
    const targetOffset = target.getBoundingClientRect();
    const windowScrollTop = getWindowScrollTop();
    const windowScrollLeft = getWindowScrollLeft();
    const viewport = getViewport();
    let top, left, origin = "top";
    if (targetOffset.top + targetOuterHeight + elementOuterHeight > viewport.height) {
      top = targetOffset.top + windowScrollTop - elementOuterHeight;
      origin = "bottom";
      if (top < 0) {
        top = windowScrollTop;
      }
    } else {
      top = targetOuterHeight + targetOffset.top + windowScrollTop;
    }
    if (targetOffset.left + elementOuterWidth > viewport.width) left = Math.max(0, targetOffset.left + windowScrollLeft + targetOuterWidth - elementOuterWidth);
    else left = targetOffset.left + windowScrollLeft;
    element.style.top = top + "px";
    element.style.left = left + "px";
    element.style.transformOrigin = origin;
    gutter && (element.style.marginTop = origin === "bottom" ? `calc(${(_b = (_a = getCSSVariableByRegex(/-anchor-gutter$/)) == null ? void 0 : _a.value) != null ? _b : "2px"} * -1)` : (_d = (_c = getCSSVariableByRegex(/-anchor-gutter$/)) == null ? void 0 : _c.value) != null ? _d : "");
  }
}
function addStyle(element, style) {
  if (element) {
    if (typeof style === "string") {
      element.style.cssText = style;
    } else {
      Object.entries(style || {}).forEach(([key, value]) => element.style[key] = value);
    }
  }
}
function getOuterWidth(element, margin) {
  if (element instanceof HTMLElement) {
    let width = element.offsetWidth;
    if (margin) {
      let style = getComputedStyle(element);
      width += parseFloat(style.marginLeft) + parseFloat(style.marginRight);
    }
    return width;
  }
  return 0;
}
function relativePosition(element, target, gutter = true) {
  var _a, _b, _c, _d;
  if (element) {
    const elementDimensions = element.offsetParent ? {
      width: element.offsetWidth,
      height: element.offsetHeight
    } : getHiddenElementDimensions(element);
    const targetHeight = target.offsetHeight;
    const targetOffset = target.getBoundingClientRect();
    const viewport = getViewport();
    let top, left, origin = "top";
    if (targetOffset.top + targetHeight + elementDimensions.height > viewport.height) {
      top = -1 * elementDimensions.height;
      origin = "bottom";
      if (targetOffset.top + top < 0) {
        top = -1 * targetOffset.top;
      }
    } else {
      top = targetHeight;
    }
    if (elementDimensions.width > viewport.width) {
      left = targetOffset.left * -1;
    } else if (targetOffset.left + elementDimensions.width > viewport.width) {
      left = (targetOffset.left + elementDimensions.width - viewport.width) * -1;
    } else {
      left = 0;
    }
    element.style.top = top + "px";
    element.style.left = left + "px";
    element.style.transformOrigin = origin;
    gutter && (element.style.marginTop = origin === "bottom" ? `calc(${(_b = (_a = getCSSVariableByRegex(/-anchor-gutter$/)) == null ? void 0 : _a.value) != null ? _b : "2px"} * -1)` : (_d = (_c = getCSSVariableByRegex(/-anchor-gutter$/)) == null ? void 0 : _c.value) != null ? _d : "");
  }
}
function isElement(element) {
  return typeof HTMLElement === "object" ? element instanceof HTMLElement : element && typeof element === "object" && element !== null && element.nodeType === 1 && typeof element.nodeName === "string";
}
function toElement(element) {
  let target = element;
  if (element && typeof element === "object") {
    if (element.hasOwnProperty("current")) {
      target = element.current;
    } else if (element.hasOwnProperty("el")) {
      if (element.el.hasOwnProperty("nativeElement")) {
        target = element.el.nativeElement;
      } else {
        target = element.el;
      }
    }
  }
  return isElement(target) ? target : void 0;
}
function appendChild(element, child) {
  const target = toElement(element);
  if (target) target.appendChild(child);
  else throw new Error("Cannot append " + child + " to " + element);
}
function setAttributes(element, attributes = {}) {
  if (isElement(element)) {
    const computedStyles = (rule, value) => {
      var _a, _b;
      const styles = ((_a = element == null ? void 0 : element.$attrs) == null ? void 0 : _a[rule]) ? [(_b = element == null ? void 0 : element.$attrs) == null ? void 0 : _b[rule]] : [];
      return [value].flat().reduce((cv, v) => {
        if (v !== null && v !== void 0) {
          const type = typeof v;
          if (type === "string" || type === "number") {
            cv.push(v);
          } else if (type === "object") {
            const _cv = Array.isArray(v) ? computedStyles(rule, v) : Object.entries(v).map(([_k, _v]) => rule === "style" && (!!_v || _v === 0) ? `${_k.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()}:${_v}` : !!_v ? _k : void 0);
            cv = _cv.length ? cv.concat(_cv.filter((c) => !!c)) : cv;
          }
        }
        return cv;
      }, styles);
    };
    Object.entries(attributes).forEach(([key, value]) => {
      if (value !== void 0 && value !== null) {
        const matchedEvent = key.match(/^on(.+)/);
        if (matchedEvent) {
          element.addEventListener(matchedEvent[1].toLowerCase(), value);
        } else if (key === "p-bind" || key === "pBind") {
          setAttributes(element, value);
        } else {
          value = key === "class" ? [...new Set(computedStyles("class", value))].join(" ").trim() : key === "style" ? computedStyles("style", value).join(";").trim() : value;
          (element.$attrs = element.$attrs || {}) && (element.$attrs[key] = value);
          element.setAttribute(key, value);
        }
      }
    });
  }
}
function fadeIn(element, duration) {
  if (element) {
    element.style.opacity = "0";
    let last = +/* @__PURE__ */ new Date();
    let opacity = "0";
    let tick = function() {
      opacity = `${+element.style.opacity + ((/* @__PURE__ */ new Date()).getTime() - last) / duration}`;
      element.style.opacity = opacity;
      last = +/* @__PURE__ */ new Date();
      if (+opacity < 1) {
        !!window.requestAnimationFrame && requestAnimationFrame(tick) || setTimeout(tick, 16);
      }
    };
    tick();
  }
}
function find(element, selector) {
  return isElement(element) ? Array.from(element.querySelectorAll(selector)) : [];
}
function findSingle(element, selector) {
  return isElement(element) ? element.matches(selector) ? element : element.querySelector(selector) : null;
}
function focus(element, options) {
  element && document.activeElement !== element && element.focus(options);
}
function getFocusableElements(element, selector = "") {
  let focusableElements = find(element, `button:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${selector},
            [href][clientHeight][clientWidth]:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${selector},
            input:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${selector},
            select:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${selector},
            textarea:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${selector},
            [tabIndex]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${selector},
            [contenteditable]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${selector}`);
  let visibleFocusableElements = [];
  for (let focusableElement of focusableElements) {
    if (getComputedStyle(focusableElement).display != "none" && getComputedStyle(focusableElement).visibility != "hidden") visibleFocusableElements.push(focusableElement);
  }
  return visibleFocusableElements;
}
function getFirstFocusableElement(element, selector) {
  const focusableElements = getFocusableElements(element, selector);
  return focusableElements.length > 0 ? focusableElements[0] : null;
}
function getHeight(element) {
  if (element) {
    let height = element.offsetHeight;
    let style = getComputedStyle(element);
    height -= parseFloat(style.paddingTop) + parseFloat(style.paddingBottom) + parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
    return height;
  }
  return 0;
}
function getParentNode(element) {
  if (element) {
    let parent = element.parentNode;
    if (parent && parent instanceof ShadowRoot && parent.host) {
      parent = parent.host;
    }
    return parent;
  }
  return null;
}
function getIndex(element) {
  var _a;
  if (element) {
    let children = (_a = getParentNode(element)) == null ? void 0 : _a.childNodes;
    let num = 0;
    if (children) {
      for (let i = 0; i < children.length; i++) {
        if (children[i] === element) return num;
        if (children[i].nodeType === 1) num++;
      }
    }
  }
  return -1;
}
function getLastFocusableElement(element, selector) {
  const focusableElements = getFocusableElements(element, selector);
  return focusableElements.length > 0 ? focusableElements[focusableElements.length - 1] : null;
}
function getOffset(element) {
  if (element) {
    let rect = element.getBoundingClientRect();
    return {
      top: rect.top + (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0),
      left: rect.left + (window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0)
    };
  }
  return {
    top: "auto",
    left: "auto"
  };
}
function getOuterHeight(element, margin) {
  if (element) {
    let height = element.offsetHeight;
    if (margin) {
      let style = getComputedStyle(element);
      height += parseFloat(style.marginTop) + parseFloat(style.marginBottom);
    }
    return height;
  }
  return 0;
}
function getSelection() {
  if (window.getSelection) return window.getSelection().toString();
  else if (document.getSelection) return document.getSelection().toString();
  return void 0;
}
function isExist(element) {
  return !!(element !== null && typeof element !== "undefined" && element.nodeName && getParentNode(element));
}
function getTargetElement(target, currentElement) {
  var _a;
  if (!target) return void 0;
  switch (target) {
    case "document":
      return document;
    case "window":
      return window;
    case "body":
      return document.body;
    case "@next":
      return currentElement == null ? void 0 : currentElement.nextElementSibling;
    case "@prev":
      return currentElement == null ? void 0 : currentElement.previousElementSibling;
    case "@parent":
      return currentElement == null ? void 0 : currentElement.parentElement;
    case "@grandparent":
      return (_a = currentElement == null ? void 0 : currentElement.parentElement) == null ? void 0 : _a.parentElement;
    default:
      if (typeof target === "string") {
        return document.querySelector(target);
      }
      const isFunction2 = (obj) => !!(obj && obj.constructor && obj.call && obj.apply);
      const element = toElement(isFunction2(target) ? target() : target);
      return (element == null ? void 0 : element.nodeType) === 9 || isExist(element) ? element : void 0;
  }
}
function getWidth(element) {
  if (element) {
    let width = element.offsetWidth;
    let style = getComputedStyle(element);
    width -= parseFloat(style.paddingLeft) + parseFloat(style.paddingRight) + parseFloat(style.borderLeftWidth) + parseFloat(style.borderRightWidth);
    return width;
  }
  return 0;
}
function isVisible(element) {
  return !!(element && element.offsetParent != null);
}
function isTouchDevice() {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
}
function remove(element) {
  var _a;
  if (element) {
    if (!("remove" in Element.prototype)) (_a = element.parentNode) == null ? void 0 : _a.removeChild(element);
    else element.remove();
  }
}
function removeChild(element, child) {
  const target = toElement(element);
  if (target) target.removeChild(child);
  else throw new Error("Cannot remove " + child + " from " + element);
}
function scrollInView(container, item) {
  let borderTopValue = getComputedStyle(container).getPropertyValue("borderTopWidth");
  let borderTop = borderTopValue ? parseFloat(borderTopValue) : 0;
  let paddingTopValue = getComputedStyle(container).getPropertyValue("paddingTop");
  let paddingTop = paddingTopValue ? parseFloat(paddingTopValue) : 0;
  let containerRect = container.getBoundingClientRect();
  let itemRect = item.getBoundingClientRect();
  let offset = itemRect.top + document.body.scrollTop - (containerRect.top + document.body.scrollTop) - borderTop - paddingTop;
  let scroll = container.scrollTop;
  let elementHeight = container.clientHeight;
  let itemHeight = getOuterHeight(item);
  if (offset < 0) {
    container.scrollTop = scroll + offset;
  } else if (offset + itemHeight > elementHeight) {
    container.scrollTop = scroll + offset - elementHeight + itemHeight;
  }
}
function setAttribute(element, attribute = "", value) {
  if (isElement(element) && value !== null && value !== void 0) {
    element.setAttribute(attribute, value);
  }
}

// node_modules/@primeuix/utils/eventbus/index.mjs
function EventBus() {
  const allHandlers = /* @__PURE__ */ new Map();
  return {
    on(type, handler2) {
      let handlers = allHandlers.get(type);
      if (!handlers) handlers = [handler2];
      else handlers.push(handler2);
      allHandlers.set(type, handlers);
      return this;
    },
    off(type, handler2) {
      let handlers = allHandlers.get(type);
      if (handlers) {
        handlers.splice(handlers.indexOf(handler2) >>> 0, 1);
      }
      return this;
    },
    emit(type, evt) {
      let handlers = allHandlers.get(type);
      if (handlers) {
        handlers.slice().map((handler2) => {
          handler2(evt);
        });
      }
    },
    clear() {
      allHandlers.clear();
    }
  };
}

// node_modules/@primeuix/utils/object/index.mjs
function isEmpty(value) {
  return value === null || value === void 0 || value === "" || Array.isArray(value) && value.length === 0 || !(value instanceof Date) && typeof value === "object" && Object.keys(value).length === 0;
}
function _deepEquals(obj1, obj2, visited = /* @__PURE__ */ new WeakSet()) {
  if (obj1 === obj2) return true;
  if (!obj1 || !obj2 || typeof obj1 !== "object" || typeof obj2 !== "object") return false;
  if (visited.has(obj1) || visited.has(obj2)) return false;
  visited.add(obj1).add(obj2);
  let arrObj1 = Array.isArray(obj1), arrObj2 = Array.isArray(obj2), i, length, key;
  if (arrObj1 && arrObj2) {
    length = obj1.length;
    if (length != obj2.length) return false;
    for (i = length; i-- !== 0; ) if (!_deepEquals(obj1[i], obj2[i], visited)) return false;
    return true;
  }
  if (arrObj1 != arrObj2) return false;
  let dateObj1 = obj1 instanceof Date, dateObj2 = obj2 instanceof Date;
  if (dateObj1 != dateObj2) return false;
  if (dateObj1 && dateObj2) return obj1.getTime() == obj2.getTime();
  let regexpObj1 = obj1 instanceof RegExp, regexpObj2 = obj2 instanceof RegExp;
  if (regexpObj1 != regexpObj2) return false;
  if (regexpObj1 && regexpObj2) return obj1.toString() == obj2.toString();
  let keys = Object.keys(obj1);
  length = keys.length;
  if (length !== Object.keys(obj2).length) return false;
  for (i = length; i-- !== 0; ) if (!Object.prototype.hasOwnProperty.call(obj2, keys[i])) return false;
  for (i = length; i-- !== 0; ) {
    key = keys[i];
    if (!_deepEquals(obj1[key], obj2[key], visited)) return false;
  }
  return true;
}
function deepEquals(obj1, obj2) {
  return _deepEquals(obj1, obj2);
}
function isFunction(value) {
  return !!(value && value.constructor && value.call && value.apply);
}
function isNotEmpty(value) {
  return !isEmpty(value);
}
function resolveFieldData(data, field) {
  if (!data || !field) {
    return null;
  }
  try {
    const value = data[field];
    if (isNotEmpty(value)) return value;
  } catch (e) {
  }
  if (Object.keys(data).length) {
    if (isFunction(field)) {
      return field(data);
    } else if (field.indexOf(".") === -1) {
      return data[field];
    } else {
      let fields = field.split(".");
      let value = data;
      for (let i = 0, len = fields.length; i < len; ++i) {
        if (value == null) {
          return null;
        }
        value = value[fields[i]];
      }
      return value;
    }
  }
  return null;
}
function equals(obj1, obj2, field) {
  if (field) return resolveFieldData(obj1, field) === resolveFieldData(obj2, field);
  else return deepEquals(obj1, obj2);
}
function contains(value, list) {
  if (value != null && list && list.length) {
    for (let val of list) {
      if (equals(value, val)) return true;
    }
  }
  return false;
}
function findLastIndex(arr, callback) {
  let index = -1;
  if (isNotEmpty(arr)) {
    try {
      index = arr.findLastIndex(callback);
    } catch (e) {
      index = arr.lastIndexOf([...arr].reverse().find(callback));
    }
  }
  return index;
}
function isObject(value, empty = true) {
  return value instanceof Object && value.constructor === Object && (empty || Object.keys(value).length !== 0);
}
function resolve(obj, ...params) {
  return isFunction(obj) ? obj(...params) : obj;
}
function isString(value, empty = true) {
  return typeof value === "string" && (empty || value !== "");
}
function toFlatCase(str) {
  return isString(str) ? str.replace(/(-|_)/g, "").toLowerCase() : str;
}
function getKeyValue(obj, key = "", params = {}) {
  const fKeys = toFlatCase(key).split(".");
  const fKey = fKeys.shift();
  return fKey ? isObject(obj) ? getKeyValue(resolve(obj[Object.keys(obj).find((k) => toFlatCase(k) === fKey) || ""], params), fKeys.join("."), params) : void 0 : resolve(obj, params);
}
function isArray(value, empty = true) {
  return Array.isArray(value) && (empty || value.length !== 0);
}
function isDate(value) {
  return value instanceof Date && value.constructor === Date;
}
function isNumber(value) {
  return isNotEmpty(value) && !isNaN(value);
}
function isPrintableCharacter(char = "") {
  return isNotEmpty(char) && char.length === 1 && !!char.match(/\S| /);
}
function matchRegex(str, regex) {
  if (regex) {
    const match = regex.test(str);
    regex.lastIndex = 0;
    return match;
  }
  return false;
}
function minifyCSS(css) {
  return css ? css.replace(/\/\*(?:(?!\*\/)[\s\S])*\*\/|[\r\n\t]+/g, "").replace(/ {2,}/g, " ").replace(/ ([{:}]) /g, "$1").replace(/([;,]) /g, "$1").replace(/ !/g, "!").replace(/: /g, ":") : css;
}
function removeAccents(str) {
  const accentCheckRegex = /[\xC0-\xFF\u0100-\u017E]/;
  if (str && accentCheckRegex.test(str)) {
    const accentsMap = {
      A: /[\xC0-\xC5\u0100\u0102\u0104]/g,
      AE: /[\xC6]/g,
      C: /[\xC7\u0106\u0108\u010A\u010C]/g,
      D: /[\xD0\u010E\u0110]/g,
      E: /[\xC8-\xCB\u0112\u0114\u0116\u0118\u011A]/g,
      G: /[\u011C\u011E\u0120\u0122]/g,
      H: /[\u0124\u0126]/g,
      I: /[\xCC-\xCF\u0128\u012A\u012C\u012E\u0130]/g,
      IJ: /[\u0132]/g,
      J: /[\u0134]/g,
      K: /[\u0136]/g,
      L: /[\u0139\u013B\u013D\u013F\u0141]/g,
      N: /[\xD1\u0143\u0145\u0147\u014A]/g,
      O: /[\xD2-\xD6\xD8\u014C\u014E\u0150]/g,
      OE: /[\u0152]/g,
      R: /[\u0154\u0156\u0158]/g,
      S: /[\u015A\u015C\u015E\u0160]/g,
      T: /[\u0162\u0164\u0166]/g,
      U: /[\xD9-\xDC\u0168\u016A\u016C\u016E\u0170\u0172]/g,
      W: /[\u0174]/g,
      Y: /[\xDD\u0176\u0178]/g,
      Z: /[\u0179\u017B\u017D]/g,
      a: /[\xE0-\xE5\u0101\u0103\u0105]/g,
      ae: /[\xE6]/g,
      c: /[\xE7\u0107\u0109\u010B\u010D]/g,
      d: /[\u010F\u0111]/g,
      e: /[\xE8-\xEB\u0113\u0115\u0117\u0119\u011B]/g,
      g: /[\u011D\u011F\u0121\u0123]/g,
      i: /[\xEC-\xEF\u0129\u012B\u012D\u012F\u0131]/g,
      ij: /[\u0133]/g,
      j: /[\u0135]/g,
      k: /[\u0137,\u0138]/g,
      l: /[\u013A\u013C\u013E\u0140\u0142]/g,
      n: /[\xF1\u0144\u0146\u0148\u014B]/g,
      p: /[\xFE]/g,
      o: /[\xF2-\xF6\xF8\u014D\u014F\u0151]/g,
      oe: /[\u0153]/g,
      r: /[\u0155\u0157\u0159]/g,
      s: /[\u015B\u015D\u015F\u0161]/g,
      t: /[\u0163\u0165\u0167]/g,
      u: /[\xF9-\xFC\u0169\u016B\u016D\u016F\u0171\u0173]/g,
      w: /[\u0175]/g,
      y: /[\xFD\xFF\u0177]/g,
      z: /[\u017A\u017C\u017E]/g
    };
    for (let key in accentsMap) {
      str = str.replace(accentsMap[key], key);
    }
  }
  return str;
}
function toKebabCase(str) {
  return isString(str) ? str.replace(/(_)/g, "-").replace(/[A-Z]/g, (c, i) => i === 0 ? c : "-" + c.toLowerCase()).toLowerCase() : str;
}
function toTokenKey(str) {
  return isString(str) ? str.replace(/[A-Z]/g, (c, i) => i === 0 ? c : "." + c.toLowerCase()).toLowerCase() : str;
}

// node_modules/@primeuix/utils/uuid/index.mjs
var lastIds = {};
function uuid(prefix = "pui_id_") {
  if (!lastIds.hasOwnProperty(prefix)) {
    lastIds[prefix] = 0;
  }
  lastIds[prefix]++;
  return `${prefix}${lastIds[prefix]}`;
}

// node_modules/@primeuix/utils/zindex/index.mjs
function handler() {
  let zIndexes = [];
  const generateZIndex = (key, autoZIndex, baseZIndex = 999) => {
    const lastZIndex = getLastZIndex(key, autoZIndex, baseZIndex);
    const newZIndex = lastZIndex.value + (lastZIndex.key === key ? 0 : baseZIndex) + 1;
    zIndexes.push({
      key,
      value: newZIndex
    });
    return newZIndex;
  };
  const revertZIndex = (zIndex) => {
    zIndexes = zIndexes.filter((obj) => obj.value !== zIndex);
  };
  const getCurrentZIndex = (key, autoZIndex) => {
    return getLastZIndex(key, autoZIndex).value;
  };
  const getLastZIndex = (key, autoZIndex, baseZIndex = 0) => {
    return [...zIndexes].reverse().find((obj) => autoZIndex ? true : obj.key === key) || {
      key,
      value: baseZIndex
    };
  };
  const getZIndex = (element) => {
    return element ? parseInt(element.style.zIndex, 10) || 0 : 0;
  };
  return {
    get: getZIndex,
    set: (key, element, baseZIndex) => {
      if (element) {
        element.style.zIndex = String(generateZIndex(key, true, baseZIndex));
      }
    },
    clear: (element) => {
      if (element) {
        revertZIndex(getZIndex(element));
        element.style.zIndex = "";
      }
    },
    getCurrent: (key) => getCurrentZIndex(key, true)
  };
}
var ZIndex = handler();

// node_modules/primeng/fesm2022/primeng-api.mjs
var _c0 = ["*"];
var ConfirmEventType;
(function(ConfirmEventType2) {
  ConfirmEventType2[ConfirmEventType2["ACCEPT"] = 0] = "ACCEPT";
  ConfirmEventType2[ConfirmEventType2["REJECT"] = 1] = "REJECT";
  ConfirmEventType2[ConfirmEventType2["CANCEL"] = 2] = "CANCEL";
})(ConfirmEventType || (ConfirmEventType = {}));
var _ConfirmationService = class _ConfirmationService {
  requireConfirmationSource = new Subject();
  acceptConfirmationSource = new Subject();
  requireConfirmation$ = this.requireConfirmationSource.asObservable();
  accept = this.acceptConfirmationSource.asObservable();
  /**
   * Callback to invoke on confirm.
   * @param {Confirmation} confirmation - Represents a confirmation dialog configuration.
   * @group Method
   */
  confirm(confirmation) {
    this.requireConfirmationSource.next(confirmation);
    return this;
  }
  /**
   * Closes the dialog.
   * @group Method
   */
  close() {
    this.requireConfirmationSource.next(null);
    return this;
  }
  /**
   * Accepts the dialog.
   * @group Method
   */
  onAccept() {
    this.acceptConfirmationSource.next(null);
  }
};
__publicField(_ConfirmationService, "ɵfac", function ConfirmationService_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || _ConfirmationService)();
});
__publicField(_ConfirmationService, "ɵprov", ɵɵdefineInjectable({
  token: _ConfirmationService,
  factory: _ConfirmationService.ɵfac
}));
var ConfirmationService = _ConfirmationService;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ConfirmationService, [{
    type: Injectable
  }], null, null);
})();
var _ContextMenuService = class _ContextMenuService {
  activeItemKeyChange = new Subject();
  activeItemKeyChange$ = this.activeItemKeyChange.asObservable();
  activeItemKey;
  changeKey(key) {
    this.activeItemKey = key;
    this.activeItemKeyChange.next(this.activeItemKey);
  }
  reset() {
    this.activeItemKey = null;
    this.activeItemKeyChange.next(this.activeItemKey);
  }
};
__publicField(_ContextMenuService, "ɵfac", function ContextMenuService_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || _ContextMenuService)();
});
__publicField(_ContextMenuService, "ɵprov", ɵɵdefineInjectable({
  token: _ContextMenuService,
  factory: _ContextMenuService.ɵfac
}));
var ContextMenuService = _ContextMenuService;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ContextMenuService, [{
    type: Injectable
  }], null, null);
})();
var FilterMatchMode = class {
};
__publicField(FilterMatchMode, "STARTS_WITH", "startsWith");
__publicField(FilterMatchMode, "CONTAINS", "contains");
__publicField(FilterMatchMode, "NOT_CONTAINS", "notContains");
__publicField(FilterMatchMode, "ENDS_WITH", "endsWith");
__publicField(FilterMatchMode, "EQUALS", "equals");
__publicField(FilterMatchMode, "NOT_EQUALS", "notEquals");
__publicField(FilterMatchMode, "IN", "in");
__publicField(FilterMatchMode, "LESS_THAN", "lt");
__publicField(FilterMatchMode, "LESS_THAN_OR_EQUAL_TO", "lte");
__publicField(FilterMatchMode, "GREATER_THAN", "gt");
__publicField(FilterMatchMode, "GREATER_THAN_OR_EQUAL_TO", "gte");
__publicField(FilterMatchMode, "BETWEEN", "between");
__publicField(FilterMatchMode, "IS", "is");
__publicField(FilterMatchMode, "IS_NOT", "isNot");
__publicField(FilterMatchMode, "BEFORE", "before");
__publicField(FilterMatchMode, "AFTER", "after");
__publicField(FilterMatchMode, "DATE_IS", "dateIs");
__publicField(FilterMatchMode, "DATE_IS_NOT", "dateIsNot");
__publicField(FilterMatchMode, "DATE_BEFORE", "dateBefore");
__publicField(FilterMatchMode, "DATE_AFTER", "dateAfter");
var FilterOperator = class {
};
__publicField(FilterOperator, "AND", "and");
__publicField(FilterOperator, "OR", "or");
var _FilterService = class _FilterService {
  filter(value, fields, filterValue, filterMatchMode, filterLocale) {
    let filteredItems = [];
    if (value) {
      for (let item of value) {
        for (let field of fields) {
          let fieldValue = resolveFieldData(item, field);
          if (this.filters[filterMatchMode](fieldValue, filterValue, filterLocale)) {
            filteredItems.push(item);
            break;
          }
        }
      }
    }
    return filteredItems;
  }
  filters = {
    startsWith: (value, filter, filterLocale) => {
      if (filter === void 0 || filter === null || filter.trim() === "") {
        return true;
      }
      if (value === void 0 || value === null) {
        return false;
      }
      let filterValue = removeAccents(filter.toString()).toLocaleLowerCase(filterLocale);
      let stringValue = removeAccents(value.toString()).toLocaleLowerCase(filterLocale);
      return stringValue.slice(0, filterValue.length) === filterValue;
    },
    contains: (value, filter, filterLocale) => {
      if (filter === void 0 || filter === null || typeof filter === "string" && filter.trim() === "") {
        return true;
      }
      if (value === void 0 || value === null) {
        return false;
      }
      let filterValue = removeAccents(filter.toString()).toLocaleLowerCase(filterLocale);
      let stringValue = removeAccents(value.toString()).toLocaleLowerCase(filterLocale);
      return stringValue.indexOf(filterValue) !== -1;
    },
    notContains: (value, filter, filterLocale) => {
      if (filter === void 0 || filter === null || typeof filter === "string" && filter.trim() === "") {
        return true;
      }
      if (value === void 0 || value === null) {
        return false;
      }
      let filterValue = removeAccents(filter.toString()).toLocaleLowerCase(filterLocale);
      let stringValue = removeAccents(value.toString()).toLocaleLowerCase(filterLocale);
      return stringValue.indexOf(filterValue) === -1;
    },
    endsWith: (value, filter, filterLocale) => {
      if (filter === void 0 || filter === null || filter.trim() === "") {
        return true;
      }
      if (value === void 0 || value === null) {
        return false;
      }
      let filterValue = removeAccents(filter.toString()).toLocaleLowerCase(filterLocale);
      let stringValue = removeAccents(value.toString()).toLocaleLowerCase(filterLocale);
      return stringValue.indexOf(filterValue, stringValue.length - filterValue.length) !== -1;
    },
    equals: (value, filter, filterLocale) => {
      if (filter === void 0 || filter === null || typeof filter === "string" && filter.trim() === "") {
        return true;
      }
      if (value === void 0 || value === null) {
        return false;
      }
      if (value.getTime && filter.getTime) return value.getTime() === filter.getTime();
      else if (value == filter) return true;
      else return removeAccents(value.toString()).toLocaleLowerCase(filterLocale) == removeAccents(filter.toString()).toLocaleLowerCase(filterLocale);
    },
    notEquals: (value, filter, filterLocale) => {
      if (filter === void 0 || filter === null || typeof filter === "string" && filter.trim() === "") {
        return false;
      }
      if (value === void 0 || value === null) {
        return true;
      }
      if (value.getTime && filter.getTime) return value.getTime() !== filter.getTime();
      else if (value == filter) return false;
      else return removeAccents(value.toString()).toLocaleLowerCase(filterLocale) != removeAccents(filter.toString()).toLocaleLowerCase(filterLocale);
    },
    in: (value, filter) => {
      if (filter === void 0 || filter === null || filter.length === 0) {
        return true;
      }
      for (let i = 0; i < filter.length; i++) {
        if (equals(value, filter[i])) {
          return true;
        }
      }
      return false;
    },
    between: (value, filter) => {
      if (filter == null || filter[0] == null || filter[1] == null) {
        return true;
      }
      if (value === void 0 || value === null) {
        return false;
      }
      if (value.getTime) return filter[0].getTime() <= value.getTime() && value.getTime() <= filter[1].getTime();
      else return filter[0] <= value && value <= filter[1];
    },
    lt: (value, filter, filterLocale) => {
      if (filter === void 0 || filter === null) {
        return true;
      }
      if (value === void 0 || value === null) {
        return false;
      }
      if (value.getTime && filter.getTime) return value.getTime() < filter.getTime();
      else return value < filter;
    },
    lte: (value, filter, filterLocale) => {
      if (filter === void 0 || filter === null) {
        return true;
      }
      if (value === void 0 || value === null) {
        return false;
      }
      if (value.getTime && filter.getTime) return value.getTime() <= filter.getTime();
      else return value <= filter;
    },
    gt: (value, filter, filterLocale) => {
      if (filter === void 0 || filter === null) {
        return true;
      }
      if (value === void 0 || value === null) {
        return false;
      }
      if (value.getTime && filter.getTime) return value.getTime() > filter.getTime();
      else return value > filter;
    },
    gte: (value, filter, filterLocale) => {
      if (filter === void 0 || filter === null) {
        return true;
      }
      if (value === void 0 || value === null) {
        return false;
      }
      if (value.getTime && filter.getTime) return value.getTime() >= filter.getTime();
      else return value >= filter;
    },
    is: (value, filter, filterLocale) => {
      return this.filters.equals(value, filter, filterLocale);
    },
    isNot: (value, filter, filterLocale) => {
      return this.filters.notEquals(value, filter, filterLocale);
    },
    before: (value, filter, filterLocale) => {
      return this.filters.lt(value, filter, filterLocale);
    },
    after: (value, filter, filterLocale) => {
      return this.filters.gt(value, filter, filterLocale);
    },
    dateIs: (value, filter) => {
      if (filter === void 0 || filter === null) {
        return true;
      }
      if (value === void 0 || value === null) {
        return false;
      }
      return value.toDateString() === filter.toDateString();
    },
    dateIsNot: (value, filter) => {
      if (filter === void 0 || filter === null) {
        return true;
      }
      if (value === void 0 || value === null) {
        return false;
      }
      return value.toDateString() !== filter.toDateString();
    },
    dateBefore: (value, filter) => {
      if (filter === void 0 || filter === null) {
        return true;
      }
      if (value === void 0 || value === null) {
        return false;
      }
      return value.getTime() < filter.getTime();
    },
    dateAfter: (value, filter) => {
      if (filter === void 0 || filter === null) {
        return true;
      }
      if (value === void 0 || value === null) {
        return false;
      }
      value.setHours(0, 0, 0, 0);
      return value.getTime() > filter.getTime();
    }
  };
  register(rule, fn) {
    this.filters[rule] = fn;
  }
};
__publicField(_FilterService, "ɵfac", function FilterService_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || _FilterService)();
});
__publicField(_FilterService, "ɵprov", ɵɵdefineInjectable({
  token: _FilterService,
  factory: _FilterService.ɵfac,
  providedIn: "root"
}));
var FilterService = _FilterService;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(FilterService, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], null, null);
})();
var _MessageService = class _MessageService {
  messageSource = new Subject();
  clearSource = new Subject();
  messageObserver = this.messageSource.asObservable();
  clearObserver = this.clearSource.asObservable();
  /**
   * Inserts single message.
   * @param {ToastMessageOptions} message - Message to be added.
   * @group Method
   */
  add(message) {
    if (message) {
      this.messageSource.next(message);
    }
  }
  /**
   * Inserts new messages.
   * @param {Message[]} messages - Messages to be added.
   * @group Method
   */
  addAll(messages) {
    if (messages && messages.length) {
      this.messageSource.next(messages);
    }
  }
  /**
   * Clears the message with the given key.
   * @param {string} key - Key of the message to be cleared.
   * @group Method
   */
  clear(key) {
    this.clearSource.next(key || null);
  }
};
__publicField(_MessageService, "ɵfac", function MessageService_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || _MessageService)();
});
__publicField(_MessageService, "ɵprov", ɵɵdefineInjectable({
  token: _MessageService,
  factory: _MessageService.ɵfac
}));
var MessageService = _MessageService;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(MessageService, [{
    type: Injectable
  }], null, null);
})();
var _OverlayService = class _OverlayService {
  clickSource = new Subject();
  clickObservable = this.clickSource.asObservable();
  add(event) {
    if (event) {
      this.clickSource.next(event);
    }
  }
};
__publicField(_OverlayService, "ɵfac", function OverlayService_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || _OverlayService)();
});
__publicField(_OverlayService, "ɵprov", ɵɵdefineInjectable({
  token: _OverlayService,
  factory: _OverlayService.ɵfac,
  providedIn: "root"
}));
var OverlayService = _OverlayService;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(OverlayService, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], null, null);
})();
var PrimeIcons = class {
};
__publicField(PrimeIcons, "ADDRESS_BOOK", "pi pi-address-book");
__publicField(PrimeIcons, "ALIGN_CENTER", "pi pi-align-center");
__publicField(PrimeIcons, "ALIGN_JUSTIFY", "pi pi-align-justify");
__publicField(PrimeIcons, "ALIGN_LEFT", "pi pi-align-left");
__publicField(PrimeIcons, "ALIGN_RIGHT", "pi pi-align-right");
__publicField(PrimeIcons, "AMAZON", "pi pi-amazon");
__publicField(PrimeIcons, "ANDROID", "pi pi-android");
__publicField(PrimeIcons, "ANGLE_DOUBLE_DOWN", "pi pi-angle-double-down");
__publicField(PrimeIcons, "ANGLE_DOUBLE_LEFT", "pi pi-angle-double-left");
__publicField(PrimeIcons, "ANGLE_DOUBLE_RIGHT", "pi pi-angle-double-right");
__publicField(PrimeIcons, "ANGLE_DOUBLE_UP", "pi pi-angle-double-up");
__publicField(PrimeIcons, "ANGLE_DOWN", "pi pi-angle-down");
__publicField(PrimeIcons, "ANGLE_LEFT", "pi pi-angle-left");
__publicField(PrimeIcons, "ANGLE_RIGHT", "pi pi-angle-right");
__publicField(PrimeIcons, "ANGLE_UP", "pi pi-angle-up");
__publicField(PrimeIcons, "APPLE", "pi pi-apple");
__publicField(PrimeIcons, "ARROWS_ALT", "pi pi-arrows-alt");
__publicField(PrimeIcons, "ARROW_CIRCLE_DOWN", "pi pi-arrow-circle-down");
__publicField(PrimeIcons, "ARROW_CIRCLE_LEFT", "pi pi-arrow-circle-left");
__publicField(PrimeIcons, "ARROW_CIRCLE_RIGHT", "pi pi-arrow-circle-right");
__publicField(PrimeIcons, "ARROW_CIRCLE_UP", "pi pi-arrow-circle-up");
__publicField(PrimeIcons, "ARROW_DOWN", "pi pi-arrow-down");
__publicField(PrimeIcons, "ARROW_DOWN_LEFT", "pi pi-arrow-down-left");
__publicField(PrimeIcons, "ARROW_DOWN_LEFT_AND_ARROW_UP_RIGHT_TO_CENTER", "pi pi-arrow-down-left-and-arrow-up-right-to-center");
__publicField(PrimeIcons, "ARROW_DOWN_RIGHT", "pi pi-arrow-down-right");
__publicField(PrimeIcons, "ARROW_LEFT", "pi pi-arrow-left");
__publicField(PrimeIcons, "ARROW_RIGHT_ARROW_LEFT", "pi pi-arrow-right-arrow-left");
__publicField(PrimeIcons, "ARROW_RIGHT", "pi pi-arrow-right");
__publicField(PrimeIcons, "ARROW_UP", "pi pi-arrow-up");
__publicField(PrimeIcons, "ARROW_UP_LEFT", "pi pi-arrow-up-left");
__publicField(PrimeIcons, "ARROW_UP_RIGHT", "pi pi-arrow-up-right");
__publicField(PrimeIcons, "ARROW_UP_RIGHT_AND_ARROW_DOWN_LEFT_FROM_CENTER", "pi pi-arrow-up-right-and-arrow-down-left-from-center");
__publicField(PrimeIcons, "ARROWS_H", "pi pi-arrows-h");
__publicField(PrimeIcons, "ARROWS_V", "pi pi-arrows-v");
__publicField(PrimeIcons, "ASTERISK", "pi pi-asterisk");
__publicField(PrimeIcons, "AT", "pi pi-at");
__publicField(PrimeIcons, "BACKWARD", "pi pi-backward");
__publicField(PrimeIcons, "BAN", "pi pi-ban");
__publicField(PrimeIcons, "BARCODE", "pi pi-barcode");
__publicField(PrimeIcons, "BARS", "pi pi-bars");
__publicField(PrimeIcons, "BELL", "pi pi-bell");
__publicField(PrimeIcons, "BELL_SLASH", "pi pi-bell-slash");
__publicField(PrimeIcons, "BITCOIN", "pi pi-bitcoin");
__publicField(PrimeIcons, "BOLT", "pi pi-bolt");
__publicField(PrimeIcons, "BOOK", "pi pi-book");
__publicField(PrimeIcons, "BOOKMARK", "pi pi-bookmark");
__publicField(PrimeIcons, "BOOKMARK_FILL", "pi pi-bookmark-fill");
__publicField(PrimeIcons, "BOX", "pi pi-box");
__publicField(PrimeIcons, "BRIEFCASE", "pi pi-briefcase");
__publicField(PrimeIcons, "BUILDING", "pi pi-building");
__publicField(PrimeIcons, "BUILDING_COLUMNS", "pi pi-building-columns");
__publicField(PrimeIcons, "BULLSEYE", "pi pi-bullseye");
__publicField(PrimeIcons, "CALCULATOR", "pi pi-calculator");
__publicField(PrimeIcons, "CALENDAR", "pi pi-calendar");
__publicField(PrimeIcons, "CALENDAR_CLOCK", "pi pi-calendar-clock");
__publicField(PrimeIcons, "CALENDAR_MINUS", "pi pi-calendar-minus");
__publicField(PrimeIcons, "CALENDAR_PLUS", "pi pi-calendar-plus");
__publicField(PrimeIcons, "CALENDAR_TIMES", "pi pi-calendar-times");
__publicField(PrimeIcons, "CAMERA", "pi pi-camera");
__publicField(PrimeIcons, "CAR", "pi pi-car");
__publicField(PrimeIcons, "CARET_DOWN", "pi pi-caret-down");
__publicField(PrimeIcons, "CARET_LEFT", "pi pi-caret-left");
__publicField(PrimeIcons, "CARET_RIGHT", "pi pi-caret-right");
__publicField(PrimeIcons, "CARET_UP", "pi pi-caret-up");
__publicField(PrimeIcons, "CART_ARROW_DOWN", "pi pi-cart-arrow-down");
__publicField(PrimeIcons, "CART_MINUS", "pi pi-cart-minus");
__publicField(PrimeIcons, "CART_PLUS", "pi pi-cart-plus");
__publicField(PrimeIcons, "CHART_BAR", "pi pi-chart-bar");
__publicField(PrimeIcons, "CHART_LINE", "pi pi-chart-line");
__publicField(PrimeIcons, "CHART_PIE", "pi pi-chart-pie");
__publicField(PrimeIcons, "CHART_SCATTER", "pi pi-chart-scatter");
__publicField(PrimeIcons, "CHECK", "pi pi-check");
__publicField(PrimeIcons, "CHECK_CIRCLE", "pi pi-check-circle");
__publicField(PrimeIcons, "CHECK_SQUARE", "pi pi-check-square");
__publicField(PrimeIcons, "CHEVRON_CIRCLE_DOWN", "pi pi-chevron-circle-down");
__publicField(PrimeIcons, "CHEVRON_CIRCLE_LEFT", "pi pi-chevron-circle-left");
__publicField(PrimeIcons, "CHEVRON_CIRCLE_RIGHT", "pi pi-chevron-circle-right");
__publicField(PrimeIcons, "CHEVRON_CIRCLE_UP", "pi pi-chevron-circle-up");
__publicField(PrimeIcons, "CHEVRON_DOWN", "pi pi-chevron-down");
__publicField(PrimeIcons, "CHEVRON_LEFT", "pi pi-chevron-left");
__publicField(PrimeIcons, "CHEVRON_RIGHT", "pi pi-chevron-right");
__publicField(PrimeIcons, "CHEVRON_UP", "pi pi-chevron-up");
__publicField(PrimeIcons, "CIRCLE", "pi pi-circle");
__publicField(PrimeIcons, "CIRCLE_FILL", "pi pi-circle-fill");
__publicField(PrimeIcons, "CLIPBOARD", "pi pi-clipboard");
__publicField(PrimeIcons, "CLOCK", "pi pi-clock");
__publicField(PrimeIcons, "CLONE", "pi pi-clone");
__publicField(PrimeIcons, "CLOUD", "pi pi-cloud");
__publicField(PrimeIcons, "CLOUD_DOWNLOAD", "pi pi-cloud-download");
__publicField(PrimeIcons, "CLOUD_UPLOAD", "pi pi-cloud-upload");
__publicField(PrimeIcons, "CODE", "pi pi-code");
__publicField(PrimeIcons, "COG", "pi pi-cog");
__publicField(PrimeIcons, "COMMENT", "pi pi-comment");
__publicField(PrimeIcons, "COMMENTS", "pi pi-comments");
__publicField(PrimeIcons, "COMPASS", "pi pi-compass");
__publicField(PrimeIcons, "COPY", "pi pi-copy");
__publicField(PrimeIcons, "CREDIT_CARD", "pi pi-credit-card");
__publicField(PrimeIcons, "CROWN", "pi pi-crown");
__publicField(PrimeIcons, "DATABASE", "pi pi-database");
__publicField(PrimeIcons, "DESKTOP", "pi pi-desktop");
__publicField(PrimeIcons, "DELETE_LEFT", "pi pi-delete-left");
__publicField(PrimeIcons, "DIRECTIONS", "pi pi-directions");
__publicField(PrimeIcons, "DIRECTIONS_ALT", "pi pi-directions-alt");
__publicField(PrimeIcons, "DISCORD", "pi pi-discord");
__publicField(PrimeIcons, "DOLLAR", "pi pi-dollar");
__publicField(PrimeIcons, "DOWNLOAD", "pi pi-download");
__publicField(PrimeIcons, "EJECT", "pi pi-eject");
__publicField(PrimeIcons, "ELLIPSIS_H", "pi pi-ellipsis-h");
__publicField(PrimeIcons, "ELLIPSIS_V", "pi pi-ellipsis-v");
__publicField(PrimeIcons, "ENVELOPE", "pi pi-envelope");
__publicField(PrimeIcons, "EQUALS", "pi pi-equals");
__publicField(PrimeIcons, "ERASER", "pi pi-eraser");
__publicField(PrimeIcons, "ETHEREUM", "pi pi-ethereum");
__publicField(PrimeIcons, "EURO", "pi pi-euro");
__publicField(PrimeIcons, "EXCLAMATION_CIRCLE", "pi pi-exclamation-circle");
__publicField(PrimeIcons, "EXCLAMATION_TRIANGLE", "pi pi-exclamation-triangle");
__publicField(PrimeIcons, "EXPAND", "pi pi-expand");
__publicField(PrimeIcons, "EXTERNAL_LINK", "pi pi-external-link");
__publicField(PrimeIcons, "EYE", "pi pi-eye");
__publicField(PrimeIcons, "EYE_SLASH", "pi pi-eye-slash");
__publicField(PrimeIcons, "FACE_SMILE", "pi pi-face-smile");
__publicField(PrimeIcons, "FACEBOOK", "pi pi-facebook");
__publicField(PrimeIcons, "FAST_BACKWARD", "pi pi-fast-backward");
__publicField(PrimeIcons, "FAST_FORWARD", "pi pi-fast-forward");
__publicField(PrimeIcons, "FILE", "pi pi-file");
__publicField(PrimeIcons, "FILE_ARROW_UP", "pi pi-file-arrow-up");
__publicField(PrimeIcons, "FILE_CHECK", "pi pi-file-check");
__publicField(PrimeIcons, "FILE_EDIT", "pi pi-file-edit");
__publicField(PrimeIcons, "FILE_IMPORT", "pi pi-file-import");
__publicField(PrimeIcons, "FILE_PDF", "pi pi-file-pdf");
__publicField(PrimeIcons, "FILE_PLUS", "pi pi-file-plus");
__publicField(PrimeIcons, "FILE_EXCEL", "pi pi-file-excel");
__publicField(PrimeIcons, "FILE_EXPORT", "pi pi-file-export");
__publicField(PrimeIcons, "FILE_WORD", "pi pi-file-word");
__publicField(PrimeIcons, "FILTER", "pi pi-filter");
__publicField(PrimeIcons, "FILTER_FILL", "pi pi-filter-fill");
__publicField(PrimeIcons, "FILTER_SLASH", "pi pi-filter-slash");
__publicField(PrimeIcons, "FLAG", "pi pi-flag");
__publicField(PrimeIcons, "FLAG_FILL", "pi pi-flag-fill");
__publicField(PrimeIcons, "FOLDER", "pi pi-folder");
__publicField(PrimeIcons, "FOLDER_OPEN", "pi pi-folder-open");
__publicField(PrimeIcons, "FOLDER_PLUS", "pi pi-folder-plus");
__publicField(PrimeIcons, "FORWARD", "pi pi-forward");
__publicField(PrimeIcons, "GAUGE", "pi pi-gauge");
__publicField(PrimeIcons, "GIFT", "pi pi-gift");
__publicField(PrimeIcons, "GITHUB", "pi pi-github");
__publicField(PrimeIcons, "GLOBE", "pi pi-globe");
__publicField(PrimeIcons, "GOOGLE", "pi pi-google");
__publicField(PrimeIcons, "GRADUATION_CAP", "pi pi-graduation-cap");
__publicField(PrimeIcons, "HAMMER", "pi pi-hammer");
__publicField(PrimeIcons, "HASHTAG", "pi pi-hashtag");
__publicField(PrimeIcons, "HEADPHONES", "pi pi-headphones");
__publicField(PrimeIcons, "HEART", "pi pi-heart");
__publicField(PrimeIcons, "HEART_FILL", "pi pi-heart-fill");
__publicField(PrimeIcons, "HISTORY", "pi pi-history");
__publicField(PrimeIcons, "HOME", "pi pi-home");
__publicField(PrimeIcons, "HOURGLASS", "pi pi-hourglass");
__publicField(PrimeIcons, "ID_CARD", "pi pi-id-card");
__publicField(PrimeIcons, "IMAGE", "pi pi-image");
__publicField(PrimeIcons, "IMAGES", "pi pi-images");
__publicField(PrimeIcons, "INBOX", "pi pi-inbox");
__publicField(PrimeIcons, "INDIAN_RUPEE", "pi pi-indian-rupee");
__publicField(PrimeIcons, "INFO", "pi pi-info");
__publicField(PrimeIcons, "INFO_CIRCLE", "pi pi-info-circle");
__publicField(PrimeIcons, "INSTAGRAM", "pi pi-instagram");
__publicField(PrimeIcons, "KEY", "pi pi-key");
__publicField(PrimeIcons, "LANGUAGE", "pi pi-language");
__publicField(PrimeIcons, "LIGHTBULB", "pi pi-lightbulb");
__publicField(PrimeIcons, "LINK", "pi pi-link");
__publicField(PrimeIcons, "LINKEDIN", "pi pi-linkedin");
__publicField(PrimeIcons, "LIST", "pi pi-list");
__publicField(PrimeIcons, "LIST_CHECK", "pi pi-list-check");
__publicField(PrimeIcons, "LOCK", "pi pi-lock");
__publicField(PrimeIcons, "LOCK_OPEN", "pi pi-lock-open");
__publicField(PrimeIcons, "MAP", "pi pi-map");
__publicField(PrimeIcons, "MAP_MARKER", "pi pi-map-marker");
__publicField(PrimeIcons, "MARS", "pi pi-mars");
__publicField(PrimeIcons, "MEGAPHONE", "pi pi-megaphone");
__publicField(PrimeIcons, "MICROCHIP", "pi pi-microchip");
__publicField(PrimeIcons, "MICROCHIP_AI", "pi pi-microchip-ai");
__publicField(PrimeIcons, "MICROPHONE", "pi pi-microphone");
__publicField(PrimeIcons, "MICROSOFT", "pi pi-microsoft");
__publicField(PrimeIcons, "MINUS", "pi pi-minus");
__publicField(PrimeIcons, "MINUS_CIRCLE", "pi pi-minus-circle");
__publicField(PrimeIcons, "MOBILE", "pi pi-mobile");
__publicField(PrimeIcons, "MONEY_BILL", "pi pi-money-bill");
__publicField(PrimeIcons, "MOON", "pi pi-moon");
__publicField(PrimeIcons, "OBJECTS_COLUMN", "pi pi-objects-column");
__publicField(PrimeIcons, "PALETTE", "pi pi-palette");
__publicField(PrimeIcons, "PAPERCLIP", "pi pi-paperclip");
__publicField(PrimeIcons, "PAUSE", "pi pi-pause");
__publicField(PrimeIcons, "PAUSE_CIRCLE", "pi pi-pause-circle");
__publicField(PrimeIcons, "PAYPAL", "pi pi-paypal");
__publicField(PrimeIcons, "PEN_TO_SQUARE", "pi pi-pen-to-square");
__publicField(PrimeIcons, "PENCIL", "pi pi-pencil");
__publicField(PrimeIcons, "PERCENTAGE", "pi pi-percentage");
__publicField(PrimeIcons, "PHONE", "pi pi-phone");
__publicField(PrimeIcons, "PINTEREST", "pi pi-pinterest");
__publicField(PrimeIcons, "PLAY", "pi pi-play");
__publicField(PrimeIcons, "PLAY_CIRCLE", "pi pi-play-circle");
__publicField(PrimeIcons, "PLUS", "pi pi-plus");
__publicField(PrimeIcons, "PLUS_CIRCLE", "pi pi-plus-circle");
__publicField(PrimeIcons, "POUND", "pi pi-pound");
__publicField(PrimeIcons, "POWER_OFF", "pi pi-power-off");
__publicField(PrimeIcons, "PRIME", "pi pi-prime");
__publicField(PrimeIcons, "PRINT", "pi pi-print");
__publicField(PrimeIcons, "QRCODE", "pi pi-qrcode");
__publicField(PrimeIcons, "QUESTION", "pi pi-question");
__publicField(PrimeIcons, "QUESTION_CIRCLE", "pi pi-question-circle");
__publicField(PrimeIcons, "RECEIPT", "pi pi-receipt");
__publicField(PrimeIcons, "REDDIT", "pi pi-reddit");
__publicField(PrimeIcons, "REFRESH", "pi pi-refresh");
__publicField(PrimeIcons, "REPLAY", "pi pi-replay");
__publicField(PrimeIcons, "REPLY", "pi pi-reply");
__publicField(PrimeIcons, "SAVE", "pi pi-save");
__publicField(PrimeIcons, "SEARCH", "pi pi-search");
__publicField(PrimeIcons, "SEARCH_MINUS", "pi pi-search-minus");
__publicField(PrimeIcons, "SEARCH_PLUS", "pi pi-search-plus");
__publicField(PrimeIcons, "SEND", "pi pi-send");
__publicField(PrimeIcons, "SERVER", "pi pi-server");
__publicField(PrimeIcons, "SHARE_ALT", "pi pi-share-alt");
__publicField(PrimeIcons, "SHIELD", "pi pi-shield");
__publicField(PrimeIcons, "SHOP", "pi pi-shop");
__publicField(PrimeIcons, "SHOPPING_BAG", "pi pi-shopping-bag");
__publicField(PrimeIcons, "SHOPPING_CART", "pi pi-shopping-cart");
__publicField(PrimeIcons, "SIGN_IN", "pi pi-sign-in");
__publicField(PrimeIcons, "SIGN_OUT", "pi pi-sign-out");
__publicField(PrimeIcons, "SITEMAP", "pi pi-sitemap");
__publicField(PrimeIcons, "SLACK", "pi pi-slack");
__publicField(PrimeIcons, "SLIDERS_H", "pi pi-sliders-h");
__publicField(PrimeIcons, "SLIDERS_V", "pi pi-sliders-v");
__publicField(PrimeIcons, "SORT", "pi pi-sort");
__publicField(PrimeIcons, "SORT_ALPHA_DOWN", "pi pi-sort-alpha-down");
__publicField(PrimeIcons, "SORT_ALPHA_DOWN_ALT", "pi pi-sort-alpha-down-alt");
__publicField(PrimeIcons, "SORT_ALPHA_UP", "pi pi-sort-alpha-up");
__publicField(PrimeIcons, "SORT_ALPHA_UP_ALT", "pi pi-sort-alpha-up-alt");
__publicField(PrimeIcons, "SORT_ALT", "pi pi-sort-alt");
__publicField(PrimeIcons, "SORT_ALT_SLASH", "pi pi-sort-alt-slash");
__publicField(PrimeIcons, "SORT_AMOUNT_DOWN", "pi pi-sort-amount-down");
__publicField(PrimeIcons, "SORT_AMOUNT_DOWN_ALT", "pi pi-sort-amount-down-alt");
__publicField(PrimeIcons, "SORT_AMOUNT_UP", "pi pi-sort-amount-up");
__publicField(PrimeIcons, "SORT_AMOUNT_UP_ALT", "pi pi-sort-amount-up-alt");
__publicField(PrimeIcons, "SORT_DOWN", "pi pi-sort-down");
__publicField(PrimeIcons, "SORT_DOWN_FILL", "pi pi-sort-down-fill");
__publicField(PrimeIcons, "SORT_NUMERIC_DOWN", "pi pi-sort-numeric-down");
__publicField(PrimeIcons, "SORT_NUMERIC_DOWN_ALT", "pi pi-sort-numeric-down-alt");
__publicField(PrimeIcons, "SORT_NUMERIC_UP", "pi pi-sort-numeric-up");
__publicField(PrimeIcons, "SORT_NUMERIC_UP_ALT", "pi pi-sort-numeric-up-alt");
__publicField(PrimeIcons, "SORT_UP", "pi pi-sort-up");
__publicField(PrimeIcons, "SORT_UP_FILL", "pi pi-sort-up-fill");
__publicField(PrimeIcons, "SPARKLES", "pi pi-sparkles");
__publicField(PrimeIcons, "SPINNER", "pi pi-spinner");
__publicField(PrimeIcons, "SPINNER_DOTTED", "pi pi-spinner-dotted");
__publicField(PrimeIcons, "STAR", "pi pi-star");
__publicField(PrimeIcons, "STAR_FILL", "pi pi-star-fill");
__publicField(PrimeIcons, "STAR_HALF", "pi pi-star-half");
__publicField(PrimeIcons, "STAR_HALF_FILL", "pi pi-star-half-fill");
__publicField(PrimeIcons, "STEP_BACKWARD", "pi pi-step-backward");
__publicField(PrimeIcons, "STEP_BACKWARD_ALT", "pi pi-step-backward-alt");
__publicField(PrimeIcons, "STEP_FORWARD", "pi pi-step-forward");
__publicField(PrimeIcons, "STEP_FORWARD_ALT", "pi pi-step-forward-alt");
__publicField(PrimeIcons, "STOP", "pi pi-stop");
__publicField(PrimeIcons, "STOP_CIRCLE", "pi pi-stop-circle");
__publicField(PrimeIcons, "STOPWATCH", "pi pi-stopwatch");
__publicField(PrimeIcons, "SUN", "pi pi-sun");
__publicField(PrimeIcons, "SYNC", "pi pi-sync");
__publicField(PrimeIcons, "TABLE", "pi pi-table");
__publicField(PrimeIcons, "TABLET", "pi pi-tablet");
__publicField(PrimeIcons, "TAG", "pi pi-tag");
__publicField(PrimeIcons, "TAGS", "pi pi-tags");
__publicField(PrimeIcons, "TELEGRAM", "pi pi-telegram");
__publicField(PrimeIcons, "TH_LARGE", "pi pi-th-large");
__publicField(PrimeIcons, "THUMBS_DOWN", "pi pi-thumbs-down");
__publicField(PrimeIcons, "THUMBS_DOWN_FILL", "pi pi-thumbs-down-fill");
__publicField(PrimeIcons, "THUMBS_UP", "pi pi-thumbs-up");
__publicField(PrimeIcons, "THUMBS_UP_FILL", "pi pi-thumbs-up-fill");
__publicField(PrimeIcons, "THUMBTACK", "pi pi-thumbtack");
__publicField(PrimeIcons, "TICKET", "pi pi-ticket");
__publicField(PrimeIcons, "TIKTOK", "pi pi-tiktok");
__publicField(PrimeIcons, "TIMES", "pi pi-times");
__publicField(PrimeIcons, "TIMES_CIRCLE", "pi pi-times-circle");
__publicField(PrimeIcons, "TRASH", "pi pi-trash");
__publicField(PrimeIcons, "TROPHY", "pi pi-trophy");
__publicField(PrimeIcons, "TRUCK", "pi pi-truck");
__publicField(PrimeIcons, "TURKISH_LIRA", "pi pi-turkish-lira");
__publicField(PrimeIcons, "TWITCH", "pi pi-twitch");
__publicField(PrimeIcons, "TWITTER", "pi pi-twitter");
__publicField(PrimeIcons, "UNDO", "pi pi-undo");
__publicField(PrimeIcons, "UNLOCK", "pi pi-unlock");
__publicField(PrimeIcons, "UPLOAD", "pi pi-upload");
__publicField(PrimeIcons, "USER", "pi pi-user");
__publicField(PrimeIcons, "USER_EDIT", "pi pi-user-edit");
__publicField(PrimeIcons, "USER_MINUS", "pi pi-user-minus");
__publicField(PrimeIcons, "USER_PLUS", "pi pi-user-plus");
__publicField(PrimeIcons, "USERS", "pi pi-users");
__publicField(PrimeIcons, "VENUS", "pi pi-venus");
__publicField(PrimeIcons, "VERIFIED", "pi pi-verified");
__publicField(PrimeIcons, "VIDEO", "pi pi-video");
__publicField(PrimeIcons, "VIMEO", "pi pi-vimeo");
__publicField(PrimeIcons, "VOLUME_DOWN", "pi pi-volume-down");
__publicField(PrimeIcons, "VOLUME_OFF", "pi pi-volume-off");
__publicField(PrimeIcons, "VOLUME_UP", "pi pi-volume-up");
__publicField(PrimeIcons, "WALLET", "pi pi-wallet");
__publicField(PrimeIcons, "WAREHOUSE", "pi pi-warehouse");
__publicField(PrimeIcons, "WAVE_PULSE", "pi pi-wave-pulse");
__publicField(PrimeIcons, "WHATSAPP", "pi pi-whatsapp");
__publicField(PrimeIcons, "WIFI", "pi pi-wifi");
__publicField(PrimeIcons, "WINDOW_MAXIMIZE", "pi pi-window-maximize");
__publicField(PrimeIcons, "WINDOW_MINIMIZE", "pi pi-window-minimize");
__publicField(PrimeIcons, "WRENCH", "pi pi-wrench");
__publicField(PrimeIcons, "YOUTUBE", "pi pi-youtube");
var _Header = class _Header {
};
__publicField(_Header, "ɵfac", function Header_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || _Header)();
});
__publicField(_Header, "ɵcmp", ɵɵdefineComponent({
  type: _Header,
  selectors: [["p-header"]],
  standalone: false,
  ngContentSelectors: _c0,
  decls: 1,
  vars: 0,
  template: function Header_Template(rf, ctx) {
    if (rf & 1) {
      ɵɵprojectionDef();
      ɵɵprojection(0);
    }
  },
  encapsulation: 2
}));
var Header = _Header;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(Header, [{
    type: Component,
    args: [{
      selector: "p-header",
      template: "<ng-content></ng-content>",
      standalone: false
    }]
  }], null, null);
})();
var _Footer = class _Footer {
};
__publicField(_Footer, "ɵfac", function Footer_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || _Footer)();
});
__publicField(_Footer, "ɵcmp", ɵɵdefineComponent({
  type: _Footer,
  selectors: [["p-footer"]],
  standalone: false,
  ngContentSelectors: _c0,
  decls: 1,
  vars: 0,
  template: function Footer_Template(rf, ctx) {
    if (rf & 1) {
      ɵɵprojectionDef();
      ɵɵprojection(0);
    }
  },
  encapsulation: 2
}));
var Footer = _Footer;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(Footer, [{
    type: Component,
    args: [{
      selector: "p-footer",
      template: "<ng-content></ng-content>",
      standalone: false
    }]
  }], null, null);
})();
var _PrimeTemplate = class _PrimeTemplate {
  template;
  type;
  name;
  constructor(template) {
    this.template = template;
  }
  getType() {
    return this.name;
  }
};
__publicField(_PrimeTemplate, "ɵfac", function PrimeTemplate_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || _PrimeTemplate)(ɵɵdirectiveInject(TemplateRef));
});
__publicField(_PrimeTemplate, "ɵdir", ɵɵdefineDirective({
  type: _PrimeTemplate,
  selectors: [["", "pTemplate", ""]],
  inputs: {
    type: "type",
    name: [0, "pTemplate", "name"]
  }
}));
var PrimeTemplate = _PrimeTemplate;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(PrimeTemplate, [{
    type: Directive,
    args: [{
      selector: "[pTemplate]",
      standalone: true
    }]
  }], () => [{
    type: TemplateRef
  }], {
    type: [{
      type: Input
    }],
    name: [{
      type: Input,
      args: ["pTemplate"]
    }]
  });
})();
var _SharedModule = class _SharedModule {
};
__publicField(_SharedModule, "ɵfac", function SharedModule_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || _SharedModule)();
});
__publicField(_SharedModule, "ɵmod", ɵɵdefineNgModule({
  type: _SharedModule,
  declarations: [Header, Footer],
  imports: [CommonModule, PrimeTemplate],
  exports: [Header, Footer, PrimeTemplate]
}));
__publicField(_SharedModule, "ɵinj", ɵɵdefineInjector({
  imports: [CommonModule]
}));
var SharedModule = _SharedModule;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(SharedModule, [{
    type: NgModule,
    args: [{
      imports: [CommonModule, PrimeTemplate],
      exports: [Header, Footer, PrimeTemplate],
      declarations: [Header, Footer]
    }]
  }], null, null);
})();
var TranslationKeys = class {
};
__publicField(TranslationKeys, "STARTS_WITH", "startsWith");
__publicField(TranslationKeys, "CONTAINS", "contains");
__publicField(TranslationKeys, "NOT_CONTAINS", "notContains");
__publicField(TranslationKeys, "ENDS_WITH", "endsWith");
__publicField(TranslationKeys, "EQUALS", "equals");
__publicField(TranslationKeys, "NOT_EQUALS", "notEquals");
__publicField(TranslationKeys, "NO_FILTER", "noFilter");
__publicField(TranslationKeys, "LT", "lt");
__publicField(TranslationKeys, "LTE", "lte");
__publicField(TranslationKeys, "GT", "gt");
__publicField(TranslationKeys, "GTE", "gte");
__publicField(TranslationKeys, "IS", "is");
__publicField(TranslationKeys, "IS_NOT", "isNot");
__publicField(TranslationKeys, "BEFORE", "before");
__publicField(TranslationKeys, "AFTER", "after");
__publicField(TranslationKeys, "CLEAR", "clear");
__publicField(TranslationKeys, "APPLY", "apply");
__publicField(TranslationKeys, "MATCH_ALL", "matchAll");
__publicField(TranslationKeys, "MATCH_ANY", "matchAny");
__publicField(TranslationKeys, "ADD_RULE", "addRule");
__publicField(TranslationKeys, "REMOVE_RULE", "removeRule");
__publicField(TranslationKeys, "ACCEPT", "accept");
__publicField(TranslationKeys, "REJECT", "reject");
__publicField(TranslationKeys, "CHOOSE", "choose");
__publicField(TranslationKeys, "UPLOAD", "upload");
__publicField(TranslationKeys, "CANCEL", "cancel");
__publicField(TranslationKeys, "PENDING", "pending");
__publicField(TranslationKeys, "FILE_SIZE_TYPES", "fileSizeTypes");
__publicField(TranslationKeys, "DAY_NAMES", "dayNames");
__publicField(TranslationKeys, "DAY_NAMES_SHORT", "dayNamesShort");
__publicField(TranslationKeys, "DAY_NAMES_MIN", "dayNamesMin");
__publicField(TranslationKeys, "MONTH_NAMES", "monthNames");
__publicField(TranslationKeys, "MONTH_NAMES_SHORT", "monthNamesShort");
__publicField(TranslationKeys, "FIRST_DAY_OF_WEEK", "firstDayOfWeek");
__publicField(TranslationKeys, "TODAY", "today");
__publicField(TranslationKeys, "WEEK_HEADER", "weekHeader");
__publicField(TranslationKeys, "WEAK", "weak");
__publicField(TranslationKeys, "MEDIUM", "medium");
__publicField(TranslationKeys, "STRONG", "strong");
__publicField(TranslationKeys, "PASSWORD_PROMPT", "passwordPrompt");
__publicField(TranslationKeys, "EMPTY_MESSAGE", "emptyMessage");
__publicField(TranslationKeys, "EMPTY_FILTER_MESSAGE", "emptyFilterMessage");
__publicField(TranslationKeys, "SHOW_FILTER_MENU", "showFilterMenu");
__publicField(TranslationKeys, "HIDE_FILTER_MENU", "hideFilterMenu");
__publicField(TranslationKeys, "SELECTION_MESSAGE", "selectionMessage");
__publicField(TranslationKeys, "ARIA", "aria");
__publicField(TranslationKeys, "SELECT_COLOR", "selectColor");
__publicField(TranslationKeys, "BROWSE_FILES", "browseFiles");
var _TreeDragDropService = class _TreeDragDropService {
  dragStartSource = new Subject();
  dragStopSource = new Subject();
  dragStart$ = this.dragStartSource.asObservable();
  dragStop$ = this.dragStopSource.asObservable();
  startDrag(event) {
    this.dragStartSource.next(event);
  }
  stopDrag(event) {
    this.dragStopSource.next(event);
  }
};
__publicField(_TreeDragDropService, "ɵfac", function TreeDragDropService_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || _TreeDragDropService)();
});
__publicField(_TreeDragDropService, "ɵprov", ɵɵdefineInjectable({
  token: _TreeDragDropService,
  factory: _TreeDragDropService.ɵfac
}));
var TreeDragDropService = _TreeDragDropService;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(TreeDragDropService, [{
    type: Injectable
  }], null, null);
})();

export {
  hasClass,
  addClass,
  blockBodyScroll,
  removeClass,
  unblockBodyScroll,
  getViewport,
  getWindowScrollLeft,
  getWindowScrollTop,
  absolutePosition,
  addStyle,
  getOuterWidth,
  relativePosition,
  appendChild,
  setAttributes,
  fadeIn,
  find,
  findSingle,
  focus,
  getFocusableElements,
  getFirstFocusableElement,
  getHeight,
  getIndex,
  getLastFocusableElement,
  getOffset,
  getOuterHeight,
  getSelection,
  getTargetElement,
  getWidth,
  isVisible,
  isTouchDevice,
  remove,
  removeChild,
  scrollInView,
  setAttribute,
  EventBus,
  isEmpty,
  deepEquals,
  isNotEmpty,
  resolveFieldData,
  equals,
  contains,
  findLastIndex,
  isObject,
  resolve,
  isString,
  getKeyValue,
  isArray,
  isDate,
  isNumber,
  isPrintableCharacter,
  matchRegex,
  minifyCSS,
  toKebabCase,
  toTokenKey,
  uuid,
  ConfirmEventType,
  ConfirmationService,
  ContextMenuService,
  FilterMatchMode,
  FilterOperator,
  FilterService,
  MessageService,
  OverlayService,
  PrimeIcons,
  Header,
  Footer,
  PrimeTemplate,
  SharedModule,
  TranslationKeys,
  TreeDragDropService
};
//# sourceMappingURL=chunk-2IOQD7UG.js.map

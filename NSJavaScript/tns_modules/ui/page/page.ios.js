var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var pageCommon = require("ui/page/page-common");
var trace = require("trace");
module.exports.knownEvents = pageCommon.knownEvents;
var body = {
    get owner() {
        return this._owner;
    },
    viewWillAppear: function (animated) {
        this.super.viewWillAppear(animated);
        trace.write(this.owner + " viewWillAppear", trace.categories.ViewHierarchy);
    },
    viewWillDisappear: function (animated) {
        this.super.viewWillDisappear(animated);
    },
    viewDidAppear: function (animated) {
        this.super.viewDidAppear(animated);
        trace.write(this.owner + " viewDidAppear", trace.categories.ViewHierarchy);
        this.owner.onLoaded();
    },
    viewDidDisappear: function (animated) {
        this.super.viewDidDisappear(animated);
        this.owner.onUnloaded();
    },
    viewDidLoad: function () {
        this.view.autoresizesSubviews = false;
        this.view.autoresizingMask = UIViewAutoresizing.UIViewAutoresizingNone;
    },
    viewDidLayoutSubviews: function () {
        trace.write(this.owner + " viewDidLayoutSubviews, isLoaded = " + this.owner.isLoaded, trace.categories.ViewHierarchy);
        this.owner.arrangeView();
    }
};
var viewControllerExtended = UIViewController.extend(body);
var Page = (function (_super) {
    __extends(Page, _super);
    function Page(options) {
        _super.call(this, options);
        this._ios = viewControllerExtended.new();
        this._ios.automaticallyAdjustsScrollViewInsets = false;
        this._ios["_owner"] = this;
        (this._layoutInfo).isLayoutSuspended = false;
    }
    Page.prototype._onContentChanged = function (oldView, newView) {
        _super.prototype._onContentChanged.call(this, oldView, newView);
        this._removeNativeView(oldView);
        this._addNativeView(newView);
    };
    Page.prototype._addNativeView = function (view) {
        if (view) {
            trace.write("Native: Adding " + view + " to " + this, trace.categories.ViewHierarchy);
            if (view.ios instanceof UIView) {
                this._ios.view.addSubview(view.ios);
            }
            else if (view.ios instanceof UIViewController) {
                this._ios.addChildViewController(view.ios);
                this._ios.view.addSubview(view.ios.view);
            }
        }
    };
    Page.prototype._removeNativeView = function (view) {
        if (view) {
            trace.write("Native: Removing " + view + " from " + this, trace.categories.ViewHierarchy);
            if (view.ios instanceof UIView) {
                view.ios.removeFromSuperview();
            }
            else if (view.ios instanceof UIViewController) {
                view.ios.removeFromParentViewController();
                view.ios.view.removeFromSuperview();
            }
        }
    };
    Page.prototype.arrangeView = function () {
        if (this.isLoaded) {
            this._updateLayout();
        }
    };
    Object.defineProperty(Page.prototype, "ios", {
        get: function () {
            return this._ios;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Page.prototype, "_nativeView", {
        get: function () {
            return this.ios.view;
        },
        enumerable: true,
        configurable: true
    });
    return Page;
})(pageCommon.Page);
exports.Page = Page;

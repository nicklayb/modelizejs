'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var axios = require('axios');

function capitalizeFirstLetter(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
}

var Model = function () {
    function Model() {
        var attributes = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        var withSetters = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

        _classCallCheck(this, Model);

        this.attributes = {};
        this.url = '';
        this.primaryKey = this.constructor.primaryKey;
        this.dates = [];
        this.casts = {};
        this.DateConstructor = Date;
        this.store = false;
        this.setAttributes(attributes, withSetters);
    }

    _createClass(Model, [{
        key: 'setAttributes',
        value: function setAttributes(attributes) {
            var withSetters = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

            attributes = this.bindCastables(attributes);
            if (withSetters) {
                return this.setAttributesWithSetters(attributes);
            } else {
                return this.setAttributesWithoutSetters(attributes);
            }
        }
    }, {
        key: 'setAttributesWithSetters',
        value: function setAttributesWithSetters(attributes) {
            for (var key in attributes) {
                this.set(key, attributes[key]);
            }
            return this;
        }
    }, {
        key: 'setStored',
        value: function setStored() {
            var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

            this.stored = value;
            return this;
        }
    }, {
        key: 'setAttributesWithoutSetters',
        value: function setAttributesWithoutSetters(attributes) {
            this.attributes = attributes;
            return this;
        }
    }, {
        key: 'bindCastables',
        value: function bindCastables(attributes) {
            var castables = this.constructor.castables();
            var casted = {};
            for (var key in attributes) {
                var castable = castables[key];
                var attribute = attributes[key];
                casted[key] = attribute;
                if (castable && attribute) {
                    if (attribute.constructor === Array) {
                        casted[key] = this.castArray(attribute, castable);
                    } else {
                        casted[key] = this.castItem(attribute, castable);
                    }
                }
            }
            return casted;
        }
    }, {
        key: 'castArray',
        value: function castArray(items, Cast) {
            var _this = this;

            return items.map(function (item) {
                return _this.castItem(item, Cast);
            });
        }
    }, {
        key: 'castItem',
        value: function castItem(item, Cast) {
            return Cast.create(item);
        }
    }, {
        key: 'hasGetter',
        value: function hasGetter(key) {
            return this.hasMethod(this.getQualifiedGetter(key));
        }
    }, {
        key: 'hasCasts',
        value: function hasCasts(key) {
            return !!this.casts[key];
        }
    }, {
        key: 'hasRelation',
        value: function hasRelation(key) {
            return this.hasMethod(this.getQualifiedRelation(key));
        }
    }, {
        key: 'hasSetter',
        value: function hasSetter(key) {
            return this.hasMethod(this.getQualifiedSetter(key));
        }
    }, {
        key: 'isDate',
        value: function isDate(key) {
            return this.dates.includes(key);
        }
    }, {
        key: 'hasMethod',
        value: function hasMethod(method) {
            return !!this[method];
        }
    }, {
        key: 'getQualifiedRelation',
        value: function getQualifiedRelation(key) {
            return key + 'Related';
        }
    }, {
        key: 'getQualifiedGetter',
        value: function getQualifiedGetter(key) {
            return 'get' + capitalizeFirstLetter(key) + 'Attribute';
        }
    }, {
        key: 'getQualifiedSetter',
        value: function getQualifiedSetter(key) {
            return 'set' + capitalizeFirstLetter(key) + 'Attribute';
        }
    }, {
        key: 'hasAttribute',
        value: function hasAttribute(key) {
            return this.attributes[key] !== undefined;
        }
    }, {
        key: 'getAttribute',
        value: function getAttribute(key) {
            return this.hasAttribute(key) ? this.attributes[key] : null;
        }
    }, {
        key: 'getAttributes',
        value: function getAttributes() {
            return this.attributes;
        }
    }, {
        key: 'setAttribute',
        value: function setAttribute(key, value) {
            this.attributes[key] = value;
            return this;
        }
    }, {
        key: 'fromGetter',
        value: function fromGetter(key) {
            return this[this.getQualifiedGetter(key)](this.getAttribute(key));
        }
    }, {
        key: 'fromSetter',
        value: function fromSetter(key, value) {
            return this[this.getQualifiedSetter(key)](value);
        }
    }, {
        key: 'fromRelation',
        value: function fromRelation(key, options) {
            return this[this.getQualifiedRelation(key)](this.constructor.extractOptions(options));
        }
    }, {
        key: 'fromCast',
        value: function fromCast(key) {
            var Cast = this.casts[key];
            return new Cast(this.getAttribute(key));
        }
    }, {
        key: 'fromDate',
        value: function fromDate(key) {
            return new this.DateConstructor(this.getAttribute[key]);
        }
    }, {
        key: 'setUrl',
        value: function setUrl(url) {
            this.url = url;
            return this;
        }
    }, {
        key: 'getUrl',
        value: function getUrl() {
            return this.url;
        }
    }, {
        key: 'getPrimaryKey',
        value: function getPrimaryKey() {
            return this.get(this.primaryKey);
        }
    }, {
        key: 'related',
        value: function related(key, options) {
            if (this.hasRelation(key)) {
                return this.fromRelation(key, options);
            }

            return this.get(key);
        }
    }, {
        key: 'has',
        value: function has(key) {
            return !!this.get(key);
        }
    }, {
        key: 'get',
        value: function get(key, options) {
            if (this.hasRelation(key)) {
                return this.fromRelation(key, options);
            }
            if (this.hasCasts(key)) {
                return this.fromCast(key);
            }
            if (this.hasGetter(key)) {
                return this.fromGetter(key);
            }
            if (this.isDate(key)) {
                return this.fromDate(key);
            }
            return this.getAttribute(key);
        }
    }, {
        key: 'set',
        value: function set(key, value) {
            value = this.hasSetter(key) ? this.fromSetter(key, value) : value;
            return this.setAttribute(key, value);
        }
    }, {
        key: 'getSaveMethod',
        value: function getSaveMethod() {
            return this.isStored ? 'PUT' : 'POST';
        }
    }, {
        key: 'getSaveArguments',
        value: function getSaveArguments() {
            return this.isStored ? [this.get(this.primaryKey)] : [];
        }
    }, {
        key: 'save',
        value: function save() {
            var _this2 = this;

            var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            options.datas = this.getAttributes();
            var url = this.constructor.getFullUrl(this.getSaveArguments());
            return new Promise(function (resolve, reject) {
                _this2.constructor.fetch(url, _this2.getSaveMethod(), _this2.constructor.extractOptions(options)).then(function (object) {
                    _this2.setAttributes(object.getAttributes());
                    _this2.setStored();
                    resolve(_this2);
                }).catch(function (err) {
                    return reject(err);
                });
            });
        }
    }, {
        key: 'delete',
        value: function _delete(options) {
            return this.constructor.destroy(this.getPrimaryKey(), options);
        }
    }, {
        key: 'hasMany',
        value: function hasMany(RelatedClass, options) {
            var url = new RelatedClass().getUrl();
            var id = options.id || -1;
            options.className = RelatedClass;
            if (id > -1) {
                return RelatedClass.find(id, options);
            }
            return this.constructor.fetch(this.constructor.getFullUrl([this.getPrimaryKey(), url]), 'GET', options);
        }
    }, {
        key: 'hasOne',
        value: function hasOne(RelatedClass, foreignKey, options) {
            var relatedInstance = new RelatedClass();
            var id = this.get(foreignKey);
            options.className = RelatedClass;
            return relatedInstance.constructor.fetch(relatedInstance.constructor.getFullUrl(id), 'GET', options);
        }
    }, {
        key: 'isStored',
        get: function get() {
            return !!this.stored;
        }
    }], [{
        key: 'castables',
        value: function castables() {
            return {};
        }
    }, {
        key: 'getFullUrlBase',
        value: function getFullUrlBase() {
            return [this.getBaseUrl(), this.create().getUrl()].filter(function (part) {
                return !!part;
            });
        }
    }, {
        key: 'getFullUrl',
        value: function getFullUrl(options) {
            var url = this.getFullUrlBase();
            if (options) {
                switch (options.constructor) {
                    case Array:
                        url.push.apply(url, _toConsumableArray(options));
                        break;
                    case String:
                    case Number:
                        url.push(options);
                        break;
                    default:
                        break;
                }
            }
            return url.join('/');
        }
    }, {
        key: 'cast',
        value: function cast(attributes) {
            if (attributes.constructor === Array) {
                return attributes.map(this.cast.bind(this));
            }
            return this.create(attributes).setStored();
        }
    }, {
        key: 'getBaseUrl',
        value: function getBaseUrl() {
            return '';
        }
    }, {
        key: 'destroy',
        value: function destroy(id, options) {
            return this.fetch(this.getFullUrl(id), 'DELETE', this.extractOptions(options));
        }
    }, {
        key: 'get',
        value: function get(id, options) {
            return this.fetch(this.getFullUrl(id), 'GET', this.extractOptions(options));
        }
    }, {
        key: 'find',
        value: function find(id, options) {
            return this.get(id, options);
        }
    }, {
        key: 'all',
        value: function all(options) {
            return this.fetch(this.getFullUrl(), 'GET', this.extractOptions(options));
        }
    }, {
        key: 'extractOptions',
        value: function extractOptions() {
            var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            return Object.assign(this.options, options);
        }
    }, {
        key: 'fetch',
        value: function fetch(url, type, options) {
            var _this3 = this;

            return new Promise(function (resolve, reject) {
                axios.request({
                    url: url,
                    params: options.datas,
                    method: type,
                    headers: options.headers,
                    baseURL: _this3.getBaseUrl()
                }).then(function (response) {
                    return resolve(options.className.cast(_this3.getDataFromResponse(response)));
                }).catch(function (err) {
                    return reject(err);
                });
            });
        }
    }, {
        key: 'getDataFromResponse',
        value: function getDataFromResponse(response) {
            return response.data;
        }
    }, {
        key: 'create',
        value: function create() {
            var attributes = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            return new this(attributes);
        }
    }, {
        key: 'options',
        get: function get() {
            return {
                className: this,
                datas: {},
                headers: {}
            };
        }
    }, {
        key: 'primaryKey',
        get: function get() {
            return 'id';
        }
    }]);

    return Model;
}();

module.exports = Model;
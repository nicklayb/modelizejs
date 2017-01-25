'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var axios = require('axios');
/*global module*/
function capitalizeFirstLetter(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
}

var Model = exports.Model = function () {
    function Model(attributes, withSetters) {
        _classCallCheck(this, Model);

        this.attributes = {};
        this.url = '';
        this.primaryKey = this.constructor.primaryKey;
        this.dates = [];
        this.DateConstructor = Date;
        withSetters = withSetters !== undefined ? withSetters : true;
        attributes = attributes || {};
        this.setAttributes(attributes, withSetters);
    }

    _createClass(Model, [{
        key: 'setAttributes',
        value: function setAttributes(attributes, withSetters) {
            withSetters = withSetters || false;
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
        key: 'setAttributesWithoutSetters',
        value: function setAttributesWithoutSetters(attributes) {
            this.attributes = attributes;
            return this;
        }
    }, {
        key: 'hasGetter',
        value: function hasGetter(key) {
            return this.has(this.getQualifiedGetter(key));
        }
    }, {
        key: 'hasRelation',
        value: function hasRelation(key) {
            return this.has(this.getQualifiedRelation(key));
        }
    }, {
        key: 'hasSetter',
        value: function hasSetter(key) {
            return this.has(this.getQualifiedSetter(key));
        }
    }, {
        key: 'isDate',
        value: function isDate(key) {
            return this.dates.includes(key);
        }
    }, {
        key: 'has',
        value: function has(method) {
            return this[method] !== undefined;
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
            return this[this.getQualifiedRelation(key)](this.constructor._extractOptions(options));
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
        key: 'get',
        value: function get(key, options) {
            if (this.hasRelation(key)) {
                return this.fromRelation(key, options);
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
            if (this.hasSetter(key)) {
                this.setAttribute(key, this.fromSetter(key, value));
            } else {
                this.setAttribute(key, value);
            }
            return this;
        }
    }, {
        key: '_getIndexedUrl',
        value: function _getIndexedUrl(id) {
            id = id || this.get(this.primaryKey);
            return this._getUnindexedUrl() + '/' + id;
        }
    }, {
        key: 'update',
        value: function update(options) {
            this._fetch(this._getUnindexedUrl(), 'PUT', this._extractOptions(options));
        }
    }, {
        key: 'store',
        value: function store(options) {
            this._fetch(this._getIndexedUrl(), 'POST', this._extractOptions(options));
        }
    }, {
        key: 'delete',
        value: function _delete(options) {
            this.destroy(this.getPrimaryKey(), options);
        }
    }, {
        key: 'hasMany',
        value: function hasMany(RelatedClass, options) {
            var url = new RelatedClass().getUrl();
            var id = options.id || -1;
            options.className = RelatedClass;
            if (id > -1) {
                RelatedClass.find(id, options);
            } else {
                this.constructor._fetch(this.constructor._getUnindexedUrl([this.getPrimaryKey(), url]), 'GET', options);
            }
        }
    }, {
        key: 'hasOne',
        value: function hasOne(RelatedClass, foreignKey, options) {
            var relatedInstance = new RelatedClass();
            var id = this.get(foreignKey);
            options.className = RelatedClass;
            relatedInstance.constructor._fetch(relatedInstance.constructor._getUnindexedUrl(id), 'GET', options);
        }
    }], [{
        key: '_getUnindexedUrl',
        value: function _getUnindexedUrl(options) {
            options = options || '';
            if (options.constructor === Array) {
                options = options.join('/');
            }
            return this.getBaseUrl() + '/' + new this().getUrl() + '/' + options;
        }
    }, {
        key: 'castFromArray',
        value: function castFromArray(attributes) {
            var results = [];
            for (var index in attributes) {
                results.push(this.cast(attributes[index]));
            }
            return results;
        }
    }, {
        key: 'cast',
        value: function cast(attributes) {
            if (attributes.constructor === Array) {
                return this.castFromArray(attributes);
            }
            return new this(attributes);
        }
    }, {
        key: 'getBaseUrl',
        value: function getBaseUrl() {
            return '';
        }
    }, {
        key: 'destroy',
        value: function destroy(id, options) {
            this._fetch(this._getUnindexedUrl(id), 'DELETE', this._extractOptions(options));
        }
    }, {
        key: 'get',
        value: function get(id, options) {
            this._fetch(this._getUnindexedUrl(id), 'GET', this._extractOptions(options));
        }
    }, {
        key: 'find',
        value: function find(id, options) {
            return this.get(id, options);
        }
    }, {
        key: 'all',
        value: function all(options) {
            this._fetch(this.getUnindexedUrl(), 'GET', this._extractOptions(options));
        }
    }, {
        key: '_extractOptions',
        value: function _extractOptions(options) {
            var callbacks = options || {};
            for (var option in this.options) {
                callbacks[option] = options[option] || this.options[option];
            }
            return callbacks;
        }
    }, {
        key: '_fetch',
        value: function _fetch(url, type, options) {
            var className = options.className;
            axios.request({
                url: url,
                data: options.data,
                method: type,
                baseURL: this.getBaseUrl()
            }).then(function (response) {
                options.success(className.cast(response.data));
            }).catch(options.error);
        }
    }, {
        key: 'options',
        get: function get() {
            return {
                success: function success() {},
                error: function error() {},
                beforeSend: function beforeSend() {},
                className: this,
                datas: {}
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
'use strict';
const axios = require('axios');
/*global module*/
function capitalizeFirstLetter(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
}

export class Model {
    constructor(attributes, withSetters) {
        this.attributes = {};
        this.url = '';
        this.primaryKey = this.constructor.primaryKey;
        withSetters = (withSetters !== undefined) ? withSetters : true;
        attributes = attributes || {};
        this.setAttributes(attributes, withSetters);
    }

    setAttributes(attributes, withSetters) {
        withSetters = withSetters || false;
        if (withSetters) {
            return this.setAttributesWithSetters(attributes);
        } else {
            return this.setAttributesWithoutSetters(attributes);
        }
    }

    setAttributesWithSetters(attributes) {
        for (let key in attributes) {
            this.set(key, attributes[key]);
        }
        return this;
    }

    setAttributesWithoutSetters(attributes) {
        this.attributes = attributes;
        return this;
    }

    hasGetter(key) {
        return this.has(this.getQualifiedGetter(key));
    }

    hasRelation(key) {
        return this.has(this.getQualifiedRelation(key));
    }

    hasSetter(key) {
        return this.has(this.getQualifiedSetter(key));
    }

    has(method) {
        return this[method] !== undefined;
    }

    getQualifiedRelation(key) {
        return key + 'Related';
    }

    getQualifiedGetter(key) {
        return 'get' + capitalizeFirstLetter(key) + 'Attribute';
    }

    getQualifiedSetter(key) {
        return 'set' + capitalizeFirstLetter(key) + 'Attribute';
    }

    hasAttribute(key) {
        return this.attributes[key] !== undefined;
    }

    getAttribute(key) {
        return (this.hasAttribute(key)) ? this.attributes[key] : null;
    }

    getAttributes() {
        return this.attributes;
    }

    setAttribute(key, value) {
        this.attributes[key] = value;
        return this;
    }

    fromGetter(key) {
        return this[this.getQualifiedGetter(key)](this.getAttribute(key));
    }

    fromSetter(key, value) {
        return this[this.getQualifiedSetter(key)](value);
    }

    fromRelation(key, options) {
        return this[this.getQualifiedRelation(key)](this.constructor._extractOptions(options));
    }

    setUrl(url) {
        this.url = url;
    }

    getUrl() {
        return this.url;
    }

    getPrimaryKey() {
        return this.get(this.primaryKey);
    }

    related(key, options) {
        if (this.hasRelation(key)) {
            return this.fromRelation(key, options);
        }

        return this.get(key);
    }

    get(key, options) {
        if (this.hasRelation(key)) {
            return this.fromRelation(key, options);
        }
        if (this.hasGetter(key)) {
            return this.fromGetter(key);
        }
        return this.getAttribute(key);
    }

    set(key, value) {
        if (this.hasSetter(key)) {
            this.setAttribute(key, this.fromSetter(key, value));
        } else {
            this.setAttribute(key, value);
        }
        return this;
    }

    _getIndexedUrl(id) {
        id = id || this.get(this.primaryKey);
        return this._getUnindexedUrl() + '/' + id;
    }

    update(options) {
        this._fetch(this._getUnindexedUrl(), 'PUT', this._extractOptions(options));
    }

    store(options) {
        this._fetch(this._getIndexedUrl(), 'POST', this._extractOptions(options));
    }

    delete(options) {
        this.destroy(this.getPrimaryKey(), options);
    }

    hasMany(RelatedClass, options) {
        const url = (new RelatedClass()).getUrl();
        const id = options.id || -1;
        options.className = RelatedClass;
        if (id > -1) {
            RelatedClass.find(id, options);
        } else {
            this.constructor._fetch(this.constructor._getUnindexedUrl([this.getPrimaryKey(), url]), 'GET', options);
        }
    }

    hasOne(RelatedClass, foreignKey, options) {
        const relatedInstance = (new RelatedClass());
        const id = this.get(foreignKey);
        options.className = RelatedClass;
        relatedInstance.constructor._fetch(relatedInstance.constructor._getUnindexedUrl(id), 'GET', options);
    }

    static _getUnindexedUrl(options) {
        options = options || '';
        if (options.constructor === Array) {
            options = options.join('/');
        }
        return this.getBaseUrl() + '/' + (new this()).getUrl() + '/' + options;
    }

    static castFromArray(attributes) {
        const results = [];
        for (let index in attributes) {
            results.push(this.cast(attributes[index]));
        }
        return results;
    }

    static cast(attributes) {
        if (attributes.constructor === Array) {
            return this.castFromArray(attributes);
        }
        return new this(attributes);
    }

    static getBaseUrl() {
        return '';
    }

    static destroy(id, options) {
        this._fetch(this._getUnindexedUrl(id), 'DELETE', this._extractOptions(options));
    }

    static get(id, options) {
        this._fetch(this._getUnindexedUrl(id), 'GET', this._extractOptions(options));
    }

    static find(id, options) {
        return this.get(id, options);
    }

    static _extractOptions(options) {
        const callbacks = options || {};
        for (let option in this.options) {
            callbacks[option] = options[option] || this.options[option];
        }
        return callbacks;
    }

    static _fetch(url, type, options) {
        const className = options.className;
        axios.request({
            url: url,
            data: options.data,
            method: type,
            baseURL: this.getBaseUrl()
        }).then(function(response) {
            options.success(className.cast(response.data));
        })
        .catch(options.error);
    }

    static get options() {
        return {
            success: () => {},
            error: () => {},
            beforeSend: () => {},
            className: this,
            datas: {},
        };
    }

    static get primaryKey() {
        return 'id';
    }
}
module.exports = Model;

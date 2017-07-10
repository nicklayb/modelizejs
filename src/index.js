'use strict';
const axios = require('axios');

function capitalizeFirstLetter(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
}

class Model {
    constructor(attributes = {}, withSetters = true) {
        this.attributes = {};
        this.url = '';
        this.primaryKey = this.constructor.primaryKey;
        this.dates = [];
        this.casts = {};
        this.DateConstructor = Date;
        this.store = false;
        this.setAttributes(attributes, withSetters);
    }

    setAttributes(attributes, withSetters = false) {
        attributes = this.bindCastables(attributes);
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

    setStored(value = true) {
        this.stored = value;
        return this;
    }

    setAttributesWithoutSetters(attributes) {
        this.attributes = attributes;
        return this;
    }

    bindCastables(attributes) {
        const castables = this.constructor.castables();
        let casted = {};
        for (const key in attributes) {
            const castable = castables[key];
            const attribute = attributes[key];
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

    castArray(items, Cast) {
        return items.map(item => this.castItem(item, Cast));
    }

    castItem(item, Cast) {
        return new Cast(item);
    }

    hasGetter(key) {
        return this.has(this.getQualifiedGetter(key));
    }

    hasCasts(key) {
        return !!this.casts[key];
    }

    hasRelation(key) {
        return this.has(this.getQualifiedRelation(key));
    }

    hasSetter(key) {
        return this.has(this.getQualifiedSetter(key));
    }

    isDate(key) {
        return this.dates.includes(key);
    }

    has(method) {
        return !!this[method];
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
        return this[this.getQualifiedRelation(key)](this.constructor.extractOptions(options));
    }

    fromCast(key) {
        const Cast = this.casts[key];
        return new Cast(this.getAttribute(key));
    }

    fromDate(key) {
        return new this.DateConstructor(this.getAttribute[key]);
    }

    setUrl(url) {
        this.url = url;
        return this;
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

    set(key, value) {
        value = (this.hasSetter(key)) ? this.fromSetter(key, value) : value;
        return this.setAttribute(key, value);
    }

    getSaveMethod() {
        return (this.isStored) ? 'PUT' : 'POST';
    }

    getSaveArguments() {
        return (this.isStored) ? [this.get(this.primaryKey)] : [];
    }

    save(options = {}) {
        options.data = this.getAttributes();
        const url = this.constructor.getFullUrl(this.getSaveArguments());
        return new Promise((resolve, reject) => {
            this.constructor.fetch(url, this.getSaveMethod(), this.constructor.extractOptions(options))
                .then((object) => {
                    this.setAttributes(object.getAttributes());
                    this.setStored();
                    resolve(this);
                }).catch((err) => reject(err));
        });
    }

    delete(options) {
        return this.constructor.destroy(this.getPrimaryKey(), options);
    }

    get isStored() {
        return !!this.stored;
    }

    hasMany(RelatedClass, options) {
        const url = (new RelatedClass()).getUrl();
        const id = options.id || -1;
        options.className = RelatedClass;
        if (id > -1) {
            return RelatedClass.find(id, options);
        }
        return this.constructor.fetch(this.constructor.getFullUrl([this.getPrimaryKey(), url]), 'GET', options);
    }

    hasOne(RelatedClass, foreignKey, options) {
        const relatedInstance = (new RelatedClass());
        const id = this.get(foreignKey);
        options.className = RelatedClass;
        return relatedInstance.constructor.fetch(relatedInstance.constructor.getFullUrl(id), 'GET', options);
    }

    static castables() {
        return {};
    }

    static getFullUrlBase() {
        return [
            this.getBaseUrl(),
            (this.create().getUrl())
        ].filter(part => !!part);
    }

    static getFullUrl(options) {
        let url = this.getFullUrlBase();
        if (options) {
            switch (options.constructor) {
                case Array:
                    url.push(...options);
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

    static cast(attributes) {
        if (attributes.constructor === Array) {
            return attributes.map(this.cast.bind(this));
        }
        return this.create().setStored();
    }

    static getBaseUrl() {
        return '';
    }

    static destroy(id, options) {
        return this.fetch(this.getFullUrl(id), 'DELETE', this.extractOptions(options));
    }

    static get(id, options) {
        return this.fetch(this.getFullUrl(id), 'GET', this.extractOptions(options));
    }

    static find(id, options) {
        return this.get(id, options);
    }

    static all(options) {
        return this.fetch(this.getFullUrl(), 'GET', this.extractOptions(options));
    }

    static extractOptions(options = {}) {
        return Object.assign(this.options, options);
    }

    static fetch(url, type, options) {
        return new Promise((resolve, reject) => {
            axios.request({
                url: url,
                params: options.datas,
                method: type,
                headers: options.headers,
                baseURL: this.getBaseUrl()
            }).then((response) => resolve(options.className.cast(this.getDataFromResponse(response))))
                .catch((err) => reject(err));
        });
    }

    static getDataFromResponse(response) {
        return response.data;
    }

    static get options() {
        return {
            className: this,
            datas: {},
            headers: {}
        };
    }

    static get primaryKey() {
        return 'id';
    }

    static create(attributes = {}) {
        return new this(attributes);
    }
}
module.exports = Model;

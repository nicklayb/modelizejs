import { expect } from 'firenpm/mochaccino';
import Model from '../lib';
/*global describe, it*/
const url = '/users';
class User extends Model {
    constructor(attributes) {
        super(attributes);
        this.setUrl(url);
        this.dates.push('birthdate');
    }

    getFullnameAttribute() {
        return this.get('firstname') + ' ' + this.get('lastname');
    }
}
describe('Model', () => {
    const attributes = {
        'id': 1,
        'firstname': 'John',
        'lastname': 'Doe',
        'email': 'johndoe@mock.com',
        'birthdate': '1993-01-10',
    };
    let user = new User(attributes);

    it('should concat firstname and lastname attributes', () => {
        expect(user.get('fullname')).toEqual(attributes.firstname + ' ' + attributes.lastname);
    });

    it('should have "/users" as url', () => {
        expect(user.getUrl()).toEqual(url);
    });

    it('should be an instance of date', () => {
        expect(user.get('birthdate').constructor).toBe(Date);
    });

    it('should add 1 to the url', () => {
        expect(user.constructor.getFullUrl(1)).toEqual([url, 1].join('/'));
    });

    it('should add test and test2 to the url', () => {
        expect(user.constructor.getFullUrl(['test', 'test2'])).toEqual([url, 'test', 'test2'].join('/'));
    });

    it('should add 6 to the id (2)', () => {
        const VALUE_TO_ADD = 6;
        const NEW_ID = 2;
        user.setIdAttribute = (value) => {
            return value + VALUE_TO_ADD;
        };
        user.set('id', NEW_ID);
        expect(user.get('id')).toEqual(VALUE_TO_ADD + NEW_ID);
    });

    it('should set stored value to true', () => {
        user.setStored();
        expect(user.isStored).toEqual(true);
    });
});

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
});

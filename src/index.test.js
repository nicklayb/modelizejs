import { expect } from 'firenpm/mochaccino';
import Model from '../lib';
/*global describe, it*/
const url = '/users';
class Post extends Model {
    constructor(attributes) {
        super(attributes);
        this.setUrl('/posts');
    }
}
class Role extends Model {
    constructor(attributes) {
        super(attributes);
        this.setUrl('/roles');
    }

    getConcatedAttribute() {
        return this.get('name') + this.get('level');
    }
}

class User extends Model {
    constructor(attributes) {
        super(attributes);
        this.setUrl(url);
        this.dates.push('birthdate');
    }

    getFullnameAttribute() {
        return this.get('firstname') + ' ' + this.get('lastname');
    }

    static castables() {
        return {
            role: Role,
            posts: Post
        };
    }
}
describe('Model', () => {
    const attributes = {
        'id': 1,
        'firstname': 'John',
        'lastname': 'Doe',
        'email': 'johndoe@mock.com',
        'birthdate': '1993-01-10',
        'role': {
            name: 'admin',
            level: 100
        },
        'posts': [
            { body: 'First post' },
            { body: 'Second post' },
        ]
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

    it('should cast role as Role', () => {
        expect(user.get('role').constructor).toBe(Role);
    });

    it('should cast role as Role and has the same method', () => {
        expect(user.get('role').get.constructor).toBe(Function);
    });

    it('should cast all posts as Post array', () => {
        expect(user.get('posts').constructor).toBe(Array);
    });

    it('should cast posts as Post', () => {
        expect(user.get('posts')[0].constructor).toBe(Post);
    });

    it('should gives the concatenated value of the role attributes', () => {
        expect(user.get('role').get('concated')).toEqual('admin100');
    });

    it('should set stored value to true', () => {
        user.setStored();
        expect(user.isStored).toEqual(true);
    });

    it('should have the firstName attribute', () => {
        expect(user.has('firstname')).toEqual(true);
    });

    it('should not have an age attribute', () => {
        expect(user.has('age')).toEqual(false);
    });

    it('should merge options with default options', () => {
        const OPTIONS = {
            datas: {
                firstName: 'John',
                lastName: 'Doe'
            }
        };
        const EXPECTATION = Object.assign({}, User.options, OPTIONS);
        expect(user.constructor.extractOptions(OPTIONS)).toEqual(EXPECTATION);
    });
});

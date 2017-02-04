var Model = require('../index.js');

Model.getBaseUrl = () => {
    return 'https://jsonplaceholder.typicode.com';
};

class Posts extends Model {
    constructor(attributes, withSetters) {
        super(attributes, withSetters);
        this.setUrl('posts');
    }
    userRelated(callbacks) {
        return this.hasOne(Users, 'userId', callbacks);
    }
}

class Users extends Model {
    constructor(attributes, withSetters) {
        super(attributes, withSetters);
        this.setUrl('users');
    }

    postsRelated(callbacks) {
        return this.hasMany(Posts, callbacks);
    }
}
Users.find(1).then((/*user*/) => {
    //  console.log(user);
});

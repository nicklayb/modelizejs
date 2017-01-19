var Model = require('../index.js');

Model.get baseUrl() = function () {
    return 'https://jsonplaceholder.typicode.com';
}

class Comments extends Model{
    constructor(attributes, withSetters) {
        super(attributes, withSetters);
        this.setUrl('comments');
    }
}

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
Users.find(1, {
    success (user) {
        console.log(user);
    }
});

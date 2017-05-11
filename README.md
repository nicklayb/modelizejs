# modelizejs
###### By Nicolas Boisvert :: nicklay@me.com

[![Build Status](https://travis-ci.org/nicklayb/modelizejs.svg?branch=master)](https://travis-ci.org/nicklayb/modelizejs)

### Javascript model library Eloquent-like oriented using Axios for fetch request

##### Purposes

It helps you fetch object from an API using Laravel Eloquent-like model extensions. This can be helpful to customize accessors or to fetch relations directly from a primary instance. It uses the awesome Axios library to make the ajax request. It all use ES6 and I highly recommend using it when extending.

Feel to make pull request and make suggestions

### Extending

You can have look in *Demo* for more information. This example will use the JSONPlaceholder API for testing.

```js
var Model = require('modelizejs');

class Users extends Model {
    //  Required for the construction
    constructor(attributes, withSetters) {
        super(attributes, withSetters);
        //  Will set the url to call (/users)
        this.setUrl('users');
    }

    //  Will add a relation to Posts class using hasMany relation. It'll return all the instances related
    postsRelated(callbacks) {
        return this.hasMany(Posts, callbacks);
    }

    //  Accessor for the user fullname
    getFullnameAttribute() {
        return this.getAttribute('name') + ' (' + this.getAttribute('username') + ')';
    }

    //  Adds a base url for make the call. The class url will be appended
    getBaseUrl() {
        return 'https://jsonplaceholder.typicode.com';
    }
}

class Posts extends Model {
    //  Required for the construction
    constructor(attributes, withSetters) {
        super(attributes, withSetters);
        //  Will set the url to call (/users)
        this.setUrl('posts');
    }

    //  Will add a relation to Users class using hasOne relation. It'll return the associated instance
    userRelated(callbacks) {
        return this.hasOne(Users, 'userId', callbacks);
    }
}

Users.find(1).then((user) => {
    console.log(user);
    /*
        Will return an object looking like this :
        Users {
          attributes:
           { id: 1,
             name: 'Leanne Graham',
             username: 'Bret',
             email: 'Sincere@april.biz',
             address:
              { street: 'Kulas Light',
                suite: 'Apt. 556',
                city: 'Gwenborough',
                zipcode: '92998-3874',
                geo: [Object] },
             phone: '1-770-736-8031 x56442',
             website: 'hildegard.org',
             company:
              { name: 'Romaguera-Crona',
                catchPhrase: 'Multi-layered client-server neural-net',
                bs: 'harness real-time e-markets' } },
          url: 'users',
          primaryKey: 'id' }
     */
     console.log(user.get('fullname')); //  Leanne Graham (Bret)

    user.get('posts').then((posts) => {
        console.log(posts);
        posts[0].get('user').then((user) => {
            console.log(user); //   Returns the same user as above
        });
    });
});
        /*
            Will return an array of Posts objects related to the selected user (1)
            [ Posts {
                attributes:
                 { userId: 1,
                   id: 1,
                   title: 'sunt aut facere repellat provident occaecati excepturi optio reprehenderit',
                   body: 'quia et suscipit\nsuscipit recusandae consequuntur expedita et cum\nreprehenderit molestiae ut ut quas totam\nnostrum rerum est autem sunt rem eveniet architecto' },
                url: 'posts',
                primaryKey: 'id' },
              Posts {
                attributes:
                 { userId: 1,
            ...
            atttributes:
             { userId: 1,
               id: 10,
               title: 'optio molestias id quia eum',
               body: 'quo et expedita modi cum officia vel magni\ndoloribus qui repudiandae\nvero nisi sit\nquos veniam quod sed accusamus veritatis error' },
            url: 'posts',
            primaryKey: 'id' } ]

         */

```

### Casting related

Sometimes you wish an attribute to be called as a specific class. If, for instance, our User model would come with an array of related posts, you could override the static method `castables()` to return an object within a attribute:class format.

```
castables() {
    return {
        posts: Posts
    };
}
```

When you will access the `posts` property with the get method, it will return you an array of `Posts` instead of an array of `Object`.

### Creating relation

Add a method to your class called '{relation}Related', like 'commentsRelated' or 'userRelated'

Returning an has many relation will make an API call to the related items. Let's take our example.
```js
class Users extends Model {
    //  constructor() ...

    //  When calling the relation (.related('posts') or .get('posts')), it'll fetch to /users/{id}/posts
    postsRelated(callbacks) {
        return this.hasMany(Posts, callbacks);
    }
}
```

Returning an has one relation will make an API call to the related item specified by the foreign key as second parameter. Let's take our example.

```js
class Posts extends Model {
    //  constructor() ...

    //  When calling the relation (.related('user') or .get('user')), it'll fetch to /users/{this.userId}
    userRelated(callbacks) {
        return this.hasOne(Users, 'userId', callbacks);
    }
}
```

## Conclusion

Thank you for using, testing and improving it and feel free to contact me for any question.

Ending joke :
> !false, it's funny because it's true

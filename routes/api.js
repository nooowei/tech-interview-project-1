var express = require('express');
var router = express.Router();
var axios = require('axios');

// /api routes
router.get('/ping', function(req, res, next) {
    // axios.post('/login', user)
    //   .then(function(res){})
  res.json({"success" : true});
});

//route to get posts
router.get('/posts', function(req, res, next) {

    // get the parameters from the query string
    let {tags, sortBy, direction} = req.query;

    // if tags not present, return error
    if(typeof tags === "undefined"){
        res.json({"error": "Tags parameter is required"});
    }

    // set default sortBy to id, also check for invalid parameters
    if(typeof sortBy === "undefined"){
        sortBy = "id";
    }else if(sortBy != "id" && sortBy != "reads" && sortBy != "likes" && sortBy != "popularity"){
        res.json({"error": "sortBy parameter is invalid"});
    }

    // set default direction to asc, also check for invalid parameters
    if(typeof direction === "undefined"){
        direction = "asc";
    }else if(direction != "desc" && direction != "asc"){
        res.json({"error": "direction parameter is invalid"});
    }

    // split tags parameters into an array
    let tagsArr = tags.split(',');
    // console.log(tagsArr);

    // create a axios call stack for fetching posts concurrently
    //(APIKEY REMOVED FROM THIS FILE UNDER NDA)
    let callArr = tagsArr.map(tag => axios.get(`https://APIKEY${tag}`));

    // use axios to fetch all posts from API with tags as parameter
    axios.all(callArr)
      .then(axios.spread((...response) => {
        //   console.log(response[0].data.posts);
        //   console.log(response[0].data.posts.length);
        
        // create an array to store all response posts
        let posts = [];
        let uniquePosts = [];
        
        // add all response posts into this array
        for(i = 0; i<response.length; i++){
            for(j = 0; j<response[i].data.posts.length; j++){
                posts.push(response[i].data.posts[j]);
            }
        }

        console.log("Number of Total Posts are: " + posts.length);
        

          // check direction
          if(direction == 'desc'){  
            //sort in descending order
            function sort_by_key_desc(array, key){
             return array.sort(function(a, b){
              let x = a[key]; 
              let y = b[key];
              return ((x > y) ? -1 : ((x < y) ? 1 : 0));
             });
            }
            posts = sort_by_key_desc(posts, sortBy);

            // delete the dupliated posts 
            uniquePosts = Array.from(new Set(posts.map(a => a.id)))
                .map(id => {
                    return posts.find(a => a.id === id)
                })
            console.log("Number of Unique Posts are: " + uniquePosts.length);

            res.json({"posts":uniquePosts});
          }else{    
            //sort in ascending order
            function sort_by_key_asc(array, key){
                return array.sort(function(a, b){
                    let x = a[key]; 
                    let y = b[key];
                    return ((x < y) ? -1 : ((x > y) ? 1 : 0));
                });
            }
            posts = sort_by_key_asc(posts, sortBy);

            // delete the dupliated posts 
            uniquePosts = Array.from(new Set(posts.map(a => a.id)))
                .map(id => {
                    return posts.find(a => a.id === id)
                })

            console.log("Number of Unique Posts are: " + uniquePosts.length);
               return res.json({"posts":uniquePosts});
          }
         
      }));
});

module.exports = router;

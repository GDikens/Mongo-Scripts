// add first connection here in URI format
db = connect("mongodb://USERNAME:PASSWORD@cluster0-shard-00-00-qllbz.mongodb.net:27017,cluster0-shard-00-01-qllbz.mongodb.net:27017,cluster0-shard-00-02-qllbz.mongodb.net:27017/DATABASE_NAME?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true");

// add second connection here in URI format
db2 = connect("mongodb://USERNAME:PASSWORD@cluster1-shard-00-00-qibjj.mongodb.net:27017,cluster1-shard-00-01-qibjj.mongodb.net:27017,cluster1-shard-00-02-qibjj.mongodb.net:27017/DATABASE_NAME?ssl=true&replicaSet=Cluster1-shard-0&authSource=admin&retryWrites=true");

// Add tenant here
var tenant = "meg";

// Add field path want to replace
var path = "modules.0.view_descriptors.0.is_landing";

db.getCollection("Account").aggregate(

    [
        {
            "$match" : 
            {
                "tenant_id" : tenant
            }
        },
        {
            "$project":
            {
            "_id":0,
            "subject_key":1
            }
        },
        { 
            "$lookup" : 
            {
                "from" : "ProvisioningProfile", 
                "localField" : "subject_key", 
                "foreignField" : "subject_key", 
                "as" : "provision_profile"
            }
        },
        {
            "$unwind" : "$provision_profile"
        },
        {
            "$project":
            {
            "app_group_id":"$provision_profile.app_group_id"
            }
        },
        { 
            "$lookup" : 
            {
                "from" : "AppGroup", 
                "localField" : "app_group_id", 
                "foreignField" : "_id", 
                "as" : "app_group"
            }
        }, 
        { 
            "$unwind" : "$app_group"
        }, 
        { 
            "$project" : 
            {
                "_id" : 0, 
                "subject_key" :1,
                "app_group" : "$app_group.products_map"
            }
        },
        { 
            "$addFields": 
            {
            "latest_ids":
            {
                "$objectToArray":"$app_group"
            } 
            }
        },
        {
            "$project" : 
            {
            "_id" : 0,
            "subject_key" :1,
            "latest_ids" : "$latest_ids"
            }
        },
        {
            "$unwind" : "$latest_ids"
        },
        {
            "$project" :
            {
            "_id" : 0,
            "subject_key" :1,
            "latest_ids" : "$latest_ids.v.latest"
            }
        },
        {
            "$lookup" : 
            {
            "from" : "Release",
            "localField" : "latest_ids",
            "foreignField" : "_id",
            "as" : "releases"
            }
        },
        {
            "$unwind": "$releases"
        },
        {
            "$project" :
            {
            "subject_key": 1,
            "product_id" :"$releases.product_id"
            }
        },
        {
            "$lookup":
            {
            "from" : "ProductEntry",
            "localField" : "product_id",
            "foreignField" : "_id",
            "as" : "products"
            }
        },
        {
            "$unwind": "$products"
        },
        {
            "$project": 
            {
            "subject_key":1,
            "product":"$products"
            }
        },
        {
            "$project":
            {
            "product._id":0
            }
        }
    ]

).map( function (e) {
    
    db2.getCollection("Account").aggregate(

    [
        {
            "$match" : 
            {
                "tenant_id" : tenant
            }
        },
        {
            "$project":
            {
            "_id":0,
            "subject_key":1
            }
        },
        { 
            "$lookup" : 
            {
                "from" : "ProvisioningProfile", 
                "localField" : "subject_key", 
                "foreignField" : "subject_key", 
                "as" : "provision_profile"
            }
        },
        {
            "$unwind" : "$provision_profile"
        },
        {
            "$project":
            {
            "app_group_id":"$provision_profile.app_group_id"
            }
        },
        { 
            "$lookup" : 
            {
                "from" : "AppGroup", 
                "localField" : "app_group_id", 
                "foreignField" : "_id", 
                "as" : "app_group"
            }
        }, 
        { 
            "$unwind" : "$app_group"
        }, 
        { 
            "$project" : 
            {
                "_id" : 0, 
                "subject_key" :1,
                "app_group" : "$app_group.products_map"
            }
        },
        { 
            "$addFields": 
            {
            "latest_ids":
            {
                "$objectToArray":"$app_group"
            } 
            }
        },
        {
            "$project" : 
            {
            "_id" : 0,
            "subject_key" :1,
            "latest_ids" : "$latest_ids"
            }
        },
        {
            "$unwind" : "$latest_ids"
        },
        {
            "$project" :
            {
            "_id" : 0,
            "subject_key" :1,
            "latest_ids" : "$latest_ids.v.latest"
            }
        },
        {
            "$lookup" : 
            {
            "from" : "Release",
            "localField" : "latest_ids",
            "foreignField" : "_id",
            "as" : "releases"
            }
        },
        {
            "$unwind": "$releases"
        },
        {
            "$project" :
            {
            "subject_key": 1,
            "product_id" :"$releases.product_id"
            }
        },
        {
            "$lookup":
            {
            "from" : "ProductEntry",
            "localField" : "product_id",
            "foreignField" : "_id",
            "as" : "products"
            }
        },
        {
            "$unwind": "$products"
        },
        {
            "$project": 
            {
            "subject_key":1,
            "product":"$products"
            }
        },
        {
            "$match":
            {
            "product.product_type":e.product.product_type
            }
        },
        {
            "$project":
            {
            "_id":"$product._id"
            }
        }

    ]
    
    ).map( function (f) {

        var nested_keys = flatten(e.product);
        var set_query = {};
        set_query[path] = nested_keys[path];

        if(nested_keys[path]){

            db2.getCollection("ProductEntry").update(

                f,
                {
                    $set:set_query
                }
        
            );

        }
    
    });
  
});

// flatten a json array into key-value pair
function flatten(data) {
    var result = {};
    function recurse (cur, prop) {
        if (Object(cur) !== cur) {
            result[prop] = cur;
        } else if (Array.isArray(cur)) {
             for(var i=0, l=cur.length; i<l; i++)
                 recurse(cur[i], prop + "." + i );
            if (l == 0)
                result[prop] = [];
        } else {
            var isEmpty = true;
            for (var p in cur) {
                isEmpty = false;
                recurse(cur[p], prop ? prop+"."+p : p);
            }
            if (isEmpty && prop)
                result[prop] = {};
        }
    }
    recurse(data, "");
    return result;
}


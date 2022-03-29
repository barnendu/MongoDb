db.air_alliances.aggregate([
    {
        $match: {
            name:"OneWorld"
        }
    },
    {
        $graphLookup: {
            startWith: "$airlines",
            from: "air_airlines",
            connectFromField: "name",
            connectToField: "name",
            as: "airlines",
            maxDepth: 0, 
            restrictSearchWithMatch:{
                country:{ $in:["Germany", "Spain","Canada"]}
            }
        }
    },
    {
        $graphLookup:{
            startWith: "$airlines.base",
            from:"air_routes",
            connectFromField: "dst_airport",
            connectToField: "src_airport",
            as:"connections",
            maxDepth: 1
        },
    },
    {
        $project: {
            validAirlines: "$airlines.name",
            "connections.dst_airport": 1,
            "connections.airline.name": 1 
        }
    },
    { $unwind: "$connections" },
    {
    $project: {
        isValid: {
        $in: ["$connections.airline.name", "$validAirlines"]
        },
        "connections.dst_airport": 1
        }
    },
    { $match: { isValid: true } },
    {
      $group: {
        _id: "$connections.dst_airport"
      }
    }
])

db.movies.aggregate([
    {
        $match:{
            metacritic: {$gt : 0},
            "imdb.rating": {$gt : 0}
        }
    },
    {
        $facet:{
            "top_metacritic":[
                {
                    $sort:{
                        "metacritic": -1
                    }
                },
                {
                    $limit: 10
                },
                {
                    $project:{
                        _id : 0, 
                        title: 1
                    }
                }
            ],
            "top_imdb":[
                {
                    $sort:{
                        "imdb.rating": -1
                    }
                },
                {
                    $limit: 10
                },
                {
                    $project:{
                        _id : 0, 
                        title: 1
                    }
                }
            ]
        }
    },
    {
        $project:{
            "movie_in_both": {
                $setIntersection: ["$top_metacritic", "$top_imdb"]
            }
        }
    }
])


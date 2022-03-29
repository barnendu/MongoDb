var validateLab2 = pipeline => {
  let aggregations = db.getSiblingDB("aggregations")
  if (!pipeline) {
    print("var pipeline isn't properly set up!")
  } else {
    try {
      let resultsExplain = aggregations.movies.aggregate(pipeline, {
        explain: true
      })
      let result = aggregations.movies.aggregate(pipeline).toArray().length
      let data = 0
      while (result != 1) {
        data++
        result = result % 2 === 0 ? result / 2 : result * 3 + 1
      }
      let { _id, title, rated } = resultsExplain.stages.pop()["$project"]
      return title && rated && !_id
        ? print("Answer is", data)
        : print("Your $project stage doesn't seem correct")
    } catch (e) {
      print(e.message)
    }
  }
}


db.movies.aggregate([
  {
    $match: {
      cast: { $elemMatch: { $exists: true } },
      directors: { $elemMatch: { $exists: true } },
      writers: { $elemMatch: { $exists: true } }
    }
  },
  {
    $project: {
      _id: 0,
      cast: 1,
      directors: 1,
      writers: {
        $map: {
          input: "$writers",
          as: "writer",
          in: {
            $arrayElemAt: [
              {
                $split: ["$$writer", " ("]
              },
              0
            ]
          }
        }
      }
    }
  },
  {
    $project: {
      labor_of_love: {
        $gt: [
          { $size: { $setIntersection: ["$cast", "$directors", "$writers"] } },
          0
        ]
      }
    }
  },
  {
    $match: { labor_of_love: true }

    
  },
  {
    $count: "labors of love"
  }
])



var favorites = [
  "Sandra Bullock",
  "Tom Hanks",
  "Julia Roberts",
  "Kevin Spacey",
  "George Clooney"]

db.movies.aggregate([
  {
    $match: {
      "tomatoes.viewer.rating": { $gte: 3 },
      countries: "USA",
      cast: {
        $in: favorites
      }
    }
  },
  {
    $project: {
      _id: 0,
      title: 1,
      "tomatoes.viewer.rating": 1,
      num_favs: {
        $size: {
          $setIntersection: [
            "$cast",
            favorites
          ]
        }
      }
    }
  },
  {
    $sort: { num_favs: -1, "tomatoes.viewer.rating": -1, title: -1 }
  },
  {
    $skip: 24
  },
  {
    $limit: 1
  }
])
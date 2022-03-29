db.movies.aggregate([
    {
      $match: {
        awards: /Won \d{1,2} Oscars?/
      }
    },
    {
      $group: {
        _id: null,
        highest_rating: { $max: "$imdb.rating" },
        lowest_rating: { $min: "$imdb.rating" },
        average_rating: { $avg: "$imdb.rating" },
        deviation: { $stdDevSamp: "$imdb.rating" }
      }
    }
  ])

  db.movies.aggregate([
    {
      $match: {
        languages: "English"
      }
    },
    {
      $project: { _id: 0, cast: 1, "imdb.rating": 1 }
    },
    {
      $unwind: "$cast"
    },
    {
      $group: {
        _id: "$cast",
        numFilms: { $sum: 1 },
        average: { $avg: "$imdb.rating" }
      }
    },
    {
      $project: {
        numFilms: 1,
        average: {
          $divide: [{ $trunc: { $multiply: ["$average", 10] } }, 10]
        }
      }
    },
    {
      $sort: { numFilms: -1 }
    },
    {
      $limit: 1
    }
  ])

  db.air_routes.aggregate([
      {
          $match:{
            airplane: /747|380/
          }
      },
      {
        $lookup: {
          from: "air_alliances",
          foreignField: "airlines",
          localField: "airline.name",
          as: "alliance"
        }
      },
      {
        $unwind: "$alliance"
      },
      {
        $group: {
          _id: "$alliance.name",
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
  ])
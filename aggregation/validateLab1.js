var validateLab1 = pipeline => {
  let aggregations = db.getSiblingDB("aggregations")
  if (!pipeline) {
    print("var pipeline isn't properly set up!")
  } else {
    try {
      var result = aggregations.movies.aggregate(pipeline).toArray().length
      let sentinel = result
      let data = 0
      while (result != 1) {
        data++
        result = result % 2 === 0 ? result / 2 : result * 3 + 1
      }
      if (sentinel === 23) {
        print("Answer is", data)
      } else {
        print("You aren't returning the correct number of documents")
      }
    } catch (e) {
      print(e.message)
    }
  }
}

var pipeline = [
    {
    $match: {
       "imdb.rating": { $gte: 7 },
        genres: { $nin: [ "Crime", "Horror" ] } ,
        rated: { $in: ["PG", "G" ] },
        languages: { $all: [ "English", "Japanese" ] }
       }
     },
     {
       $project:{
         _id: 0,
         title: 1,
         rated: "$imdb.rating"
       }
     }
   ]

   db.movies.aggregate([{$project:{
     titleLength: {$size: {$split:["$title"," "]}}
   }},{
     $match:{
      titleLength:{$eq: 1}
     }
   }]).itcount()

   db.movies.aggregate([{$project:{
     directors: 1,
     cast: 1,
     writers: 1,
     commonToBoth: { $setIntersection: [ "$cast", "$directors","$writers" ] }, 
     _id: 0 
  }}]).itcount()
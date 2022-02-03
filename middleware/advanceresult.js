const advanceResults = (model, populate) => async (req, res, next) => {
  let queryParams = { ...req.query };
  console.log(queryParams);

  //Fields to exclude
  const removeFeilds = ["select", "sort", "page", "limit"];

  //loop over the removeFeilds and delete them from queryparms
  removeFeilds.forEach((param) => delete queryParams[param]);
  //converting objet into string
  queryParams = JSON.stringify(queryParams);

  //converting string gt to $gt i.e. from normal property to mongoose operator
  queryParams = queryParams.replace(
    /\b(gte|gt|lte|lt|in)\b/g,
    (match) => `$${match}`
  ); //=>{ averageCost: { '$gte': '1000' } }
  //finding the resource
  let query = model.find(JSON.parse(queryParams)).populate(populate);

  //return only reqested properties of document
  if (req.query.select) {
    const feilds = req.query.select.split(",").join(" ");
    query = query.select(feilds);
  }
  //sort the result
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    query = query.sort("-createdAt");
  }

  //pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endEndex = page * limit;
  const total = await model.countDocuments();

  query = query.skip(startIndex).limit(limit);

  const results = await query;

  //pagination results for showin if the next or prev page are available
  const pagination = {};

  if (endEndex < total) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }
  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  }
  res.advanceResult = {
    success: "true",
    count: results.length,
    msg: "show all ",
    pagination: pagination,
    data: results,
  };
  next();
};

module.exports = advanceResults;

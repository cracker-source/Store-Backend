const Product = require("../models/product");

const getAllProductsStatic = async (req, res) => {
  // with - == 'DESC' without - == 'ASC'
  const products = await Product.find({ price: { $gt: 30 } })
    .select("price")
    .sort("price");
  res.status(200).json({ products });
};
const getAllProducts = async (req, res) => {
  const { featured, company, name, sort, fields, numericFilters } = req.query;
  const queryObject = {};

  if (featured) {
    queryObject.featured = featured === "1" ? 1 : 0;
  }

  if (name) {
    // using regex and in options using i - case insensitive
    queryObject.name = { $regex: name, $options: "i" };
  }

  if (company) {
    queryObject.company = company;
  }

  if (numericFilters) {
    const operatorMap = {
      ">": "$gt",
      ">=": "$gte",
      "=": "$eq",
      "<": "$lt",
      "<=": "$lte",
    };

    const regEx = /\b(<|>|>=|=|<|<=)\b/g;
    let filters = numericFilters.replace(
      regEx,
      (match) => `-${operatorMap[match]}-`
    );

    const options = ["price", "rating"];
    filters = filters.split(",").forEach((item) => {
      const [field, operator, value] = item.split("-");
      if (options.includes(field)) {
        queryObject[field] = { [operator]: +value };
      }
    });
  }
  console.log(queryObject);
  let result = Product.find(queryObject);
  if (sort) {
    const sortList = sort.split(",").join(" ");
    result = result.sort(sortList);
  } else {
    result = result.sort("createdAt");
  }

  if (fields) {
    const fieldsList = fields.split(",").join(" ");
    result = result.select(fieldsList);
  }

  const page = +req.query.page || 1;
  const limit = +req.query.limit || 10;
  const skip = (page - 1) * limit;

  result = result.skip(skip).limit(limit);

  const totalProducts = await Product.countDocuments(queryObject);
  const products = await result;

  res.status(200).json({
    total: totalProducts,
    page: page,
    pageSize: products.length,
    products: products,
  });
};

module.exports = { getAllProductsStatic, getAllProducts };

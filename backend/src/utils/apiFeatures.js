class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  // Filter results
  filter() {
    const queryObj = { ...this.queryString };
    
    // Fields to exclude from filtering
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
    excludedFields.forEach(el => delete queryObj[el]);

    // Advanced filtering (gte, gt, lte, lt)
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt|in|nin|ne|regex)\b/g, match => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  // Sort results
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      // Default sort by creation date (newest first)
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  // Limit fields
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      // Exclude __v field by default
      this.query = this.query.select('-__v');
    }
    return this;
  }

  // Paginate results
  paginate() {
    const page = parseInt(this.queryString.page, 10) || 1;
    const limit = parseInt(this.queryString.limit, 10) || 25;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    
    // Store pagination info for later use
    this.pagination = { page, limit, skip };
    return this;
  }

  // Search functionality
  search(searchFields = []) {
    if (this.queryString.search && searchFields.length > 0) {
      const searchRegex = new RegExp(this.queryString.search, 'i');
      const searchConditions = searchFields.map(field => ({
        [field]: searchRegex
      }));
      
      this.query = this.query.find({ $or: searchConditions });
    }
    return this;
  }

  // Date range filtering
  dateRange(dateField = 'createdAt') {
    const { startDate, endDate } = this.queryString;
    
    if (startDate || endDate) {
      const dateFilter = {};
      
      if (startDate) {
        dateFilter.$gte = new Date(startDate);
      }
      
      if (endDate) {
        dateFilter.$lte = new Date(endDate);
      }
      
      this.query = this.query.find({ [dateField]: dateFilter });
    }
    
    return this;
  }

  // Populate related fields
  populate(populateOptions) {
    if (populateOptions) {
      if (Array.isArray(populateOptions)) {
        populateOptions.forEach(option => {
          this.query = this.query.populate(option);
        });
      } else {
        this.query = this.query.populate(populateOptions);
      }
    }
    return this;
  }

  // Count total documents (for pagination)
  async countTotal() {
    // Clone the query to count total documents
    const countQuery = this.query.model.find(this.query.getQuery());
    return await countQuery.countDocuments();
  }

  // Execute query and return results with metadata
  async execute() {
    const results = await this.query;
    
    // Get total count for pagination
    const total = await this.countTotal();
    
    // Calculate pagination metadata
    const pagination = this.pagination || { page: 1, limit: 25 };
    const totalPages = Math.ceil(total / pagination.limit);
    
    return {
      success: true,
      count: results.length,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        pages: totalPages,
        hasNext: pagination.page < totalPages,
        hasPrev: pagination.page > 1
      },
      data: results
    };
  }

  // Get query for further processing
  getQuery() {
    return this.query;
  }
}

// Helper function to create API features
const createAPIFeatures = (model, queryString, options = {}) => {
  const {
    searchFields = [],
    populateOptions = null,
    dateField = 'createdAt',
    defaultSort = '-createdAt'
  } = options;

  let query = model.find();
  
  // Apply default sort if no sort specified
  if (!queryString.sort) {
    queryString.sort = defaultSort;
  }

  const features = new APIFeatures(query, queryString)
    .filter()
    .search(searchFields)
    .dateRange(dateField)
    .sort()
    .limitFields()
    .populate(populateOptions)
    .paginate();

  return features;
};

// Advanced filtering helpers
class FilterHelpers {
  // Create text search filter
  static textSearch(searchTerm, fields) {
    if (!searchTerm || !fields.length) return {};
    
    const regex = new RegExp(searchTerm, 'i');
    return {
      $or: fields.map(field => ({ [field]: regex }))
    };
  }

  // Create date range filter
  static dateRange(startDate, endDate, field = 'createdAt') {
    const filter = {};
    
    if (startDate) {
      filter[field] = { ...filter[field], $gte: new Date(startDate) };
    }
    
    if (endDate) {
      filter[field] = { ...filter[field], $lte: new Date(endDate) };
    }
    
    return Object.keys(filter).length > 0 ? filter : {};
  }

  // Create numeric range filter
  static numericRange(min, max, field) {
    const filter = {};
    
    if (min !== undefined) {
      filter[field] = { ...filter[field], $gte: Number(min) };
    }
    
    if (max !== undefined) {
      filter[field] = { ...filter[field], $lte: Number(max) };
    }
    
    return Object.keys(filter).length > 0 ? filter : {};
  }

  // Create array contains filter
  static arrayContains(values, field) {
    if (!values || !Array.isArray(values) || values.length === 0) return {};
    
    return { [field]: { $in: values } };
  }

  // Create exists filter
  static exists(field, shouldExist = true) {
    return { [field]: { $exists: shouldExist } };
  }

  // Create regex filter
  static regex(pattern, field, options = 'i') {
    if (!pattern) return {};
    
    return { [field]: { $regex: pattern, $options: options } };
  }
}

// Aggregation pipeline helpers
class AggregationHelpers {
  // Create match stage
  static match(conditions) {
    return { $match: conditions };
  }

  // Create lookup stage
  static lookup(from, localField, foreignField, as) {
    return {
      $lookup: {
        from,
        localField,
        foreignField,
        as
      }
    };
  }

  // Create group stage
  static group(id, fields) {
    return {
      $group: {
        _id: id,
        ...fields
      }
    };
  }

  // Create sort stage
  static sort(sortObj) {
    return { $sort: sortObj };
  }

  // Create project stage
  static project(fields) {
    return { $project: fields };
  }

  // Create limit stage
  static limit(count) {
    return { $limit: count };
  }

  // Create skip stage
  static skip(count) {
    return { $skip: count };
  }

  // Create unwind stage
  static unwind(path, options = {}) {
    return {
      $unwind: {
        path,
        ...options
      }
    };
  }
}

module.exports = {
  APIFeatures,
  createAPIFeatures,
  FilterHelpers,
  AggregationHelpers
};
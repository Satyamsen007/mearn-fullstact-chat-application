import ApiError from '../helper/ApiError.js'

const errorHandler = (err, req, res, next) => {
    let error = err;

    // Handle different types of errors
    if (!(error instanceof ApiError)) {
        const statusCode =
            error.name === 'ValidationError' ? 400 :
                error.name === 'JsonWebTokenError' ? 401 :
                    error.name === 'TokenExpiredError' ? 401 :
                        error.statusCode || 500;

        const message = error.message || "Something went wrong";
        error = new ApiError(
            statusCode,
            message,
            error?.errors || [],
            error?.stack
        );
    }

    // Ensure response object is properly structured
    const response = {
        success: false,
        statusCode: error.statusCode,
        message: error.message,
        errors: Array.isArray(error.errors) ? error.errors : [error.message], // Ensure errors is always an array
        ...(process.env.NODE_ENV === "development" ? { stack: error.stack } : {})
    };

    // If error contains additional data, include it in response
    if (error.data) {
        response.data = error.data;
    }

    // Ensure proper status code is set
    const statusCode = error.statusCode || 500;

    // Send response with appropriate headers
    return res
        .status(statusCode)
        .header('Content-Type', 'application/json')
        .json(response);
};

export default errorHandler;

export const notFound = (req, res) => {
    res.status(404).json({ message: 'Resource not found' });
};

export const errorHandler = (error, req, res, next) => {
    console.error(error);

    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal server error';

    res.status(statusCode).json({
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
};

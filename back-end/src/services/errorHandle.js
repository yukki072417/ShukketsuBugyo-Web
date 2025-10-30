function errorHandle(message, status){
    const error = new Error(message);
    error.status = status;
    error.timestamp = new Date().toISOString();
    throw error;
}

function createValidationError(field, value) {
    const error = new Error(`Invalid ${field}: ${value}`);
    error.name = 'ValidationError';
    error.status = 400;
    error.field = field;
    throw error;
}

module.exports = {
    errorHandle,
    createValidationError
};
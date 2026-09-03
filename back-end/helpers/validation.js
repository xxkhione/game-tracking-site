const valid_statuses = [
    'Plan_to_play',
    'Playing',
    'Completed',
    'On_hold',
    'Dropped',
]

function validate_string(value, field_name, maximum_length = null) {
    if (typeof value !== 'string' || value.trim() === '') {
        return `${field_name} is required.`
    }

    if (maximum_length !== null && value.trim().length > maximum_length) {
        return `${field_name} must be ${maximum_length} characters or fewer.`
    }

    return null
}

function validate_integer(value, field_name, minimum = 0, maximum = null) {
    if (!Number.isInteger(value) || value < minimum) {
        return `${field_name} must be a whole number greater than or equal to ${minimum}.`
    }

    if (maximum !== null && value > maximum) {
        return `${field_name} must be less than or equal to ${maximum}.`
    }

    return null
}

function validate_number(value, field_name, minimum = 0) {
    if (typeof value !== 'number' || !Number.isFinite(value) || value < minimum) {
        return `${field_name} must be a number greater than or equal to ${minimum}.`
    }

    return null
}

function validate_status(status) {
    if (!valid_statuses.includes(status)) {
        return `status must be one of: ${valid_statuses.join(', ')}.`
    }

    return null
}

export {
    valid_statuses,
    validate_string,
    validate_integer,
    validate_number,
    validate_status
}
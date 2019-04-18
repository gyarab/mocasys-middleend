import * as errors from 'restify-errors';

function paramErrorMessage(name: string, key: string, required: boolean): string {
    if (required) return `${key}.required.${name}`;
    return `${key}.notAllowed.${name}`;
}

export function requireParams(data: object, key: string, required: boolean, requiredParams: Array<string>): Array<string> {
    let messages = [];
    if (!data) data = {};
    if (!required && Object.keys(data).length === 0) return messages;
    for (let i = 0; i < requiredParams.length; i++) {
        let param = requiredParams[i];
        let hasProperty = data.hasOwnProperty(param);
        if ((hasProperty && !required) || (!hasProperty && required)) {
            let msg = paramErrorMessage(param, key, required)
            messages.push(msg);
        }
    }
    return messages;
}

export function sendErrors(res, errMessages) {
    res.send(new errors.BadRequestError(errMessages.join(',')));
}

export function sendErrorsNext(res, errMessages, next) {
    sendErrors(res, errMessages);
    return next();
}

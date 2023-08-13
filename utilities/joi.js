export function joiValidator(input, schema){
	const result = schema.validate(input, { abortEarly: false, convert: true });
	if (result.error) {
		const tempErrorObject = {};
		result.error.details.forEach((errObj) => {
			tempErrorObject[errObj.path[0]] = errObj.message;
		});
		return { data: undefined, error: tempErrorObject };
	}
	return { data: result.value, error: undefined };
}



export const documentsDto = (documents) => {
	const result = documents.map((document) => {
		const { fieldname, name } = document;
		return { fieldname, name };
	});
	return result;
};

export default documentsDto;

import { defineOperationApi } from '@directus/extensions-sdk';
import { isValidJSON } from '@directus/utils';
import axios from 'axios';
import encodeUrl from 'encodeurl';

type Options = {
	url: string;
	method: string;
	body: Record<string, any> | string | null;
	headers?: { header: string; value: string }[] | null;
};

export default defineOperationApi<Options>({
	id: 'simple-form',
	handler: async ({ url, method, body, headers }) => {
		const customHeaders =
			headers?.reduce(
				(acc, { header, value }) => {
					acc[header] = value;
					return acc;
				},
				{} as Record<string, string>,
			) ?? {};
		
		if (!customHeaders['Content-Type'] && (typeof body === 'object' || isValidJSON(body))) {
			customHeaders['Content-Type'] = 'application/x-www-form-urlencoded';
		}

		const formData = axios.toFormData(body as object);

		try {
			const result = await axios({
				url: encodeUrl(url),
				method,
				data: formData,
				headers: customHeaders,
			});

			return { status: result.status, statusText: result.statusText, headers: result.headers, data: result.data };
		} catch (error: unknown) {
			if (axios.isAxiosError(error) && error.response) {
				throw JSON.stringify({
					status: error.response.status,
					statusText: error.response.statusText,
					headers: error.response.headers,
					data: error.response.data,
				});
			} else {
				throw error;
			}
		}
	},
});

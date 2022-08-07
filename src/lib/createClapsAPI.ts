import { Redis } from '@upstash/redis';
import type { RequestEvent, RequestHandler } from '@sveltejs/kit';
import { generateHash, getData } from './utils';
import variables from './variables';

type OptionProps = { maxClaps?: number };

const prepareRequest = async (event: RequestEvent) => {
	const body = event.request.body ? await event.request.json() : {};
	const { score } = body;

	const key = event.url.searchParams.get('key') as string;
	const RAW_IP = event.clientAddress;
	const KEY = `CLAP:${key}`;
	const HASH_IP = await generateHash(RAW_IP);

	return { KEY, HASH_IP, score };
};

function createClapsAPI({ maxClaps = 10 }: OptionProps): {
	GET: RequestHandler;
	PATCH: RequestHandler;
} {
	const redis = new Redis({
		url: variables.UPSTASH_URL,
		token: variables.UPSTASH_TOKEN
	});

	return {
		GET: async function (event) {
			const { KEY, HASH_IP } = await prepareRequest(event);
			return {
				status: 200,
				body: await getData(KEY, HASH_IP)
			};
		},
		PATCH: async function (event) {
			try {
				const { KEY, HASH_IP, score } = await prepareRequest(event);
				let addScore = Number(score) || 0;
				const { userScore } = await getData(KEY, HASH_IP);

				if (userScore >= maxClaps) {
					return {
						status: 404,
						body: 'You have reached the maximum number of claps'
					};
				}

				// if the total value is higher than the max value, we need to remove some claps
				if (userScore + addScore > maxClaps) {
					addScore = addScore - (userScore + addScore - maxClaps);
				}

				await redis.zincrby(KEY, addScore, HASH_IP);

				const data = await getData(KEY, HASH_IP);
				return {
					status: 200,
					body: { ...data, maxClaps }
				};
			} catch (e) {
				console.log(e);
				return {
					status: 505,
					body: 'Something went wrong'
				};
			}
		}
	};
}

export default createClapsAPI;

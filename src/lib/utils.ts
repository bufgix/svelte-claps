import { Redis } from '@upstash/redis';
import type { ClapsResponse } from './types';
import variables from './variables';

const redis = new Redis({
	url: variables.UPSTASH_URL,
	token: variables.UPSTASH_TOKEN
});

export async function generateHash(ip: string) {
	const crypto = await import('crypto');
	return crypto.createHash('sha256').update(ip).digest('base64');
}

export function generateKey(url: URL, key: string) {
	if (key) {
		return `CLAP:${key}`;
	}

	return `CLAP:${url.origin + url.pathname}`;
}

export function getIP(req: Request) {
	const xff = req.headers.get('x-forwarded-for');

	return xff ? (Array.isArray(xff) ? xff[0] : xff.split(',')[0]) : '127.0.0.1';
}

export async function getData(key: string, ip: string): Promise<ClapsResponse> {
	// eslint-disable-next-line no-async-promise-executor
	return new Promise(async (resolve) => {
		let totalScore = 0,
			userScore = 0;

		const sortedList: Array<string | number> = await redis.zrange(key, 0, -1, {
			withScores: true
		});

		for (let i = 0; i < sortedList.length; i += 2) {
			const [key, value] = [sortedList[i], Number(sortedList[i + 1])];
			if (key === ip) userScore = value;
			totalScore = totalScore + value;
		}

		resolve({
			totalScore,
			userScore,
			totalUsers: sortedList.length / 2
		});
	});
}

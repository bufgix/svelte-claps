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

export async function getData(key: string, ip: string): Promise<ClapsResponse> {
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

	return {
		totalScore,
		userScore,
		totalUsers: sortedList.length / 2
	};
}

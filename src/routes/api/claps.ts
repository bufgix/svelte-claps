import createClapsApi from '$lib/createClapsAPI';

export const { GET, PATCH } = createClapsApi({ maxClaps: 10 });

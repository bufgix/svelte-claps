# svelte-claps

Adds clap button (like medium) to any page for your SvelteKit apps.

This package originally was created for Next.js by [@upstash](https://github.com/upstash/claps)

Nothing to maintain, it is completely serverless 💯

Check out the [demo](https://www.farukoruc.com/claps-demo)






https://user-images.githubusercontent.com/22038798/188115038-c1edd555-7b9f-4175-bb07-a4531bea8386.mp4





## Installation

### 1 Create Database

Create a free Redis database at [Upstash Console](https://console.upstash.com)

> We will use [Upstash Redis](https://upstash.com) to keep the data as well as
> messaging (Redis pub/sub).

### 2. Environment Variables

Copy the `.env.local.example` file to `.env.local` (which will be ignored by
Git):

```bash
cp .env.local.example .env.local
```

> `VITE_UPSTASH_URL` and `VITE_UPSTASH_TOKEN` can be found at the
> database details page in Upstash Console.

### 3. Install Package

```bash
npm install --save svelte-claps
# or
yarn add svelte-claps
```

### 4. Setup API

Create a new API endpoint for SvelteKit app. Import the package and expose the
`GET` and `PATCH` methods.

```ts
// src/routes/api/claps.js

import createClapsApi from 'svelte-claps';

export const { GET, PATCH } = createClapsApi({ maxClaps: 10 });
```

### 5. Use `<Claps />` Component

```svelte
<script lang="ts">
	import { Claps } from 'svelte-claps';
</script>

<div class="container">
	<Claps replyUrl="https://twitter.com/bufgix_" />
</div>

```

The options can be passed as React props

| key           | type                        | default           |
| ------------- | --------------------------- |-------------------|
| `key?`        | `string`                    | current page path |
| `fixed?`      | `"left", "center", "right"` |                   |
| `replyUrl?`   | `string`                    |                   |
| `apiPath?`    | `string`                    | `/api/claps`      |

> pathname of the page is being used as the key/identity to keep the claps count. You
> can override this giving the `key` attribute.

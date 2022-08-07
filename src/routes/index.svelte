<script lang="ts">
	import Claps from '$lib/components/Claps.svelte';
</script>

<div class="root">
	<div class="container">
		<h1>svelte-claps</h1>
		<Claps class="claps" key="demo-page" replyUrl="https://twitter.com/bufgix_" />
	</div>
</div>

<style global>
	body {
		margin: 0;
	}

	.root {
		background: #1f1f1f;
		height: 100vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		color: white;
		font-family: sans-serif;
	}

	.container {
		width: 400px;
		max-width: 600px;
	}
</style>

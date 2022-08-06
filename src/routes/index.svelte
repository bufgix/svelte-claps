<script lang="ts">
	import Claps from '$lib/components/Claps.svelte';
</script>

<div class="container">
	<Claps replyUrl="https://twitter.com/bufgix_" />
</div>

<style global>
	body {
		margin: 0;
	}

	.container {
		background: #1f1f1f;
		height: 100vh;
		display: flex;
		justify-content: center;
		align-items: center;
	}
</style>

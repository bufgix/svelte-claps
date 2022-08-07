<script lang="ts">
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import _ from 'lodash';
	import TheIcons from '$lib/components/TheIcons.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import Loading from './Loading.svelte';
	import { page } from '$app/stores';
	import type { ClapsResponse } from '$lib/types';

	// props
	export let fixed: 'left' | 'center' | 'right' | 'default' = 'default';
	export let replyUrl = '';
	export let shareButton = false;
	export let apiPath = `/api/claps`;
	export let key = $page.url.pathname;

	enum ReactionClass {
		default = '',
		reject = 'headShake animated',
		success = 'heartBeat animated'
	}

	// data
	let cache = 0;
	let data: ClapsResponse | null = null;
	let loading = true;
	let reactionClass = ReactionClass.default;

	onMount(() => {
		getData();
	});

	// functions
	const getData = async () => {
		loading = true;
		try {
			const response = await fetch(`${apiPath}?key=${key}`, {
				method: 'GET'
			});
			if (!response.ok) return;
			data = await response.json();
		} catch (error) {
			console.error(error);
		} finally {
			loading = false;
		}
	};

	const onClapSave = _.debounce(async (score: number) => {
		try {
			if (data.userScore >= data.maxClaps) {
				reactionClass = ReactionClass.reject;
				return;
			}
			const response = await fetch(`${apiPath}?key=${key}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ score })
			});

			if (!response.ok) {
				reactionClass = ReactionClass.reject;
				return;
			}
			data = await response.json();

			reactionClass = ReactionClass.success;
		} catch (error) {
			console.error(error);
		} finally {
			cache = 0;
		}
	}, 1e3);

	const onClapClick = () => {
		cache = data.maxClaps === cache ? cache : cache + 1;
		onClapSave(cache);
	};

	// reactive
	$: fixedRootClass = fixed !== 'default' && `claps-fixed claps-fixed-${fixed}`;
	$: score = data && data.totalScore + cache;

	$: {
		if (reactionClass) {
			setTimeout(() => {
				reactionClass = ReactionClass.default;
			}, 600);
		}
	}
</script>

<div class="claps-root {fixedRootClass}">
	<TheIcons />

	{#if loading}
		<div class="claps-loading">
			<Loading size="30" />
		</div>
	{:else}
		<div class="claps-body {reactionClass}" in:fly={{ y: -20 }}>
			<button class="claps-button claps-button-clap" on:click={onClapClick}>
				<Icon name={data.userScore ? `icon-claps-fill` : `icon-claps`} size="24" color="black" />
				{#if data}
					{#key score}
						<span class="claps-button-text" in:fly={{ y: -20 }}>
							{score}
						</span>
					{/key}
				{/if}
			</button>

			{#if replyUrl}
				<span class="claps-divider" />
				<a href={replyUrl} class="claps-button claps-button-reply">
					<Icon name="icon-reply" size="24" color="black" />
				</a>
			{/if}

			{#if shareButton}
				<span class="claps-divider" />
				<button class="claps-button claps-button-share">
					<Icon name="icon-dots" size="24" color="black" />
				</button>
			{/if}
		</div>
	{/if}
</div>

<style>
	.claps-root {
		--animate-duration: 600ms;
		--transition: 120ms;

		-webkit-text-size-adjust: 100%;
		-webkit-font-smoothing: antialiased;
		text-rendering: optimizeLegibility;
		-moz-osx-font-smoothing: grayscale;

		display: flex;
		position: relative;
		z-index: 1;
		font-size: 15px;
		line-height: 1;
		user-select: none;
		font-family: sans-serif;
	}

	.claps-root * {
		box-sizing: border-box;
		transition: var(--transition);
	}

	.claps-fixed {
		position: fixed;
		bottom: 1rem;
		z-index: 10;
	}

	.claps-fixed-left {
		left: 1rem;
	}

	.claps-fixed-center {
		left: 50%;
		transform: translateX(-50%);
	}

	.claps-fixed-right {
		right: 1rem;
	}

	.claps-body {
		display: flex;
		align-items: center;
		gap: 1px;
		padding: 2px;
		color: #000;
		background-color: #fff;
		border-radius: 40px;

		filter: drop-shadow(0 1px 1px rgb(0 0 0 / 10%));
	}

	.claps-fixed .claps-body {
		filter: drop-shadow(0 4px 8px rgb(0 0 0 / 14%)) drop-shadow(0 1px 2px rgb(0 0 0 / 6%));
	}

	.claps-divider {
		display: block;
		width: 1px;
		height: 1.1em;
		background-color: rgb(0 0 0 / 10%);
	}

	.claps-loading {
		padding: 0.5rem;
		background: #ffffff;
		border-radius: 100%;
		filter: drop-shadow(0 4px 8px rgb(0 0 0 / 14%)) drop-shadow(0 1px 2px rgb(0 0 0 / 6%));
	}

	.claps-button {
		cursor: pointer;
		border: 0;
		padding: 8px 12px;
		display: flex;
		align-items: center;
		gap: 0.3em;
		font: inherit;
		background-color: transparent;
		border-radius: 6px;
		text-decoration: none;
		color: inherit;
	}

	.claps-button:first-child {
		border-top-left-radius: inherit;
		border-bottom-left-radius: inherit;
	}

	.claps-button:last-child {
		border-top-right-radius: inherit;
		border-bottom-right-radius: inherit;
	}

	.claps-button:hover {
		background-color: rgb(0 0 0 / 5%);
	}

	.claps-body:hover .claps-divider {
		background-color: transparent;
	}

	.claps-button :global(svg) {
		color: rgb(0 0 0 / 80%);
	}

	.claps-button:hover :global(svg) {
		color: rgb(0 0 0 / 100%);
	}

	.claps-button-clap.clapped :global(svg) {
		color: rgb(0 0 0 / 100%);
	}

	.claps-share-header :global(svg) {
		font-size: 1.4rem;
		font-weight: bold;
	}

	.claps-share-button:hover .claps-share-button-icon {
		background-color: rgb(0 0 0 / 10%);
	}

	/* https://github.com/animate-css/animate.css */

	:global(.animated) {
		animation-duration: var(--animate-duration);
		animation-fill-mode: both;
	}

	@keyframes headShake {
		0% {
			transform: translateX(0);
		}
		6.5% {
			transform: translateX(-6px) rotateY(-9deg);
		}
		18.5% {
			transform: translateX(5px) rotateY(7deg);
		}
		31.5% {
			transform: translateX(-3px) rotateY(-5deg);
		}
		43.5% {
			transform: translateX(2px) rotateY(3deg);
		}
		50% {
			transform: translateX(0);
		}
	}

	.headShake {
		animation-timing-function: ease-in-out;
		animation-name: headShake;
	}

	@keyframes heartBeat {
		0% {
			transform: scale(1);
		}
		14% {
			transform: scale(1.1);
		}
		28% {
			transform: scale(1);
		}
		42% {
			transform: scale(1.1);
		}
		70% {
			transform: scale(1);
		}
	}

	.heartBeat {
		animation-name: heartBeat;
		animation-duration: calc(var(--animate-duration) * 1.3);
		animation-timing-function: ease-in-out;
	}
</style>

<script lang="ts">
	import data from "./data";
	import PodcastDisplay from "./podcastDisplay.svelte";
</script>

<div class="content">
	{#each data as podcast}
		<PodcastDisplay {podcast} />
	{/each}
</div>

<style>
	.content {
		display: flex;
		flex-direction: column;
		color: aliceblue;
	}
</style>

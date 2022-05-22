<script lang="ts">
	import podcasts from "./data";
	import data from "./data";
	import PodcastDisplay from "./podcastDisplay.svelte";
</script>

<div class="content">
	<div class="main-title">
		Here's the movies we also watched while we were attempting to watch
		imdb's top 50-100 movies.
	</div>
	<div class="podcasts">
		<div class="bonus-films">
			<div class="podcast-category">Bonus films</div>
			{#each data as podcast}
				{#if podcast.episode === 0}
					<PodcastDisplay {podcast} />
				{/if}
			{/each}
		</div>
		<div class="imdb-films">
			<div class="podcast-category">Imdb listed</div>
			{#each data as podcast}
				{#if podcast.episode > 0}
					<PodcastDisplay {podcast} />
				{/if}
			{/each}
		</div>
	</div>
</div>

<style>
	.main-title {
		font-size: 24px;
	}
	.details {
		font-size: medium;
	}
	.podcast-category {
		text-decoration: underline;
		padding-top: 12px;
		color: #4c8a55;
		font-size: 34px;
	}
	.podcasts {
		display: flex;
		justify-content: space-around;
		width: 100%;
	}
	.imdb-films {
		display: flex;
		flex-direction: column;
	}
	.bonus-films {
		display: flex;
		flex-direction: column;
	}
	.content {
		display: flex;
		flex-direction: column;
		color: aliceblue;
	}
</style>

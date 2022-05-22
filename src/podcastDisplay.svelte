<script lang="ts">
    import type Podcast from "./podcast";
    export let podcast: Podcast;
</script>

<div class="content" />
<div class="pc-title">
    {#if podcast.episode > 0}
        {`${podcast.episode}: ${podcast.title}`}
    {:else}
        {`${podcast.title}`}
    {/if}
</div>

<style>
    .content {
        display: flex;
        font-size: 16px;
        font-size: 3.2vw;
    }
    .pc-title {
        color: #fff;
        padding-top: 4px;
        padding-bottom: 500px;
    }
</style>

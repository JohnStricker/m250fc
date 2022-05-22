<script lang="ts">
    import type Podcast from "./podcast";
    export let podcast: Podcast;
</script>

<div class="content" />
<div class="pc-title">
    {#if !podcast.bonus}
        {`${podcast.episode}: ${podcast.title}`}
    {:else}
        {`${podcast.title}`}
    {/if}
</div>

<style>
    .content {
        display: flex;
    }
    .pc-title {
        color: #fff;
    }
    .audio {
    }
</style>

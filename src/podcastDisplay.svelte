<script lang="ts">
    import type Podcast from "./podcast";
    export let podcast: Podcast;
</script>

<div class="content" />
<div class="title">
    {`${podcast.episode}: ${podcast.title}`}
</div>

<style>
    .content {
        display: flex;
    }
    .title {
    }
    .audio {
    }
</style>

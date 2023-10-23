<script>
  import {
    Page,
    Navbar,
    List,
    ListItem,
    Card as Cardd,
    Block,
    Searchbar,
    SkeletonBlock,
    BlockFooter,
  } from "framework7-svelte";
  import axios from "axios";
  import { v4 } from "uuid";
  import { config } from "../js/init";
  import Card from "../components/card.svelte";

  let q;
  let results = [];
  let loading;
  let error = "search across all posts";
  let processed;
  async function search() {
    processed = false;
    error = "";
    loading = true;
    await axios
      .get(`${config.api}/api/search?q=${q}`)
      .then((res) => {
        results = [];
        let data = res.data;
        console.log(data);
        data["data"].forEach((e) => {
          results = [e, ...results];
        });
        loading = false;
      })
      .catch((a) => {
        if (a.code == "ERR_BAD_REQUEST") {
          error = a.response.data.m;
          // f7.toast
          //   .create({
          //     text: error,
          //     closeTimeout: 2000,
          //   })
          //   .open();
        }
      });
    processed = true;
  }
</script>

<Page name="Search">
  <Navbar title="Search" />
  <Searchbar
    onInput={() => {
      processed = false;
    }}
    bind:value={q}
    onChange={search}
    disableButtonText="Cancel"
    placeholder="Search"
    clearButton={true}
  />
  <Block>
    {#if processed && results.length == 0 && !error}
      <div class="truncate opacity-80">
        no result for '{q}'
      </div>
    {/if}
    {#if error}
      <BlockFooter>
        {error}
      </BlockFooter>
    {/if}
    {#if loading && !error && !processed}
      <Cardd style="padding: 20px;">
        <SkeletonBlock
          class="skeleton-effect-wave"
          style="width: 100%; height: 20px; border-radius: 20px"
        />
        <br />
        <SkeletonBlock
          class="skeleton-effect-wave"
          style="width: 70%; height: 20px; border-radius: 20px"
        />
      </Cardd>
      <Cardd style="padding: 20px;">
        <SkeletonBlock
          class="skeleton-effect-wave"
          style="width: 80%; height: 20px; border-radius: 20px"
        />
        <br />
        <SkeletonBlock
          class="skeleton-effect-wave"
          style="width: 90%; height: 20px; border-radius: 20px"
        />
      </Cardd>
    {/if}
    {#if !loading && processed}
      {#each results as f (v4())}
        <Card {f} />
      {/each}
    {/if}
  </Block>
</Page>

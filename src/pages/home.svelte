<script>
  export let f7router;
  import {
    Page,
    Link,
    Block,
    Card as Cardd,
    List,
    ListItem,
    Button,
    Popover,
    Icon,
    Fab,
    SkeletonBlock,
    BlockFooter,
  } from "framework7-svelte";
  import { db, loggedin, user } from "../js/gun";
  import axios from "axios";
  import Card from "../components/card.svelte";
  import { v4 } from "uuid";

  let sel = "city";
  let sortbytime = "asc";
  let loc = {
    state: "city",
    country: "country",
  };
  let feed = [];
  let popoverOpened;

  async function fetchh(node) {
    console.log("loading ", node);
    await db
      .get("#" + node)
      .once((a, b) => {
        if (a) {
          delete a._;
          Object.entries(a).forEach((a) => {
            try {
              let data = new Object(JSON.parse(a[1]));
              if (
                data.hasOwnProperty("uid") &&
                data.hasOwnProperty("time") &&
                data.hasOwnProperty("heading")
              ) {
                feed = [
                  {
                    heading: data.heading,
                    time: data.time,
                    desc: data.desc,
                    uid: data.uid,
                    images: data.images || {},
                  },
                  ...feed,
                ];
              }
            } catch (error) {}
          });
        } else {
          console.log("ok");
        }
      })
      .then(() => {
        process();
      });
  }

  async function load() {
    popoverOpened = false;
    console.log("starting load");
    if (loc) {
      if (sel == "city") {
        fetchh(loc.state);
      } else if (sel == "country") {
        fetchh(loc.country);
      } else {
        fetchh("world");
      }
    }
  }

  function process() {
    feed = feed.filter((object, index) => {
      const found = feed.findIndex((obj) => obj.uid === object.uid);
      return found === index;
    });
    feed.sort((b, a) => {
      if (sortbytime == "asc") {
        return new String(a.time).localeCompare(b.time);
      } else if (sortbytime == "des") {
        return new String(b.time).localeCompare(a.time);
      }
    });
  }

  import { Geolocation } from "@capacitor/geolocation";
  import { config } from "../js/init";
  loggedin.subscribe(async (a) => {
    if (a == true) {
      let options = {
        pub: user.is.pub,
      };

      try {
        const coordinates = await Geolocation.getCurrentPosition();
        if (coordinates) {
          options["lat"] = coordinates.coords.latitude;
          options["long"] = coordinates.coords.longitude;
        }
      } catch (error) {}

      await axios
        .post(config.api + "/api/geo", options)
        .then(async function (response) {
          console.log(response.data);
          loc = response.data;
          fetchh(loc.state);
          if (loc) {
            localStorage.setItem("loc", JSON.stringify(loc));
            load();
          }
        })
        .catch((e) => {
          if (localStorage.getItem("loc")) {
            loc = JSON.parse(localStorage.getItem("loc"));
          }
          load();
        });
    }
  });

  $: sel, load();
  $: sortbytime, process();
  // $: feed, process();

  async function sleep(t) {
    return new Promise((r) => {
      setTimeout(() => {
        r();
      }, t);
    });
  }

</script>

<Page
  ptr
  ptrMousewheel={true}
  onPtrRefresh={(done) => {
    load();
    done();
  }}
  name="home"
>
  <Block style="display: flex;">
    <div style="width: {sel == 'country' ? 'auto' : '20'}vw;">
      <Button fill round small popoverOpen=".popover-menu">
        {#if sel == "city"}
          {loc.state}
        {:else if sel == "country"}
          {loc.country}
        {:else}
          world
        {/if}</Button
      >
    </div>
    <div style="width: 20vw;">
      <Button round small popoverOpen=".popover-menusorttime"
        >{sortbytime == "asc" ? "latest" : "old"}</Button
      >
    </div>
  </Block>
  <Popover
    bind:opened={popoverOpened}
    class="popover-menu"
    style="width: 50vw;"
  >
    <List>
      <ListItem
        onClick={() => {
          sel = "city";
        }}
        title={loc.state}
      />
      <ListItem
        onClick={() => {
          sel = "country";
        }}
        title={loc.country}
      />
      <ListItem
        onClick={() => {
          sel = "world";
        }}
        title="World"
      />
    </List>
  </Popover>

  <Popover class="popover-menusorttime" style="width: 50vw;">
    <List>
      <ListItem
        onClick={() => {
          sortbytime = "asc";
        }}
        popoverClose
        title="latest"
      />
      <ListItem
        onClick={() => {
          sortbytime = "des";
        }}
        popoverClose
        title="old"
      />
    </List>
  </Popover>

  <Fab
    onClick={() => {
      f7router.navigate("/write");
    }}
    position="right-bottom"
  >
    <Icon f7="pencil" size="25" />
  </Fab>
  {#if feed.length == 0 && $loggedin}
    {#await sleep(3000)}
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
    {:then a}
      <BlockFooter>BIG NEWS! WE'RE OUT OF IT!!!</BlockFooter>
    {/await}
  {/if}
  {#each feed as f (v4())}
    <Card {f} />
  {/each}
</Page>

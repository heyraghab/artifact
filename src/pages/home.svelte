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
  import { db, loggedin } from "../js/gun";
  import axios from "axios";
  import Card from "../components/card.svelte";
  import { v4 } from "uuid";

  let sel = "city";
  let sortbytime = "asc";
  let loc;
  let feed = [];

  async function fetchh(node) {
    console.warn(`loading ${node}`);
    await db
      .get("#" + node)
      .once((a, b) => {
        console.log(a);
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
                  },
                  ...feed,
                ];
              }
            } catch (error) {}
          });
        }
      })
      .then(() => {
        process();
      });
  }

  async function load() {
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
    console.log(feed);
  }

  import { Geolocation } from "@capacitor/geolocation";
  import { config } from "../js/init";
  loggedin.subscribe(async (a) => {
    if (a == true) {
      const coordinates = await Geolocation.getCurrentPosition();

      axios
        .post(config.api + "/api/geo", {
          lat: coordinates.coords.latitude,
          long: coordinates.coords.longitude,
        })
        .then(async function (response) {
          loc = response.data["address"];
          console.log(loc);
          if (loc) {
            localStorage.setItem("loc", JSON.stringify(loc));
            load();
          }
        })
        .catch((e) => {
          console.log("error fetching location");
          console.log(e);
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
    <div style="width: {sel == 'country' ? '28' : '20'}vw;">
      <Button fill round small popoverOpen=".popover-menu">{sel}</Button>
    </div>
    <div style="width: 20vw;">
      <Button round small popoverOpen=".popover-menusorttime"
        >{sortbytime == "asc" ? "latest" : "old"}</Button
      >
    </div>
  </Block>
  <Popover class="popover-menu" style="width: 50vw;">
    <List>
      <ListItem
        onClick={() => {
          sel = "city";
        }}
        popoverClose
        title="Your City"
      />
      <ListItem
        onClick={() => {
          sel = "country";
        }}
        popoverClose
        title="Your Country"
      />
      <ListItem
        onClick={() => {
          sel = "world";
        }}
        popoverClose
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

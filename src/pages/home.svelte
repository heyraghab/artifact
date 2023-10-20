<script>
  export let f7router;
  import {
    Page,
    Link,
    Block,
    List,
    ListItem,
    Button,
    Popover,
    Icon,
    Fab,
  } from "framework7-svelte";
  import { db } from "../js/gun";
  import axios from "axios";
  import Card from "../components/card.svelte";

  let sel = "city";
  let loc;
  let feed = [];

  axios
    .get("https://ipapi.co/json/")
    .then(async function (response) {
      loc = response.data;
      if (loc) {
        localStorage.setItem("loc", JSON.stringify(loc));
        load(() => {});
      }
    })
    .catch((e) => {
      console.log("error fetching location");
      console.log(e);
      if (localStorage.getItem("loc")) {
        loc = JSON.parse(localStorage.getItem("loc"));
      }
      load(() => {});
    });

  async function fetchh(node) {
    db.get("#" + node).once((a, b) => {
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
    });
  }

  async function load(done) {
    if (loc) {
      if (sel == "city") {
        fetchh(loc.city);
      } else if (sel == "country") {
        fetchh(loc.country);
      } else {
        fetchh("world");
      }
    }
    done();
  }

  let sortbytime = "asc";
  function process() {
    console.log(feed);
    feed = feed.filter((object, index) => {
      const found = feed.findIndex((obj) => obj.heading === object.heading);
      return found === index;
    });
    feed = feed.sort((b, a) => {
      if (sortbytime == "asc") {
        return new String(a.time).localeCompare(b.time);
      } else if (sortbytime == "des") {
        return new String(b.time).localeCompare(a.time);
      }
    });
    console.log(feed);
  }

  function update() {
    load(() => {});
  }

  function updatesort() {
    process();
  }

  $: sel, update();
  $: sortbytime, updatesort();
  $: feed, process();
</script>

<Page ptr ptrMousewheel={true} onPtrRefresh={load} name="home">
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
    <Icon f7="square_pencil" />
  </Fab>
  {#each feed as f}
    <Card {f} />
  {/each}
</Page>

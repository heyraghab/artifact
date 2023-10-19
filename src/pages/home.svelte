<script>
  import {
    Page,
    Link,
    Toolbar,
    Block,
    BlockTitle,
    List,
    ListItem,
    Button,
    Popover,
    CardHeader,
    CardContent,
    CardFooter,
    Icon,
    Fab,
  } from "framework7-svelte";
  import { db } from "../js/gun";
  import axios from "axios";
  import Card from "../components/card.svelte";

  let sel = "country";

  let loc = {
    city: "New Delhi",
    country: "India",
  };
  let feed = [];

  function load(done) {
    if (sel == "city") {
      db.get("#" + loc.city).map((a, b) => {
        let data = JSON.parse(a);
        if (data.uid) {
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
      });
    } else if (sel == "country") {
      db.get("#" + loc.country).map((a) => {
        if (a) {
          let data = JSON.parse(a);
          if (
            data.heading !== "undefined" &&
            data.time &&
            data.desc !== "undefined"
          ) {
            feed = [
              {
                heading: data.heading,
                time: data.time,
                desc: data.desc,
              },
              ...feed,
            ];
          }
        }
      });
    } else {
      db.get("#world").map((a) => {
        if (a) {
          let data = JSON.parse(a);
          if (
            data.heading !== "undefined" &&
            data.time &&
            data.desc !== "undefined"
          ) {
            feed = [
              {
                heading: data.heading,
                time: data.time,
                desc: data.desc,
              },
              ...feed,
            ];
          }
        }
      });
    }
    done();
  }

  // axios
  //   .get("https://api.ipapi.is/?key=64bedbf80e6a4a7f")
  //   .then(async function (response) {
  //     // handle success
  //     loc = response.data["location"];
  //     load(() => {});
  //   });

  let sortbytime = "asc";
  function process() {
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
  }

  function update() {
    feed = [];
    load(() => {});
  }

  let render = true;
  function updatesort() {
    process();
    render = false;
    setInterval(() => {
      render = true;
    }, 100);
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

  <Fab position="right-bottom">
    <Link color="white" tabLink="#view-write" href="/write/">
      <Icon f7="square_pencil" />
    </Link>
  </Fab>

  {#if render}
    {#each feed as f}
      <Card {f} />
    {/each}
  {/if}
</Page>

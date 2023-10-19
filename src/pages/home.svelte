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
    Card,
    CardHeader,
    CardContent,
    CardFooter,
    Icon,
    Fab,
  } from "framework7-svelte";
  import { db } from "../js/gun";
  import axios from "axios";
  let sel = "city";

  let loc;
  let feed = [];

  function load(done) {
    if (sel == "city") {
      db.get("#" + loc.city).map((a) => {
        let data = JSON.parse(a);
        console.log(data);
        feed = [
          {
            heading: data.heading,
            time: data.time,
            desc: data.desc,
          },
          ...feed,
        ];
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
            console.log(data);
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
            console.log(data);
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

  axios
    .get("https://api.ipapi.is/?key=64bedbf80e6a4a7f")
    .then(async function (response) {
      // handle success
      loc = response.data["location"];
      console.log(loc);
      load(() => {});
    });

  function process() {
    feed = feed.filter((object, index) => {
      const found = feed.findIndex((obj) => obj.heading === object.heading);
      return found === index;
    });
    feed = feed.sort((a, b) => {
      return new Date(a.time) - new Date(b.time);
    });
  }

  $: feed, process();
</script>

<Page ptr ptrMousewheel={true} onPtrRefresh={load} name="home">
  <Block>
    <div style="width: 20vw;">
      <Button fill round small popoverOpen=".popover-menu">{sel}</Button>
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

  <Fab position="right-bottom">
    <Link color="white" tabLink="#view-write" href="/write/">
      <Icon f7="square_pencil" />
    </Link>
  </Fab>

  {#each feed as f}
    <Card outlineMd class="demo-card-header-pic">
      <CardHeader valign="bottom">
        <div style="font-size: large;">
          {f.heading}
        </div>
      </CardHeader>
      <CardContent>
        {f.desc}
      </CardContent>
      <CardFooter>
        <Link>
          <Icon f7="arrow_up" size="20" />
        </Link>
        <Link>
          <Icon f7="captions_bubble_fill" size="20" />
        </Link>
      </CardFooter>
    </Card>
  {/each}
</Page>

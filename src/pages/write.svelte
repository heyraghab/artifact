<script>
  import { Geolocation } from "@capacitor/geolocation";
  export let f7router;
  import {
    Block,
    BlockHeader,
    Button,
    Icon,
    Input,
    List,
    ListIndex,
    ListInput,
    ListItem,
    Navbar,
    Page,
    Progressbar,
  } from "framework7-svelte";

  let heading = "",
    desc = "";
  import { db, user } from "../js/gun";
  import axios from "axios";
  let processing = false;
  let loc;
  import { config } from "../js/init";
  import { v4 as uuidv4 } from "uuid";

  async function post() {
    processing = true;
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

    axios
      .post(config.api + "/api/geo", options)
      .then(async function (response) {
        loc = response.data;
        localStorage.setItem("loc", JSON.stringify(loc));
      })
      .catch((e) => {
        console.log(e);
        if (localStorage.getItem("loc")) {
          loc = JSON.parse(localStorage.getItem("loc"));
        }
      })
      .finally(async (e) => {
        let uidd = await uuidv4().split("-").join("");
        let data = {
          heading: heading,
          desc: desc,
          time: Math.floor(new Date().getTime() / 1000),
          uid: uidd,
        };
        data = JSON.stringify(data);
        var hash = await SEA.work(data, null, null, {
          name: "SHA-256",
        });
        console.log(loc);
        db.get(`#${loc.state}`).get(hash).put(data);
        db.get(`#${loc.country}`).get(hash).put(data);
        db.get(`#world`).get(hash).put(data);
        user
          .get("posts")
          .get(Math.floor(new Date().getTime() / 1000))
          .put(data);

        await axios.get(config.api + "/api/cache?pub=" + user.is.pub);
        await axios.post(config.api + "/api/submit", {
          heading: heading,
          content: desc,
          pub: user.is.pub || "",
          uid: uidd,
        });
        processing = false;
        f7router.back();
      });
  }
  let disabledd;
  function prcess() {
    if (heading == "" || desc == "") {
      disabledd = true;
    } else {
      disabledd = false;
    }
  }

  $: heading || desc, prcess();

  async function pickFile() {}
</script>

<Navbar title="write" backLink=" " backLinkUrl="/" />
<Page>
  <List>
    <!-- <ListItem>
      <div>
        <Button outline round onClick={pickFile}>
          <Icon f7="plus" size="24" />
        </Button>
      </div>
    </ListItem> -->
    <ListInput
      bind:value={heading}
      label="Headline"
      type="text"
      placeholder="Add Title"
      clearButton
    />
    <ListInput
      bind:value={desc}
      label="Description"
      type="text"
      resizable
      placeholder="Add Context"
      clearButton
    />
    {#if processing}
      <BlockHeader>
        <Progressbar infinite />
      </BlockHeader>
    {/if}
    <Button
      disabled={processing | disabledd}
      style="width: 20vw;margin: 10px;"
      onClick={post}
      fill
      round
      small
    >
      Post
    </Button>
  </List>
</Page>

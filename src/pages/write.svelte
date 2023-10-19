<script>
    export let f7router;
    import {
        Block,
        BlockHeader,
        Button,
        Input,
        List,
        ListIndex,
        ListInput,
        Navbar,
        Page,
        Progressbar,
    } from "framework7-svelte";

    let heading = "",
        desc = "";
    import { db, user } from "../js/gun";
    import axios from "axios";
    let processing = false;
    let loc = {
        city: "Delhi",
        country: "India",
    };

    import { v4 as uuidv4 } from "uuid";
    async function post() {
        processing = true;
        axios
            .get("https://api.ipapi.is/?key=64bedbf80e6a4a7f")
            .then(async function (response) {
                // handle success
                loc = response.data["location"];
                let data = {
                    heading: heading,
                    desc: desc,
                    time: Math.floor(new Date().getTime() / 1000),
                    uid: await uuidv4().split('-').join(''),
                };
                data = JSON.stringify(data);
                var hash = await SEA.work(data, null, null, {
                    name: "SHA-256",
                });
                db.get(`#${loc.city}`).get(hash).put(data);
                db.get(`#${loc.country}`).get(hash).put(data);
                db.get(`#world`).get(hash).put(data);
                user.get("posts")
                    .get(Math.floor(new Date().getTime() / 1000))
                    .put(data);
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
</script>

<Navbar title="write" backLink=" " backLinkUrl="/" />
<Page>
    <List>
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

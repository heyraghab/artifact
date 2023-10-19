<script>
    import {
        Card,
        CardContent,
        CardFooter,
        CardHeader,
        Icon,
        f7,
        Link,
    } from "framework7-svelte";
    import { onMount } from "svelte";
    import { db, user } from "../js/gun";
    export let f;

    let vote = [];
    let voted = false;
    onMount(() => {
        db.get("upvotes")
            .get(`#${f.uid}`)
            .map((a) => {
                try {
                    if (JSON.parse(a).pub == user.is.pub) {
                        voted = true;
                    }
                    vote = [...vote, JSON.parse(a)];
                    console.log(vote);
                } catch (error) {
                    console.log(error);
                }
            });
    });

    let upvote = async () => {
        if (!voted) {
            let data = {
                pub: user.is.pub,
                vote: "up",
            };
            data = JSON.stringify(data);
            var hash = await SEA.work(data, null, null, {
                name: "SHA-256",
            });
            await db
                .get(`upvotes`)
                .get(`#${f.uid}`)
                .get(hash)
                .put(data, (a) => {});
            voted = true;
        }
    };

    function process() {
        vote = vote.filter((object, index) => {
            const found = vote.findIndex((obj) => obj.pub === object.pub);
            return found === index;
        });
    }

    $: vote, process();
</script>

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
        {#if voted}
            <Link
                color="red"
                onClick={() => {
                    f7.toast
                        .create({
                            text: 'already voted',
                            position: "bottom",
                            closeTimeout: 1000,
                        })
                        .open();
                }}
            >
                <Icon f7="arrow_up" size="20" />
                {vote.length}
            </Link>
        {:else}
            <Link onClick={upvote}>
                <Icon f7="arrow_up" size="20" />
                {vote.length}
            </Link>
        {/if}
        <Link>
            <Icon f7="captions_bubble_fill" size="20" />
        </Link>
    </CardFooter>
</Card>

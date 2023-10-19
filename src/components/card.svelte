<script>
    import {
        Card,
        CardContent,
        CardFooter,
        CardHeader,
        Icon,
        f7,
        Link,
        Popup,
        Page,
        Block,
        Navbar,
        NavRight,
        ListItem,
        List,
        SkeletonBlock,
        Messagebar,
    } from "framework7-svelte";
    import { onMount } from "svelte";
    import { db, user } from "../js/gun";
    export let f;
    let commentsopened = false;

    let vote = [];
    let voted = false;
    let upvoltes_graph = db.get("upvotes").get(`#${f.uid}`);
    onMount(() => {
        upvoltes_graph.map((a) => {
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
            upvoltes_graph.get(hash).put(data, (a) => {});
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

    let comment = [];
    let loadingcomments = true,
        messageText;
    let comments_graph = db.get("comments").get(`#${f.uid}`);

    function processcomments() {
        comment = comment.filter((object, index) => {
            const found = comment.findIndex((obj) => obj.uid == object.uid);
            return found === index;
        });
    }
    $: comment, processcomments();

    function loadcomments() {
        comments_graph.map(async (a) => {
            try {
                a = JSON.parse(a);
                comment = [a, ...comment];
            } catch (error) {
                console.log(error);
            }
        });
        loadingcomments = false;
    }
    import { v4 } from "uuid";
    async function sendMessage() {
        if (messageText) {
            console.log(messageText);
            let data = {
                comment: messageText,
                uid: v4().split("-").join(""),
                time: Math.floor(new Date().getTime() / 1000),
            };
            data = JSON.stringify(data);
            var hash = await SEA.work(data, null, null, {
                name: "SHA-256",
            });
            comments_graph.get(hash).put(data, (a) => {
                console.log(a);
            });
            messageText = "";
        }
    }

    async function upvotecomment(uid) {
        let data = {
            pub: user.is.pub,
            vote: "up",
        };
        data = JSON.stringify(data);
        var hash = await SEA.work(data, null, null, {
            name: "SHA-256",
        });
        db.get("commentupvotes")
            .get(`#${uid}`)
            .get(hash)
            .put(data, (a) => {
                console.log("ok");
            });
        voted = true;
    }
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
                            text: "already voted",
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
        <Link
            onClick={() => {
                commentsopened = true;
            }}
        >
            <Icon f7="captions_bubble_fill" size="20" />
        </Link>
    </CardFooter>
</Card>

<Popup
    class="demo-popup"
    opened={commentsopened}
    onPopupOpened={() => {
        commentsopened = true;
        loadcomments();
    }}
    onPopupClosed={() => {
        commentsopened = false;
    }}
>
    <Page>
        <Navbar title={f.heading}>
            <NavRight>
                <Link popupClose>Close</Link>
            </NavRight>
        </Navbar>
        <Block>
            {#if !loadingcomments}
                {#each comment as f}
                    <Card style="padding: 10px;">
                        <div style="display: flex;">
                            <!-- svelte-ignore missing-declaration -->
                            <!-- svelte-ignore a11y-click-events-have-key-events -->
                            <!-- svelte-ignore a11y-no-static-element-interactions -->
                            <div
                                on:click={() => {
                                    upvotecomment(f.uid);
                                }}
                                style="margin: 10px;"
                            >
                                <Icon f7="arrow_up" color="blue" size="15" />
                            </div>
                            <div
                                style="display: flex;justify-items: center;align-items: center;"
                            >
                                {f.comment}
                            </div>
                        </div>
                    </Card>
                {/each}
            {:else}
                <Card style="padding: 20px;">
                    <SkeletonBlock
                        class="skeleton-effect-wave"
                        style="width: 100%; height: 20px; border-radius: 20px"
                    />
                    <br />
                    <SkeletonBlock
                        class="skeleton-effect-wave"
                        style="width: 70%; height: 20px; border-radius: 20px"
                    />
                </Card>
                <Card style="padding: 20px;">
                    <SkeletonBlock
                        class="skeleton-effect-wave"
                        style="width: 80%; height: 20px; border-radius: 20px"
                    />
                    <br />
                    <SkeletonBlock
                        class="skeleton-effect-wave"
                        style="width: 90%; height: 20px; border-radius: 20px"
                    />
                </Card>
            {/if}
        </Block>

        <!-- svelte-ignore a11y-missing-attribute -->
        <Messagebar
            placeholder="Type a comment"
            value={messageText}
            onInput={(e) => (messageText = e.target.value)}
        >
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <!-- svelte-ignore missing-declaration -->
            <a class="link icon-only" slot="inner-end" on:click={sendMessage}>
                <Icon ios="f7:arrow_up_circle_fill" md="material:send" />
            </a>
        </Messagebar>
    </Page>
</Popup>

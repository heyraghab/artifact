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
        SkeletonBlock,
        Messagebar,
        Button,
        BlockFooter,
    } from "framework7-svelte";
    import { db, user } from "../js/gun";
    export let f;

    let vote = [];
    let voted = false;
    let userpub = user.is.pub;
    db.get("upvotes")
        .get(`#${f.uid}`)
        .once((a) => {
            if (a) {
                delete a._;
                Object.entries(a).forEach((a) => {
                    try {
                        a = JSON.parse(a[1]);
                        if (a.pub == userpub) {
                            voted = true;
                        }
                        vote = [...vote, a];
                    } catch (error) {}
                });
            }
        });

    async function upvote() {
        let data = {
            pub: user.is.pub,
            vote: "up",
        };
        data = JSON.stringify(data);
        var hash = await SEA.work(data, null, null, {
            name: "SHA-256",
        });
        await db
            .get("upvotes")
            .get(`#${f.uid}`)
            .get(hash)
            .put(data, (a) => {
                if (a.err) {
                    f7.toast
                        .create({
                            text: a.err,
                            position: "bottom",
                            closeTimeout: 3000,
                        })
                        .open();
                } else {
                }
            });
        voted = true;
        vote = [...vote, data];
    }
    import { v4 } from "uuid";

    let comment = [];
    let messageText;
    let commentsopened = false;

    let comments_graph = db.get("comments").get(`#${f.uid}`);

    function process() {
        comment = comment.filter((object, index) => {
            const found = comment.findIndex(
                (obj) => obj.uid === object.uid || obj.comment == undefined
            );
            return found === index;
        });
        comment.sort((b, a) => {
            return new String(a.time).localeCompare(b.time);
        });
    }

    async function loadcomments() {
        commentsopened = true;
        try {
            await db
                .get("comments")
                .get(`#${f.uid}`)
                .once((a) => {
                    delete a._;
                    Object.entries(a).forEach((c) => {
                        try {
                            console.log(c);
                            let data = JSON.parse(c[1]);
                            if (
                                data.hasOwnProperty("uid") &&
                                data.hasOwnProperty("time") &&
                                data.hasOwnProperty("comment")
                            ) {
                                comment = [...comment, data];
                            }
                        } finally {
                            process();
                        }
                    });
                });
        } catch (error) {
            comment = [];
        }
    }
    async function sendMessage() {
        if (messageText) {
            let data = {
                comment: messageText,
                uid: v4().split("-").join(""),
                time: Math.floor(new Date().getTime() / 1000),
            };
            console.log(data);
            data = JSON.stringify(data);
            var hash = await SEA.work(data, null, null, {
                name: "SHA-256",
            });
            await comments_graph.get(hash).put(data);
            messageText = "";
            loadcomments();
        }
    }
    async function upvotecomment() {}
</script>

<Popup
    class="demo-popup"
    opened={commentsopened}
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
            {#if comment.length > 0}
                {#each comment as f (v4())}
                    <Card style="padding: 10px;">
                        <div style="display: flex;">
                            <Button
                                on:click={() => {
                                    upvotecomment(f.uid);
                                }}
                                style="margin: 10px;"
                            >
                                <Icon f7="person" color="blue" size="15" />
                            </Button>
                            <div
                                style="display: flex;justify-items: center;align-items: center;"
                            >
                                {f.comment}
                            </div>
                        </div>
                    </Card>
                {/each}
            {:else if comment == 0}
                <BlockFooter>Be The First One To Comment</BlockFooter>
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

        <Messagebar
            placeholder="Type a comment"
            value={messageText}
            onInput={(e) => (messageText = e.target.value)}
        >
            <Button
                class="link icon-only"
                slot="inner-end"
                on:click={sendMessage}
            >
                <Icon ios="f7:arrow_up_circle_fill" md="material:send" />
            </Button>
        </Messagebar>
    </Page>
</Popup>
<Card outline>
    <CardHeader style="padding-bottom: 0px;">
        {f.heading}
    </CardHeader>
    <CardContent style="font-size: 13px;padding-top: 10px;">
        {f.desc}
    </CardContent>
    <CardFooter style="font-size: 12px;padding-top: 0px;">
        <Button
            disabled={voted}
            color={voted ? "red" : "blue"}
            small
            on:click={() => {
                if (!voted) {
                    upvote();
                }
            }}
        >
            <Icon f7="arrow_up" size="18" />
            {vote.length}
        </Button>
        <Button onClick={loadcomments}>
            <Icon f7="chat_bubble" size="18" />
        </Button>
    </CardFooter>
</Card>

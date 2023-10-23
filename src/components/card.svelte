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
    PhotoBrowser,
    f7ready,
  } from "framework7-svelte";
  import sanitizeHtml from "sanitize-html";
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
  import News from "./news.svelte";

  let comment = [];
  let messageText;
  let commentsopened = false;

  let comments_graph = db.get("comments").get(`#${f.uid}`);

  function process() {
    comment = comment.filter((object, index) => {
      const found = comment.findIndex(
        (obj) => obj.uid === object.uid || obj.comment == undefined,
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

  let popup;
  let images = [];
  let thumbs = [];
  Object.values(f.images).forEach((e) => {
    images.push({ url: e.url });
    thumbs.push(e.url + "-/preview/500x500/");
  });

  f7ready(() => {
    popup = f7.photoBrowser.create({
      photos: images,
      thumbs: thumbs,
      closeByBackdropClick: true,
    });
  });

  let newsopened = false;
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
      <Button class="link icon-only" slot="inner-end" on:click={sendMessage}>
        <Icon ios="f7:arrow_up_circle_fill" md="material:send" />
      </Button>
    </Messagebar>
  </Page>
</Popup>

<News {images} {thumbs} {popup} {f} bind:opened={newsopened} />

<!--
  CARD COMPONENT
-->

<Card outline>
  <CardHeader style="padding-bottom: 0px;">
    {f.heading}
  </CardHeader>
  <CardContent
    class="line-clamp-2 mb-1"
    style="font-size: 13px;padding-top: 10px;"
  >
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div
      on:click={() => {
        newsopened = true;
      }}
    >
      {@html sanitizeHtml(f.desc || f.content).replace(/href\=\"(.*)\"/)}
    </div>
  </CardContent>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div
    class="flex gap-2 overflow-x-scroll m-2"
    on:click={() => {
      popup.open();
    }}
  >
    {#each thumbs as img (v4())}
      <img
        class="h-28 w-28 object-cover rounded-md aspect-square"
        src={img}
        alt=""
      />
    {/each}
  </div>
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
    <Button rounded onClick={loadcomments}>
      <Icon f7="chat_bubble" size="19" />
    </Button>
  </CardFooter>
</Card>

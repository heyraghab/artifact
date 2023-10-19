<script>
    import {
        Block,
        BlockTitle,
        Card,
        CardContent,
        CardFooter,
        CardHeader,
        Icon,
        Link,
        Navbar,
        Page,
    } from "framework7-svelte";
    import { db, user } from "../js/gun";
    let posts = [];

    function load(done) {
        db.user()
            .get("posts")
            .map((a, b) => {
                a = JSON.parse(a);
                console.log("hua?", a);
                posts = [a, ...posts];
            });
        done();
    }
    load(() => {});

    function process() {
        posts = posts.filter((object, index) => {
            const found = posts.findIndex(
                (obj) => obj.heading === object.heading
            );
            return found === index;
        });
        posts = posts.sort((a, b) => {
            return new Date(a.time) - new Date(b.time);
        });
    }

    $: posts, process();
</script>

<Navbar title="history" />
<Page ptr ptrMousewheel={true} onPtrRefresh={load} name="history">
    <Block>
        {#each posts as f}
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
    </Block>
</Page>

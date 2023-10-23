<script>
  import {
    f7,
    f7ready,
    App,
    Views,
    View,
    Page,
    Toolbar,
    Link,
    Block,
    LoginScreen,
    LoginScreenTitle,
    List,
    ListInput,
    BlockFooter,
    Button,
    Progressbar,
    Icon,
  } from "framework7-svelte";

  let username = "";
  let password = "";

  import { Geolocation } from "@capacitor/geolocation";
  async function setloc() {}

  async function setup() {
    return new Promise(async (resolve, reject) => {
      await Geolocation.checkPermissions().then((a) => {
        if (a.location == "denied" || a.location == "prompt") {
          //not granted
          f7ready(() => {
            f7.dialog.confirm(
              "geographical data required for news!",
              "setup",
              () => {
                //granted
                Geolocation.requestPermissions().then((a) => {
                  if (a.location == "granted") {
                    resolve();
                  } else {
                    setloc();
                    resolve();
                  }
                });
              },
              () => {
                //denied
                f7.dialog.confirm(
                  "allow location for a better experience",
                  "setup",
                  () => {
                    //granted
                    Geolocation.requestPermissions().then((a) => {
                      if (a.location == "granted") {
                        resolve();
                      } else {
                        setloc();
                        resolve();
                      }
                    });
                  },
                  () => {
                    setloc();
                    resolve();
                  }
                );
              }
            );
          });
        } else {
          resolve();
        }
      });
    });
  }
  let loading;
  export let f7router;
  import { db, loggedin, user } from "../js/gun";
  import { Capacitor } from "@capacitor/core";
  import axios from "axios";
  import { onMount } from "svelte";

  async function signIn() {
    if (Capacitor.isNativePlatform()) {
      await setup();
    }
    loading = true;
    user.auth(username, password, (a) => {
      loading = true;
      let txt;
      if (a.err) {
        loading = false;
        txt = a.err;
      } else {
        loading = false;
        txt = "logged in";
        f7router.navigate("/");
        localStorage.setItem("keys", JSON.stringify(a.sea));
      }
      f7.toast
        .create({
          text: txt,
          position: "center",
          closeTimeout: 5000,
        })
        .open();
    });
  }

  async function signUp() {
    if (Capacitor.isNativePlatform()) {
      await setup();
    }
    loading = true;
    db.user().create(username, password, (a) => {
      if (a.err) {
        f7.toast
          .create({
            text: a.err,
            position: "center",
            closeTimeout: 5000,
          })
          .open();
      } else {
        user.auth(username, password, (a) => {
          f7router.navigate("/");
          localStorage.setItem("keys", JSON.stringify(a.sea));
        });
      }
      loading = false;
    });
  }

  if (localStorage.getItem("keys")) {
    loading = true;
    user.auth(JSON.parse(localStorage.getItem("keys")), (a) => {
      if (a.err) {
        f7.toast
          .create({
            text: a.err,
            position: "bottom",
            closeTimeout: 5000,
          })
          .open();
      } else {
        console.log("loggedin through localstorage");
      }
      loading = false;
    });
  }
</script>

<Page loginScreen>
  {#if loading}
    <Block>
      loading...
      <Progressbar infinite />
    </Block>
  {:else}
    <LoginScreenTitle>artifact</LoginScreenTitle>
    <List form>
      <ListInput
        label="Username"
        type="text"
        placeholder="Your username"
        value={username}
        onInput={(e) => (username = e.target.value)}
      />
      <ListInput
        label="Password"
        type="password"
        placeholder="Your password"
        value={password}
        onInput={(e) => (password = e.target.value)}
      />
    </List>
    <Block style="display: flex;justify-content:center;">
      <Button
        disabled={loading}
        style="width: 20vw;"
        round
        fill
        onClick={signIn}>login</Button
      >
      <Button disabled={loading} style="width: 20vw;" round onClick={signUp}
        >signup</Button
      >
    </Block>
    <BlockFooter>
      by registering you agree to our term and conditions
    </BlockFooter>
  {/if}
</Page>

import GUN from 'gun'
import "gun/sea"
import { writable } from 'svelte/store'
export const db = new GUN({
    peers: [
        'http://localhost:8765/gun',
        'https://plankton-app-6qfp3.ondigitalocean.app/gun',
        'https://gun-manhattan.herokuapp.com/gun'
    ],
    localStorage: true,
    radisk: true
})

export const user = db.user().recall({ sessionStorage: true })

export let loggedin = writable(false)
db.on("auth", (a, b, c) => {
    loggedin.set(true)
});
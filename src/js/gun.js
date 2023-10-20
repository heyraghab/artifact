import GUN from 'gun'
import "gun/sea"
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

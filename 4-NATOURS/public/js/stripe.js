/* eslint-disable */
import axios from 'axios'
import { showAlert } from './alerts'
//前端使用公钥
const stripe = Stripe(
    'pk_test_51LdvapATwayfKpSDiXmeSlhJj4ekmwCxoNJn2Rq3qTeZz6TR0S6XOMzUyFomegHqUuNbzN1zxIylUNbU11suIwJr00TItTF562'
)

export const bookTour = async tourId => {
    try {
        // 1 Get session from server(API)
        const session = await axios({
            url: `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`
        })
        console.log(session)
        // 2 Create checkout form + charge credit card
        await stripe.redirectToCheckout({
            sessionId: session.data.session.id
        })
    } catch (err) {
        console.log(err)
        showAlert('error', err)
    }
}

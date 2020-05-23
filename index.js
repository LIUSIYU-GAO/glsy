const functions = require('firebase-functions')
const admin = require("firebase-admin")

admin.initializeApp(functions.config().firebase);

const stripe = require('stripe')('sk_test_6CqZEoh3f38PFTqBJItVLVqa00rN16rda3')

exports.stripeCharge = functions.database
                                .ref(`/payments/{userId}/{paymentId}`)
                                .onWrite(event => {
    
    
    
    const payment = event.data.val();
    const userId = event.params.userId;
    const paymentId = event.params.paymentId;

    
    
    if (!payment || payment.charge) return;

    return admin.database()
                .ref(`/users/${userId}`)
                .once('value')
                .then(snapshot => {
                    return snapshot.val();
                })
                .then(customer => {
                    
                    const amount = payment.amount;
                    const idempotency_key = paymentId;
                    const source = payment.token.id;
                    const currency = 'usd';
                    const charge = {amount, currency, source};

                    
                    return stripe.charges.create(charge, { idempotency_key });
                })
        

                .then(charge => {
                    admin.dagabase()
                         .ref(`/payments/${userId}/${paymentId}/charge`)
                         .set(charge)
                    return null
                })
});

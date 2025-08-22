import React from 'react'
import { BASE_URL } from '../utils/constants'
import axios from 'axios';

const Premium = () => {

    const paymentHandle = async (type)=> {
        try {
            const order = await axios.post(BASE_URL + '/payment/create', 
            { membershipType: type }, 
            { withCredentials: true, }
            );

            const {amount, keyId, currency, notes, orderId} = order.data.data;
            const options = {
                key: keyId, 
                amount, 
                currency,
                name: 'Dev Connect',
                description: 'Connect to other developers',
                order_id: orderId, 
                prefill: {
                    name: notes.firstName + " " + notes.lastName,
                    email: notes.emailId,
                    contact: '9999999999'
                },
                theme: {
                    color: '#F37254'
                },
            };
            console.log(options);
            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (error) {
            console.log(error.message);
        }
    } 

    return (
        <div className='m-10'>
            <div className="flex w-full">
                <div className="card bg-base-300 rounded-box grid h-80 grow place-items-center">
                    <h1 className='font-bold text-3xl'>Silver MemberShip</h1>
                    <ul>
                        <li>- Chat with other people</li>
                        <li>- 100 connection Request per day</li>
                        <li>- Blue tick</li>
                        <li>- 3 months</li>
                    </ul>
                    <button onClick={() => paymentHandle("silver")} className='btn btn-secondary'>Buy Silver</button>
                </div>
                <div className="divider divider-horizontal">OR</div>
                <div className="card bg-base-300 rounded-box grid h-80 grow place-items-center">
                    <h1 className='font-bold text-3xl'>Gold MemberShip</h1>
                    <ul>
                        <li>- Chat with other people</li>
                        <li>- Infinite connection request per day</li>
                        <li>- Blue tick</li>
                        <li>- 6 month</li>
                    </ul>
                    <button onClick={() => paymentHandle("gold")} className='btn btn-primary'>Buy Gold</button>
                </div>
            </div>
        </div>
    )
}

export default Premium
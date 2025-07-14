import React from 'react'

const Premium = () => {
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
                    <button className='btn btn-secondary'>Buy Silver</button>
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
                    <button className='btn btn-primary'>Buy Gold</button>
                </div>
            </div>
        </div>
    )
}

export default Premium
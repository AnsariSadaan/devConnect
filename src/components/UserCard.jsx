import React from 'react'

const UserCard = ({user}) => {
    const {firstName, lastName, age, about, skills, photoUrl, gender} = user;
    return (
        <div className="card bg-base-100 w-96 shadow-sm">
            <figure>
                <img
                    className='w-60 h-60'
                    src={photoUrl}
                    alt="user photo" />
            </figure>
            <div className="card-body">
                <h2 className="card-title">{firstName + " " + lastName}</h2>
                {age && gender && <p>{age + " " +gender}</p>}
                <p>{about}</p>
                <p>{skills}</p>
                <div className="card-actions justify-end">
                    <button className="btn btn-danger">Swipe</button>
                    <button className="btn btn-primary">Interested</button>
                </div>
            </div>
        </div>
    )
}

export default UserCard
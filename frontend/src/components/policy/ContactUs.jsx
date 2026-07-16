import React from 'react'

const ContactUs = () => {
    return (
        <div className='flex justify-center my-10'>
            <div className='card card-border bg-base-300 w-11/12 md:w-3/4 lg:w-1/2 p-6'>
                <h2 className='card-title text-center'>Contact Us</h2>
                <p className='mt-4'>
                    For any questions, issues, or support inquiries, please reach out to us at:
                    <br />
                    📧 <a href='mailto:support@devconnect.info' className='text-blue-400 underline'>support@devconnect.info</a>
                    <br />
                    📞 +91-7045623244
                </p>
            </div>
        </div>
    )
}

export default ContactUs
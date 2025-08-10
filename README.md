# DevConnect

- Created a Vite + React application
- Remove unnecessary code and cretae a hello world app
- Install tailwind css
- Install daisyui 
- Added navbar component from daisyui in app.jsx
- Cretaed a seperate Navbar.jsx component file 
- Installed react router dom
- created browserRouter => routes => route = /Layout => routeChildren
- create an outlet in Layout component 
- added footer 
- create a login page 
- install axios 
- cors install cors in backend ==> add middleware to with configuration : origin and credentials true
- whenever youre call api so pass axios => {withCredebtials: true} 
- installed redux tool kit + react-redux
- configureStore => Provider => createSlice => add reducer to store
- added redux dev tools in chrome 
- login functionality done 
- nvabar is updating as soon as user is logged in 
- restricted other routes without login
- without token page will redirect to login
- logout functionality 
- profile page 
- build the user card on feed 
- build edit profile page
- show toast message while saving profile  
- New Page - see all my connection
- New page - seel all my connections requests
- feature - Accept/Reject connection request




aws notes
deployment 
signup on aws 
launch instance 
create key value pair secret key 
on git bash => chmod 400 devConnect-secret.pem
connected to the ubuntu machine using => ssh -i "devConnect-secret.pem" ubuntu@ec2-51-21-167-60.eu-north-1.compute.amazonaws.com
installed node on ubuntu 
clone backend and frontend 
 - go to frontend path 
    - do npm i 
    - npm run build 
    - sudo apt update
    - sudo apt install nginx
    - sudo systemctl start nginx
    - sudo systemctl enable nginx
    - copy code from dist(build file) to var/www/html
    - sudo scp -r dist/* /var/www/html/
    - Enable port 80 of your instance to make this run 


- deploy backend 
    - removed mongo link from .env
    - allowed ec2 instance public ip in mongo server
    - installed pm2 :- npm i pm2 -g 
    - pm2 start npm -- start
    - pm2 logs
    - flush logs (pm2 flush service_Name)
    - pm2 ls
    - pm2 stop service_name
    - pm2 delete service_name
    - pm2 start npm --name servicename -- start
    - config nginx 
    - restart the nginx -> sudo systemctl restart nginx 

to check which port is running (sudo lsof -i :4000)
to stop or kill (kill -9 id(1234))


    frontend = http://13.60.196.16/
    backend  = http://13.60.196.16:4000/

    domain name = devConnect.com ==> 13.60.196.16

    frontend = devConnect.com 
    backend  = devConnect.com:4000 ==> devConnect.com/api

    nginx config

    server_name 13.60.196.16;

    location /api/ {
        proxy_pass http://localhost:4000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }


# Adding a custom domain name
    - purchase a domain name from godaddy 
    - signup on cloudflare $ add a new domain name 
    - change the nameserver on godaddy and point it to cloudflare
    - wait for sometime till nameserver are updated 
    - DNS record : A devConnect.info  13.60.222.228
    - enable ssl for website from browser to cloudflare 
    - homw work to do from cloudflare to my origin server


# Sending email via SES
    - create a IAM user
    - Give Access to AmazoneSESFull Access
    - Amazon SES : create an identity 
    - verify your domain name
    - verify an email address - identity
    - install AWS SDK - v3 : 
    - code example :- https://github.com/awsdocs/aws-doc-sdk-examples/blob/main/javascript/example_code/ses/ses_sendemail.js
    - setup SesClient 
    - Access Credentials should be created in IAM under securityCredentials Tab
    - Add the credentials to the env file 
    - wrie code for sesClient
    - write code for sending email address
    - Make the email dynamic by passing more parameter to the run function  


# scheduling cron jobs in nodejs
    - installing node-cron
    - learning about cron job -> crontabguru
    - schedule a job
    - learned about datefns
    - find all the unique emailId who have got connection request in previous day
    - send email 
    - explore queue mechanism to send bulk emails
    - amazon ses bilk emails
    - make send email function dynamic
    - bee-queue and bullmq (queue package)

# RazorPay Payment Gateway Integration
    - Signup on Razorpay & complete KYC 
    - created a ui for premium page
    - createing an api for payment in backend 
    - Initialized razorpay in utils
    - creating order on razorpay 
    - created schema and model
    - also added key and id in env
    - save the api in payment collection
    - make the api dynamic 

# need to make some pages
privacy policy 
terms and service 
contact us
refund policy
team



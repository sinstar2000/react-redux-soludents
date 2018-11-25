You are now here because the expectations are completely unreasonable. The deadline of 1st december is absolutely unrealistic. You are asking to complete 16 miletones in a span of 6.5 days. No one serious is going to apply to complete any of this, if you move the deadline to 1st January then I believe that it might be possible to build this on time.

___________________________
1	pending	Your first task will be to deploy current version of project on aws EC2 instance to the domain name https://www.soludents.com
Each time a bug is fixed you will push and deploy new version to keep track of the progress and so I can test new version every time when bugs are fixed.
Please also detail me here how to push and deploy new version so I can do some little change myself like changing text/color/image and so on…

`If you want to deploy the code on AWS you should set up CI/CD pipelines, it's the reasonable way to do it.`

__________________________
2, 9 & 14 

`If you want a secure and easy way to add admin accounts and manage everything then you might want to look into AWS Cognito, should
solve these milestones.`

____________________________
12	pending	check aws deployment is correctly set up and can scale correctly to: 
for example imagine that there are 10k documents uploaded to the ec2 instance of 100 terabytes that it will scale without issue 

`You shouldn't put the files on EC2 instances, but on S3 instead, this one milestone is easily a week of work.`

_____________________________
16	pending	General Bugs:

Potential bugs (only bugs, no edit or adding functionalities) that may appear along the way resulting from All the issues requested above

`No one really knows how many hidden bugs are there already.`

_____________________________
I would totally help you with this project but it's just unrealistic. That's 4 - 5 weeks of work.


# react-redux-project

1. Accessing to EC2 instance via putty.

Using puttygen, convert *.pem to *.ppk.
In putty, it is used as auth key.
(I think you will know how to use putty.)

2. Pushing project folder to instance.

Go to certain folder.
Type the url as the following:

>> git clone https://github.com/soludents/react-redux-project.git

In the project folder, there are two directories: frontend and backend.

3. Setting up environment

- Installing node.js

Run the following command:

>>curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
>>sudo apt-get install -y nodejs

You may check node.js and npm version:

>> node.js -v
>> npm -v

- Installing mongodb

Refer this url:
https://www.digitalocean.com/community/tutorials/how-to-install-mongodb-on-ubuntu-16-04

- Setting up global node package for backend service.

In certain directory

>> npm install -g forever

- Setting up npm modules in project folder.

Go to the folder "frontend" in project root.

>> npm install

And go to the folder "backend" in project root.

>> npm install

4. Running backend and frontend projects.

Go to the folder "frontend" in project root.

>> npm start&

And go to the folder "backend" in project root.

>> forever start app.js

5. Configuring and running proxy server "nginx" for frontend.

To setup, configure and run nginx to instance, refer this url.

https://www.rosehosting.com/blog/how-to-install-nginx-on-ubuntu-16-04/

*************

You may check currently running ports.

>> netstat -tuplen

Maybe backend is running on port 5000, frontend is running on port 3000, nginx is running on port 80 and mongodb is running on port 27017.

Now that all services are running, you may reconfigure nginx config.

In certain directory

>> nano /etc/nginx/sites-available/default

You may open the file.

There, you must place as the following:

server {
    listen 80;
    server_name 18.202.179.5;
    root /opt/react-redux-project;

    location / {
        include proxy_params;
        proxy_pass http://localhost:3000;
    }
...
}

This will have request redirect from clients to "localhost:3000" , react project when users requests http://18.202.179.5/


